import type { Crisis, Resource, ResourceAllocation } from '../types';
import { haversineDistance } from '../utils/geo';

const SEVERITY_ORDER: Record<Crisis['severity'], number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const CRISIS_RESOURCE_NEEDS: Record<Crisis['type'], Resource['type'][]> = {
  flood: ['rescue_team', 'water_tanker', 'police_unit'],
  heatwave: ['ambulance', 'medical_outreach', 'water_tanker'],
  accident: ['ambulance', 'police_unit', 'rescue_team'],
  infrastructure: ['rescue_team', 'fire_truck', 'drone'],
  power_outage: ['fire_truck', 'rescue_team', 'drone'],
  protest: ['police_unit', 'medical_outreach', 'drone'],
  disease_cluster: ['medical_outreach', 'ambulance', 'drone'],
  unknown: ['rescue_team', 'police_unit'],
};

export function resourceAllocationAgent(
  crises: Crisis[],
  resources: Resource[],
): ResourceAllocation[] {
  const allocations: ResourceAllocation[] = [];
  const assigned = new Set<string>();
  const activeCrises = crises
    .filter((crisis) => crisis.status !== 'resolved' && crisis.status !== 'false_alarm')
    .sort((a, b) => {
      const severityDelta = SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity];
      if (severityDelta !== 0) return severityDelta;
      return (b.confidenceScore * b.affectedPopulation) - (a.confidenceScore * a.affectedPopulation);
    });

  for (const crisis of activeCrises) {
    const neededTypes = CRISIS_RESOURCE_NEEDS[crisis.type] ?? CRISIS_RESOURCE_NEEDS.unknown;
    const targetCount = SEVERITY_ORDER[crisis.severity] >= 3 ? 3 : 2;

    for (const neededType of neededTypes.slice(0, targetCount)) {
      const available = resources.filter((resource) =>
        resource.status === 'available' &&
        !resource.assignedCrisisId &&
        !assigned.has(resource.id)
      );
      if (available.length === 0) break;

      const ranked = available
        .map((resource) => scoreResource(resource, crisis, neededType))
        .sort((a, b) => b.score - a.score);
      const winner = ranked[0];

      allocations.push(winner);
      assigned.add(winner.resourceId);
    }
  }

  return allocations;
}

function scoreResource(
  resource: Resource,
  crisis: Crisis,
  neededType: Resource['type'],
): ResourceAllocation {
  const currentPosition = resource.currentPosition ?? resource.location;
  const distanceKm = haversineDistance(
    currentPosition.lat,
    currentPosition.lng,
    crisis.location.lat,
    crisis.location.lng,
  );
  const etaMinutes = Math.max(1, Math.round((distanceKm / 32) * 60));
  const typeMatch = resource.type === neededType
    ? 36
    : (CRISIS_RESOURCE_NEEDS[crisis.type] ?? []).includes(resource.type)
      ? 20
      : 6;
  const severity = SEVERITY_ORDER[crisis.severity] * 14;
  const confidence = crisis.confidenceScore * 22;
  const affectedPopulation = Math.min(18, Math.log10(Math.max(10, crisis.affectedPopulation)) * 4);
  const travelTime = Math.max(0, 24 - Math.min(24, etaMinutes * 1.35));
  const availability = resource.status === 'available' && !resource.assignedCrisisId ? 18 : 0;
  const score = Number((
    severity +
    confidence +
    affectedPopulation +
    typeMatch +
    travelTime +
    availability
  ).toFixed(1));

  const fitText = resource.type === neededType
    ? `type match for ${neededType}`
    : `fallback for ${neededType}`;

  return {
    resourceId: resource.id,
    crisisId: crisis.id,
    score,
    etaMinutes,
    tradeoff: `${fitText}; ${etaMinutes} min travel; preserves other available units for competing incidents.`,
    factors: {
      severity,
      confidence: Number(confidence.toFixed(1)),
      affectedPopulation: Number(affectedPopulation.toFixed(1)),
      typeMatch,
      travelTime: Number(travelTime.toFixed(1)),
      availability,
    },
    reasoning: [
      `${resource.label} -> ${crisis.title}`,
      `${fitText}`,
      `severity ${crisis.severity}, confidence ${Math.round(crisis.confidenceScore * 100)}%, affected ${crisis.affectedPopulation.toLocaleString()} people`,
      `travel ETA ${etaMinutes} min, allocation score ${score}`,
    ].join('; '),
  };
}
