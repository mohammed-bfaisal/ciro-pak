import { motion } from 'framer-motion';
import { useTraceStore } from '../../store/traceStore';
import { colors } from '../../constants/colors';
import { Check, Loader2, Circle } from 'lucide-react';

export function PipelineTimeline() {
  const workplan = useTraceStore((s) => s.workplan);

  if (!workplan) {
    return (
      <div className="flex items-center justify-center h-24 text-sm" style={{ color: colors.textDim }}>
        Run pipeline to see phase timeline
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar px-4 py-4">
      {workplan.phases.map((phase, i) => {
        const isRunning = phase.status === 'running';
        const isDone = phase.status === 'complete';
        const isFailed = phase.status === 'failed';

        return (
          <motion.div
            key={phase.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-1 flex-shrink-0"
          >
            {/* Phase node */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isRunning ? 'animate-pulse-dot' : ''}`}
                style={{
                  borderColor: isDone ? colors.amber : isRunning ? colors.amber : isFailed ? colors.danger : colors.textDim,
                  background: isDone ? colors.amber : 'transparent',
                  color: isDone ? colors.void : isRunning ? colors.amber : isFailed ? colors.danger : colors.textDim,
                }}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> :
                 isRunning ? <Loader2 size={14} className="animate-spin" /> :
                 <Circle size={8} />}
              </div>
              <span
                className="text-[10px] font-medium text-center max-w-[72px] leading-tight"
                style={{ color: isDone ? colors.amber : isRunning ? colors.textPrimary : colors.textDim }}
              >
                {phase.name}
              </span>
              {phase.durationMs && (
                <span className="text-[9px] font-mono" style={{ color: colors.textDim }}>
                  {phase.durationMs}ms
                </span>
              )}
            </div>

            {/* Connector line */}
            {i < workplan.phases.length - 1 && (
              <div
                className="w-6 h-0.5 rounded flex-shrink-0 mt-[-20px]"
                style={{
                  background: isDone ? colors.amber : colors.textDim,
                  opacity: isDone ? 0.6 : 0.2,
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
