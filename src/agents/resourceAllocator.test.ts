import { describe, expect, it } from 'vitest';
import { getCityData } from '../data/cityData';
import { resourceAllocationAgent } from './resourceAllocator';

describe('resource allocation agent', () => {
  it('scores allocations with type match, travel time, severity, confidence, and availability factors', () => {
    const cityData = getCityData('peshawar');
    const allocations = resourceAllocationAgent(cityData.crises, cityData.resources);

    expect(allocations.length).toBeGreaterThanOrEqual(4);
    expect(allocations.every((allocation) => allocation.score > 0)).toBe(true);
    expect(allocations.every((allocation) => allocation.etaMinutes > 0)).toBe(true);
    expect(allocations.every((allocation) => allocation.reasoning)).toBe(true);

    const criticalCrisis = cityData.crises.find((crisis) => crisis.severity === 'critical');
    const criticalAllocations = allocations.filter((allocation) => allocation.crisisId === criticalCrisis?.id);
    expect(criticalAllocations.length).toBeGreaterThanOrEqual(3);
    expect(criticalAllocations.some((allocation) => allocation.reasoning.includes('type match'))).toBe(true);
    expect(criticalAllocations.some((allocation) => allocation.reasoning.includes('travel'))).toBe(true);
  });

  it('does not allocate unavailable or already busy resources', () => {
    const cityData = getCityData('lahore');
    const busyResource = cityData.resources[0];
    const resources = cityData.resources.map((resource) =>
      resource.id === busyResource.id
        ? { ...resource, status: 'en_route' as const }
        : resource
    );

    const allocations = resourceAllocationAgent(cityData.crises, resources);

    expect(allocations.some((allocation) => allocation.resourceId === busyResource.id)).toBe(false);
    expect(new Set(allocations.map((allocation) => allocation.resourceId)).size).toBe(allocations.length);
  });
});
