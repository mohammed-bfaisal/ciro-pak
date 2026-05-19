import { AlertTriangle, Bot, ClipboardList, Pencil, Play, X } from 'lucide-react';
import { colors, getSeverityColor } from '../../constants/colors';
import type { MissionBriefing } from '../../foundation/triggeredMissionBriefing';

interface MissionBriefingPanelProps {
  briefing: MissionBriefing;
  busy?: boolean;
  statusMessage?: string;
  onStart: () => void;
  onEditScenario: () => void;
  onCancel: () => void;
}

export function MissionBriefingPanel({
  briefing,
  busy = false,
  statusMessage,
  onStart,
  onEditScenario,
  onCancel,
}: MissionBriefingPanelProps) {
  const title = briefing.trigger === 'ai_dispatch' ? 'AI Dispatch Briefing' : 'Mission Briefing';
  const triggerLabel = briefing.trigger === 'ai_dispatch' ? 'AI Dispatch' : 'Simulation';

  return (
    <section
      className="absolute left-2 right-2 top-2 z-40 max-h-[calc(100%-1rem)] overflow-y-auto rounded-2xl p-3 shadow-2xl desktop:left-1/2 desktop:right-auto desktop:top-14 desktop:w-[420px] desktop:-translate-x-1/2 desktop:p-4"
      role="dialog"
      aria-label={title}
      style={{
        background: 'rgba(12,12,12,0.97)',
        border: `1px solid ${colors.borderStrong}`,
        boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            {briefing.trigger === 'ai_dispatch'
              ? <Bot size={16} style={{ color: colors.amber }} />
              : <ClipboardList size={16} style={{ color: colors.amber }} />
            }
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: colors.textDim }}>
              {triggerLabel}
            </span>
          </div>
          <h2 className="text-base font-semibold leading-tight desktop:text-lg" style={{ color: colors.textPrimary }}>
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5" style={{ color: colors.textSecondary }}>
            {briefing.summary}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          aria-label="Cancel mission briefing"
          style={{ background: colors.raised, color: colors.textSecondary }}
        >
          <X size={15} />
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <BriefingMetric label="City" value={briefing.cityLabel} />
        <BriefingMetric label="Province" value={briefing.province} />
      </dl>

      <div className="mt-3 rounded-xl p-3" style={{ background: colors.raised, border: `1px solid ${colors.borderSubtle}` }}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} style={{ color: colors.warning }} />
          <span className="text-xs font-semibold" style={{ color: colors.textPrimary }}>
            {briefing.scenarioTitle}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {briefing.expectedCrises.map((crisis) => (
            <span
              key={crisis}
              className="rounded-md px-2 py-1 text-[10px] font-semibold uppercase"
              style={{
                background: `${getSeverityColor('high')}22`,
                color: colors.textSecondary,
                border: `1px solid ${colors.borderSubtle}`,
              }}
            >
              {crisis.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {statusMessage && (
        <p className="mt-3 rounded-lg p-2 text-[11px] leading-5" style={{ background: colors.overlay, color: colors.textSecondary }}>
          {statusMessage}
        </p>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={busy}
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold desktop:gap-2 desktop:px-3 desktop:text-sm"
          style={{
            background: colors.amberMuted,
            color: colors.amber,
            border: `1px solid ${colors.borderAmber}`,
            opacity: busy ? 0.7 : 1,
          }}
        >
          <Play size={15} fill="currentColor" />
          Start
        </button>
        <button
          type="button"
          onClick={onEditScenario}
          disabled={busy}
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold desktop:gap-2 desktop:px-3 desktop:text-sm"
          style={{
            background: 'rgba(96,165,250,0.14)',
            color: colors.info,
            border: '1px solid rgba(96,165,250,0.30)',
            opacity: busy ? 0.7 : 1,
          }}
        >
          <Pencil size={15} />
          Edit Scenario
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold desktop:gap-2 desktop:px-3 desktop:text-sm"
          style={{
            background: colors.raised,
            color: colors.textSecondary,
            border: `1px solid ${colors.borderDefault}`,
            opacity: busy ? 0.7 : 1,
          }}
        >
          <X size={15} />
          Cancel
        </button>
      </div>
    </section>
  );
}

function BriefingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg px-2 py-2" style={{ background: colors.raised }}>
      <dt className="text-[10px]" style={{ color: colors.textDim }}>{label}</dt>
      <dd className="mt-1 truncate text-xs font-semibold" style={{ color: colors.textPrimary }}>{value}</dd>
    </div>
  );
}
