// The isometric model: real buildings extruded from OpenStreetMap footprints on a plinth,
// streets, parks, and customers as small pawns. Rotation snaps to the four isometric angles.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { AreaMap } from './geo';

const ISO_ELEVATION = Math.atan(1 / Math.SQRT2); // 35.264°, true isometric
const COLORS = {
  paper: 0xf3eee4,
  ground: 0xebe3d3,
  plinthSide: 0xb9ab92,
  road: 0xd9cdb8,
  park: 0xc5cfa8,
  home: 0xf1ebdf,
  other: 0xe1d6c2,
  edge: 0x7d705c,
  cafe: 0xd9472b,
  rival: 0x1f6f6b,
};

export const PAWN = {
  toCafe: new THREE.Color(0xd9472b),
  toRival: new THREE.Color(0x1f6f6b),
  noticed: new THREE.Color(0xf0a020),
};

/** Map meters (x east, y north) -> three.js world (y up). */
export const toWorld = (x: number, y: number, h = 0) => new THREE.Vector3(x, h, -y);

function footprint(p: number[]): THREE.Shape | null {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < p.length; i += 2) pts.push(new THREE.Vector2(p[i], p[i + 1]));
  if (pts.length > 3 && pts[0].distanceTo(pts[pts.length - 1]) < 0.01) pts.pop();
  if (pts.length < 3) return null;
  return new THREE.Shape(pts);
}

function extrude(p: number[], h: number): THREE.BufferGeometry | null {
  const shape = footprint(p);
  if (!shape) return null;
  const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
  g.rotateX(-Math.PI / 2); // shape (x, north) -> world (x, -z), extrusion -> up
  return g;
}

function ribbon(p: number[], width: number, y: number): THREE.BufferGeometry | null {
  const pos: number[] = [];
  const half = width / 2;
  for (let i = 0; i + 3 < p.length; i += 2) {
    const ax = p[i], ay = p[i + 1], bx = p[i + 2], by = p[i + 3];
    const len = Math.hypot(bx - ax, by - ay);
    if (len < 0.01) continue;
    const nx = (-(by - ay) / len) * half, ny = ((bx - ax) / len) * half;
    const a1 = toWorld(ax + nx, ay + ny, y), a2 = toWorld(ax - nx, ay - ny, y);
    const b1 = toWorld(bx + nx, by + ny, y), b2 = toWorld(bx - nx, by - ny, y);
    pos.push(a1.x, a1.y, a1.z, b1.x, b1.y, b1.z, a2.x, a2.y, a2.z);
    pos.push(a2.x, a2.y, a2.z, b1.x, b1.y, b1.z, b2.x, b2.y, b2.z);
  }
  if (!pos.length) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

export class IsoScene {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.OrthographicCamera;
  private target = new THREE.Vector3();
  private azimuth = Math.PI / 4;
  private azimuthGoal = Math.PI / 4;
  private viewSize = 300;
  private viewSizeGoal = 300;
  private mapRadius = 300;
  private model = new THREE.Group();
  private region = new THREE.Group(); // rivals beyond the model, the radius ring
  private rivalPins: HTMLElement[] = [];
  private pawns: THREE.InstancedMesh | null = null;
  private selectedRing: THREE.Mesh;
  private dummy = new THREE.Object3D();
  private pins: { el: HTMLElement; world: THREE.Vector3 }[] = [];
  onPick: (index: number | null) => void = () => {};
  onFrame: (dt: number) => void = () => {};

  constructor(private host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.setClearColor(COLORS.paper);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(this.renderer.domElement);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -40000, 40000);
    this.scene.add(this.model);
    this.scene.add(this.region);

    const hemi = new THREE.HemisphereLight(0xfffaf0, 0xb8a888, 1.15);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff1dc, 1.6);
    sun.position.set(-260, 420, 180);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0005;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -700;
    sun.shadow.camera.right = sun.shadow.camera.top = 700;
    sun.shadow.camera.far = 2000;
    this.scene.add(sun);

    this.selectedRing = new THREE.Mesh(
      new THREE.RingGeometry(4.5, 6, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x1f1c18, transparent: true, opacity: 0.85 })
    );
    this.selectedRing.visible = false;
    this.scene.add(this.selectedRing);

    this.bindControls();
    window.addEventListener('resize', () => this.resize());
    this.resize();
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      this.azimuth += (this.azimuthGoal - this.azimuth) * Math.min(1, dt * 8);
      if (Math.abs(this.viewSizeGoal - this.viewSize) > 0.5) {
        this.viewSize += (this.viewSizeGoal - this.viewSize) * Math.min(1, dt * 5);
        this.resize();
      }
      this.placeCamera();
      this.onFrame(dt);
      this.renderer.render(this.scene, this.camera);
      this.updatePins();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /** Rotate the model a quarter turn; the view stays isometric. */
  rotate(dir: 1 | -1) {
    this.azimuthGoal += (dir * Math.PI) / 2;
  }

  private resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    this.renderer.setSize(w, h);
    const aspect = w / h;
    this.camera.left = (-this.viewSize * aspect) / 2;
    this.camera.right = (this.viewSize * aspect) / 2;
    this.camera.top = this.viewSize / 2;
    this.camera.bottom = -this.viewSize / 2;
    this.camera.updateProjectionMatrix();
  }

  private placeCamera() {
    const d = 1000;
    this.camera.position.set(
      this.target.x + d * Math.cos(ISO_ELEVATION) * Math.cos(this.azimuth),
      this.target.y + d * Math.sin(ISO_ELEVATION),
      this.target.z + d * Math.cos(ISO_ELEVATION) * Math.sin(this.azimuth)
    );
    this.camera.lookAt(this.target);
  }

  private bindControls() {
    const el = this.renderer.domElement;
    let dragging = false, moved = 0, lx = 0, ly = 0;
    el.addEventListener('pointerdown', e => {
      dragging = true;
      moved = 0;
      lx = e.clientX;
      ly = e.clientY;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      // Pan on the ground plane, in screen-aligned directions.
      const scale = (this.camera.top - this.camera.bottom) / this.camera.zoom / el.clientHeight;
      const right = new THREE.Vector3(-Math.sin(this.azimuth), 0, Math.cos(this.azimuth));
      const fwd = new THREE.Vector3(-Math.cos(this.azimuth), 0, -Math.sin(this.azimuth));
      this.target.addScaledVector(right, -dx * scale);
      this.target.addScaledVector(fwd, (dy * scale) / Math.sin(ISO_ELEVATION));
    });
    el.addEventListener('pointerup', e => {
      dragging = false;
      if (moved < 5) this.pick(e);
    });
    el.addEventListener(
      'wheel',
      e => {
        e.preventDefault();
        this.camera.zoom = Math.max(0.5, Math.min(8, this.camera.zoom * Math.exp(-e.deltaY * 0.0012)));
        this.camera.updateProjectionMatrix();
      },
      { passive: false }
    );
    window.addEventListener('keydown', e => {
      if ((e.target as HTMLElement).closest('input, textarea, select')) return;
      if (e.key === 'q' || e.key === 'Q') this.rotate(-1);
      if (e.key === 'e' || e.key === 'E') this.rotate(1);
    });
  }

  private pick(e: PointerEvent) {
    if (!this.pawns) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const hit = ray.intersectObject(this.pawns)[0];
    this.onPick(hit?.instanceId ?? null);
  }

  // ---- Building the model -------------------------------------------------------

  setMap(map: AreaMap) {
    this.model.clear();
    this.clearPins();
    const R = map.radius;

    // Plinth: the model sits on a slab, like an architect's maquette.
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(R * 2 + 24, 8, R * 2 + 24),
      [
        new THREE.MeshLambertMaterial({ color: COLORS.plinthSide }),
        new THREE.MeshLambertMaterial({ color: COLORS.plinthSide }),
        new THREE.MeshLambertMaterial({ color: COLORS.ground }),
        new THREE.MeshLambertMaterial({ color: COLORS.plinthSide }),
        new THREE.MeshLambertMaterial({ color: COLORS.plinthSide }),
        new THREE.MeshLambertMaterial({ color: COLORS.plinthSide }),
      ]
    );
    plinth.position.y = -4;
    plinth.receiveShadow = true;
    this.model.add(plinth);

    const inside = (p: number[]) => {
      for (let i = 0; i < p.length; i += 2) if (Math.abs(p[i]) > R + 10 || Math.abs(p[i + 1]) > R + 10) return false;
      return true;
    };

    const parkGeoms = map.parks
      .map(pk => footprint(pk.p))
      .filter((s): s is THREE.Shape => !!s)
      .map(s => new THREE.ShapeGeometry(s).rotateX(-Math.PI / 2).translate(0, 0.05, 0));
    if (parkGeoms.length) {
      const parks = new THREE.Mesh(mergeGeometries(parkGeoms), new THREE.MeshLambertMaterial({ color: COLORS.park }));
      parks.receiveShadow = true;
      this.model.add(parks);
    }

    const roadGeoms = map.roads.map(r => ribbon(r.p, r.w, 0.12)).filter((g): g is THREE.BufferGeometry => !!g);
    if (roadGeoms.length) {
      const roads = new THREE.Mesh(mergeGeometries(roadGeoms), new THREE.MeshLambertMaterial({ color: COLORS.road }));
      roads.receiveShadow = true;
      this.model.add(roads);
    }

    const groups: Record<string, THREE.BufferGeometry[]> = { home: [], other: [], cafe: [], rival: [] };
    const edges: THREE.BufferGeometry[] = [];
    const rivalIdx = new Set(map.competitors.map(c => c.building));
    map.buildings.forEach((b, i) => {
      if (!inside(b.p)) return;
      const special = i === map.cafe.building ? 'cafe' : rivalIdx.has(i) ? 'rival' : null;
      const g = extrude(b.p, special ? Math.max(b.h, 8) : b.h);
      if (!g) return;
      groups[special ?? (b.home ? 'home' : 'other')].push(g);
      edges.push(new THREE.EdgesGeometry(g, 25));
    });
    for (const [kind, geoms] of Object.entries(groups)) {
      if (!geoms.length) continue;
      const mesh = new THREE.Mesh(
        mergeGeometries(geoms),
        new THREE.MeshLambertMaterial({ color: COLORS[kind as keyof typeof COLORS] })
      );
      mesh.castShadow = mesh.receiveShadow = true;
      this.model.add(mesh);
    }
    if (edges.length) {
      this.model.add(
        new THREE.LineSegments(
          mergeGeometries(edges),
          new THREE.LineBasicMaterial({ color: COLORS.edge, transparent: true, opacity: 0.28 })
        )
      );
    }

    // If OSM has no building at the café or rival, stand in a marker block so they're visible.
    const marker = (x: number, y: number, color: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(10, 9, 10), new THREE.MeshLambertMaterial({ color }));
      m.position.copy(toWorld(x, y, 4.5));
      m.castShadow = true;
      this.model.add(m);
    };
    if (map.cafe.building < 0) marker(map.cafe.x, map.cafe.y, COLORS.cafe);
    for (const c of map.competitors) if (c.building < 0) marker(c.x, c.y, COLORS.rival);

    this.addPin('cafe', map.cafe.name, '', toWorld(map.cafe.x, map.cafe.y, this.heightAt(map, map.cafe.building) + 4));
    for (const c of map.competitors) {
      this.addPin('rival', c.name, 'rival', toWorld(c.x, c.y, this.heightAt(map, c.building) + 4));
    }

    this.target.set(0, 0, 0);
    this.mapRadius = R;
    this.viewSize = this.viewSizeGoal = R * 1.35;
    this.camera.zoom = 1;
    this.region.clear();
    this.resize();
  }

  // ---- Rivals within the chosen radius ---------------------------------------------

  /**
   * Show the competitor radius: a ring on a map-table surface around the model, a teal pin for
   * every rival in range (inside the model or out on the table), and labels for the strongest.
   * Zooms out so the whole radius is in view.
   */
  setRivals(rivals: { key: string; name: string; x: number; y: number; distanceM: number; weight: number }[], radiusM: number) {
    this.region.clear();
    for (const el of this.rivalPins) el.remove();
    this.rivalPins = [];
    // Once real rivals are known, the single legacy rival label is redundant.
    for (const p of this.pins.filter(p => p.el.classList.contains('rival'))) p.el.remove();
    this.pins = this.pins.filter(p => !p.el.classList.contains('rival'));

    const R = this.mapRadius;
    const table = new THREE.Mesh(
      new THREE.CircleGeometry(Math.max(radiusM * 1.08, R * 1.6), 96).rotateX(-Math.PI / 2),
      // Unlit, a shade off the paper background: reads as a map table, not a brown disc.
      new THREE.MeshBasicMaterial({ color: 0xebe4d6 })
    );
    table.position.y = -8.2;
    this.region.add(table);

    const ringWidth = Math.max(2, radiusM * 0.006);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radiusM - ringWidth, radiusM, 128).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: COLORS.rival, transparent: true, opacity: 0.55 })
    );
    ring.position.y = radiusM > R ? -8.1 : 0.4;
    this.region.add(ring);

    // Pins scale with the view so far-out rivals stay visible when zoomed out.
    const s = Math.max(1, radiusM / 600);
    const pinGeom = new THREE.CylinderGeometry(0.9 * s, 0.9 * s, 16 * s, 8).translate(0, 8 * s, 0);
    const headGeom = new THREE.SphereGeometry(3 * s, 12, 8).translate(0, 17 * s, 0);
    const mat = new THREE.MeshLambertMaterial({ color: COLORS.rival });
    const strongest = [...rivals].sort((a, b) => b.weight - a.weight).slice(0, 6);
    for (const r of rivals) {
      const inside = Math.abs(r.x) <= R && Math.abs(r.y) <= R;
      const base = inside ? 10 : -8;
      for (const g of [pinGeom, headGeom]) {
        const m = new THREE.Mesh(g, mat);
        m.position.copy(toWorld(r.x, r.y, base));
        m.castShadow = true;
        this.region.add(m);
      }
      if (strongest.includes(r)) {
        const miles = r.distanceM / 1609;
        this.addPin('rival', r.name, miles < 1 ? `${miles.toFixed(2)} mi` : `${miles.toFixed(1)} mi`, toWorld(r.x, r.y, base + 22 * s));
        this.rivalPins.push(this.pins[this.pins.length - 1].el);
      }
    }
    this.viewSizeGoal = Math.max(R * 1.35, radiusM * 2.3);
  }

  private heightAt(map: AreaMap, building: number) {
    return building >= 0 ? Math.max(8, map.buildings[building].h) : 9;
  }

  // ---- Labels -------------------------------------------------------------------

  private addPin(kind: 'cafe' | 'rival', name: string, note: string, world: THREE.Vector3) {
    const el = document.createElement('div');
    el.className = `pin ${kind}`;
    el.textContent = name;
    if (note) {
      const s = document.createElement('span');
      s.textContent = note;
      el.appendChild(s);
    }
    document.body.appendChild(el);
    this.pins.push({ el, world });
  }

  private clearPins() {
    for (const p of this.pins) p.el.remove();
    this.pins = [];
  }

  setPinNote(kind: 'cafe' | 'rival', note: string) {
    for (const p of this.pins) {
      if (!p.el.classList.contains(kind)) continue;
      let s = p.el.querySelector('span');
      if (!s) {
        s = document.createElement('span');
        p.el.appendChild(s);
      }
      s.textContent = note;
    }
  }

  private updatePins() {
    const rect = this.renderer.domElement.getBoundingClientRect();
    for (const p of this.pins) {
      const v = p.world.clone().project(this.camera);
      p.el.style.left = `${rect.left + ((v.x + 1) / 2) * rect.width}px`;
      p.el.style.top = `${rect.top + ((1 - v.y) / 2) * rect.height - 6}px`;
    }
  }

  // ---- People --------------------------------------------------------------------

  setPeopleCount(n: number) {
    if (this.pawns) {
      this.scene.remove(this.pawns);
      this.pawns.dispose();
    }
    // Pawns are drawn larger than life (about 3x) so you can follow them across the model.
    const geom = new THREE.CapsuleGeometry(2.4, 4.2, 4, 12).translate(0, 4.5, 0);
    this.pawns = new THREE.InstancedMesh(geom, new THREE.MeshLambertMaterial(), Math.max(1, n));
    this.pawns.castShadow = true;
    this.pawns.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < n; i++) {
      this.pawns.setColorAt(i, PAWN.toCafe);
      this.hidePerson(i);
    }
    this.scene.add(this.pawns);
  }

  placePerson(i: number, x: number, y: number, color: THREE.Color) {
    if (!this.pawns) return;
    this.dummy.position.copy(toWorld(x, y, 0.2));
    this.dummy.scale.setScalar(1);
    this.dummy.updateMatrix();
    this.pawns.setMatrixAt(i, this.dummy.matrix);
    this.pawns.setColorAt(i, color);
  }

  hidePerson(i: number) {
    if (!this.pawns) return;
    this.dummy.position.set(0, -50, 0);
    this.dummy.scale.setScalar(0.0001);
    this.dummy.updateMatrix();
    this.pawns.setMatrixAt(i, this.dummy.matrix);
  }

  commitPeople() {
    if (!this.pawns) return;
    this.pawns.instanceMatrix.needsUpdate = true;
    if (this.pawns.instanceColor) this.pawns.instanceColor.needsUpdate = true;
  }

  /** Show the selection ring under a person (or hide it). */
  ringAt(x: number | null, y = 0) {
    this.selectedRing.visible = x !== null;
    if (x !== null) this.selectedRing.position.copy(toWorld(x, y, 0.3));
  }
}
