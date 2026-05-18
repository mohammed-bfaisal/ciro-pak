import { useState } from 'react';
import { ChevronDown, ChevronUp, GitCompareArrows } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { colors } from '../../constants/colors';

export function ImpactPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const snapshots = useSessionStore((s) => s.impactSnapshots);

  if (snapshots.length === 0) return null;

  const latest = snapshots.slice(0, 4);

  return (
    <div
      className="absolute z-20 rounded-xl overflow-hidden hidden tablet:block"
      style={{
        top: 54,
        left: 12,
        width: 320,
        maxHeight: collapsed ? 42 : 350,
        background: 'rgba(17,17,17,0.92)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${colors.borderDefault}`,
        transition: 'max-height 0.2s ease',
      }}
    >
      <button
        onClick={() => setCollapsed((value) => !value)}
        className="w-full flex items-center justify-between px-3 py-2.5"
        style={{ color: colors.textPrimary }}
      >
        <span className="flex items-center gap-2 text-xs font-semibold tracking-wide">
          <GitCompareArrows size={14} style={{ color: colors.amber }} />
          BEFORE / AFTER
        </span>
        {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {!collapsed && (
        <div className="px-3 pb-3 space-y-2 overflow-y-auto hide-scrollbar" style={{ maxHeight: 304 }}>
          {latest.map((snapshot) => (
            <div key={snapshot.actionId} className="rounded-lg border p-2" style={{ borderColor: colors.borderSubtle, background: colors.raised }}>
              <div className="text-[10px] font-semibold mb-2" style={{ color: colors.amber }}>
                {snapshot.actionId} to {snapshot.crisisId}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StateBox label="Before" state={snapshot.beforeState} />
                <StateBox label="After" state={snapshot.afterState} />
              </div>
              {snapshot.sideEffects.length > 0 && (
                <div className="mt-2 text-[10px]" style={{ color: colors.textDim }}>
                  {snapshot.sideEffects.join(' | ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StateBox({ label, state }: { label: string; state: Record<string, unknown> }) {
  return (
    <div className="rounded-md p-2" style={{ background: colors.overlay }}>
      <div className="text-[10px] font-semibold mb-1" style={{ color: label === 'After' ? colors.success : colors.textDim }}>
        {label}
      </div>
      <div className="space-y-1">
        {Object.entries(state).slice(0, 4).map(([key, value]) => (
          <div key={key} className="text-[10px] leading-tight" style={{ color: colors.textSecondary }}>
            <span style={{ color: colors.textDim }}>{key}: </span>
            {String(value)}
          </div>
        ))}
      </div>
    </div>
  );
}
