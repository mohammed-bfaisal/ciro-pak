import { AlertTriangle, Bot, Play, SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { GlassPanel } from '../ui/GlassPanel';
import { colors } from '../../constants/colors';
import { CITY_REGISTRY } from '../../data/cities';
import { formatP04ActionLabel, type P04MissionAction, type P04Status } from '../../foundation/missionBriefing';
import type { City } from '../../types';

interface MissionBriefingPanelProps {
  action: P04MissionAction;
  city: City;
  backendStatus: P04Status;
  message?: string;
  busy?: boolean;
  onStart: () => void;
  onEditScenario: () => void;
  onCancel: () => void;
}

export function MissionBriefingPanel({
  action,
  city,
  backendStatus,
  message,
  busy = false,
  onStart,
  onEditScenario,
  onCancel,
}: MissionBriefingPanelProps) {
  const cityLabel = CITY_REGISTRY[city].label;
  const actionLabel = formatP04ActionLabel(action);
  const Icon = action === 'ai_dispatch' ? Bot : Play;
  const statusLabel = backendStatus === 'fallback' ? 'offline fallback' : backendStatus;

  return (
    <GlassPanel
      amber
      className="absolute left-2 right-2 top-2 z-40 max-h-[calc(100dvh-180px)] overflow-y-auto p-3 shadow-2xl desktop:left-1/2 desktop:right-auto desktop:top-16 desktop:w-[420px] desktop:-translate-x-1/2 desktop:p-4"
      style={{ borderRadius: 14 }}
      data-ciro-p04-briefing="true"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: colors.amberMuted, color: colors.amber }}>
              <Icon size={16} />
            </span>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textDim }}>
                Mission briefing
              </div>
              <h2 className="truncate text-base font-semibold" style={{ color: colors.textPrimary }}>
                {cityLabel} {actionLabel}
              </h2>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ color: colors.textDim, background: colors.raised }}
          aria-label="Cancel mission briefing"
        >
          <X size={15} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge label="P04" variant="status" />
        <Badge label={statusLabel} variant="status" />
      </div>

      <p className="mt-3 text-xs leading-5" style={{ color: colors.textSecondary }}>
        Review the city, command intent, and fallback path before this {actionLabel} changes the live board.
      </p>

      <div className="mt-3 rounded-lg p-3 text-xs leading-5" style={{ background: colors.raised, color: colors.textSecondary }}>
        <div className="mb-1 flex items-center gap-2 font-semibold" style={{ color: colors.amber }}>
          <AlertTriangle size={13} />
          Operator gate
        </div>
        {message ?? 'Hosted backend status is being checked. Bundled briefing data remains available offline.'}
      </div>

      <div className="mt-3 grid gap-2 tablet:grid-cols-3">
        <button
          type="button"
          onClick={onStart}
          disabled={busy}
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
          style={{
            background: colors.amber,
            color: colors.void,
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
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
          style={{
            background: colors.raised,
            color: colors.textPrimary,
            border: `1px solid ${colors.borderDefault}`,
            opacity: busy ? 0.7 : 1,
          }}
        >
          <SlidersHorizontal size={15} />
          Edit Scenario
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
          style={{
            background: 'rgba(248,113,113,0.10)',
            color: colors.danger,
            border: '1px solid rgba(248,113,113,0.22)',
            opacity: busy ? 0.7 : 1,
          }}
        >
          <X size={15} />
          Cancel
        </button>
      </div>
    </GlassPanel>
  );
}
