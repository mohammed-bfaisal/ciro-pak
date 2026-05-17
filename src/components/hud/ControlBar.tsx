import { Loader2, Play, User, Bot } from 'lucide-react';
import { useResourceStore } from '../../store/resourceStore';
import { useTraceStore } from '../../store/traceStore';
import { useCityStore } from '../../store/cityStore';
import { runSimulation, runAIDispatch } from '../../agents/orchestrator';
import { colors } from '../../constants/colors';

export function ControlBar() {
  const city              = useCityStore((s) => s.city);
  const isRunning         = useTraceStore((s) => s.isRunning);
  const simulationRunning = useResourceStore((s) => s.simulationRunning);
  const dispatchMode      = useResourceStore((s) => s.dispatchMode);
  const toggleSimulation  = useResourceStore((s) => s.toggleSimulation);
  const setDispatchMode   = useResourceStore((s) => s.setDispatchMode);

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

  const btnBase = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all';

  return (
    <div
      className="absolute top-3 left-1/2 z-20 flex items-center gap-2 px-2 py-1.5 rounded-xl"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(17,17,17,0.92)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${colors.borderDefault}`,
      }}
    >
      {/* SIMULATE */}
      <button
        className={btnBase}
        onClick={handleSimulate}
        disabled={isRunning}
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
        Simulate
      </button>

      <div style={{ width: 1, height: 20, background: colors.borderDefault }} />

      {/* MANUAL DISPATCH */}
      <button
        className={btnBase}
        onClick={handleManual}
        disabled={isRunning}
        style={{
          background: dispatchMode === 'manual' ? 'rgba(96,165,250,0.15)' : colors.raised,
          color: dispatchMode === 'manual' ? colors.info : colors.textSecondary,
          border: `1px solid ${dispatchMode === 'manual' ? 'rgba(96,165,250,0.3)' : colors.borderDefault}`,
          opacity: isRunning ? 0.6 : 1,
          cursor: isRunning ? 'not-allowed' : 'pointer',
        }}
      >
        <User size={13} />
        Manual
      </button>

      {/* AI DISPATCH */}
      <button
        className={btnBase}
        onClick={handleAI}
        disabled={isRunning}
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
        AI Dispatch
      </button>
    </div>
  );
}
