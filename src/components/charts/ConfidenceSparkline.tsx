import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { colors } from '../../constants/colors';

interface ConfidenceSparklineProps {
  history: { t: string; v: number }[];
  width?: number;
  height?: number;
}

export function ConfidenceSparkline({ history, width = 100, height = 40 }: ConfidenceSparklineProps) {
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history}>
          <YAxis domain={[0, 1]} hide />
          <Line
            type="monotone"
            dataKey="v"
            stroke={colors.amber}
            strokeWidth={2}
            dot={false}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
