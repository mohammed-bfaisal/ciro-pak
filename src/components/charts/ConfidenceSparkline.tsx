import { colors } from '../../constants/colors';

interface ConfidenceSparklineProps {
  history: { t: string; v: number }[];
  width?: number;
  height?: number;
}

export function ConfidenceSparkline({ history, width = 100, height = 40 }: ConfidenceSparklineProps) {
  if (history.length < 2) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 9, color: '#525252' }}>—</span>
      </div>
    );
  }

  const pad = 4;
  const W = width - pad * 2;
  const H = height - pad * 2;

  const min = Math.min(...history.map((d) => d.v));
  const max = Math.max(...history.map((d) => d.v));
  const range = max - min || 0.01;

  const points = history.map((d, i) => {
    const x = pad + (i / (history.length - 1)) * W;
    const y = pad + H - ((d.v - min) / range) * H;
    return `${x},${y}`;
  });

  const lastPt = points[points.length - 1].split(',');
  const lastX = parseFloat(lastPt[0]);
  const lastY = parseFloat(lastPt[1]);
  const lastV = history[history.length - 1].v;

  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      {/* Area fill */}
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.amber} stopOpacity={0.25} />
          <stop offset="100%" stopColor={colors.amber} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline
        points={[
          ...points,
          `${pad + W},${pad + H}`,
          `${pad},${pad + H}`,
        ].join(' ')}
        fill="url(#spark-grad)"
        stroke="none"
      />
      {/* Line */}
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={colors.amber}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Last value dot */}
      <circle cx={lastX} cy={lastY} r={2.5} fill={colors.amber} />
      {/* Last value label */}
      <text
        x={lastX + 4}
        y={lastY + 3}
        fontSize={8}
        fill={colors.amber}
        fontWeight={600}
      >
        {Math.round(lastV * 100)}%
      </text>
    </svg>
  );
}
