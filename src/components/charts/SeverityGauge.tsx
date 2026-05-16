import { getSeverityColor } from '../../constants/colors';
import type { Severity } from '../../types';

interface SeverityGaugeProps {
  severity: Severity;
  size?: number;
}

const severityPct: Record<Severity, number> = {
  low: 0.25,
  medium: 0.5,
  high: 0.75,
  critical: 1,
};

export function SeverityGauge({ severity, size = 80 }: SeverityGaugeProps) {
  const color = getSeverityColor(severity);
  const pct = severityPct[severity];

  const cx = size / 2;
  const cy = size * 0.54;
  const r = size * 0.36;
  const strokeW = 7;
  const circ = Math.PI * r;
  const offset = circ * (1 - pct);
  const svgH = cy + strokeW / 2 + 2;

  return (
    <div style={{ width: size, textAlign: 'center' }}>
      <svg width={size} height={svgH} style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
        {/* Track */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 5px ${color}99)` }}
        />
      </svg>
      <span style={{
        display: 'block',
        fontSize: 9,
        fontWeight: 700,
        color,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        lineHeight: 1,
        marginTop: 3,
      }}>
        {severity}
      </span>
    </div>
  );
}
