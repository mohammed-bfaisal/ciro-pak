import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DARK_STYLE } from '../../constants/mapStyles';
import { CITY_REGISTRY } from '../../data/cities';
import { useSignalStore } from '../../store/signalStore';
import { useCrisisStore } from '../../store/crisisStore';
import { getCrisisColor, getCredColor } from '../../constants/colors';
import type { City } from '../../types';

interface CiroMapProps {
  city: City;
  onCrisisClick?: (crisisId: string) => void;
}

export function CiroMap({ city, onCrisisClick }: CiroMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const signals = useSignalStore((s) => s.signals);
  const crises = useCrisisStore((s) => s.crises);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = new maplibregl.Map({
      container: mapRef.current,
      style: DARK_STYLE,
      center: [CITY_REGISTRY[city].lng, CITY_REGISTRY[city].lat],
      zoom: CITY_REGISTRY[city].zoom,
      attributionControl: false,
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Fly to city on change
  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.flyTo({
      center: [CITY_REGISTRY[city].lng, CITY_REGISTRY[city].lat],
      zoom: CITY_REGISTRY[city].zoom,
      duration: 1500,
    });
  }, [city]);

  // Add signal pins
  useEffect(() => {
    if (!mapInstance.current || signals.length === 0) return;
    const map = mapInstance.current;

    // Wait for map style to load
    const addSignals = () => {
      // Add heatmap source
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

      // Add signal pin markers with entrance pulse
      signals.forEach((signal, idx) => {
        const color = getCredColor(signal.credibilityScore);
        const el = document.createElement('div');
        el.style.position = 'relative';
        el.style.width = '14px';
        el.style.height = '14px';
        el.style.cursor = 'pointer';
        el.title = `${signal.source}: ${signal.content.slice(0, 50)}...`;
        el.innerHTML = `
          <div style="
            position:absolute;inset:0;border-radius:50%;
            background:${color}33;border:1.5px solid ${color}88;
            animation:signal-pulse 2s ease-out ${idx * 80}ms both;
          "></div>
          <div style="
            position:absolute;top:50%;left:50%;
            transform:translate(-50%,-50%);
            width:7px;height:7px;border-radius:50%;
            background:${color};
            box-shadow:0 0 5px ${color};
            animation:signal-arrive 0.4s ease-out ${idx * 80}ms both;
          "></div>
        `;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([signal.location.lng, signal.location.lat])
          .addTo(map);
        markersRef.current.push(marker);
      });
    };

    if (map.isStyleLoaded()) {
      addSignals();
    } else {
      map.on('load', addSignals);
    }
  }, [signals]);

  // Add crisis markers
  useEffect(() => {
    if (!mapInstance.current || crises.length === 0) return;
    const map = mapInstance.current;

    crises.forEach((crisis) => {
      const color = getCrisisColor(crisis.type);

      const el = document.createElement('div');
      el.style.position = 'relative';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="
          position: absolute; inset: 0; border-radius: 50%;
          background: ${color}33; border: 2px solid ${color};
          animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        "></div>
        <div style="
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 14px; height: 14px; border-radius: 50%;
          background: ${color};
          box-shadow: 0 0 12px ${color};
          animation: pulse-dot 2s ease-in-out infinite;
        "></div>
      `;
      el.onclick = () => onCrisisClick?.(crisis.id);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([crisis.location.lng, crisis.location.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [crises, onCrisisClick]);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      style={{ position: 'absolute', inset: 0 }}
    />
  );
}
