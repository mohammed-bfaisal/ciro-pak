import type { ReactNode } from 'react';
import { Activity, Clock, Gauge, ShieldCheck } from 'lucide-react';
import { useResourceStore } from '../../store/resourceStore';
import { useSessionStore } from '../../store/sessionStore';
import { colors } from '../../constants/colors';

export function SessionStats() {
  const live = useSessionStore((s) => s.live);
  const simulationSpeed = useResourceStore((s) => s.simulationSpeed);
  const resources = useResourceStore((s) => s.resources);

  if (!live) return null;

  const score = live.score;
  const available = resources.filter((resource) => resource.status === 'available').length;
  const busy = resources.length - available;

  return (
    <div
      className="absolute z-20 rounded-xl px-3 py-2"
      style={{
        top: 54,
        right: 12,
        width: 'min(300px, calc(100vw - 24px))',
        background: 'rgba(17,17,17,0.92)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${colors.borderDefault}`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <Metric icon={<Clock size={14} />} label="Shift" value={formatClock(live.elapsedMinutes)} />
        <Metric icon={<Gauge size={14} />} label="Speed" value={`${simulationSpeed}x`} />
        <Metric icon={<Activity size={14} />} label="Units" value={`${busy}/${resources.length}`} />
        <Metric icon={<ShieldCheck size={14} />} label="Trust" value={`${score.publicTrust}%`} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
        <Score label="Handled" value={score.handledIncidents} color={colors.success} />
        <Score label="Missed" value={score.missedIncidents} color={colors.danger} />
        <Score label="Avg resp" value={`${score.averageResponseMinutes}m`} color={colors.amber} />
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1" style={{ color: colors.amber }}>
        {icon}
        <span className="text-[10px] font-semibold">{label}</span>
      </div>
      <div className="text-sm font-semibold leading-tight" style={{ color: colors.textPrimary }}>
        {value}
      </div>
    </div>
  );
}

function Score({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-md px-2 py-1" style={{ background: colors.raised }}>
      <div style={{ color: colors.textDim }}>{label}</div>
      <div className="font-semibold" style={{ color }}>{value}</div>
    </div>
  );
}

function formatClock(minutes: number): string {
  const total = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(total / 60).toString().padStart(2, '0');
  const mins = (total % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}
