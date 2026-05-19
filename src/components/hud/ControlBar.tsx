import { useState } from 'react';
import { Loader2, Play, User, Bot, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useResourceStore } from '../../store/resourceStore';
import { useCityStore } from '../../store/cityStore';
import { useSessionStore } from '../../store/sessionStore';
import { useCrisisStore } from '../../store/crisisStore';
import { useSettingsStore } from '../../store/settingsStore';
import { runAIDispatch } from '../../agents/orchestrator';
import { colors } from '../../constants/colors';
import { simulateTriggeredMissionBriefing } from '../../api/triggeredMissionBriefing';
import { createMissionBriefing, type MissionBriefing, type P04Trigger } from '../../foundation/triggeredMissionBriefing';
import { MissionBriefingPanel } from './MissionBriefingPanel';

export function ControlBar() {
  const navigate = useNavigate();
  const [isAIDispatching, setIsAIDispatching] = useState(false);
  const [briefing, setBriefing] = useState<MissionBriefing | null>(null);
  const [briefingMessage, setBriefingMessage] = useState<string | undefined>(undefined);
  const [briefingBusy, setBriefingBusy] = useState(false);
  const city              = useCityStore((s) => s.city);
  const live              = useSessionStore((s) => s.live);
  const startSession      = useSessionStore((s) => s.start);
  const p04Enabled        = useSettingsStore((s) => s.p04.enabled);
  const markP04Reviewed   = useSettingsStore((s) => s.markP04Reviewed);
  const simulationRunning = useResourceStore((s) => s.simulationRunning);
  const isPaused          = useResourceStore((s) => s.isPaused);
  const simulationSpeed   = useResourceStore((s) => s.simulationSpeed);
  const dispatchMode      = useResourceStore((s) => s.dispatchMode);
  const toggleSimulation  = useResourceStore((s) => s.toggleSimulation);
  const setDispatchMode   = useResourceStore((s) => s.setDispatchMode);
  const togglePause       = useResourceStore((s) => s.togglePause);
  const setSpeed          = useResourceStore((s) => s.setSimulationSpeed);
  const setP04Status      = useSessionStore((s) => s.setP04Status);
  const setP04ErrorState  = useSessionStore((s) => s.setP04ErrorState);

  const executeSimulate = () => {
    if (!live || live.session.city !== city) {
      startSession(city);
      useResourceStore.setState({ simulationRunning: true, isPaused: false });
      return;
    }

    toggleSimulation();
  };

  const prepareBriefing = async (trigger: P04Trigger) => {
    const requestedAt = new Date().toISOString();
    setBriefing(createMissionBriefing(city, trigger, requestedAt));
    setBriefingMessage('Preparing bundled briefing while checking the hosted backend path.');
    setP04Status('checking', requestedAt);

    const result = await simulateTriggeredMissionBriefing({
      request: {
        city,
        requestedAt,
        source: 'operator',
        trigger,
      },
    });

    setBriefing(result.briefing);
    setBriefingMessage(result.message);
    setP04Status(result.status, result.simulatedAt);
    markP04Reviewed(result.simulatedAt);
    if (result.status === 'error') setP04ErrorState(result.message);
  };

  const handleSimulate = () => {
    if (!p04Enabled) {
      executeSimulate();
      return;
    }
    void prepareBriefing('simulation');
  };

  const handleManual = () => {
    setDispatchMode(dispatchMode === 'manual' ? 'off' : 'manual');
  };

  const executeAI = async () => {
    if (isAIDispatching) return;
    if (!live || live.session.city !== city) {
      startSession(city);
      useResourceStore.setState({ simulationRunning: true, isPaused: false });
    }
    if (useCrisisStore.getState().crises.length === 0) {
      useSessionStore.getState().tick(6);
    }
    setDispatchMode('off');
    setIsAIDispatching(true);
    await runAIDispatch(city);
    setIsAIDispatching(false);
  };

  const handleAI = async () => {
    if (!p04Enabled) {
      await executeAI();
      return;
    }
    await prepareBriefing('ai_dispatch');
  };

  const startBriefedAction = async () => {
    if (!briefing) return;
    const trigger = briefing.trigger;
    setBriefingBusy(true);
    setBriefing(null);
    if (trigger === 'ai_dispatch') {
      await executeAI();
    } else {
      executeSimulate();
    }
    setBriefingBusy(false);
  };

  const editScenario = () => {
    setBriefing(null);
    navigate('/whatif');
  };

  const base = 'flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all px-2 py-1.5 sm:px-3';

  return (
    <>
      <div
        className="hidden desktop:flex absolute top-3 left-1/2 z-20 items-center gap-1.5 px-2 py-1.5 rounded-xl"
        style={{
          transform: 'translateX(-50%)',
          background: 'rgba(17,17,17,0.92)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${colors.borderDefault}`,
          whiteSpace: 'nowrap',
        }}
      >
        {/* SIMULATE */}
        <button
          className={base}
          onClick={handleSimulate}
          title={simulationRunning ? 'Pause live shift clock' : 'Start live shift clock'}
          style={{
            background: simulationRunning ? colors.amberMuted : colors.raised,
            color: simulationRunning ? colors.amber : colors.textSecondary,
            border: `1px solid ${simulationRunning ? colors.borderAmber : colors.borderDefault}`,
            cursor: 'pointer',
          }}
        >
          {isAIDispatching && simulationRunning
            ? <Loader2 size={13} className="animate-spin" />
            : <Play size={13} fill={simulationRunning ? 'currentColor' : 'none'} />
          }
          <span className="hidden sm:inline">Simulate</span>
        </button>

        <div style={{ width: 1, height: 18, background: colors.borderDefault }} />

        {/* MANUAL DISPATCH */}
        <button
          className={base}
          onClick={handleManual}
          title="Manual dispatch"
          style={{
            background: dispatchMode === 'manual' ? 'rgba(96,165,250,0.15)' : colors.raised,
            color: dispatchMode === 'manual' ? colors.info : colors.textSecondary,
            border: `1px solid ${dispatchMode === 'manual' ? 'rgba(96,165,250,0.3)' : colors.borderDefault}`,
            cursor: 'pointer',
          }}
        >
          <User size={13} />
          <span className="hidden sm:inline">Manual</span>
        </button>

        {/* AI DISPATCH */}
        <button
          className={base}
          onClick={handleAI}
          disabled={isAIDispatching}
          title="AI auto-dispatch"
          style={{
            background: dispatchMode === 'ai' || isAIDispatching ? colors.amberMuted : colors.raised,
            color: dispatchMode === 'ai' || isAIDispatching ? colors.amber : colors.textSecondary,
            border: `1px solid ${dispatchMode === 'ai' || isAIDispatching ? colors.borderAmber : colors.borderDefault}`,
            opacity: isAIDispatching ? 0.75 : 1,
            cursor: isAIDispatching ? 'progress' : 'pointer',
          }}
        >
          {isAIDispatching
            ? <Loader2 size={13} className="animate-spin" />
            : <Bot size={13} />
          }
          <span className="hidden sm:inline">AI Dispatch</span>
        </button>

        {/* Time controls — only visible when simulation is running */}
        {simulationRunning && (
          <>
            <div style={{ width: 1, height: 18, background: colors.borderDefault }} />

            <button
              onClick={togglePause}
              title={isPaused ? 'Resume' : 'Pause'}
              className="w-7 h-7 flex items-center justify-center rounded"
              style={{ color: colors.amber }}
            >
              {isPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} />}
            </button>

            {([1, 2, 5, 10, 20] as const).map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeed(speed)}
                className="px-1.5 py-0.5 rounded text-[11px] font-semibold"
                style={{
                  background: simulationSpeed === speed ? colors.amberMuted : 'transparent',
                  color: simulationSpeed === speed ? colors.amber : colors.textDim,
                }}
              >
                {speed}×
              </button>
            ))}
          </>
        )}
      </div>

      {briefing && (
        <MissionBriefingPanel
          briefing={briefing}
          busy={briefingBusy}
          statusMessage={briefingMessage}
          onStart={() => { void startBriefedAction(); }}
          onEditScenario={editScenario}
          onCancel={() => setBriefing(null)}
        />
      )}
    </>
  );
}
