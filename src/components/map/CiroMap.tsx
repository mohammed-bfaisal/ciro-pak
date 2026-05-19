import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DARK_STYLE, CITY_COORDS } from '../../constants/mapStyles';
import { useSignalStore } from '../../store/signalStore';
import { useCrisisStore } from '../../store/crisisStore';
import { useResourceStore } from '../../store/resourceStore';
import { getCrisisColor, getCredColor } from '../../constants/colors';
import { createVehicleMarkerEl } from './VehicleMarker';
import { initRouteLayer, updateRouteLayer } from './RouteLayer';
import { removeDisplayAccessibilityLayers, syncDisplayAccessibilityLayers } from './displayAccessibilityLayers';
import { removeFoundationLayers, syncFoundationLayers } from './foundationLayers';
import { haversineDistance } from '../../utils/geo';
import { fetchRoute } from '../../api/routing';
import { getMapTilePreloader, scheduleMapTilePreload } from '../../utils/mapTilePreloader';
import type { City } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';

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
  const foundationEnabled = useSettingsStore((s) => s.p00.enabled);
  const displayAccessibilityEnabled = useSettingsStore((s) => s.p02.enabled);

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

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    const sync = () => syncFoundationLayers(map, city, foundationEnabled);
    if (map.isStyleLoaded()) sync();
    else map.once('load', sync);
  }, [city, foundationEnabled]);

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    const sync = () => syncDisplayAccessibilityLayers(map, city, displayAccessibilityEnabled);
    if (map.isStyleLoaded()) sync();
    else map.once('load', sync);
  }, [city, displayAccessibilityEnabled]);

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
    if (!mapInstance.current || signals.length === 0) return;
    const map = mapInstance.current;

    const addSignals = () => {
      if (!map.getSource('signals-heat')) {
        map.addSource('signals-heat', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: signals.map((s) => ({
              type: 'Feature' as const,
              geometry: { type: 'Point' as const, coordinates: [s.location.lng, s.location.lat] },
              properties: { weight: s.credibilityScore * s.urgencyScore },
            })),
          },
        });
        map.addLayer({
          id: 'signals-heatmap',
          type: 'heatmap',
          source: 'signals-heat',
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
      } else {
        (map.getSource('signals-heat') as maplibregl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: signals.map((s) => ({
            type: 'Feature' as const,
            geometry: { type: 'Point' as const, coordinates: [s.location.lng, s.location.lat] },
            properties: { weight: s.credibilityScore * s.urgencyScore },
          })),
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
    else map.on('load', addSignals);
  }, [signals]);

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
          const routeResult = await fetchRoute(fromLng, fromLat, crisis.location.lng, crisis.location.lat);
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
  }, [crises, dispatchMode, selectedUnitId]);

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
      if (mapInstance.current) {
        removeFoundationLayers(mapInstance.current);
        removeDisplayAccessibilityLayers(mapInstance.current);
      }
      signalMarkersRef.current.forEach((m) => m.remove());
      crisisMarkersRef.current.forEach((m) => m.remove());
      vehicleMarkersRef.current.forEach((m) => m.remove());
    };
  }, []);

  return (
    <div ref={mapRef} className="w-full h-full" style={{ position: 'absolute', inset: 0 }} />
  );
}
