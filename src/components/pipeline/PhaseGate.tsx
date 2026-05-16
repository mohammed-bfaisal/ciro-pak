import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Pause } from 'lucide-react';
import { useTraceStore } from '../../store/traceStore';
import { colors } from '../../constants/colors';

const AUTO_ADVANCE_MS = 2000;

export function PhaseGate() {
  const { pipelineMode, currentPhaseIndex, resumeFromGate, workplan } = useTraceStore((s) => ({
    pipelineMode: s.pipelineMode,
    currentPhaseIndex: s.currentPhaseIndex,
    resumeFromGate: s.resumeFromGate,
    workplan: s.workplan,
  }));

  const [paused, setPaused] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_ADVANCE_MS / 1000);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visible = pipelineMode === 'paused';

  const clearTimers = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (autoRef.current) { clearTimeout(autoRef.current); autoRef.current = null; }
  };

  const startCountdown = () => {
    setCountdown(AUTO_ADVANCE_MS / 1000);
    setPaused(false);

    timerRef.current = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 0.1));
    }, 100);

    autoRef.current = setTimeout(() => {
      resumeFromGate();
    }, AUTO_ADVANCE_MS);
  };

  useEffect(() => {
    if (visible) {
      startCountdown();
    } else {
      clearTimers();
    }
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handlePause = () => {
    clearTimers();
    setPaused(true);
  };

  const handleContinue = () => {
    clearTimers();
    resumeFromGate();
  };

  const completedPhase = workplan?.phases.find((p) => p.status === 'complete' && workplan.phases.indexOf(p) === currentPhaseIndex - 1);
  const phaseName = workplan?.phases[currentPhaseIndex - 1]?.name ?? `Phase ${currentPhaseIndex}`;
  const progressPct = paused ? (1 - countdown / (AUTO_ADVANCE_MS / 1000)) * 100 : ((AUTO_ADVANCE_MS / 1000 - countdown) / (AUTO_ADVANCE_MS / 1000)) * 100;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="phase-gate"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border overflow-hidden"
          style={{
            background: 'rgba(10,10,10,0.98)',
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          {/* Auto-advance progress bar */}
          <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {!paused && (
              <motion.div
                className="h-full"
                style={{ background: colors.amber }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: 'linear' }}
              />
            )}
          </div>

          <div className="px-4 py-3 flex items-center gap-3">
            {/* Phase label */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium" style={{ color: colors.textMuted }}>
                Phase complete
              </div>
              <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>
                {phaseName}
              </div>
            </div>

            {/* Countdown or paused indicator */}
            <div
              className="text-xs font-mono w-10 text-center"
              style={{ color: paused ? colors.textMuted : colors.amber }}
            >
              {paused ? 'PAUSED' : `${countdown.toFixed(1)}s`}
            </div>

            {/* Controls */}
            {!paused ? (
              <button
                onClick={handlePause}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: colors.textSecondary,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Pause size={11} />
                Pause
              </button>
            ) : null}

            <button
              onClick={handleContinue}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
              style={{
                background: colors.amber,
                color: colors.void,
              }}
            >
              Continue
              <ChevronRight size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
