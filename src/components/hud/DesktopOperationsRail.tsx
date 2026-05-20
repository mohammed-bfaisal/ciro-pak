import { useState, type ComponentType } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  BrainCircuit,
  GitCompareArrows,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Truck,
  User,
} from 'lucide-react';
import { runAIDispatch } from '../../agents/orchestrator';
import { colors, getSeverityColor, getStatusColor } from '../../constants/colors';
import { useCityStore } from '../../store/cityStore';
import { useCrisisStore } from '../../store/crisisStore';
import { useResourceStore } from '../../store/resourceStore';
import { useSessionStore } from '../../store/sessionStore';
import { resetDashboardRun } from '../../utils/dashboardRunState';
import { formatRouteEta } from '../../utils/formatting';

type RailTab = 'units' | 'incidents' | 'trace' | 'impact';

interface DesktopOperationsRailProps {
  onSelectCrisis: (id: string) => void;
}

const tabs: { id: RailTab; label: string; icon: ComponentType<{ size?: number }> }[] = [
  { id: 'units', label: 'Units', icon: Truck },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { id: 'trace', label: 'Trace', icon: BrainCircuit },
  { id: 'impact', label: 'Impact', icon: GitCompareArrows },
];

export function DesktopOperationsRail({ onSelectCrisis }: DesktopOperationsRailProps) {
  const [activeTab, setActiveTab] = useState<RailTab>('units');
  const [isAIDispatching, setIsAIDispatching] = useState(false);
  const city = useCityStore((state) => state.city);
  const live = useSessionStore((state) => state.live);
  const traceEvents = useSessionStore((state) => state.traceEvents);
  const impactSnapshots = useSessionStore((state) => state.impactSnapshots);
  const crises = useCrisisStore((state) => state.crises);
  const resources = useResourceStore((state) => state.resources);
  const selectedUnitId = useResourceStore((state) => state.selectedUnitId);
  const dispatchMode = useResourceStore((state) => state.dispatchMode);
  const simulationRunning = useResourceStore((state) => state.simulationRunning);
  const isPaused = useResourceStore((state) => state.isPaused);
  const simulationSpeed = useResourceStore((state) => state.simulationSpeed);

  const busyUnits = resources.filter((resource) => resource.status !== 'available').length;
  const score = live?.score;

  const startOrToggle = () => {
    if (!live || live.session.city !== city) {
      useSessionStore.getState().start(city);
      useResourceStore.setState({ simulationRunning: true, isPaused: false });
      return;
    }
    useResourceStore.getState().toggleSimulation();
  };

  const runAI = async () => {
    if (isAIDispatching) return;
    if (!live || live.session.city !== city) {
      useSessionStore.getState().start(city);
      useResourceStore.setState({ simulationRunning: true, isPaused: false });
    }
    if (useCrisisStore.getState().crises.length === 0) {
      useSessionStore.getState().tick(6);
    }
    useResourceStore.getState().setDispatchMode('off');
    setIsAIDispatching(true);
    await runAIDispatch(city);
    setIsAIDispatching(false);
  };

  return (
    <aside
      className="hidden desktop:flex absolute right-3 top-3 bottom-3 z-20 w-[360px] flex-col overflow-hidden rounded-xl border"
      style={{
        background: 'rgba(12,12,12,0.95)',
        borderColor: colors.borderStrong,
        boxShadow: '0 18px 60px rgba(0,0,0,0.42)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
      }}
    >
      <header className="border-b px-4 py-3" style={{ borderColor: colors.borderDefault }}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.amber }}>
              <Activity size={15} />
              Operations
            </div>
            <div className="mt-1 text-[11px]" style={{ color: colors.textSecondary }}>
              {live ? `${formatClock(live.elapsedMinutes)} shift time` : 'Idle shift clock'}
            </div>
          </div>
          <div className="rounded-lg px-2 py-1 text-xs font-semibold" style={{ background: colors.raised, color: colors.textPrimary }}>
            {simulationSpeed}x
          </div>
        </div>
      </header>

      <section className="border-b px-3 py-3" style={{ borderColor: colors.borderSubtle }}>
        <div className="grid grid-cols-3 gap-2">
          <CommandButton
            active={simulationRunning}
            icon={simulationRunning ? Pause : Play}
            label={simulationRunning ? 'Running' : 'Simulate'}
            onClick={startOrToggle}
          />
          <CommandButton
            active={dispatchMode === 'manual'}
            icon={User}
            label="Manual"
            onClick={() => useResourceStore.getState().setDispatchMode(dispatchMode === 'manual' ? 'off' : 'manual')}
          />
          <CommandButton
            active={isAIDispatching}
            icon={isAIDispatching ? Loader2 : Bot}
            label={isAIDispatching ? 'Routing' : 'AI Dispatch'}
            onClick={runAI}
            disabled={isAIDispatching}
            spin={isAIDispatching}
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => resetDashboardRun(city)}
            className="flex h-10 w-11 items-center justify-center rounded-lg"
            style={{
              background: colors.raised,
              color: colors.textSecondary,
            }}
            aria-label="Reset current run"
            title="Reset current run"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            onClick={() => useResourceStore.getState().togglePause()}
            disabled={!simulationRunning}
            className="flex h-10 w-11 items-center justify-center rounded-lg"
            style={{
              background: colors.raised,
              color: simulationRunning ? colors.amber : colors.textDim,
              opacity: simulationRunning ? 1 : 0.55,
            }}
            aria-label={isPaused ? 'Resume simulation' : 'Pause simulation'}
          >
            {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} />}
          </button>
          <div className="grid flex-1 grid-cols-5 gap-1 rounded-lg p-1" style={{ background: colors.raised }}>
            {([1, 2, 5, 10, 20] as const).map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => useResourceStore.getState().setSimulationSpeed(speed)}
                className="h-8 rounded-md text-xs font-semibold"
                style={{
                  background: simulationSpeed === speed ? colors.amberMuted : 'transparent',
                  color: simulationSpeed === speed ? colors.amber : colors.textDim,
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-2 border-b px-3 py-3" style={{ borderColor: colors.borderSubtle }}>
        <RailStat label="Handled" value={score?.handledIncidents ?? 0} color={colors.success} />
        <RailStat label="Missed" value={score?.missedIncidents ?? 0} color={colors.danger} />
        <RailStat label="Trust" value={`${score?.publicTrust ?? 72}%`} color={colors.amber} />
        <RailStat label="Units" value={`${busyUnits}/${resources.length}`} color={colors.info} />
      </section>

      <nav className="grid grid-cols-4 gap-1 border-b px-2 py-2" style={{ borderColor: colors.borderSubtle }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex h-9 min-w-0 items-center justify-center gap-1 rounded-lg text-[11px] font-semibold"
              style={{
                background: active ? colors.amberMuted : 'transparent',
                color: active ? colors.amber : colors.textDim,
              }}
            >
              <Icon size={13} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 hide-scrollbar">
        {activeTab === 'units' && (
          <div className="space-y-2">
            {resources.map((resource) => {
              const selected = resource.id === selectedUnitId;
              const remainingEta = (resource.etaSeconds ?? ((resource.etaMinutes ?? 0) * 60)) * (1 - resource.movementProgress);
              const routeLabel = resource.routeProvider === 'google'
                ? 'Google traffic'
                : resource.routeProvider === 'osrm'
                  ? 'OSRM fallback'
                  : 'No route data';
              const routeUpdated = resource.routeRefreshedAt ?? resource.trafficUpdatedAt;
              return (
                <button
                  key={resource.id}
                  type="button"
                  onClick={() => useResourceStore.getState().selectUnit(selected ? null : resource.id)}
                  className="w-full rounded-lg border px-3 py-2 text-left"
                  style={{
                    background: selected ? colors.amberMuted : colors.raised,
                    borderColor: selected ? colors.borderAmber : colors.borderSubtle,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold" style={{ color: colors.textPrimary }}>
                        {resource.label}
                      </span>
                      <span className="mt-1 block text-[11px]" style={{ color: getStatusColor(resource.status) }}>
                        {resource.status}
                        {resource.status === 'en_route' ? ` - ${formatRouteEta(remainingEta)}` : ''}
                      </span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wide" style={{ color: colors.textDim }}>
                      {resource.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px]" style={{ color: resource.routeProvider === 'google' ? colors.success : colors.textDim }}>
                    {routeLabel}
                    {routeUpdated ? ` - refreshed ${formatShortTime(routeUpdated)}` : ''}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-2">
            {crises.length === 0 && <EmptyState label="No active incidents yet" />}
            {crises.map((crisis) => {
              const assignedCount = resources.filter((resource) => resource.assignedCrisisId === crisis.id).length;
              return (
                <button
                  key={crisis.id}
                  type="button"
                  onClick={() => onSelectCrisis(crisis.id)}
                  className="w-full rounded-lg border px-3 py-2 text-left"
                  style={{ background: colors.raised, borderColor: colors.borderSubtle }}
                >
                  <div className="truncate text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {crisis.title}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-[11px]">
                    <span style={{ color: getSeverityColor(crisis.severity) }}>{crisis.severity}</span>
                    <span style={{ color: colors.textDim }}>{assignedCount} unit{assignedCount === 1 ? '' : 's'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'trace' && (
          <div className="space-y-2">
            {traceEvents.length === 0 && <EmptyState label="Trace appears after simulation or dispatch" />}
            {traceEvents.slice(-8).reverse().map((event) => (
              <div key={event.id} className="rounded-lg border p-3" style={{ background: colors.raised, borderColor: colors.borderSubtle }}>
                <div className="text-[11px] font-semibold" style={{ color: colors.amber }}>
                  {event.phase}
                </div>
                <div className="mt-2 text-[11px] leading-snug" style={{ color: colors.textSecondary }}>
                  {event.decision}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="space-y-2">
            {impactSnapshots.length === 0 && <EmptyState label="Impact appears after actions execute" />}
            {impactSnapshots.slice(0, 6).map((snapshot) => (
              <div key={snapshot.actionId} className="rounded-lg border p-3" style={{ background: colors.raised, borderColor: colors.borderSubtle }}>
                <div className="text-[11px] font-semibold" style={{ color: colors.amber }}>
                  {snapshot.actionId} to {snapshot.crisisId}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]" style={{ color: colors.textSecondary }}>
                  <StateSummary label="Before" state={snapshot.beforeState} />
                  <StateSummary label="After" state={snapshot.afterState} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function CommandButton({
  active,
  icon: Icon,
  label,
  onClick,
  disabled = false,
  spin = false,
}: {
  active: boolean;
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  spin?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 min-w-0 items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold"
      style={{
        background: active ? colors.amberMuted : colors.raised,
        color: active ? colors.amber : colors.textSecondary,
        border: `1px solid ${active ? colors.borderAmber : colors.borderSubtle}`,
        opacity: disabled ? 0.72 : 1,
      }}
    >
      <Icon size={14} className={spin ? 'animate-spin' : ''} />
      <span className="truncate">{label}</span>
    </button>
  );
}

function RailStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="min-w-0 rounded-lg px-2 py-2" style={{ background: colors.raised }}>
      <div className="text-[10px] leading-tight" style={{ color: colors.textDim }}>{label}</div>
      <div className="truncate text-sm font-semibold leading-tight" style={{ color }}>{value}</div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border px-3 py-6 text-center text-sm" style={{ borderColor: colors.borderSubtle, color: colors.textDim }}>
      {label}
    </div>
  );
}

function StateSummary({ label, state }: { label: string; state: Record<string, unknown> }) {
  const [first] = Object.entries(state);
  return (
    <div className="rounded-md p-2" style={{ background: colors.overlay }}>
      <div className="text-[10px] font-semibold" style={{ color: label === 'After' ? colors.success : colors.textDim }}>
        {label}
      </div>
      <div className="mt-1 truncate">
        {first ? `${first[0]} ${String(first[1])}` : 'none'}
      </div>
    </div>
  );
}

function formatClock(minutes: number): string {
  const total = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(total / 60).toString().padStart(2, '0');
  const mins = (total % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

function formatShortTime(timestamp: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}
