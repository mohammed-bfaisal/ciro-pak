import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { colors } from '../../constants/colors';
import type { Workplan } from '../../types';
import { getPhaseDurationData } from '../../utils/traceDurations';

interface TracePhaseDurationChartProps {
  workplan: Workplan;
}

export function TracePhaseDurationChart({ workplan }: TracePhaseDurationChartProps) {
  const chartData = getPhaseDurationData(workplan);

  if (chartData.length === 0) return null;

  return (
    <section
      className="border-b px-4 py-3"
      style={{ borderColor: colors.borderDefault, background: colors.base }}
      aria-label="Trace phase duration chart"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textPrimary }}>
          Phase Duration
        </h2>
        <span className="text-[10px]" style={{ color: colors.textDim }}>
          milliseconds
        </span>
      </div>
      <div style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: colors.textDim }}
              axisLine={false}
              tickLine={false}
              interval={0}
              height={34}
            />
            <YAxis tick={{ fontSize: 9, fill: colors.textDim }} axisLine={false} tickLine={false} width={44} />
            <Bar dataKey="durationMs" fill={colors.amber} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
