import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { getSeverityColor } from '../../constants/colors';
import type { Severity } from '../../types';

interface SeverityGaugeProps {
  severity: Severity;
  size?: number;
}

const severityValues: Record<Severity, number> = {
  low: 25,
  medium: 50,
  high: 75,
  critical: 100,
};

export function SeverityGauge({ severity, size = 80 }: SeverityGaugeProps) {
  const color = getSeverityColor(severity);
  const value = severityValues[severity];

  const data = [{ name: severity, value, fill: color }];

  return (
    <div style={{ width: size, height: size }} className="relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="65%" outerRadius="100%"
          startAngle={180} endAngle={0}
          data={data}
          barSize={6}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={10}
            background={{ fill: 'rgba(255,255,255,0.06)' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold uppercase" style={{ color }}>
          {severity}
        </span>
      </div>
    </div>
  );
}
