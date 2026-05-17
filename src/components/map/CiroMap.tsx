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
import { haversineDistance } from '../../utils/geo';
import type { City } from '../../types';

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
  const resources      = useResourceStore((s) => s.resources);
  const selectedUnitId = useResourceStore((s) => s.selectedUnitId);
  const dispatchMode   = useResourceStore((s) => s.dispatchMode);
  const selectUnit     = useResourceStore((s) => s.selectUnit);

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
    });
    const observer = new ResizeObserver(() => mapInstance.current?.resize());
    observer.observe(container);
    mapInstance.current.on('load', () => {
      initRouteLayer(mapInstance.current!);
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
    mapInstance.current.flyTo({
      center: CITY_COORDS[city].center,
      zoom: CITY_COORDS[city].zoom,
      duration: 1500,
    });
  }, [city]);

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
          new maplibregl.Marker({ element: el })
            .setLngLat([signal.location.lng, signal.location.lat])
            .addTo(map)
        );
      });
    };

    if (map.isStyleLoaded()) addSignals();
    else map.on('load', addSignals);
  }, [signals]);

  // Crisis markers — recreate on change, dispatch-aware
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
      el.style.cssText = `position:relative;width:${size}px;height:${size}px;cursor:pointer`;
      el.innerHTML = `
        <div style="position:absolute;inset:0;border-radius:50%;background:${color}33;border:${isSelectTarget ? 3 : 2}px solid ${color};animation:pulse-ring 1.5s cubic-bezier(0.215,0.61,0.355,1) infinite"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${isSelectTarget ? 18 : 14}px;height:${isSelectTarget ? 18 : 14}px;border-radius:50%;background:${color};box-shadow:0 0 12px ${color};animation:pulse-dot 2s ease-in-out infinite"></div>
      `;

      el.onclick = () => {
        // Use getState() to avoid stale closure over selectedUnitId/dispatchMode
        const store = useResourceStore.getState();
        if (store.dispatchMode === 'manual' && store.selectedUnitId) {
          const unit = store.resources.find((r) => r.id === store.selectedUnitId);
          const fromLat = unit?.currentPosition.lat ?? crisis.location.lat;
          const fromLng = unit?.currentPosition.lng ?? crisis.location.lng;
          const distKm = haversineDistance(fromLat, fromLng, crisis.location.lat, crisis.location.lng);
          const etaMinutes = Math.max(2, Math.round((distKm / 30) * 60));
          store.dispatchUnit(store.selectedUnitId, crisis.id, crisis.location, etaMinutes);
        } else {
          onCrisisClick?.(crisis.id);
        }
      };

      crisisMarkersRef.current.push(
        new maplibregl.Marker({ element: el })
          .setLngLat([crisis.location.lng, crisis.location.lat])
          .addTo(map)
      );
    });
  }, [crises, dispatchMode, selectedUnitId]);

  // Vehicle markers — clear all and recreate on every resource change
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Remove markers for resources no longer in state
    vehicleMarkersRef.current.forEach((marker, id) => {
      if (!resources.find((r) => r.id === id)) {
        marker.remove();
        vehicleMarkersRef.current.delete(id);
      }
    });

    resources.forEach((resource) => {
      const isSelected = resource.id === selectedUnitId;
      const existing = vehicleMarkersRef.current.get(resource.id);

      if (existing) {
        // Move to updated position
        existing.setLngLat([resource.currentPosition.lng, resource.currentPosition.lat]);
        // Rebuild element to reflect status/selection changes without flicker
        const newEl = createVehicleMarkerEl(resource, isSelected);
        newEl.onclick = () => {
          if (useResourceStore.getState().dispatchMode !== 'ai') {
            const s = useResourceStore.getState();
            s.selectUnit(s.selectedUnitId === resource.id ? null : resource.id);
          }
        };
        // Replace the DOM element in-place via a fresh marker, then discard old one
        const updated = new maplibregl.Marker({ element: newEl })
          .setLngLat([resource.currentPosition.lng, resource.currentPosition.lat])
          .addTo(map);
        existing.remove();
        vehicleMarkersRef.current.set(resource.id, updated);
      } else {
        const el = createVehicleMarkerEl(resource, isSelected);
        el.onclick = () => {
          if (useResourceStore.getState().dispatchMode !== 'ai') {
            const s = useResourceStore.getState();
            s.selectUnit(s.selectedUnitId === resource.id ? null : resource.id);
          }
        };
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([resource.currentPosition.lng, resource.currentPosition.lat])
          .addTo(map);
        vehicleMarkersRef.current.set(resource.id, marker);
      }
    });

    // Update dashed route lines
    if (map.isStyleLoaded()) {
      updateRouteLayer(map, resources);
    }
  }, [resources, selectedUnitId, dispatchMode]);

  // Cursor: crosshair when a unit is selected in manual mode
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
