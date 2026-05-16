import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Lightbulb, Zap, Terminal } from 'lucide-react';
import { useTraceStore } from '../../store/traceStore';
import { colors } from '../../constants/colors';

const PHASE_DESCRIPTIONS: Record<string, string> = {
  'Signal Ingestion':         'Collecting signals from social media, field reports, sensors, and traffic feeds.',
  'Signal Fusion':            'Scoring credibility per source, detecting conflicts, applying corroboration bonuses.',
  'Crisis Detection':         'Clustering signals by location, classifying crisis types, estimating severity.',
  'Resource Allocation':      'Matching available units to crises by proximity, capacity, and specialisation.',
  'Action Execution':         'Dispatching units, issuing alerts, escalating to utilities — logging before/after states.',
  'Stakeholder Notifications':'Drafting targeted messages for public, emergency services, and authorities.',
  'False Alarm Correction':   'Reviewing classification accuracy against field verification. Issuing retractions if needed.',
};

function MonologueRow({
  icon: Icon,
  label,
  text,
  color,
}: {
  icon: React.ElementType;
  label: string;
  text: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3"
    >
      <div className="mt-0.5 shrink-0">
        <Icon size={14} style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color }}>
          {label}
        </div>
        <div className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
          {text}
        </div>
      </div>
    </motion.div>
  );
}

export function AgentMonologue() {
  const pipelineMode = useTraceStore((s) => s.pipelineMode);
  const currentPhase = useTraceStore((s) => s.currentPhase);
  const activeTraceStep = useTraceStore((s) => s.activeTraceStep);
  const workplan = useTraceStore((s) => s.workplan);

  const visible = pipelineMode === 'running' || pipelineMode === 'paused';
  const phaseDesc = currentPhase ? PHASE_DESCRIPTIONS[currentPhase] : null;
  const runningPhase = workplan?.phases.find((p) => p.status === 'running');

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="agent-monologue"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border p-4"
          style={{
            background: 'rgba(15,15,15,0.95)',
            borderColor: 'rgba(245,158,11,0.2)',
            boxShadow: '0 0 20px rgba(245,158,11,0.06)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: colors.amber }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            />
            <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: colors.amber }}>
              Agent Reasoning
            </span>
            {currentPhase && (
              <span className="ml-auto text-xs" style={{ color: colors.textDim }}>
                {currentPhase}
              </span>
            )}
          </div>

          {/* Phase description */}
          {phaseDesc && !activeTraceStep && (
            <div className="flex gap-2 mb-3">
              <Terminal size={12} style={{ color: colors.textDim, marginTop: 2, flexShrink: 0 }} />
              <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
                {phaseDesc}
              </p>
            </div>
          )}

          {/* Running tasks */}
          {runningPhase && !activeTraceStep && (
            <div className="space-y-1 mb-1">
              {runningPhase.tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2 text-xs" style={{ color: colors.textDim }}>
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                  >
                    ›
                  </motion.span>
                  {task}
                </div>
              ))}
            </div>
          )}

          {/* Active TraceStep — OBSERVATION / INFERENCE / DECISION */}
          {activeTraceStep && (
            <div className="space-y-3 pt-1">
              <MonologueRow
                icon={Eye}
                label="Observation"
                text={activeTraceStep.observation}
                color="#60a5fa"
              />
              <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <MonologueRow
                icon={Lightbulb}
                label="Inference"
                text={activeTraceStep.inference}
                color="#a78bfa"
              />
              <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <MonologueRow
                icon={Zap}
                label="Decision"
                text={activeTraceStep.decision}
                color={colors.amber}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
