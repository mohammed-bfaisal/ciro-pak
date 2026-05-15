import type { Crisis, Resource, ResourceAllocation } from '../types';

export function resourceAllocationAgent(
  crises: Crisis[],
  resources: Resource[]
): ResourceAllocation[] {
  const allocations: ResourceAllocation[] = [];
  const assigned = new Set<string>();

  // Sort crises by severity priority
  const severityOrder: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const sortedCrises = [...crises].sort(
    (a, b) => severityOrder[b.severity] - severityOrder[a.severity]
  );

  for (const crisis of sortedCrises) {
    const available = resources.filter((r) => !assigned.has(r.id));

    if (crisis.severity === 'critical') {
      // Critical gets priority — allocate 4 units
      const rescueTeams = available.filter((r) => r.type === 'rescue_team');
      const ambulances = available.filter((r) => r.type === 'ambulance');
      const police = available.filter((r) => r.type === 'police_unit');

      for (const team of rescueTeams.slice(0, 2)) {
        allocations.push({
          resourceId: team.id,
          crisisId: crisis.id,
          reasoning: `Rescue team ${team.label} assigned to ${crisis.title} — CRITICAL severity, ${crisis.affectedPopulation} affected. Distance: ${estimateDistance(team, crisis)}km.`,
        });
        assigned.add(team.id);
      }

      for (const amb of ambulances.slice(0, 1)) {
        allocations.push({
          resourceId: amb.id,
          crisisId: crisis.id,
          reasoning: `Ambulance ${amb.label} assigned to ${crisis.title} — medical support for evacuees. ETA ~${estimateETA(amb, crisis)} min.`,
        });
        assigned.add(amb.id);
      }

      for (const unit of police.slice(0, 1)) {
        allocations.push({
          resourceId: unit.id,
          crisisId: crisis.id,
          reasoning: `Traffic police ${unit.label} assigned for crowd/traffic management at ${crisis.location.label}.`,
        });
        assigned.add(unit.id);
      }
    } else if (crisis.severity === 'high') {
      // High severity — allocate 2 units
      const medical = available.filter((r) => r.type === 'medical_outreach');
      const ambulances = available.filter((r) => r.type === 'ambulance');
      const drones = available.filter((r) => r.type === 'drone');

      for (const med of medical.slice(0, 1)) {
        allocations.push({
          resourceId: med.id,
          crisisId: crisis.id,
          reasoning: `Medical outreach ${med.label} assigned to ${crisis.title} — on-site treatment needed for ${crisis.type} victims.`,
        });
        assigned.add(med.id);
      }

      if (ambulances.length > 0 && !assigned.has(ambulances[0].id)) {
        allocations.push({
          resourceId: ambulances[0].id,
          crisisId: crisis.id,
          reasoning: `Ambulance ${ambulances[0].label} on standby for ${crisis.title} — transport critical cases to hospital.`,
        });
        assigned.add(ambulances[0].id);
      }

      for (const drone of drones.slice(0, 1)) {
        allocations.push({
          resourceId: drone.id,
          crisisId: crisis.id,
          reasoning: `Recon drone ${drone.label} deployed for aerial assessment of ${crisis.type} at ${crisis.location.label}.`,
        });
        assigned.add(drone.id);
      }
    }
  }

  // Log reserve units
  const reserveCount = resources.filter((r) => !assigned.has(r.id)).length;
  if (reserveCount > 0) {
    // Reserve units are tracked but not allocated
  }

  return allocations;
}

function estimateDistance(resource: Resource, crisis: Crisis): string {
  const R = 6371;
  const dLat = ((crisis.location.lat - resource.location.lat) * Math.PI) / 180;
  const dLng = ((crisis.location.lng - resource.location.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((resource.location.lat * Math.PI) / 180) *
      Math.cos((crisis.location.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return d.toFixed(1);
}

function estimateETA(resource: Resource, crisis: Crisis): number {
  const dist = parseFloat(estimateDistance(resource, crisis));
  // Assume 30km/h average emergency vehicle speed in urban area
  return Math.round((dist / 30) * 60);
}
