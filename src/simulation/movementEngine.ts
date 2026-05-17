import type { Resource } from '../types';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function tickMovement(resources: Resource[], deltaMinutes: number): Resource[] {
  return resources.map((r) => {
    if ((r.status === 'en_route' || r.status === 'dispatched') && r.targetPosition) {
      const eta = r.etaMinutes ?? 10;
      const progress = Math.min(1, r.movementProgress + deltaMinutes / eta);
      const lat = lerp(r.currentPosition.lat, r.targetPosition.lat, progress);
      const lng = lerp(r.currentPosition.lng, r.targetPosition.lng, progress);
      return {
        ...r,
        movementProgress: progress,
        currentPosition: { lat, lng, label: r.currentPosition.label },
        status: progress >= 1 ? ('on_scene' as const) : r.status,
      };
    }

    if (r.status === 'returning') {
      const progress = Math.min(1, r.movementProgress + deltaMinutes / 10);
      const lat = lerp(r.currentPosition.lat, r.location.lat, progress);
      const lng = lerp(r.currentPosition.lng, r.location.lng, progress);
      if (progress >= 1) {
        return {
          ...r,
          movementProgress: 0,
          currentPosition: r.location,
          status: 'available' as const,
          assignedCrisisId: null,
          targetPosition: undefined,
        };
      }
      return {
        ...r,
        movementProgress: progress,
        currentPosition: { lat, lng, label: r.location.label },
      };
    }

    return r;
  });
}
