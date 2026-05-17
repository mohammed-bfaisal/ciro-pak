import { Loader2, Play, User, Bot, Pause } from 'lucide-react';
import { useResourceStore } from '../../store/resourceStore';
import { useTraceStore } from '../../store/traceStore';
import { useCityStore } from '../../store/cityStore';
import { runSimulation, runAIDispatch } from '../../agents/orchestrator';
import { colors } from '../../constants/colors';

export function ControlBar() {
  const city              = useCityStore((s) => s.city);
  const isRunning         = useTraceStore((s) => s.isRunning);
  const simulationRunning = useResourceStore((s) => s.simulationRunning);
  const isPaused          = useResourceStore((s) => s.isPaused);
  const simulationSpeed   = useResourceStore((s) => s.simulationSpeed);
  const dispatchMode      = useResourceStore((s) => s.dispatchMode);
  const toggleSimulation  = useResourceStore((s) => s.toggleSimulation);
  const setDispatchMode   = useResourceStore((s) => s.setDispatchMode);
  const togglePause       = useResourceStore((s) => s.togglePause);
  const setSpeed          = useResourceStore((s) => s.setSimulationSpeed);

  const handleSimulate = async () => {
    if (isRunning) return;
    toggleSimulation();
    await runSimulation(city);
  };

  const handleManual = () => {
    if (isRunning) return;
    setDispatchMode(dispatchMode === 'manual' ? 'off' : 'manual');
  };

  const handleAI = async () => {
    if (isRunning) return;
    setDispatchMode('off');
    await runAIDispatch(city);
  };

  const base = 'flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all px-2 py-1.5 sm:px-3';

  return (
    <div
      className="absolute top-3 left-1/2 z-20 flex items-center gap-1.5 px-2 py-1.5 rounded-xl"
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
        disabled={isRunning}
        title="Simulate incidents"
        style={{
          background: simulationRunning ? colors.amberMuted : colors.raised,
          color: simulationRunning ? colors.amber : colors.textSecondary,
          border: `1px solid ${simulationRunning ? colors.borderAmber : colors.borderDefault}`,
          opacity: isRunning ? 0.6 : 1,
          cursor: isRunning ? 'not-allowed' : 'pointer',
        }}
      >
        {isRunning && simulationRunning
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
        disabled={isRunning}
        title="Manual dispatch"
        style={{
          background: dispatchMode === 'manual' ? 'rgba(96,165,250,0.15)' : colors.raised,
          color: dispatchMode === 'manual' ? colors.info : colors.textSecondary,
          border: `1px solid ${dispatchMode === 'manual' ? 'rgba(96,165,250,0.3)' : colors.borderDefault}`,
          opacity: isRunning ? 0.6 : 1,
          cursor: isRunning ? 'not-allowed' : 'pointer',
        }}
      >
        <User size={13} />
        <span className="hidden sm:inline">Manual</span>
      </button>

      {/* AI DISPATCH */}
      <button
        className={base}
        onClick={handleAI}
        disabled={isRunning}
        title="AI auto-dispatch"
        style={{
          background: dispatchMode === 'ai' ? colors.amberMuted : colors.raised,
          color: dispatchMode === 'ai' ? colors.amber : colors.textSecondary,
          border: `1px solid ${dispatchMode === 'ai' ? colors.borderAmber : colors.borderDefault}`,
          opacity: isRunning ? 0.6 : 1,
          cursor: isRunning ? 'not-allowed' : 'pointer',
        }}
      >
        {isRunning && dispatchMode === 'ai'
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

          {([1, 2, 4] as const).map((speed) => (
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
  );
}
