import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Play, X } from 'lucide-react';
import { useTraceStore } from '../../store/traceStore';
import { CITY_REGISTRY } from '../../data/cities';
import { runCIROPipeline } from '../../agents/orchestrator';
import { colors } from '../../constants/colors';

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
};

export function ScenarioBriefing() {
  const { pipelineMode, pendingCity, dismissBriefing } = useTraceStore((s) => ({
    pipelineMode: s.pipelineMode,
    pendingCity: s.pendingCity,
    dismissBriefing: s.dismissBriefing,
  }));

  const visible = pipelineMode === 'briefing' && pendingCity !== null;
  const meta = pendingCity ? CITY_REGISTRY[pendingCity] : null;

  const handleLaunch = async () => {
    if (!pendingCity) return;
    const city = pendingCity;
    dismissBriefing();
    await runCIROPipeline(city);
  };

  const severityTag = meta?.scenarioHint.includes('CRITICAL')
    ? 'CRITICAL'
    : meta?.scenarioHint.includes('HIGH')
    ? 'HIGH'
    : 'MEDIUM';

  return (
    <AnimatePresence>
      {visible && meta && (
        <motion.div
          key="briefing-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && dismissBriefing()}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl border p-8 w-full max-w-lg mx-4"
            style={{
              background: 'linear-gradient(145deg, #0f0f0f 0%, #111 100%)',
              borderColor: 'rgba(255,255,255,0.12)',
              boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            {/* Close */}
            <button
              onClick={dismissBriefing}
              className="absolute top-4 right-4 p-1.5 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: colors.textMuted }}
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
              >
                <Shield size={20} style={{ color: colors.amber }} />
              </div>
              <div>
                <div className="text-xs font-medium tracking-widest uppercase" style={{ color: colors.textMuted }}>
                  Crisis Intelligence System
                </div>
                <div className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                  CIRO — Scenario Briefing
                </div>
              </div>
            </div>

            {/* City + Scenario */}
            <div
              className="rounded-xl p-5 mb-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-2xl font-bold mb-0.5" style={{ color: colors.textPrimary }}>
                    {meta.label}
                  </div>
                  <div className="text-sm" style={{ color: colors.textMuted }}>{meta.province}</div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wider shrink-0"
                  style={{
                    background: `${SEVERITY_COLOR[severityTag]}22`,
                    color: SEVERITY_COLOR[severityTag],
                    border: `1px solid ${SEVERITY_COLOR[severityTag]}44`,
                  }}
                >
                  {severityTag}
                </span>
              </div>

              <div className="font-semibold text-sm mb-2" style={{ color: colors.textSecondary }}>
                {meta.scenarioTitle}
              </div>
              <div className="text-xs" style={{ color: colors.textMuted }}>
                {meta.scenarioHint}
              </div>
            </div>

            {/* Agent reasoning preview */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={12} style={{ color: colors.amber }} />
                <span className="text-xs font-medium tracking-wider uppercase" style={{ color: colors.textMuted }}>
                  What the agent will do
                </span>
              </div>
              <div className="text-xs leading-relaxed space-y-1" style={{ color: colors.textSecondary }}>
                <div>1. Ingest signals from social, field reports, sensors, traffic</div>
                <div>2. Fuse signals — score credibility, detect conflicts</div>
                <div>3. Detect crises — cluster, classify, estimate severity</div>
                <div>4. Allocate resources — match units to crises</div>
                <div>5. Execute actions — dispatch, alert, escalate</div>
                <div>6. Notify stakeholders — public, emergency services</div>
                <div>7. Correct false alarms — validate, retract if needed</div>
              </div>
            </div>

            {/* Launch button */}
            <button
              onClick={handleLaunch}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 hover:brightness-110 active:scale-98"
              style={{
                background: `linear-gradient(135deg, ${colors.amber} 0%, #f97316 100%)`,
                color: colors.void,
              }}
            >
              <Play size={16} fill="currentColor" />
              LAUNCH ANALYSIS
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
