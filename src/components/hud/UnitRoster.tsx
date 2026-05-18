import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useResourceStore } from '../../store/resourceStore';
import { useCrisisStore } from '../../store/crisisStore';
import { colors, getStatusColor } from '../../constants/colors';
import { formatRouteEta } from '../../utils/formatting';

const TYPE_ICON: Record<string, string> = {
  ambulance: '🚑', police_unit: '🚓', fire_truck: '🚒',
  rescue_team: '🦺', water_tanker: '🚰', medical_outreach: '⛑️', drone: '🛸',
};

export function UnitRoster() {
  const [collapsed, setCollapsed] = useState(false);
  const resources      = useResourceStore((s) => s.resources);
  const selectedUnitId = useResourceStore((s) => s.selectedUnitId);
  const dispatchMode   = useResourceStore((s) => s.dispatchMode);
  const selectUnit     = useResourceStore((s) => s.selectUnit);
  const crises         = useCrisisStore((s) => s.crises);

  if (resources.length === 0) return null;

  return (
    <div
      className="hidden desktop:block absolute bottom-4 left-2 z-20 rounded-xl overflow-hidden"
      style={{
        width: 'min(220px, calc(50vw - 16px))',
        background: 'rgba(17,17,17,0.92)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${colors.borderDefault}`,
        maxHeight: collapsed ? 44 : 260,
        transition: 'max-height 0.25s ease',
      }}
    >
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5"
        style={{ color: colors.textPrimary }}
      >
        <span className="text-xs font-semibold tracking-wide">
          UNITS ({resources.length})
        </span>
        {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {!collapsed && (
        <div className="overflow-y-auto hide-scrollbar" style={{ maxHeight: 216 }}>
          {resources.map((r) => {
            const isSelected = r.id === selectedUnitId;
            const assignedCrisis = crises.find((c) => c.id === r.assignedCrisisId);
            const statusColor = getStatusColor(r.status);

            return (
              <button
                key={r.id}
                onClick={() => {
                  // Always allow selection (for map fly-to); manual mode controls dispatch
                  selectUnit(isSelected ? null : r.id);
                }}
                className="w-full flex items-start gap-2 px-3 py-2 text-left border-t"
                style={{
                  borderColor: colors.borderSubtle,
                  background: isSelected ? colors.amberMuted : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 15, lineHeight: 1.2, flexShrink: 0 }}>{TYPE_ICON[r.type] ?? '🚗'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium truncate" style={{ color: colors.textPrimary }}>
                    {r.label}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                    <span className="text-[10px] truncate" style={{ color: colors.textDim }}>
                      {r.status === 'en_route' && assignedCrisis
                        ? `→ ${assignedCrisis.title.slice(0, 18)}…`
                        : r.status === 'on_scene' && assignedCrisis
                        ? `On scene: ${assignedCrisis.type}`
                        : r.status}
                    </span>
                  </div>
                  {r.status === 'en_route' && (r.etaSeconds !== undefined || r.etaMinutes !== undefined) && (
                    <div className="text-[10px]" style={{ color: colors.amber }}>
                      ETA ~{formatRouteEta((r.etaSeconds ?? ((r.etaMinutes ?? 0) * 60)) * (1 - r.movementProgress))}
                      {dispatchMode === 'manual' && !isSelected && (
                        <span style={{ color: colors.info }}> · tap to select</span>
                      )}
                    </div>
                  )}
                  {r.status === 'available' && dispatchMode === 'manual' && !isSelected && (
                    <div className="text-[10px]" style={{ color: colors.info }}>tap to select</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
