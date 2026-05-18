import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCrisisStore } from '../../store/crisisStore';
import { useResourceStore } from '../../store/resourceStore';
import { colors, getCrisisColor, getSeverityColor } from '../../constants/colors';

const CRISIS_ICON: Record<string, string> = {
  flood: '🌊', heatwave: '🌡️', accident: '💥',
  infrastructure: '🏗️', power_outage: '⚡', protest: '🗣️',
  disease_cluster: '🦠', unknown: '❓',
};

export function IncidentRegistry() {
  const [collapsed, setCollapsed] = useState(false);
  const crises     = useCrisisStore((s) => s.crises);
  const selectCrisis = useCrisisStore((s) => s.selectCrisis);
  const resources  = useResourceStore((s) => s.resources);

  if (crises.length === 0) return null;

  return (
    <div
      className="hidden desktop:block absolute bottom-4 right-2 z-20 rounded-xl overflow-hidden"
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
          INCIDENTS ({crises.length})
        </span>
        {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {!collapsed && (
        <div className="overflow-y-auto hide-scrollbar" style={{ maxHeight: 216 }}>
          {crises.map((crisis) => {
            const assignedCount = resources.filter((r) => r.assignedCrisisId === crisis.id).length;
            const needsResponse = assignedCount === 0 &&
              (crisis.severity === 'critical' || crisis.severity === 'high');
            const crisisColor = getCrisisColor(crisis.type);
            const severityColor = getSeverityColor(crisis.severity);

            return (
              <button
                key={crisis.id}
                onClick={() => selectCrisis(crisis.id)}
                className="w-full flex items-start gap-2 px-3 py-2 text-left border-t"
                style={{ borderColor: colors.borderSubtle, cursor: 'pointer' }}
              >
                <span style={{ fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>
                  {CRISIS_ICON[crisis.type] ?? '❓'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium truncate" style={{ color: colors.textPrimary }}>
                    {crisis.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-semibold" style={{ color: severityColor }}>
                      {crisis.severity}
                    </span>
                    <span className="text-[10px]" style={{ color: colors.textDim }}>
                      · {assignedCount} unit{assignedCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {needsResponse && (
                    <div
                      className="text-[10px] font-semibold mt-0.5"
                      style={{ color: crisisColor, animation: 'fast-pulse 1.2s ease-in-out infinite' }}
                    >
                      ⚠ Needs response
                    </div>
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
