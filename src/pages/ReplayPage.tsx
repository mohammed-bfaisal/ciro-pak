import { useState, useEffect, useRef } from 'react';
import { colors } from '../constants/colors';
import { useSignalStore } from '../store/signalStore';
import { useTraceStore } from '../store/traceStore';
import { SignalCard } from '../components/cards/SignalCard';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function ReplayPage() {
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<number | null>(null);
  const logs = useTraceStore((s) => s.logs);
  const signals = useSignalStore((s) => s.fusedSignals);

  const visibleLogs = logs.slice(0, Math.floor((position / 100) * logs.length));
  const visibleSignals = signals.slice(0, Math.floor((position / 100) * signals.length));

  useEffect(() => {
    if (playing && position < 100) {
      intervalRef.current = window.setInterval(() => {
        setPosition((p) => {
          if (p >= 100) {
            setPlaying(false);
            return 100;
          }
          return p + 0.5;
        });
      }, 100 / speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed]);

  const getPhaseLabel = (): string => {
    if (position < 15) return 'Signal Ingestion';
    if (position < 30) return 'Signal Fusion';
    if (position < 45) return 'Crisis Detection';
    if (position < 55) return 'Resource Allocation';
    if (position < 75) return 'Action Execution';
    if (position < 85) return 'Stakeholder Notifications';
    if (position < 95) return 'False Alarm Correction';
    return 'Complete';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: colors.void }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: colors.borderDefault }}>
        <h1 className="font-display text-xl" style={{ color: colors.textPrimary }}>Pipeline Replay</h1>
        <p className="text-xs mt-1" style={{ color: colors.textDim }}>
          Scrub through the pipeline timeline
        </p>
      </div>

      {/* Controls */}
      <div className="px-4 py-4 border-b" style={{ borderColor: colors.borderDefault }}>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setPlaying(!playing)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: colors.amber, color: colors.void }}
          >
            {playing ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
          </button>
          <button
            onClick={() => { setPosition(0); setPlaying(false); }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: colors.raised, color: colors.textSecondary }}
          >
            <RotateCcw size={14} />
          </button>
          <div className="flex gap-1">
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="px-2 py-1 rounded text-xs font-mono"
                style={{
                  background: speed === s ? colors.amber : colors.raised,
                  color: speed === s ? colors.void : colors.textDim,
                }}
              >
                {s}x
              </button>
            ))}
          </div>
          <span className="ml-auto text-sm font-mono" style={{ color: colors.amber }}>
            {getPhaseLabel()}
          </span>
        </div>

        {/* Slider */}
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="w-full accent-amber-500"
          style={{ accentColor: colors.amber }}
        />
        <div className="flex justify-between text-[10px] mt-1" style={{ color: colors.textDim }}>
          <span>0%</span>
          <span>{Math.round(position)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 tablet:grid-cols-2 gap-4 pb-20">
        <div>
          <h3 className="text-xs font-semibold mb-2" style={{ color: colors.amber }}>Signals ({visibleSignals.length})</h3>
          <div className="space-y-2">
            {visibleSignals.map((s, i) => (
              <SignalCard key={s.id} signal={s} index={i} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold mb-2" style={{ color: colors.amber }}>Log ({visibleLogs.length} lines)</h3>
          <div className="font-mono text-[11px] space-y-0.5" style={{ color: colors.textSecondary }}>
            {visibleLogs.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
