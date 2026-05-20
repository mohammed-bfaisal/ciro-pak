import { useCrisisStore } from '../../store/crisisStore';
import { useResourceStore } from '../../store/resourceStore';
import { useSessionStore } from '../../store/sessionStore';
import { colors } from '../../constants/colors';

export function SessionKpiBar() {
  const crises = useCrisisStore((s) => s.crises);
  const resources = useResourceStore((s) => s.resources);
  const simulationRunning = useResourceStore((s) => s.simulationRunning);
  const live = useSessionStore((s) => s.live);

  if (!simulationRunning) return null;

  const activeCrises = crises.filter((c) => c.status !== 'resolved' && c.status !== 'false_alarm').length;
  const deployed = resources.filter((r) => r.status !== 'available').length;
  const actionsExecuted = live?.score.handledIncidents ?? 0;
  const avgResponseMin = live?.score.averageResponseMinutes
    ? Math.round(live.score.averageResponseMinutes)
    : null;

  const items = [
    { label: 'Active crises', value: activeCrises, color: activeCrises > 0 ? colors.amber : colors.success },
    { label: 'Deployed', value: deployed, color: deployed > 0 ? colors.info : colors.textDim },
    { label: 'Handled', value: actionsExecuted, color: colors.success },
    ...(avgResponseMin !== null ? [{ label: 'Avg response', value: `${avgResponseMin}m`, color: colors.textSecondary }] : []),
  ];

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-0 border-t"
      style={{
        background: 'rgba(8,8,8,0.88)',
        borderColor: colors.borderDefault,
        backdropFilter: 'blur(12px)',
        height: 32,
      }}
    >
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-2 px-4">
          {i > 0 && <span style={{ color: colors.borderStrong }}>|</span>}
          <span className="text-[10px]" style={{ color: colors.textDim }}>{item.label}</span>
          <span className="text-[11px] font-bold font-mono" style={{ color: item.color }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
