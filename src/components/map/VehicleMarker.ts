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

export function createVehicleMarkerEl(resource: Resource, selected: boolean): HTMLDivElement {
  const el = document.createElement('div');
  el.style.cssText = `
    position: relative;
    width: 32px;
    height: 36px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    user-select: none;
  `;

  if (selected) {
    const ring = document.createElement('div');
    ring.style.cssText = `
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 2px solid #f59e0b;
      animation: vehicle-select-ring 1s ease-in-out infinite;
      pointer-events: none;
    `;
    el.appendChild(ring);
  }

  const icon = document.createElement('div');
  icon.style.cssText = `
    font-size: 20px;
    line-height: 1;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.7));
    transform: ${selected ? 'scale(1.25)' : 'scale(1)'};
    transition: transform 0.15s;
  `;
  icon.textContent = TYPE_ICON[resource.type] ?? '🚗';

  const statusColor = getStatusColor(resource.status);
  const dot = document.createElement('div');
  dot.style.cssText = `
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${statusColor};
    border: 1.5px solid rgba(0,0,0,0.6);
    box-shadow: 0 0 5px ${statusColor};
    flex-shrink: 0;
  `;

  el.appendChild(icon);
  el.appendChild(dot);
  return el;
}
