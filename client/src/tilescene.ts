// The neighborhood as a live vector-tile map (MapLibre + OpenFreeMap's OpenStreetMap tiles):
// every street, park and building inside any radius up to 7 miles, streamed as you zoom.
// Same job as IsoScene: a near-isometric view, the café and rival pins, the radius ring, and
// the customers walking. Coordinates in and out are meters east/north of the café.
/// <reference types="geojson" />
import maplibregl, { type GeoJSONSource, type StyleSpecification } from 'maplibre-gl';
import maplibreCss from 'maplibre-gl/dist/maplibre-gl.css?inline';
import type { AreaMap } from './geo';

export interface PersonColor {
  getHexString(): string;
}

const ISO_PITCH = 54.7; // 90° minus the isometric elevation (35.26°)
const ISO_FOV = 8; // narrow lens: close to the flat isometric look, still lets buildings stand up
const C = {
  paper: '#f3eee4',
  ground: '#ebe3d3',
  water: '#c9d3cd',
  park: '#c5cfa8',
  road: '#fbf8f2',
  roadCase: '#d9cdb8',
  building: '#e1d6c2',
  cafe: '#d9472b',
  rival: '#1f6f6b',
  ink: '#1f1c18',
};

const style: StyleSpecification = {
  version: 8,
  sources: {
    osm: { type: 'vector', url: 'https://tiles.openfreemap.org/planet', attribution: '© OpenStreetMap contributors · OpenFreeMap' },
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': C.ground } },
    { id: 'water', type: 'fill', source: 'osm', 'source-layer': 'water', paint: { 'fill-color': C.water } },
    {
      id: 'green',
      type: 'fill',
      source: 'osm',
      'source-layer': 'landcover',
      filter: ['in', ['get', 'class'], ['literal', ['grass', 'wood', 'farmland']]],
      paint: { 'fill-color': C.park, 'fill-opacity': 0.8 },
    },
    { id: 'park', type: 'fill', source: 'osm', 'source-layer': 'park', paint: { 'fill-color': C.park } },
    {
      id: 'road-case',
      type: 'line',
      source: 'osm',
      'source-layer': 'transportation',
      filter: ['!', ['in', ['get', 'class'], ['literal', ['rail', 'transit', 'ferry', 'path']]]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': C.roadCase,
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 11, 1.2, 14, 4, 17, 14],
      },
    },
    {
      id: 'road',
      type: 'line',
      source: 'osm',
      'source-layer': 'transportation',
      filter: ['!', ['in', ['get', 'class'], ['literal', ['rail', 'transit', 'ferry', 'path']]]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': C.road,
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 11, 0.5, 14, 2.6, 17, 11],
      },
    },
    {
      id: 'buildings',
      type: 'fill-extrusion',
      source: 'osm',
      'source-layer': 'building',
      minzoom: 13,
      paint: {
        'fill-extrusion-color': C.building,
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 8],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
        'fill-extrusion-opacity': 0.92,
        'fill-extrusion-vertical-gradient': true,
      },
    },
  ],
};

type Feature = GeoJSON.Feature<GeoJSON.Point, { c: string; i: number }>;

export class TileScene {
  onFrame: (dt: number) => void = () => {};
  onPick: (index: number | null) => void = () => {};
  private map: maplibregl.Map;
  private ready: Promise<void>;
  private alive = true;
  private lat0 = 0;
  private lng0 = 0;
  private mPerLng = 111320;
  private areaRadius = 400;
  private shownRadiusM = 0;
  private bearing = 45;
  private people: (Feature | null)[] = [];
  private peopleDirty = false;
  private cafeMarker: maplibregl.Marker | null = null;
  private rivalMarkers: maplibregl.Marker[] = [];
  private ring: [number, number] | null = null;

  constructor(private host: HTMLElement) {
    injectMapCss();
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    this.map = new maplibregl.Map({
      container: host,
      style,
      center: [-122.4194, 37.7749],
      zoom: 14,
      pitch: ISO_PITCH,
      bearing: this.bearing,
      maxPitch: 70,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      canvasContextAttributes: { antialias: true },
    });
    this.map.touchZoomRotate.disableRotation();
    this.map.keyboard.disableRotation();
    this.map.setVerticalFieldOfView(ISO_FOV);
    this.ready = new Promise(res => this.map.on('load', () => res()));
    this.ready.then(() => this.addOverlays());
    this.map.on('click', e => {
      const hit = this.map.getLayer('people')
        ? this.map.queryRenderedFeatures(e.point, { layers: ['people'] })[0]
        : undefined;
      // Generous hit area: people are small on a zoomed-out map.
      const near =
        hit ??
        this.map.queryRenderedFeatures(
          [
            [e.point.x - 8, e.point.y - 8],
            [e.point.x + 8, e.point.y + 8],
          ],
          { layers: ['people'] }
        )[0];
      this.onPick(near ? Number(near.properties?.i) : null);
    });
    this.map.on('render', () => this.declutter());
    let last = performance.now();
    const loop = (now: number) => {
      if (!this.alive) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      this.onFrame(dt);
      if (this.peopleDirty) this.flushPeople();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // ---- Coordinates ------------------------------------------------------------------

  private ll(x: number, y: number): [number, number] {
    return [this.lng0 + x / this.mPerLng, this.lat0 + y / 110540];
  }

  private circle(radiusM: number, steps = 128): [number, number][] {
    const pts: [number, number][] = [];
    for (let k = 0; k <= steps; k++) {
      const a = (k / steps) * Math.PI * 2;
      pts.push(this.ll(Math.cos(a) * radiusM, Math.sin(a) * radiusM));
    }
    return pts;
  }

  // ---- Overlays: radius mask and ring, rival dots, people, selection --------------------

  private addOverlays() {
    const empty: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };
    for (const id of ['mask', 'ring', 'rivals', 'people', 'selected']) this.map.addSource(id, { type: 'geojson', data: empty });
    // Beyond the radius fades to paper, so the competitive area reads at a glance.
    this.map.addLayer({ id: 'mask', type: 'fill', source: 'mask', paint: { 'fill-color': C.paper, 'fill-opacity': 0.88 } });
    this.map.addLayer({
      id: 'ring',
      type: 'line',
      source: 'ring',
      paint: { 'line-color': C.rival, 'line-width': 2, 'line-opacity': 0.75, 'line-dasharray': [3, 2] },
    });
    this.map.addLayer({
      id: 'rivals',
      type: 'circle',
      source: 'rivals',
      paint: {
        'circle-color': C.rival,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 3, 15, 6],
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 1.5,
      },
    });
    this.map.addLayer({
      id: 'selected',
      type: 'circle',
      source: 'selected',
      paint: { 'circle-radius': 11, 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': C.ink, 'circle-stroke-width': 2 },
    });
    this.map.addLayer({
      id: 'people',
      type: 'circle',
      source: 'people',
      paint: {
        'circle-color': ['get', 'c'],
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 2.5, 14, 4.5, 17, 7],
        'circle-stroke-color': '#fffaf0',
        'circle-stroke-width': 1,
      },
    });
    this.map.on('mouseenter', 'people', () => (this.map.getCanvas().style.cursor = 'pointer'));
    this.map.on('mouseleave', 'people', () => (this.map.getCanvas().style.cursor = ''));
    if (this.shownRadiusM) this.drawRadius(this.shownRadiusM);
  }

  private drawRadius(radiusM: number) {
    const ring = this.circle(radiusM);
    // A big square around the café, not the whole globe (which smears near the horizon).
    const R = Math.max(radiusM * 5, 25000);
    const world: [number, number][] = [this.ll(-R, -R), this.ll(R, -R), this.ll(R, R), this.ll(-R, R), this.ll(-R, -R)];
    (this.map.getSource('mask') as GeoJSONSource | undefined)?.setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates: [world, [...ring].reverse()] },
    });
    (this.map.getSource('ring') as GeoJSONSource | undefined)?.setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: ring },
    });
  }

  /** Hide labels that would overlap a more important one (café first, then strongest rivals). */
  private declutter() {
    const now = performance.now();
    if (now - this.lastDeclutter < 120) return;
    this.lastDeclutter = now;
    const markers = [...(this.cafeMarker ? [this.cafeMarker] : []), ...this.rivalMarkers];
    const placed: DOMRect[] = [];
    for (const m of markers) {
      const el = m.getElement();
      el.style.visibility = 'visible';
      const r = el.getBoundingClientRect();
      const hit = placed.some(p => r.left < p.right + 4 && r.right > p.left - 4 && r.top < p.bottom + 2 && r.bottom > p.top - 2);
      if (hit) el.style.visibility = 'hidden';
      else placed.push(r);
    }
  }
  private lastDeclutter = 0;

  // ---- What IsoScene offered -------------------------------------------------------------

  setMap(map: AreaMap) {
    this.lat0 = map.center.lat;
    this.lng0 = map.center.lng;
    this.mPerLng = 111320 * Math.cos((this.lat0 * Math.PI) / 180);
    this.areaRadius = map.radius;
    this.cafeMarker?.remove();
    this.cafeMarker = new maplibregl.Marker({ element: pin('cafe', map.cafe.name, ''), anchor: 'bottom' })
      .setLngLat(this.ll(map.cafe.x, map.cafe.y))
      .addTo(this.map);
    this.map.jumpTo({ center: this.ll(0, 0), zoom: 15, pitch: ISO_PITCH, bearing: this.bearing });
  }

  setRivals(rivals: { key: string; name: string; x: number; y: number; distanceM: number; weight: number }[], radiusM: number) {
    this.shownRadiusM = radiusM;
    for (const m of this.rivalMarkers) m.remove();
    this.rivalMarkers = [];
    const strongest = [...rivals].sort((a, b) => b.weight - a.weight).slice(0, 12);
    for (const r of strongest) {
      const miles = r.distanceM / 1609;
      const note = miles < 1 ? `${miles.toFixed(2)} mi` : `${miles.toFixed(1)} mi`;
      this.rivalMarkers.push(
        new maplibregl.Marker({ element: pin('rival', r.name, note), anchor: 'bottom', offset: [0, -6] })
          .setLngLat(this.ll(r.x, r.y))
          .addTo(this.map)
      );
    }
    const draw = () => {
      (this.map.getSource('rivals') as GeoJSONSource | undefined)?.setData({
        type: 'FeatureCollection',
        features: rivals.map(r => ({
          type: 'Feature',
          properties: { name: r.name },
          geometry: { type: 'Point', coordinates: this.ll(r.x, r.y) },
        })),
      });
      this.drawRadius(radiusM);
    };
    if (this.map.isStyleLoaded()) draw();
    else this.ready.then(draw);
    this.frame('radius');
  }

  /** Zoom to the café's streets ('street') or out to the whole rival radius ('radius'). */
  frame(mode: 'street' | 'radius') {
    const r = mode === 'street' ? this.areaRadius : Math.max(this.areaRadius, this.shownRadiusM * 1.08);
    const sw = this.ll(-r, -r), ne = this.ll(r, r);
    const cam = this.map.cameraForBounds([sw, ne], { padding: 24, bearing: this.bearing, pitch: ISO_PITCH });
    this.map.easeTo({ center: this.ll(0, 0), zoom: cam?.zoom ?? 14, pitch: ISO_PITCH, bearing: this.bearing, duration: 700 });
  }

  /** Rotate a quarter turn; the view stays isometric. */
  rotate(dir: 1 | -1) {
    this.bearing += dir * 90;
    this.map.easeTo({ bearing: this.bearing, duration: 500 });
  }

  setPinNote(kind: 'cafe' | 'rival', note: string) {
    const els = kind === 'cafe' ? (this.cafeMarker ? [this.cafeMarker.getElement()] : []) : this.rivalMarkers.map(m => m.getElement());
    for (const el of els) {
      let s = el.querySelector('span');
      if (!s) el.appendChild((s = document.createElement('span')));
      s.textContent = note;
    }
  }

  ringAt(x: number | null, y = 0) {
    (this.map.getSource('selected') as GeoJSONSource | undefined)?.setData({
      type: 'FeatureCollection',
      features: x === null ? [] : [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: this.ll(x, y) } }],
    });
  }

  // ---- People --------------------------------------------------------------------------

  setPeopleCount(n: number) {
    this.people = new Array(n).fill(null);
    this.peopleDirty = true;
  }

  placePerson(i: number, x: number, y: number, color: PersonColor) {
    this.people[i] = { type: 'Feature', id: i, properties: { c: `#${color.getHexString()}`, i }, geometry: { type: 'Point', coordinates: this.ll(x, y) } };
  }

  hidePerson(i: number) {
    this.people[i] = null;
  }

  commitPeople() {
    this.peopleDirty = true;
  }

  private flushPeople() {
    const src = this.map.getSource('people') as GeoJSONSource | undefined;
    if (!src) return;
    this.peopleDirty = false;
    src.setData({ type: 'FeatureCollection', features: this.people.filter((f): f is Feature => f !== null) });
  }

  dispose() {
    this.alive = false;
    this.cafeMarker?.remove();
    for (const m of this.rivalMarkers) m.remove();
    this.map.remove();
  }
}

function pin(kind: 'cafe' | 'rival', name: string, note: string) {
  const el = document.createElement('div');
  el.className = `fork-pin ${kind}`;
  el.textContent = name;
  if (note) {
    const s = document.createElement('span');
    s.textContent = note;
    el.appendChild(s);
  }
  return el;
}

function injectMapCss() {
  if (document.getElementById('fork-maplibre-css')) return;
  const s = document.createElement('style');
  s.id = 'fork-maplibre-css';
  s.textContent = `${maplibreCss}
.maplibregl-ctrl-attrib{font:10px ui-monospace,monospace;background:rgba(243,238,228,.8)!important}`;
  document.head.appendChild(s);
}
