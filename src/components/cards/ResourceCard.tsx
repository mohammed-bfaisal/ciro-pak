import type { Resource } from '../../types';
import { Badge } from '../ui/Badge';
import { colors, getStatusColor } from '../../constants/colors';
import { capitalize } from '../../utils/formatting';
import { Truck, Shield, Heart, Flame, Droplets, Radio, Navigation } from 'lucide-react';

const typeIcons: Record<string, typeof Truck> = {
  ambulance: Heart,
  police_unit: Shield,
  rescue_team: Navigation,
  fire_truck: Flame,
  medical_outreach: Heart,
  water_tanker: Droplets,
  drone: Radio,
};

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const Icon = typeIcons[resource.type] || Truck;
  const statusColor = getStatusColor(resource.status);

  return (
    <div
      className="p-3 rounded-lg border flex items-center gap-3"
      style={{
        background: colors.raised,
        borderColor: colors.borderDefault,
        borderLeft: `3px solid ${statusColor}`,
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: statusColor + '18', color: statusColor }}
      >
        <Icon size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-medium truncate" style={{ color: colors.textPrimary }}>
            {resource.label}
          </span>
          <Badge label={resource.status} variant="status" />
        </div>
        <div className="flex items-center gap-3 text-[11px]" style={{ color: colors.textDim }}>
          <span>{capitalize(resource.type)}</span>
          {resource.etaMinutes && <span>ETA: {resource.etaMinutes}min</span>}
          <span>📍 {resource.location.label}</span>
        </div>
      </div>
    </div>
  );
}
