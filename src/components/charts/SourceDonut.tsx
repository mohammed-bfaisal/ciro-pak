import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { Signal } from '../../types';

interface SourceDonutProps {
  signals: Signal[];
  size?: number;
}

const SOURCE_COLORS: Record<string, string> = {
  social: '#60a5fa',
  weather: '#f59e0b',
  traffic: '#fb923c',
  field_report: '#34d399',
  sensor: '#a78bfa',
  emergency_call: '#f87171',
};

export function SourceDonut({ signals, size = 120 }: SourceDonutProps) {
  const counts: Record<string, number> = {};
  signals.forEach((s) => {
    counts[s.source] = (counts[s.source] || 0) + 1;
  });

  const data = Object.entries(counts).map(([source, count]) => ({
    name: source.replace(/_/g, ' '),
    value: count,
    color: SOURCE_COLORS[source] || '#6b7280',
  }));

  return (
    <div style={{ width: size }}>
      {/* Donut chart — fixed square, no built-in legend */}
      <div style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="45%"
              outerRadius="75%"
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom legend — wraps naturally without clipping */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '3px 8px',
          justifyContent: 'center',
          marginTop: 4,
        }}
      >
        {data.map((entry) => (
          <div
            key={entry.name}
            style={{ display: 'flex', alignItems: 'center', gap: 3 }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: entry.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 9, color: '#a3a3a3', whiteSpace: 'nowrap' }}>
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
