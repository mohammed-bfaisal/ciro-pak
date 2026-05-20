import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DARK_STYLE, CITY_COORDS } from '../../constants/mapStyles';
import { useSignalStore } from '../../store/signalStore';
import { useCrisisStore } from '../../store/crisisStore';
import { useResourceStore } from '../../store/resourceStore';
import { useLiveDataStore } from '../../store/liveDataStore';
import { getApiClientOptionsForSettings, useSettingsStore } from '../../store/settingsStore';
import { getCrisisColor, getCredColor } from '../../constants/colors';
import { createVehicleMarkerEl } from './VehicleMarker';
import { initRouteLayer, updateRouteLayer } from './RouteLayer';
import { buildTrafficLineFeatureCollection } from './trafficOverlay';
import { haversineDistance } from '../../utils/geo';
import { fetchRoute } from '../../api/routing';
import { getMapTilePreloader, scheduleMapTilePreload } from '../../utils/mapTilePreloader';
import type { City } from '../../types';

const SIGNAL_SOURCE_ID = 'signals-heat';
const SIGNAL_LAYER_ID = 'signals-heatmap';
const CRISIS_RADIUS_SOURCE_ID = 'crisis-radius-source';
const CRISIS_RADIUS_LAYER_ID = 'crisis-radius-layer';
const TRAFFIC_FLOW_SOURCE_ID = 'traffic-flow-source';
const TRAFFIC_FLOW_LAYER_ID = 'traffic-flow-layer';
const RESOURCE_COVERAGE_SOURCE_ID = 'resource-coverage-source';
const RESOURCE_COVERAGE_LAYER_ID = 'resource-coverage-layer';

interface CiroMapProps {
  city: City;
  onCrisisClick?: (crisisId: string) => void;
}

export function CiroMap({ city, onCrisisClick }: CiroMapProps) {
  const mapRef          = useRef<HTMLDivElement>(null);
  const mapInstance     = useRef<maplibregl.Map | null>(null);
  const signalMarkersRef  = useRef<maplibregl.Marker[]>([]);
  const crisisMarkersRef  = useRef<maplibregl.Marker[]>([]);
  const vehicleMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  const signals        = useSignalStore((s) => s.signals);
  const crises         = useCrisisStore((s) => s.crises);
  const selectedCrisisId = useCrisisStore((s) => s.selectedCrisisId);
  const resources      = useResourceStore((s) => s.resources);
  const selectedUnitId = useResourceStore((s) => s.selectedUnitId);
  const dispatchMode   = useResourceStore((s) => s.dispatchMode);
  const preferBackendData = useSettingsStore((s) => s.preferBackendData);
  const showSignalHeatmap = useSettingsStore((s) => s.showSignalHeatmap);
  const showCrisisRadius = useSettingsStore((s) => s.showCrisisRadius);
  const showResourceCoverage = useSettingsStore((s) => s.showResourceCoverage);
  const showTrafficLayer = useSettingsStore((s) => s.showTrafficLayer);
  const trafficFlows = useLiveDataStore((s) => s.trafficFlows);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const container = mapRef.current;
    mapInstance.current = new maplibregl.Map({
      container,
      style: DARK_STYLE,
      center: CITY_COORDS[city].center,
      zoom: CITY_COORDS[city].zoom,
      attributionControl: false,
      refreshExpiredTiles: false,
      maxTileCacheSize: 320,
      maxTileCacheZoomLevels: 8,
    });
    const observer = new ResizeObserver(() => mapInstance.current?.resize());
    observer.observe(container);
    mapInstance.current.on('load', () => {
      initRouteLayer(mapInstance.current!);
      const preloader = getMapTilePreloader();
      void preloader?.preloadCriticalMetadata();
      scheduleMapTilePreload(() => {
        void preloader?.preloadAllCities();
      }, 2500);
    });
    return () => {
      observer.disconnect();
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Fly to city on change
  useEffect(() => {
    if (!mapInstance.current) return;
    void getMapTilePreloader()?.preloadCity(city);
    mapInstance.current.easeTo({
      center: CITY_COORDS[city].center,
      zoom: CITY_COORDS[city].zoom,
      duration: 500,
      essential: true,
    });
  }, [city]);

  // Fly to selected unit (bidirectional: panel → map)
  useEffect(() => {
    if (!mapInstance.current || !selectedUnitId) return;
    const unit = resources.find((r) => r.id === selectedUnitId);
    if (!unit) return;
    mapInstance.current.flyTo({
      center: [unit.currentPosition.lng, unit.currentPosition.lat],
      zoom: 14,
      duration: 800,
    });
  }, [selectedUnitId]);

  // Fly to selected crisis (bidirectional: panel → map)
  useEffect(() => {
    if (!mapInstance.current || !selectedCrisisId) return;
    const crisis = crises.find((c) => c.id === selectedCrisisId);
    if (!crisis) return;
    mapInstance.current.flyTo({
      center: [crisis.location.lng, crisis.location.lat],
      zoom: 13,
      duration: 800,
    });
  }, [selectedCrisisId]);

  // Signal heatmap + pins
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    const clearSignals = () => {
      signalMarkersRef.current.forEach((marker) => marker.remove());
      signalMarkersRef.current = [];
      removeLayerAndSource(map, SIGNAL_LAYER_ID, SIGNAL_SOURCE_ID);
    };

    if (!showSignalHeatmap || signals.length === 0) {
      clearSignals();
      return;
    }

    const addSignals = () => {
      const data = {
        type: 'FeatureCollection' as const,
        features: signals.map((s) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [s.location.lng, s.location.lat] },
          properties: { weight: s.credibilityScore * s.urgencyScore },
        })),
      };

      if (!map.getSource(SIGNAL_SOURCE_ID)) {
        map.addSource(SIGNAL_SOURCE_ID, {
          type: 'geojson',
          data,
        });
      } else {
        (map.getSource(SIGNAL_SOURCE_ID) as maplibregl.GeoJSONSource).setData(data);
      }

      if (!map.getLayer(SIGNAL_LAYER_ID)) {
        map.addLayer({
          id: SIGNAL_LAYER_ID,
          type: 'heatmap',
          source: SIGNAL_SOURCE_ID,
          paint: {
            'heatmap-weight': ['get', 'weight'],
            'heatmap-intensity': 1.5,
            'heatmap-radius': 30,
            'heatmap-opacity': 0.6,
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0,0,0,0)',
              0.2, 'rgba(245,158,11,0.2)',
              0.4, 'rgba(245,158,11,0.4)',
              0.6, 'rgba(234,88,12,0.6)',
              0.8, 'rgba(239,68,68,0.7)',
              1, 'rgba(239,68,68,0.9)',
            ],
          },
        });
      }

      signalMarkersRef.current.forEach((m) => m.remove());
      signalMarkersRef.current = [];
      signals.forEach((signal) => {
        const el = document.createElement('div');
        el.style.cssText = `width:10px;height:10px;border-radius:50%;background:${getCredColor(signal.credibilityScore)};border:2px solid rgba(0,0,0,0.3);cursor:pointer;box-shadow:0 0 6px ${getCredColor(signal.credibilityScore)}`;
        el.title = `${signal.source}: ${signal.content.slice(0, 50)}...`;
        signalMarkersRef.current.push(
          new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat([signal.location.lng, signal.location.lat])
            .addTo(map)
        );
      });
    };

    if (map.isStyleLoaded()) addSignals();
    else map.once('load', addSignals);

    return () => {
      map.off('load', addSignals);
    };
  }, [signals, showSignalHeatmap]);

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    const updateCrisisRadius = () => {
      if (!showCrisisRadius || crises.length === 0) {
        removeLayerAndSource(map, CRISIS_RADIUS_LAYER_ID, CRISIS_RADIUS_SOURCE_ID);
        return;
      }

      const data = {
        type: 'FeatureCollection' as const,
        features: crises.map((crisis) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [crisis.location.lng, crisis.location.lat] },
          properties: {
            radiusKm: crisis.location.affectedRadiusKm,
            color: getCrisisColor(crisis.type),
          },
        })),
      };

      upsertGeoJsonSource(map, CRISIS_RADIUS_SOURCE_ID, data);
      if (!map.getLayer(CRISIS_RADIUS_LAYER_ID)) {
        map.addLayer({
          id: CRISIS_RADIUS_LAYER_ID,
          type: 'circle',
          source: CRISIS_RADIUS_SOURCE_ID,
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['get', 'radiusKm'], 0, 0, 1, 18, 5, 52, 10, 84],
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.14,
            'circle-stroke-color': ['get', 'color'],
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.62,
          },
        });
      }
    };

    if (map.isStyleLoaded()) updateCrisisRadius();
    else map.once('load', updateCrisisRadius);
    return () => {
      map.off('load', updateCrisisRadius);
    };
  }, [crises, showCrisisRadius]);

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    const flows = Object.values(trafficFlows);

    const updateTrafficLayer = () => {
      const data = buildTrafficLineFeatureCollection(flows, resources);

      if (!showTrafficLayer || data.features.length === 0) {
        removeLayerAndSource(map, TRAFFIC_FLOW_LAYER_ID, TRAFFIC_FLOW_SOURCE_ID);
        return;
      }

      upsertGeoJsonSource(map, TRAFFIC_FLOW_SOURCE_ID, data);
      if (!map.getLayer(TRAFFIC_FLOW_LAYER_ID)) {
        map.addLayer({
          id: TRAFFIC_FLOW_LAYER_ID,
          type: 'line',
          source: TRAFFIC_FLOW_SOURCE_ID,
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': ['match', ['get', 'congestion'], 'standstill', 7, 'heavy', 6, 'moderate', 5, 4],
            'line-opacity': 0.82,
            'line-blur': 0.35,
          },
        });
      }
      if (map.getLayer(TRAFFIC_FLOW_LAYER_ID)) {
        map.moveLayer(TRAFFIC_FLOW_LAYER_ID);
      }
    };

    if (map.isStyleLoaded()) updateTrafficLayer();
    else map.once('load', updateTrafficLayer);
    return () => {
      map.off('load', updateTrafficLayer);
    };
  }, [trafficFlows, resources, showTrafficLayer]);

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    const updateResourceCoverage = () => {
      const availableResources = resources.filter((resource) => resource.status === 'available');
      if (!showResourceCoverage || availableResources.length === 0) {
        removeLayerAndSource(map, RESOURCE_COVERAGE_LAYER_ID, RESOURCE_COVERAGE_SOURCE_ID);
        return;
      }

      const data = {
        type: 'FeatureCollection' as const,
        features: availableResources.map((resource) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [resource.currentPosition.lng, resource.currentPosition.lat] },
          properties: {
            radius: Math.min(40, Math.max(16, resource.capacity * 8)),
          },
        })),
      };

      upsertGeoJsonSource(map, RESOURCE_COVERAGE_SOURCE_ID, data);
      if (!map.getLayer(RESOURCE_COVERAGE_LAYER_ID)) {
        map.addLayer({
          id: RESOURCE_COVERAGE_LAYER_ID,
          type: 'circle',
          source: RESOURCE_COVERAGE_SOURCE_ID,
          paint: {
            'circle-radius': ['get', 'radius'],
            'circle-color': '#60a5fa',
            'circle-opacity': 0.08,
            'circle-stroke-color': '#60a5fa',
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.45,
          },
        });
      }
    };

    if (map.isStyleLoaded()) updateResourceCoverage();
    else map.once('load', updateResourceCoverage);
    return () => {
      map.off('load', updateResourceCoverage);
    };
  }, [resources, showResourceCoverage]);

  // Crisis markers — dispatch-aware, rebuild on change
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    crisisMarkersRef.current.forEach((m) => m.remove());
    crisisMarkersRef.current = [];

    crises.forEach((crisis) => {
      const color = getCrisisColor(crisis.type);
      const isSelectTarget = dispatchMode === 'manual' && selectedUnitId;
      const size = isSelectTarget ? 40 : 32;

      const el = document.createElement('div');
      el.style.cssText = `position:absolute;width:${size}px;height:${size}px;cursor:pointer`;
      el.innerHTML = `
        <div style="position:absolute;inset:0;border-radius:50%;background:${color}33;border:${isSelectTarget ? 3 : 2}px solid ${color};animation:pulse-ring 1.5s cubic-bezier(0.215,0.61,0.355,1) infinite"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${isSelectTarget ? 18 : 14}px;height:${isSelectTarget ? 18 : 14}px;border-radius:50%;background:${color};box-shadow:0 0 12px ${color};animation:pulse-dot 2s ease-in-out infinite"></div>
      `;

      el.onclick = async () => {
        const store = useResourceStore.getState();
        if (store.dispatchMode === 'manual' && store.selectedUnitId) {
          const unit = store.resources.find((r) => r.id === store.selectedUnitId);
          const fromLat = unit?.currentPosition.lat ?? crisis.location.lat;
          const fromLng = unit?.currentPosition.lng ?? crisis.location.lng;

          // Fetch real road route; fall back to haversine ETA if OSRM unreachable
          const routeResult = await fetchRoute(
            fromLng,
            fromLat,
            crisis.location.lng,
            crisis.location.lat,
            getApiClientOptionsForSettings(),
          );
          const etaSeconds = routeResult?.etaSeconds
            ?? Math.max(120, Math.round((haversineDistance(fromLat, fromLng, crisis.location.lat, crisis.location.lng) / 30) * 3600));

          store.dispatchUnit(store.selectedUnitId, crisis.id, crisis.location, etaSeconds, routeResult?.coords, routeResult ?? undefined);
        } else {
          onCrisisClick?.(crisis.id);
        }
      };

      crisisMarkersRef.current.push(
        new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([crisis.location.lng, crisis.location.lat])
          .addTo(map)
      );
    });
  }, [crises, dispatchMode, selectedUnitId, preferBackendData]);

  // Vehicle markers — full rebuild only when structure changes (status, selection, dispatchMode, count)
  // NOT on every tick — position updates are handled separately below.
  const rebuildKey = [
    resources.map((r) => `${r.id}:${r.status}:${r.id === selectedUnitId ? 'sel' : ''}`).join('|'),
    dispatchMode,
  ].join('/');

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Clear every existing vehicle marker before recreating
    vehicleMarkersRef.current.forEach((m) => m.remove());
    vehicleMarkersRef.current.clear();

    const locationGroups = new Map<string, typeof resources>();
    resources.forEach((r) => {
      const key = `${r.currentPosition.lng.toFixed(5)},${r.currentPosition.lat.toFixed(5)}`;
      if (!locationGroups.has(key)) locationGroups.set(key, []);
      locationGroups.get(key)!.push(r);
    });

    resources.forEach((resource) => {
      const el = createVehicleMarkerEl(resource, resource.id === selectedUnitId);
      el.onclick = () => {
        const s = useResourceStore.getState();
        if (s.dispatchMode !== 'ai') {
          s.selectUnit(s.selectedUnitId === resource.id ? null : resource.id);
        }
      };

      const key = `${resource.currentPosition.lng.toFixed(5)},${resource.currentPosition.lat.toFixed(5)}`;
      const group = locationGroups.get(key)!;
      const index = group.findIndex((g) => g.id === resource.id);
      const offsetX = group.length > 1 ? (index - (group.length - 1) / 2) * 18 : 0;

      const marker = new maplibregl.Marker({ element: el, anchor: 'center', offset: [offsetX, 0] })
        .setLngLat([resource.currentPosition.lng, resource.currentPosition.lat])
        .addTo(map);
      vehicleMarkersRef.current.set(resource.id, marker);
    });

    if (map.isStyleLoaded()) {
      updateRouteLayer(map, resources);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rebuildKey]);

  // Vehicle marker position updates — cheap, runs on every tick.
  // setLngLat() moves the existing DOM element via CSS transform;
  // no marker is destroyed or created, so there are no overflow artifacts.
  useEffect(() => {
    const locationGroups = new Map<string, typeof resources>();
    resources.forEach((r) => {
      const key = `${r.currentPosition.lng.toFixed(5)},${r.currentPosition.lat.toFixed(5)}`;
      if (!locationGroups.has(key)) locationGroups.set(key, []);
      locationGroups.get(key)!.push(r);
    });

    resources.forEach((resource) => {
      const marker = vehicleMarkersRef.current.get(resource.id);
      if (marker) {
        const key = `${resource.currentPosition.lng.toFixed(5)},${resource.currentPosition.lat.toFixed(5)}`;
        const group = locationGroups.get(key)!;
        const index = group.findIndex((g) => g.id === resource.id);
        const offsetX = group.length > 1 ? (index - (group.length - 1) / 2) * 18 : 0;

        marker.setLngLat([resource.currentPosition.lng, resource.currentPosition.lat]);
        marker.setOffset([offsetX, 0]);
      }
    });

    if (mapInstance.current?.isStyleLoaded()) {
      updateRouteLayer(mapInstance.current, resources);
    }
  }, [resources]);

  // Crosshair cursor in manual dispatch mode with unit selected
  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.getCanvas().style.cursor =
      dispatchMode === 'manual' && selectedUnitId ? 'crosshair' : '';
  }, [dispatchMode, selectedUnitId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      signalMarkersRef.current.forEach((m) => m.remove());
      crisisMarkersRef.current.forEach((m) => m.remove());
      vehicleMarkersRef.current.forEach((m) => m.remove());
    };
  }, []);

  return (
    <div ref={mapRef} className="w-full h-full" style={{ position: 'absolute', inset: 0 }} />
  );
}

function upsertGeoJsonSource(
  map: maplibregl.Map,
  sourceId: string,
  data: GeoJSON.FeatureCollection,
) {
  const source = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
  if (source) {
    source.setData(data);
    return;
  }
  map.addSource(sourceId, {
    type: 'geojson',
    data,
  });
}

function removeLayerAndSource(map: maplibregl.Map, layerId: string, sourceId: string) {
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }
}
