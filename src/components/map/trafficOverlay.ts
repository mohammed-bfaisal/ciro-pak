import type { TrafficFlow } from '../../api/traffic';
import type { CongestionLevel, Resource, TrafficSegment } from '../../types';

interface TrafficLineProperties {
  color: string;
  congestion: CongestionLevel;
  source: 'flow' | 'route' | 'fallback_probe';
  isFallback?: boolean;
  label?: string;
}

type TrafficLineFeature = GeoJSON.Feature<GeoJSON.LineString, TrafficLineProperties>;

export function buildTrafficLineFeatureCollection(
  flows: TrafficFlow[],
  resources: Resource[],
): GeoJSON.FeatureCollection<GeoJSON.LineString, TrafficLineProperties> {
  const flowFeatures = flows.flatMap((flow) => {
    const segmentFeatures = buildSegmentFeatures(flow.trafficSegments, 'flow');
    return segmentFeatures.length > 0 ? segmentFeatures : [buildFallbackProbeFeature(flow)];
  });
  const routeFeatures = resources
    .filter((resource) => resource.status === 'en_route' || resource.status === 'dispatched')
    .flatMap((resource) => buildSegmentFeatures(resource.routeTrafficSegments, 'route'));

  return {
    type: 'FeatureCollection',
    features: [...flowFeatures, ...routeFeatures],
  };
}

function buildFallbackProbeFeature(flow: TrafficFlow): TrafficLineFeature {
  const lngOffset = 0.008;
  const latOffset = 0.0035;

  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
        [flow.lng - lngOffset, flow.lat - latOffset],
        [flow.lng + lngOffset, flow.lat + latOffset],
      ],
    },
    properties: {
      color: '#f59e0b',
      congestion: flow.congestionLevel,
      source: 'fallback_probe',
      isFallback: true,
      label: flow.provider === 'google' ? 'No Google road geometry' : 'Simulated traffic probe',
    },
  };
}

export function getTrafficColor(congestionLevel: CongestionLevel): string {
  switch (congestionLevel) {
    case 'free':
      return '#34d399';
    case 'moderate':
      return '#fbbf24';
    case 'heavy':
      return '#fb923c';
    case 'standstill':
      return '#f87171';
    default:
      return '#60a5fa';
  }
}

function buildSegmentFeatures(
  segments: TrafficSegment[] | undefined,
  source: TrafficLineProperties['source'],
): TrafficLineFeature[] {
  return (segments ?? [])
    .filter((segment) => segment.coords.length >= 2)
    .map((segment) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: segment.coords,
      },
      properties: {
        color: getTrafficColor(segment.congestionLevel),
        congestion: segment.congestionLevel,
        source,
      },
    }));
}
