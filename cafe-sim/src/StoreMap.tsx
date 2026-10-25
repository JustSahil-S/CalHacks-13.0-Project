import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Map, {
  Layer,
  Source,
  type MapRef,
} from "react-map-gl/maplibre";
import { setWorkerUrl, type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import type { Feature, FeatureCollection, Geometry, Polygon } from "geojson";
import type { Business } from "./module_bindings/types";
import {
  DAY_PLAY_MS,
  fetchRoadPath,
  pointAlongPath,
  routeCacheKey,
  tripDurationMs,
  type MapTrip,
} from "./liveSim";

// MapLibre locates its worker relative to its own file, which breaks once Vite pre-bundles it
setWorkerUrl(maplibreWorkerUrl);

const BASEMAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const CAFE = "#d9472b";
const RIVAL = "#1f6f6b";
const PAPER = "#f3eee4";
const PAPER_GROUND = "#ebe3d3";
const WATER = "#c9d3cd";
const PARK = "#c5cfa8";
const ROAD = "#fbf8f2";
const ROAD_CASE = "#d9cdb8";
const BUILDING_FILL = "#e1d6c2";
// How much wider than the competitor radius the map window is
const WINDOW_PADDING = 1.6;
const KM_PER_DEGREE_LAT = 111.32;
const CAMERA_3D = { pitch: 55, bearing: -20 };
const CAMERA_2D = { pitch: 0, bearing: 0 };

export type MapCompetitor = { business: Business; distanceMeters: number };

function kmToDegrees(lat: number, km: number) {
  return {
    lat: km / KM_PER_DEGREE_LAT,
    lng: km / (KM_PER_DEGREE_LAT * Math.cos((lat * Math.PI) / 180)),
  };
}

function circleRing(lat: number, lng: number, radiusKm: number, steps = 96) {
  const delta = kmToDegrees(lat, radiusKm);
  const ring: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    ring.push([
      lng + delta.lng * Math.cos(angle),
      lat + delta.lat * Math.sin(angle),
    ]);
  }
  return ring;
}

function radiusPolygon(
  lat: number,
  lng: number,
  radiusKm: number,
): Feature<Polygon> {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [circleRing(lat, lng, radiusKm)],
    },
  };
}

function windowBounds(
  lat: number,
  lng: number,
  radiusKm: number,
): [[number, number], [number, number]] {
  const delta = kmToDegrees(lat, radiusKm * WINDOW_PADDING);
  return [
    [lng - delta.lng, lat - delta.lat],
    [lng + delta.lng, lat + delta.lat],
  ];
}

function maskPolygon(
  lat: number,
  lng: number,
  radiusKm: number,
): Feature<Polygon> {
  const pad = kmToDegrees(lat, Math.max(radiusKm * 80, 80));
  const outer: [number, number][] = [
    [lng - pad.lng, lat - pad.lat],
    [lng + pad.lng, lat - pad.lat],
    [lng + pad.lng, lat + pad.lat],
    [lng - pad.lng, lat + pad.lat],
    [lng - pad.lng, lat - pad.lat],
  ];
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [outer, [...circleRing(lat, lng, radiusKm)].reverse()],
    },
  };
}

function lockRotation(map: MapLibreMap) {
  map.dragRotate.disable();
  map.touchPitch.disable();
  map.touchZoomRotate.disableRotation();
  map.keyboard.disableRotation();
}

const EMPTY_PEOPLE: FeatureCollection = { type: "FeatureCollection", features: [] };

const BUILDING_EXTRUDE = 1.12;
const BUILDING_HEIGHT_CAP = 70;
const BUILDING_HEIGHT = [
  "min",
  [
    "*",
    [
      "case",
      [">", ["coalesce", ["get", "height"], 0], 0],
      ["get", "height"],
      10,
    ],
    BUILDING_EXTRUDE,
  ],
  BUILDING_HEIGHT_CAP,
];

function extrudedMeters(height: number) {
  return Math.min((height > 0 ? height : 10) * BUILDING_EXTRUDE, BUILDING_HEIGHT_CAP);
}

function ringContains(lng: number, lat: number, ring: number[][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function featureContains(geometry: Geometry, lng: number, lat: number) {
  if (geometry.type === "Polygon") return ringContains(lng, lat, geometry.coordinates[0]);
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygon) => ringContains(lng, lat, polygon[0]));
  }
  return false;
}

function meters2(lng0: number, lat0: number, lng1: number, lat1: number) {
  const x = (lng1 - lng0) * 111320 * Math.cos((lat0 * Math.PI) / 180);
  const y = (lat1 - lat0) * 110540;
  return x * x + y * y;
}

function firstRing(geometry: Geometry): number[][] | null {
  if (geometry.type === "Polygon") return geometry.coordinates[0];
  if (geometry.type === "MultiPolygon") return geometry.coordinates[0]?.[0] ?? null;
  return null;
}

function buildingElevAt(map: MapLibreMap, lng: number, lat: number) {
  const feats = map.querySourceFeatures("protomaps", { sourceLayer: "buildings" });
  let best = 0;
  let near = 0;
  let nearDist = 30 * 30;
  for (const feat of feats) {
    if (!feat.geometry) continue;
    const height = extrudedMeters(Number(feat.properties?.height) || 0);
    if (featureContains(feat.geometry, lng, lat)) {
      best = Math.max(best, height);
      continue;
    }
    const ring = firstRing(feat.geometry);
    if (!ring) continue;
    for (const [x, y] of ring) {
      const d = meters2(lng, lat, x, y);
      if (d < nearDist) {
        nearDist = d;
        near = height;
      }
    }
  }
  const elev = best || near;
  return elev > 0 ? elev + 2 : 0;
}

function pinImageData(color: string, selected: boolean) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(32, 42);
  ctx.rotate(-Math.PI / 4);
  const r = 14;
  if (selected) {
    ctx.strokeStyle = "#1f1c18";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.roundRect(-r, -r, r * 2, r * 2, [r, r, r, 0]);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-r, -r, r * 2, r * 2, [r, r, r, 0]);
  ctx.fill();
  ctx.stroke();
  return ctx.getImageData(0, 0, size, size);
}

function ensurePinImages(map: MapLibreMap) {
  const images: [string, string, boolean][] = [
    ["pin-store", CAFE, false],
    ["pin-store-sel", CAFE, true],
    ["pin-comp", RIVAL, false],
    ["pin-comp-sel", RIVAL, true],
  ];
  for (const [id, color, selected] of images) {
    const image = pinImageData(color, selected);
    if (map.hasImage(id)) map.updateImage(id, image);
    else map.addImage(id, image, { pixelRatio: 2 });
  }
}

function restyleBasemap(map: MapLibreMap) {
  const layers = map.getStyle()?.layers ?? [];
  for (const layer of layers) {
    const id = layer.id;
    const type = layer.type;
    const name = id.toLowerCase();
    if (id.startsWith("store-") || id.startsWith("live-") || id.startsWith("circle-") || id === "radius-outline" || id === "buildings-3d") {
      continue;
    }
    try {
      if (type === "background") {
        map.setPaintProperty(id, "background-color", PAPER_GROUND);
      }
      if (type === "fill" && /water/.test(name)) {
        map.setPaintProperty(id, "fill-color", WATER);
      }
      if (type === "line" && /water/.test(name)) {
        map.setPaintProperty(id, "line-color", WATER);
      }
      if (type === "fill" && /(park|grass|wood|landcover|landuse|pitch)/.test(name)) {
        map.setPaintProperty(id, "fill-color", PARK);
      }
      if (type === "fill" && /building/.test(name)) {
        map.setPaintProperty(id, "fill-color", BUILDING_FILL);
      }
      if (type === "line" && /(road|street|path|bridge|tunnel|motorway|highway|rail)/.test(name)) {
        map.setPaintProperty(
          id,
          "line-color",
          /(casing|case|outline)/.test(name) ? ROAD_CASE : ROAD,
        );
      }
      if (type === "symbol") {
        map.setLayoutProperty(id, "visibility", "none");
      }
    } catch {
      // Some Positron layers reject paint keys we don't care about.
    }
  }
}

function setBuildingExtrusion(map: MapLibreMap, extruded: boolean) {
  if (!map.getSource("protomaps")) return;
  if (!map.getLayer("buildings-3d")) {
    map.addLayer(
      {
        id: "buildings-3d",
        type: "fill-extrusion",
        source: "protomaps",
        "source-layer": "buildings",
        minzoom: 13,
        paint: {
          "fill-extrusion-color": BUILDING_FILL,
          "fill-extrusion-height": BUILDING_HEIGHT,
          "fill-extrusion-base": ["coalesce", ["get", "min_height"], 0],
          "fill-extrusion-opacity": 0.92,
          "fill-extrusion-vertical-gradient": true,
        },
      },
      map.getLayer("boundary_country_outline")
        ? "boundary_country_outline"
        : undefined,
    );
  } else {
    map.setPaintProperty("buildings-3d", "fill-extrusion-height", BUILDING_HEIGHT);
    map.setPaintProperty("buildings-3d", "fill-extrusion-color", BUILDING_FILL);
  }
  map.setLayoutProperty(
    "buildings-3d",
    "visibility",
    extruded ? "visible" : "none",
  );
  for (const id of ["building", "building-top"]) {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, "visibility", extruded ? "none" : "visible");
    }
  }
}

function peopleCollection(
  trips: MapTrip[],
  paths: Map<string, [number, number][]>,
  startedAt: Map<string, number>,
  now: number,
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: trips.flatMap((trip) => {
      const path = paths.get(routeCacheKey(trip.from, trip.to));
      const start = startedAt.get(trip.id);
      if (!path || start == null) return [];
      const duration = tripDurationMs(path);
      const t = (now - start) / duration;
      if (t <= 0 || t >= 1) return [];
      const [lng, lat] = pointAlongPath(path, t);
      return [
        {
          type: "Feature" as const,
          properties: {
            own: trip.own ? 1 : 0,
            customers: trip.customers,
            fade: t > 0.75 ? 1 - (t - 0.75) / 0.25 : 1,
          },
          geometry: { type: "Point" as const, coordinates: [lng, lat] },
        },
      ];
    }),
  };
}

export default function StoreMap({
  store,
  competitors,
  radiusKm,
  selectedId,
  onSelect,
  overlay,
  trips = [],
  streamId = 0,
}: {
  store: Business;
  competitors: MapCompetitor[];
  radiusKm: number;
  selectedId: string | null;
  onSelect: (placeId: string | null) => void;
  // Panel drawn over the map, e.g. the selected store's menu
  overlay?: ReactNode;
  trips?: MapTrip[];
  streamId?: number;
}) {
  const mapRef = useRef<MapRef>(null);
  const bounds = useMemo(
    () => windowBounds(store.latitude, store.longitude, radiusKm),
    [store.latitude, store.longitude, radiusKm],
  );
  const radiusArea = useMemo(
    () => radiusPolygon(store.latitude, store.longitude, radiusKm),
    [store.latitude, store.longitude, radiusKm],
  );
  const maskArea = useMemo(
    () => maskPolygon(store.latitude, store.longitude, radiusKm),
    [store.latitude, store.longitude, radiusKm],
  );

  const [is3d, setIs3d] = useState(true);
  const camera = is3d ? CAMERA_3D : CAMERA_2D;
  const [mapReady, setMapReady] = useState(false);
  const [pinElev, setPinElev] = useState<Record<string, number>>({});
  const [people, setPeople] = useState<FeatureCollection>(EMPTY_PEOPLE);
  const pathsRef = useRef(new globalThis.Map<string, [number, number][]>());
  const startedAt = useRef(new globalThis.Map<string, number>());
  const dayOrigin = useRef(0);
  const tripsRef = useRef(trips);
  tripsRef.current = trips;
  const streamIdRef = useRef(streamId);
  streamIdRef.current = streamId;
  const hasPeopleRef = useRef(false);
  const routeKey = trips
    .map((trip) => routeCacheKey(trip.from, trip.to))
    .sort()
    .join("|");

  useEffect(() => {
    mapRef.current?.fitBounds(bounds, { ...camera, duration: 600 });
  }, [bounds]);

  const competitorIds = competitors.map((c) => c.business.placeId).join(",");
  const pinPlaces = useMemo(
    () => [store, ...competitors.map((c) => c.business)],
    [store, competitorIds],
  );
  const pins = useMemo<FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: pinPlaces.map((business) => ({
        type: "Feature" as const,
        properties: {
          placeId: business.placeId,
          kind: business.placeId === store.placeId ? "store" : "competitor",
          selected: business.placeId === selectedId ? 1 : 0,
          name: business.name,
          elev: is3d ? (pinElev[business.placeId] ?? 0) : 0,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [business.longitude, business.latitude],
        },
      })),
    }),
    [pinPlaces, store.placeId, selectedId, pinElev, is3d],
  );

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map?.isStyleLoaded()) return;
    ensurePinImages(map);
    setBuildingExtrusion(map, is3d);
  }, [is3d]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const measure = () => {
      if (!map.isStyleLoaded()) return;
      if (!is3d) {
        setPinElev({});
        return;
      }
      const next: Record<string, number> = {};
      for (const business of pinPlaces) {
        next[business.placeId] = buildingElevAt(
          map,
          business.longitude,
          business.latitude,
        );
      }
      setPinElev((prev) => {
        const keys = Object.keys(next);
        if (
          keys.length === Object.keys(prev).length &&
          keys.every((key) => prev[key] === next[key])
        ) {
          return prev;
        }
        return next;
      });
    };
    measure();
    map.on("moveend", measure);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onSource = (event: { sourceId?: string }) => {
      if (event.sourceId && event.sourceId !== "protomaps") return;
      clearTimeout(timer);
      timer = setTimeout(measure, 250);
    };
    map.on("sourcedata", onSource);
    return () => {
      clearTimeout(timer);
      map.off("moveend", measure);
      map.off("sourcedata", onSource);
    };
  }, [is3d, pinPlaces, mapReady]);

  useEffect(() => {
    if (!routeKey) {
      pathsRef.current = new globalThis.Map();
      return;
    }
    let cancelled = false;
    const unique = [
      ...new Set(tripsRef.current.map((trip) => routeCacheKey(trip.from, trip.to))),
    ];
    const byKey = new globalThis.Map(
      tripsRef.current.map((trip) => [routeCacheKey(trip.from, trip.to), trip]),
    );
    (async () => {
      let next = 0;
      await Promise.all(
        [0, 1, 2, 3].map(async () => {
          while (!cancelled && next < unique.length) {
            const key = unique[next++];
            const trip = byKey.get(key);
            if (!trip || pathsRef.current.has(key)) continue;
            const path = await fetchRoadPath(trip.from, trip.to);
            pathsRef.current.set(key, path);
          }
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [routeKey]);

  useEffect(() => {
    startedAt.current = new globalThis.Map();
    dayOrigin.current = 0;
    hasPeopleRef.current = false;
    setPeople(EMPTY_PEOPLE);
  }, [streamId]);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const now = performance.now();
      const current = tripsRef.current;
      const starts = startedAt.current;
      if (!streamIdRef.current || !current.length) {
        if (hasPeopleRef.current) {
          hasPeopleRef.current = false;
          setPeople(EMPTY_PEOPLE);
        }
        frame = requestAnimationFrame(tick);
        return;
      }
      if (!dayOrigin.current) dayOrigin.current = now;
      const origin = dayOrigin.current;
      for (const trip of current) {
        if (starts.has(trip.id)) continue;
        const scheduled = origin + trip.spawnAt * DAY_PLAY_MS;
        starts.set(
          trip.id,
          scheduled > now ? scheduled : now + trip.spawnAt * 800,
        );
      }
      hasPeopleRef.current = true;
      setPeople(peopleCollection(current, pathsRef.current, starts, now));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggle3d = () => {
    const next = !is3d;
    setIs3d(next);
    mapRef.current?.easeTo({
      ...(next ? CAMERA_3D : CAMERA_2D),
      duration: 800,
    });
  };

  return (
    <div className="store-map">
      <Map
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        initialViewState={{ bounds, ...camera }}
        mapStyle={BASEMAP_STYLE}
        maxBounds={[...bounds[0], ...bounds[1]]}
        maxPitch={70}
        dragPan
        dragRotate={false}
        scrollZoom
        doubleClickZoom
        touchZoomRotate
        touchPitch={false}
        keyboard
        boxZoom
        interactiveLayerIds={["store-pins"]}
        onLoad={() => {
          const map = mapRef.current?.getMap();
          if (!map) return;
          lockRotation(map);
          restyleBasemap(map);
          ensurePinImages(map);
          setBuildingExtrusion(map, is3d);
          map.once("idle", () => restyleBasemap(map));
          map.resize();
          setMapReady(true);
        }}
        onMouseMove={(event) => {
          const map = mapRef.current?.getMap();
          if (!map) return;
          const overPin = event.features?.some((f) => f.layer.id === "store-pins");
          map.getCanvas().style.cursor = overPin ? "pointer" : "";
        }}
        onClick={(event) => {
          const placeId = event.features?.find((f) => f.layer.id === "store-pins")
            ?.properties?.placeId;
          onSelect(typeof placeId === "string" ? placeId : null);
        }}
      >
        <Source id="live-people" type="geojson" data={people}>
          <Layer
            id="live-people-dots"
            type="circle"
            interactive={false}
            paint={{
              "circle-color": [
                "case",
                ["==", ["get", "own"], 1],
                CAFE,
                RIVAL,
              ],
              "circle-radius": 3.5,
              "circle-pitch-alignment": "viewport",
              "circle-pitch-scale": "viewport",
              "circle-opacity": [
                "interpolate",
                ["linear"],
                ["get", "fade"],
                0,
                0,
                1,
                0.95,
              ],
              "circle-stroke-width": 1,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>
        <Source id="circle-mask" type="geojson" data={maskArea}>
          <Layer
            id="circle-mask-fill"
            type="fill"
            paint={{
              "fill-color": PAPER,
              "fill-opacity": 0.88,
              "fill-antialias": true,
            }}
          />
        </Source>
        <Source id="radius" type="geojson" data={radiusArea}>
          <Layer
            id="radius-outline"
            type="line"
            paint={{
              "line-color": RIVAL,
              "line-width": 2,
              "line-opacity": 0.75,
              "line-dasharray": [3, 2],
            }}
          />
        </Source>

        <Source id="store-pin-data" type="geojson" data={pins}>
          <Layer
            id="store-pins"
            type="symbol"
            layout={{
              "icon-image": [
                "case",
                [
                  "all",
                  ["==", ["get", "kind"], "store"],
                  ["==", ["get", "selected"], 1],
                ],
                "pin-store-sel",
                ["==", ["get", "kind"], "store"],
                "pin-store",
                ["==", ["get", "selected"], 1],
                "pin-comp-sel",
                "pin-comp",
              ],
              "icon-size": [
                "case",
                ["==", ["get", "kind"], "store"],
                0.55,
                0.45,
              ],
              "icon-anchor": "bottom",
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
              "icon-pitch-alignment": "viewport",
              "text-field": ["get", "name"],
              "text-font": [
                "Montserrat Medium",
                "Open Sans Regular",
                "Noto Sans Regular",
              ],
              "text-size": [
                "case",
                ["==", ["get", "selected"], 1],
                13,
                ["==", ["get", "kind"], "store"],
                12,
                11,
              ],
              "text-variable-anchor": [
                "top",
                "bottom",
                "left",
                "right",
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
              ],
              "text-radial-offset": 1.15,
              "text-padding": 6,
              "text-max-width": 8,
              "text-allow-overlap": false,
              "text-ignore-placement": false,
              "text-optional": true,
              "text-pitch-alignment": "viewport",
              "text-rotation-alignment": "viewport",
              "text-justify": "center",
              "symbol-sort-key": [
                "case",
                ["==", ["get", "kind"], "store"],
                0,
                ["==", ["get", "selected"], 1],
                1,
                2,
              ],
              "symbol-height-anchor": "ground",
              "symbol-height-offset": ["get", "elev"],
            }}
            paint={{
              "text-color": [
                "case",
                ["==", ["get", "kind"], "store"],
                CAFE,
                RIVAL,
              ],
              "text-halo-color": PAPER,
              "text-halo-width": 1.5,
              "text-halo-blur": 0.2,
            }}
          />
        </Source>
      </Map>
      <button type="button" className="map-toggle" onClick={toggle3d}>
        {is3d ? "2D" : "3D"}
      </button>
      {overlay}
    </div>
  );
}
