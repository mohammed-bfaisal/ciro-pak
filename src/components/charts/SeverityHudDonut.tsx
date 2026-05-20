import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { colors, getSeverityColor } from '../../constants/colors';
import type { Crisis } from '../../types';

interface Props {
  crises: Crisis[];
}

const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;

export function SeverityHudDonut({ crises }: Props) {
  const active = crises.filter((c) => c.status !== 'resolved' && c.status !== 'false_alarm');
  if (active.length === 0) return null;

  const data = SEVERITIES.map((s) => ({
    name: s,
    value: active.filter((c) => c.severity === s).length,
    color: getSeverityColor(s),
  })).filter((d) => d.value > 0);

  return (
    <div className="hidden desktop:flex flex-col items-center gap-0.5">
      <div style={{ width: 56, height: 56 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={16}
              outerRadius={26}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: colors.overlay, border: `1px solid ${colors.borderDefault}`, borderRadius: 6, fontSize: 11 }}
              formatter={(value, name) => [`${value} incident${Number(value) !== 1 ? 's' : ''}`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <span className="text-[9px] font-semibold" style={{ color: colors.textDim }}>
        {active.length} active
      </span>
    </div>
  );
}
