import type { Resource } from '../../types';
import { getStatusColor } from '../../constants/colors';

const TYPE_ICON: Record<Resource['type'], string> = {
  ambulance:        '🚑',
  police_unit:      '🚓',
  fire_truck:       '🚒',
  rescue_team:      '🦺',
  water_tanker:     '🚰',
  medical_outreach: '⛑️',
  drone:            '🛸',
};

// Same structure as crisis markers: fixed 32x32 box, all children absolutely
// centered with translate(-50%, -50%). This keeps MapLibre's anchor:'center'
// pinned to the visual center of the emoji at every zoom level.
export function createVehicleMarkerEl(resource: Resource, selected: boolean): HTMLDivElement {
  const el = document.createElement('div');
  el.style.cssText = `position:absolute;width:32px;height:32px;cursor:pointer;user-select:none`;

  if (selected) {
    const ring = document.createElement('div');
    ring.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:42px;height:42px;border-radius:50%;border:2px solid #f59e0b;animation:vehicle-select-ring 1s ease-in-out infinite;pointer-events:none`;
    el.appendChild(ring);
  }

  // Emoji centered using same absolute-center pattern as crisis pulse-dot
  const icon = document.createElement('div');
  icon.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:22px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.85));pointer-events:none`;
  icon.textContent = TYPE_ICON[resource.type] ?? '🚗';

  // Status indicator as a small corner badge — doesn't shift the anchor
  const statusColor = getStatusColor(resource.status);
  const dot = document.createElement('div');
  dot.style.cssText = `position:absolute;bottom:0;right:0;width:8px;height:8px;border-radius:50%;background:${statusColor};border:1.5px solid rgba(0,0,0,0.85);box-shadow:0 0 4px ${statusColor};pointer-events:none`;

  el.appendChild(icon);
  el.appendChild(dot);
  return el;
}
