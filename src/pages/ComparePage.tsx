import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { colors } from '../constants/colors';
import { CheckCircle, XCircle } from 'lucide-react';

const comparisonData = [
  {
    metric: 'Detection Time',
    baseline: 45,
    ciro: 8,
    unit: 'min',
    baselineLabel: '45 min (manual reports)',
    ciroLabel: '8 min (auto-fused signals)',
  },
  {
    metric: 'False Alarm Rate',
    baseline: 35,
    ciro: 8,
    unit: '%',
    baselineLabel: '35% (no credibility scoring)',
    ciroLabel: '8% (multi-source verification)',
  },
  {
    metric: 'Resource Allocation',
    baseline: 25,
    ciro: 87,
    unit: '% optimal',
    baselineLabel: '25% — all units to one crisis',
    ciroLabel: '87% — priority-weighted split',
  },
  {
    metric: 'Response Coordination',
    baseline: 1,
    ciro: 6,
    unit: 'stakeholders',
    baselineLabel: '1 stakeholder (emergency only)',
    ciroLabel: '6 stakeholders (hospitals, transport, media...)',
  },
  {
    metric: 'Error Recovery',
    baseline: 0,
    ciro: 100,
    unit: '%',
    baselineLabel: 'None — failures crash pipeline',
    ciroLabel: 'Auto-retry + cached fallback',
  },
  {
    metric: 'Cost Transparency',
    baseline: 0,
    ciro: 100,
    unit: '%',
    baselineLabel: 'No cost tracking',
    ciroLabel: 'Per-action PKR cost logged',
  },
];

const chartData = comparisonData.map((d) => ({
  name: d.metric,
  Baseline: d.baseline,
  CIRO: d.ciro,
}));

export function ComparePage() {
  return (
    <div className="h-full overflow-y-auto pb-20" style={{ background: colors.void }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: colors.borderDefault }}>
        <h1 className="font-display text-xl" style={{ color: colors.textPrimary }}>Baseline Comparison</h1>
        <p className="text-xs mt-1" style={{ color: colors.textDim }}>
          Non-Agentic Baseline vs CIRO Agentic System
        </p>
      </div>

      {/* Side-by-side header */}
      <div className="grid grid-cols-2 gap-0 border-b" style={{ borderColor: colors.borderDefault }}>
        <div className="p-4 border-r text-center" style={{ borderColor: colors.borderDefault, background: 'rgba(239,68,68,0.05)' }}>
          <XCircle size={24} className="mx-auto mb-1" style={{ color: colors.danger }} />
          <h2 className="text-sm font-bold" style={{ color: colors.danger }}>Non-Agentic Baseline</h2>
          <p className="text-[11px]" style={{ color: colors.textDim }}>Rule-based, single-source, no recovery</p>
        </div>
        <div className="p-4 text-center" style={{ background: 'rgba(245,158,11,0.05)' }}>
          <CheckCircle size={24} className="mx-auto mb-1" style={{ color: colors.amber }} />
          <h2 className="text-sm font-bold" style={{ color: colors.amber }}>CIRO System</h2>
          <p className="text-[11px]" style={{ color: colors.textDim }}>Multi-agent, multi-source, auto-recovery</p>
        </div>
      </div>

      {/* Metric rows */}
      <div className="divide-y" style={{ borderColor: colors.borderDefault }}>
        {comparisonData.map((d, i) => (
          <motion.div
            key={d.metric}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="grid grid-cols-2 gap-0"
          >
            <div className="p-3 border-r" style={{ borderColor: colors.borderDefault }}>
              <span className="text-xs font-semibold block mb-1" style={{ color: colors.textDim }}>{d.metric}</span>
              <span className="text-sm" style={{ color: colors.danger }}>{d.baselineLabel}</span>
            </div>
            <div className="p-3">
              <span className="text-xs font-semibold block mb-1" style={{ color: colors.textDim }}>{d.metric}</span>
              <span className="text-sm" style={{ color: colors.success }}>{d.ciroLabel}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart comparison */}
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-3" style={{ color: colors.textPrimary }}>Performance Chart</h3>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: colors.textDim }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10, fill: colors.textDim }} axisLine={false} tickLine={false} />
              <Bar dataKey="Baseline" fill={colors.danger} radius={[4, 4, 0, 0]} barSize={16} opacity={0.7} />
              <Bar dataKey="CIRO" fill={colors.amber} radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary */}
      <div className="mx-4 p-4 rounded-xl border" style={{ borderColor: colors.borderAmber, background: colors.amberMuted }}>
        <h3 className="text-sm font-bold mb-2" style={{ color: colors.amber }}>Key Differentiators</h3>
        <ul className="space-y-1 text-xs" style={{ color: colors.textSecondary }}>
          <li>• <strong style={{ color: colors.textPrimary }}>Multi-source fusion</strong> eliminates single-source bias (khi-s3 flagged at 0.12 credibility)</li>
          <li>• <strong style={{ color: colors.textPrimary }}>False alarm correction</strong> automatically retracts overstated alerts</li>
          <li>• <strong style={{ color: colors.textPrimary }}>Error recovery</strong> handles API failures with cached fallback (Action a7: 503 → cached route)</li>
          <li>• <strong style={{ color: colors.textPrimary }}>Multi-crisis coordination</strong> splits resources by severity, not first-come-first-served</li>
          <li>• <strong style={{ color: colors.textPrimary }}>Stakeholder targeting</strong> sends tailored messages to 6 different audiences</li>
        </ul>
      </div>
    </div>
  );
}
