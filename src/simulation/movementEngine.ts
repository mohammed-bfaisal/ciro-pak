import type { Resource } from '../types';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Interpolate position along a GeoJSON coordinate array ([lng, lat] pairs) at fraction t (0-1)
function interpolateAlongRoute(coords: [number, number][], t: number): { lat: number; lng: number } {
  if (coords.length === 0) return { lat: 0, lng: 0 };
  if (t <= 0) return { lat: coords[0][1], lng: coords[0][0] };
  if (t >= 1) return { lat: coords[coords.length - 1][1], lng: coords[coords.length - 1][0] };

  // Compute cumulative segment distances (Euclidean in degrees — fine at city scale)
  const segLengths: number[] = [];
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const dx = coords[i][0] - coords[i - 1][0];
    const dy = coords[i][1] - coords[i - 1][1];
    const d = Math.sqrt(dx * dx + dy * dy);
    segLengths.push(d);
    total += d;
  }

  const target = t * total;
  let accumulated = 0;
  for (let i = 0; i < segLengths.length; i++) {
    if (accumulated + segLengths[i] >= target) {
      const frac = (target - accumulated) / segLengths[i];
      const lng = lerp(coords[i][0], coords[i + 1][0], frac);
      const lat = lerp(coords[i][1], coords[i + 1][1], frac);
      return { lat, lng };
    }
    accumulated += segLengths[i];
  }

  const last = coords[coords.length - 1];
  return { lat: last[1], lng: last[0] };
}

export function tickMovement(resources: Resource[], deltaMinutes: number): Resource[] {
  return resources.map((r) => {
    if ((r.status === 'en_route' || r.status === 'dispatched') && r.targetPosition) {
      const eta = r.etaMinutes ?? 10;
      const progress = Math.min(1, r.movementProgress + deltaMinutes / eta);

      const pos = r.routeCoordinates && r.routeCoordinates.length > 1
        ? interpolateAlongRoute(r.routeCoordinates, progress)
        : {
            lat: lerp(r.currentPosition.lat, r.targetPosition.lat, progress),
            lng: lerp(r.currentPosition.lng, r.targetPosition.lng, progress),
          };

      if (progress >= 1) {
        return {
          ...r,
          movementProgress: 0,
          currentPosition: r.targetPosition,
          status: 'on_scene' as const,
          availabilityCooldownMinutes: r.availabilityCooldownMinutes ?? 3,
          lastEtaMinutes: r.etaMinutes,
        };
      }

      return {
        ...r,
        movementProgress: progress,
        currentPosition: { lat: pos.lat, lng: pos.lng, label: r.currentPosition.label },
      };
    }

    if (r.status === 'on_scene') {
      const nextCooldown = (r.availabilityCooldownMinutes ?? 3) - deltaMinutes;
      if (nextCooldown > 0) {
        return { ...r, availabilityCooldownMinutes: nextCooldown };
      }

      return {
        ...r,
        status: 'returning' as const,
        movementProgress: 0,
        targetPosition: r.location,
        availabilityCooldownMinutes: undefined,
        returnRouteCoordinates: r.returnRouteCoordinates
          ?? (r.routeCoordinates ? [...r.routeCoordinates].reverse() : undefined),
      };
    }

    if (r.status === 'returning') {
      const progress = Math.min(1, r.movementProgress + deltaMinutes / 10);
      const returnRoute = r.returnRouteCoordinates
        ?? (r.routeCoordinates ? [...r.routeCoordinates].reverse() : undefined);
      const pos = returnRoute && returnRoute.length > 1
        ? interpolateAlongRoute(returnRoute, progress)
        : {
            lat: lerp(r.currentPosition.lat, r.location.lat, progress),
            lng: lerp(r.currentPosition.lng, r.location.lng, progress),
          };

      if (progress >= 1) {
        return {
          ...r,
          movementProgress: 0,
          currentPosition: r.location,
          status: 'available' as const,
          assignedCrisisId: null,
          targetPosition: undefined,
          routeCoordinates: undefined,
          returnRouteCoordinates: undefined,
          assignmentHistory: closeAssignmentHistory(r.assignmentHistory, r.assignedCrisisId),
        };
      }
      return {
        ...r,
        movementProgress: progress,
        currentPosition: { lat: pos.lat, lng: pos.lng, label: r.location.label },
      };
    }

    return r;
  });
}

function closeAssignmentHistory(
  history: Resource['assignmentHistory'],
  crisisId: string | null,
): Resource['assignmentHistory'] {
  if (!history || !crisisId) return history;
  const clearedAt = new Date().toISOString();
  return history.map((entry) =>
    entry.crisisId === crisisId && !entry.clearedAt
      ? { ...entry, clearedAt }
      : entry
  );
}
