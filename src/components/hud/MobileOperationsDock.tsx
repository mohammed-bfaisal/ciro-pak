import { useState } from 'react';
import type { ComponentType } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  GitCompareArrows,
  Pause,
  Play,
  Radio,
  Truck,
  User,
} from 'lucide-react';
import { runAIDispatch } from '../../agents/orchestrator';
import { colors, getSeverityColor, getStatusColor } from '../../constants/colors';
import { useCityStore } from '../../store/cityStore';
import { useCrisisStore } from '../../store/crisisStore';
import { useResourceStore } from '../../store/resourceStore';
import { useSessionStore } from '../../store/sessionStore';

type MobileDockTab = 'units' | 'incidents' | 'trace' | 'impact';

interface MobileOperationsDockProps {
  showSignals: boolean;
  onToggleSignals: () => void;
  onSelectCrisis: (id: string) => void;
}

const tabs: { id: MobileDockTab; label: string; icon: ComponentType<{ size?: number }> }[] = [
  { id: 'units', label: 'Units', icon: Truck },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { id: 'trace', label: 'Trace', icon: BrainCircuit },
  { id: 'impact', label: 'Impact', icon: GitCompareArrows },
];

export function MobileOperationsDock({ showSignals, onToggleSignals, onSelectCrisis }: MobileOperationsDockProps) {
  const [activeTab, setActiveTab] = useState<MobileDockTab>('units');
  const [collapsed, setCollapsed] = useState(false);
  const [isAIDispatching, setIsAIDispatching] = useState(false);
  const city = useCityStore((s) => s.city);
  const crises = useCrisisStore((s) => s.crises);
  const resources = useResourceStore((s) => s.resources);
  const selectedUnitId = useResourceStore((s) => s.selectedUnitId);
  const dispatchMode = useResourceStore((s) => s.dispatchMode);
  const simulationRunning = useResourceStore((s) => s.simulationRunning);
  const isPaused = useResourceStore((s) => s.isPaused);
  const simulationSpeed = useResourceStore((s) => s.simulationSpeed);
  const live = useSessionStore((s) => s.live);
  const traceEvents = useSessionStore((s) => s.traceEvents);
  const impactSnapshots = useSessionStore((s) => s.impactSnapshots);

  const score = live?.score;
  const busyUnits = resources.filter((resource) => resource.status !== 'available').length;

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
    <section
      className="desktop:hidden absolute left-2 right-2 z-30 rounded-2xl overflow-hidden"
      style={{
        bottom: 8,
        background: 'rgba(12,12,12,0.96)',
        border: `1px solid ${colors.borderStrong}`,
        boxShadow: '0 -12px 40px rgba(0,0,0,0.45)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
      }}
    >
      <button
        onClick={() => setCollapsed((value) => !value)}
        className="w-full flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: colors.borderDefault, color: colors.textPrimary }}
      >
        <span className="flex items-center gap-2 text-[11px] font-semibold tracking-wide">
          <Activity size={14} style={{ color: colors.amber }} />
          OPS DOCK
        </span>
        <span className="flex items-center gap-2 text-[10px]" style={{ color: colors.textSecondary }}>
          {formatClock(live?.elapsedMinutes ?? 0)}
          <span style={{ color: colors.amber }}>{simulationSpeed}x</span>
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {!collapsed && (
        <div className="mobile-dock-body">
          <div className="grid grid-cols-4 gap-1 px-2 py-2 border-b" style={{ borderColor: colors.borderSubtle }}>
            <TinyStat label="handled" value={score?.handledIncidents ?? 0} />
            <TinyStat label="missed" value={score?.missedIncidents ?? 0} />
            <TinyStat label="trust" value={`${score?.publicTrust ?? 72}%`} />
            <TinyStat label="units" value={`${busyUnits}/${resources.length}`} />
          </div>

          <div className="grid grid-cols-4 gap-1 px-2 py-2 border-b" style={{ borderColor: colors.borderSubtle }}>
            <CommandButton active={showSignals} icon={Radio} label="Signals" onClick={onToggleSignals} />
            <CommandButton active={simulationRunning} icon={Play} label="Sim" onClick={startOrToggle} />
            <CommandButton
              active={dispatchMode === 'manual'}
              icon={User}
              label="Manual"
              onClick={() => useResourceStore.getState().setDispatchMode(dispatchMode === 'manual' ? 'off' : 'manual')}
            />
            <CommandButton active={isAIDispatching} icon={Bot} label="AI" onClick={runAI} />
          </div>

          <div className="flex items-center gap-2 px-2 py-2 border-b" style={{ borderColor: colors.borderSubtle }}>
            <button
              onClick={() => useResourceStore.getState().togglePause()}
              disabled={!simulationRunning}
              className="h-8 w-9 flex items-center justify-center rounded-lg"
              style={{
                color: simulationRunning ? colors.amber : colors.textDim,
                background: colors.raised,
                opacity: simulationRunning ? 1 : 0.55,
              }}
              aria-label={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} />}
            </button>
              <div className="flex flex-1 min-w-0 items-center gap-1 rounded-lg p-1" style={{ background: colors.raised }}>
                {([1, 2, 5, 10, 20] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => useResourceStore.getState().setSimulationSpeed(speed)}
                    className="min-w-0 flex-1 rounded-md py-1 text-xs font-semibold"
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

          <div className="grid grid-cols-4 gap-1 px-2 pt-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="min-w-0 flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold"
                  style={{
                    background: active ? colors.amberMuted : 'transparent',
                    color: active ? colors.amber : colors.textDim,
                  }}
                >
                  <Icon size={12} />
                  <span className="min-w-0 truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mobile-dock-panel px-2 py-2 overflow-y-auto hide-scrollbar">
            {activeTab === 'units' && (
              <div className="space-y-1.5">
                {resources.slice(0, 5).map((resource) => {
                  const selected = resource.id === selectedUnitId;
                  return (
                    <button
                      key={resource.id}
                      onClick={() => useResourceStore.getState().selectUnit(selected ? null : resource.id)}
                      className="w-full flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-left"
                      style={{ background: selected ? colors.amberMuted : colors.raised }}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold" style={{ color: colors.textPrimary }}>{resource.label}</span>
                        <span className="block text-[10px]" style={{ color: getStatusColor(resource.status) }}>{resource.status}</span>
                      </span>
                      <span className="text-[10px]" style={{ color: colors.textDim }}>{resource.type.replace('_', ' ')}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'incidents' && (
              <div className="space-y-1.5">
                {crises.length === 0 && <EmptyRow label="No active incidents yet" />}
                {crises.slice(0, 5).map((crisis) => (
                  <button
                    key={crisis.id}
                    onClick={() => onSelectCrisis(crisis.id)}
                    className="w-full rounded-lg px-2 py-2 text-left"
                    style={{ background: colors.raised }}
                  >
                    <span className="block truncate text-xs font-semibold" style={{ color: colors.textPrimary }}>{crisis.title}</span>
                    <span className="mt-1 flex items-center justify-between text-[10px]">
                      <span style={{ color: getSeverityColor(crisis.severity) }}>{crisis.severity}</span>
                      <span style={{ color: colors.textDim }}>{crisis.status}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'trace' && (
              <div className="space-y-1.5">
                {traceEvents.length === 0 && <EmptyRow label="Trace appears after simulation or AI dispatch" />}
                {traceEvents.slice(-3).reverse().map((event) => (
                  <div key={event.id} className="rounded-lg px-2 py-2" style={{ background: colors.raised }}>
                    <div className="text-[10px] font-semibold" style={{ color: colors.amber }}>{event.phase}</div>
                    <div className="mt-1 text-[10px] leading-snug" style={{ color: colors.textSecondary }}>{event.decision}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'impact' && (
              <div className="space-y-1.5">
                {impactSnapshots.length === 0 && <EmptyRow label="Impact appears after AI actions execute" />}
                {impactSnapshots.slice(0, 3).map((snapshot) => (
                  <div key={snapshot.actionId} className="rounded-lg px-2 py-2" style={{ background: colors.raised }}>
                    <div className="text-[10px] font-semibold" style={{ color: colors.amber }}>{snapshot.actionId}</div>
                    <div className="mt-1 grid grid-cols-2 gap-1 text-[10px]" style={{ color: colors.textSecondary }}>
                      <span>Before: {compactState(snapshot.beforeState)}</span>
                      <span>After: {compactState(snapshot.afterState)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function TinyStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-0 rounded-lg px-1.5 py-1.5" style={{ background: colors.raised }}>
      <div className="text-[9px] leading-tight" style={{ color: colors.textDim }}>{label}</div>
      <div className="truncate text-xs font-semibold leading-tight" style={{ color: colors.textPrimary }}>{value}</div>
    </div>
  );
}

function CommandButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="h-9 min-w-0 flex items-center justify-center gap-1 rounded-lg text-[11px] font-semibold"
      style={{
        background: active ? colors.amberMuted : colors.raised,
        color: active ? colors.amber : colors.textSecondary,
        border: `1px solid ${active ? colors.borderAmber : colors.borderSubtle}`,
      }}
    >
      <Icon size={13} />
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="rounded-lg px-2 py-3 text-center text-[11px]" style={{ background: colors.raised, color: colors.textDim }}>
      {label}
    </div>
  );
}

function compactState(state: Record<string, unknown>): string {
  const [first] = Object.entries(state);
  if (!first) return 'none';
  return `${first[0]} ${String(first[1])}`;
}

function formatClock(minutes: number): string {
  const total = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(total / 60).toString().padStart(2, '0');
  const mins = (total % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}
