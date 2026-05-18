import { useState, useEffect } from 'react';
import { CiroMap } from '../components/map/CiroMap';
import { SignalFeed } from '../components/panels/SignalFeed';
import { CrisisPanel } from '../components/panels/CrisisPanel';
import { GlassPanel } from '../components/ui/GlassPanel';
import { ControlBar } from '../components/hud/ControlBar';
import { UnitRoster } from '../components/hud/UnitRoster';
import { IncidentRegistry } from '../components/hud/IncidentRegistry';
import { SessionStats } from '../components/hud/SessionStats';
import { AgentTracePanel } from '../components/hud/AgentTracePanel';
import { ImpactPanel } from '../components/hud/ImpactPanel';
import { MobileOperationsDock } from '../components/hud/MobileOperationsDock';
import { useCrisisStore } from '../store/crisisStore';
import { useSignalStore } from '../store/signalStore';
import { useCityStore } from '../store/cityStore';
import { useResourceStore } from '../store/resourceStore';
import { useSessionStore } from '../store/sessionStore';
import { colors } from '../constants/colors';
import { Radio, X } from 'lucide-react';
import { getResources } from '../data/cityData';

const MOVEMENT_TICK_MS = 250;

export function Dashboard() {
  const city              = useCityStore((s) => s.city);
  const [showSignals, setShowSignals] = useState(false);
  const selectedCrisisId  = useCrisisStore((s) => s.selectedCrisisId);
  const selectCrisis      = useCrisisStore((s) => s.selectCrisis);
  const crises            = useCrisisStore((s) => s.crises);
  const signalCount       = useSignalStore((s) => s.signals.length);
  const crisisCount       = crises.length;

  const isPaused          = useResourceStore((s) => s.isPaused);
  const simulationRunning = useResourceStore((s) => s.simulationRunning);
  const simulationSpeed   = useResourceStore((s) => s.simulationSpeed);
  const tick              = useResourceStore((s) => s.tick);
  const resources         = useResourceStore((s) => s.resources);
  const sessionTick       = useSessionStore((s) => s.tick);
  const resolveSession    = useSessionStore((s) => s.resolve);

  // Close panels when city changes, and reload resources for new city
  useEffect(() => {
    selectCrisis(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowSignals(false);
    useSessionStore.getState().reset();
    useSignalStore.getState().reset();
    useCrisisStore.getState().reset();
    useResourceStore.getState().setResources(getResources(city));
  }, [city, selectCrisis]);

  // Movement tick - small fixed cadence, with speed applied as simulated minutes.
  useEffect(() => {
    if (!simulationRunning || isPaused) return;
    const deltaMinutes = simulationSpeed * (MOVEMENT_TICK_MS / 1000);
    const id = setInterval(() => {
      tick(deltaMinutes);
      sessionTick(deltaMinutes);
    }, MOVEMENT_TICK_MS);
    return () => clearInterval(id);
  }, [simulationRunning, isPaused, simulationSpeed, tick, sessionTick]);

  useEffect(() => {
    crises.forEach((crisis) => {
      if (crisis.status !== 'responding') return;
      const assigned = resources.filter((resource) => resource.assignedCrisisId === crisis.id);
      if (assigned.length === 0) return;
      const onScene = assigned.filter((resource) => resource.status === 'on_scene' || resource.status === 'returning');
      const enoughUnitsArrived = onScene.length >= Math.min(2, assigned.length);
      if (!enoughUnitsArrived) return;

      const responseMinutes = Math.max(
        1,
        ...assigned.map((resource) => resource.lastEtaMinutes ?? resource.etaMinutes ?? 1),
      );
      resolveSession(crisis.id, responseMinutes);
    });
  }, [crises, resources, resolveSession]);

  return (
    <div className="absolute inset-0">
      {/* Map fills entire viewport */}
      <CiroMap city={city} onCrisisClick={(id) => selectCrisis(id)} />

      {/* 3-button control bar — top center */}
      <ControlBar />

      {/* Signal feed toggle — top left */}
      <div className="hidden desktop:block absolute top-3 left-3 z-20">
        <button
          onClick={() => setShowSignals(!showSignals)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: showSignals ? colors.amber : 'rgba(17,17,17,0.85)',
            color: showSignals ? colors.void : colors.amber,
            backdropFilter: 'blur(12px)',
            border: `1px solid ${colors.borderAmber}`,
          }}
        >
          <Radio size={16} />
          <span className="hidden tablet:inline">Signals</span>
          {signalCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{
              background: showSignals ? 'rgba(0,0,0,0.2)' : colors.amberMuted,
              color: showSignals ? colors.void : colors.amber,
            }}>
              {signalCount}
            </span>
          )}
        </button>
      </div>

      {/* Active crises badge — top right */}
      {crisisCount > 0 && (
        <div className="hidden desktop:block absolute top-3 right-3 z-20">
          <GlassPanel amber className="px-3 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: colors.danger }} />
            <span className="text-xs font-semibold" style={{ color: colors.textPrimary }}>{crisisCount} Active</span>
          </GlassPanel>
        </div>
      )}

      {/* Signal feed panel */}
      {showSignals && (
        <div className="absolute top-0 left-0 bottom-0 z-20 w-[320px] mobile:w-full border-r" style={{
          background: 'rgba(17,17,17,0.92)',
          backdropFilter: 'blur(20px)',
          borderColor: colors.borderDefault,
        }}>
          <div className="absolute top-3 right-3 z-10">
            <button onClick={() => setShowSignals(false)} style={{ color: colors.textDim }}>
              <X size={18} />
            </button>
          </div>
          <SignalFeed />
        </div>
      )}

      {/* Crisis detail panel */}
      {selectedCrisisId && (
        <CrisisPanel crisisId={selectedCrisisId} onClose={() => selectCrisis(null)} />
      )}

      {/* HUD panels */}
      <SessionStats />
      <AgentTracePanel />
      <ImpactPanel />
      <UnitRoster />
      <IncidentRegistry />
      <MobileOperationsDock
        showSignals={showSignals}
        onToggleSignals={() => setShowSignals((value) => !value)}
        onSelectCrisis={(id) => selectCrisis(id)}
      />
    </div>
  );
}
