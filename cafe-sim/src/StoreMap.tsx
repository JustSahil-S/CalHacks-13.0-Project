import { useEffect, useMemo, useRef, useState } from 'react';
import Map, { Layer, Marker, NavigationControl, Popup, Source, type MapRef } from 'react-map-gl/maplibre';
import { setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type { Feature, Polygon } from 'geojson';
import type { Business } from './module_bindings/types';

// MapLibre locates its worker relative to its own file, which breaks once Vite pre-bundles it
setWorkerUrl(maplibreWorkerUrl);

const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
// How much wider than the competitor radius the map window is
const WINDOW_PADDING = 1.2;
const KM_PER_DEGREE_LAT = 111.32;
// Vector source name inside the CARTO style
const BASEMAP_SOURCE = 'protomaps';
// Used for buildings that have no height in OpenStreetMap
const DEFAULT_BUILDING_HEIGHT_M = 8;
const CAMERA_3D = { pitch: 55, bearing: -20 };
const CAMERA_2D = { pitch: 0, bearing: 0 };

export type MapCompetitor = { business: Business; distanceMeters: number };

type Selected = { business: Business; distanceMeters?: number };

function kmToDegrees(lat: number, km: number) {
  return {
    lat: km / KM_PER_DEGREE_LAT,
    lng: km / (KM_PER_DEGREE_LAT * Math.cos((lat * Math.PI) / 180)),
  };
}

function radiusPolygon(lat: number, lng: number, radiusKm: number): Feature<Polygon> {
  const delta = kmToDegrees(lat, radiusKm);
  const ring: [number, number][] = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * 2 * Math.PI;
    ring.push([lng + delta.lng * Math.cos(angle), lat + delta.lat * Math.sin(angle)]);
  }
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } };
}

function windowBounds(lat: number, lng: number, radiusKm: number): [[number, number], [number, number]] {
  const delta = kmToDegrees(lat, radiusKm * WINDOW_PADDING);
  return [
    [lng - delta.lng, lat - delta.lat],
    [lng + delta.lng, lat + delta.lat],
  ];
}

function formatDistance(meters: number) {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(2)} km`;
}

export default function StoreMap({
  store,
  competitors,
  radiusKm,
}: {
  store: Business;
  competitors: MapCompetitor[];
  radiusKm: number;
}) {
  const mapRef = useRef<MapRef>(null);
  const [selected, setSelected] = useState<Selected | null>(null);
  const bounds = useMemo(
    () => windowBounds(store.latitude, store.longitude, radiusKm),
    [store.latitude, store.longitude, radiusKm]
  );
  const radiusArea = useMemo(
    () => radiusPolygon(store.latitude, store.longitude, radiusKm),
    [store.latitude, store.longitude, radiusKm]
  );

  const [is3d, setIs3d] = useState(true);
  const camera = is3d ? CAMERA_3D : CAMERA_2D;

  useEffect(() => {
    mapRef.current?.fitBounds(bounds, { ...camera, duration: 600 });
    setSelected(null);
  }, [bounds]);

  const toggle3d = () => {
    const next = !is3d;
    setIs3d(next);
    mapRef.current?.easeTo({ ...(next ? CAMERA_3D : CAMERA_2D), duration: 800 });
  };

  const pin = (business: Business, kind: 'store' | 'competitor', distanceMeters?: number) => (
    <Marker
      key={business.placeId}
      latitude={business.latitude}
      longitude={business.longitude}
      anchor="bottom"
      onClick={e => {
        e.originalEvent.stopPropagation();
        setSelected({ business, distanceMeters });
      }}
    >
      <div className={`map-pin ${kind}`} title={business.name} />
    </Marker>
  );

  return (
    <div className="store-map">
      <Map
        ref={mapRef}
        initialViewState={{ bounds, ...camera }}
        mapStyle={BASEMAP_STYLE}
        maxPitch={70}
        onClick={() => setSelected(null)}
      >
        <NavigationControl position="top-right" visualizePitch />
        <Layer
          id="buildings-3d"
          type="fill-extrusion"
          source={BASEMAP_SOURCE}
          source-layer="buildings"
          minzoom={13}
          layout={{ visibility: is3d ? 'visible' : 'none' }}
          paint={{
            'fill-extrusion-color': '#d6d6dc',
            'fill-extrusion-height': ['coalesce', ['get', 'height'], DEFAULT_BUILDING_HEIGHT_M],
            'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
            'fill-extrusion-opacity': 0.85,
          }}
        />
        <Source id="radius" type="geojson" data={radiusArea}>
          <Layer id="radius-fill" type="fill" paint={{ 'fill-color': '#2563eb', 'fill-opacity': 0.06 }} />
          <Layer
            id="radius-outline"
            type="line"
            paint={{ 'line-color': '#2563eb', 'line-width': 1.5, 'line-dasharray': [3, 2] }}
          />
        </Source>

        {competitors.map(c => pin(c.business, 'competitor', c.distanceMeters))}
        {pin(store, 'store')}

        {selected && (
          <Popup
            latitude={selected.business.latitude}
            longitude={selected.business.longitude}
            anchor="bottom"
            offset={30}
            closeOnClick={false}
            onClose={() => setSelected(null)}
          >
            <div className="map-popup">
              <strong>{selected.business.name}</strong>
              <div>
                ⭐ {selected.business.rating ? selected.business.rating.toFixed(1) : '–'} ·{' '}
                {selected.business.reviewsCount} reviews
              </div>
              <div className="muted">
                {selected.distanceMeters === undefined
                  ? 'Selected store'
                  : `${formatDistance(selected.distanceMeters)} away`}
              </div>
            </div>
          </Popup>
        )}
      </Map>
      <button type="button" className="map-toggle" onClick={toggle3d}>
        {is3d ? '2D' : '3D'}
      </button>
    </div>
  );
}
