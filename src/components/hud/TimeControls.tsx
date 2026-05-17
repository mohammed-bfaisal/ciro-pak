import { Pause, Play } from 'lucide-react';
import { useResourceStore } from '../../store/resourceStore';
import { colors } from '../../constants/colors';

export function TimeControls() {
  const isPaused          = useResourceStore((s) => s.isPaused);
  const simulationSpeed   = useResourceStore((s) => s.simulationSpeed);
  const simulationRunning = useResourceStore((s) => s.simulationRunning);
  const togglePause       = useResourceStore((s) => s.togglePause);
  const setSpeed          = useResourceStore((s) => s.setSimulationSpeed);

  if (!simulationRunning) return null;

  return (
    <div
      className="absolute bottom-20 left-1/2 z-20 flex items-center gap-1 px-2 py-1.5 rounded-full"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(17,17,17,0.92)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${colors.borderDefault}`,
      }}
    >
      <button
        onClick={togglePause}
        className="w-7 h-7 rounded-full flex items-center justify-center"
        style={{ color: colors.amber }}
      >
        {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} />}
      </button>

      {([1, 2, 4] as const).map((speed) => (
        <button
          key={speed}
          onClick={() => setSpeed(speed)}
          className="px-2 py-0.5 rounded text-[11px] font-semibold"
          style={{
            background: simulationSpeed === speed ? colors.amberMuted : 'transparent',
            color: simulationSpeed === speed ? colors.amber : colors.textDim,
          }}
        >
          {speed}×
        </button>
      ))}
    </div>
  );
}
