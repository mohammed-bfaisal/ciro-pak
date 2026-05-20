import type { TrafficFlow } from '../../api/traffic';
import type { CongestionLevel, Resource, TrafficSegment } from '../../types';

interface TrafficLineProperties {
  color: string;
  congestion: CongestionLevel;
  source: 'flow' | 'route';
}

type TrafficLineFeature = GeoJSON.Feature<GeoJSON.LineString, TrafficLineProperties>;

export function buildTrafficLineFeatureCollection(
  flows: TrafficFlow[],
  resources: Resource[],
): GeoJSON.FeatureCollection<GeoJSON.LineString, TrafficLineProperties> {
  const flowFeatures = flows.flatMap((flow) =>
    buildSegmentFeatures(flow.trafficSegments, 'flow'),
  );
  const routeFeatures = resources
    .filter((resource) => resource.status === 'en_route' || resource.status === 'dispatched')
    .flatMap((resource) => buildSegmentFeatures(resource.routeTrafficSegments, 'route'));

  return {
    type: 'FeatureCollection',
    features: [...flowFeatures, ...routeFeatures],
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
