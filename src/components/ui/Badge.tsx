import { colors, getSeverityColor } from '../../constants/colors';
import type { Severity } from '../../types';

interface BadgeProps {
  label: string;
  variant?: 'severity' | 'status' | 'source' | 'default';
  severity?: Severity;
  color?: string;
}

export function Badge({ label, variant = 'default', severity, color }: BadgeProps) {
  let bg: string = 'rgba(255,255,255,0.08)';
  let fg: string = colors.textSecondary;

  if (variant === 'severity' && severity) {
    const c = getSeverityColor(severity);
    bg = c + '22';
    fg = c;
  } else if (variant === 'source') {
    const sourceColors: Record<string, string> = {
      social: '#60a5fa',
      weather: '#f59e0b',
      traffic: '#fb923c',
      field_report: '#34d399',
      sensor: '#a78bfa',
      emergency_call: '#f87171',
    };
    const c = sourceColors[label.toLowerCase()] || colors.textSecondary;
    bg = c + '22';
    fg = c;
  } else if (variant === 'status') {
    const statusColors: Record<string, string> = {
      active: colors.amber,
      responding: colors.info,
      resolved: colors.success,
      false_alarm: colors.danger,
      detecting: colors.warning,
      available: colors.success,
      dispatched: colors.amber,
      en_route: colors.info,
      on_scene: '#60a5fa',
      completed: colors.success,
      failed: colors.danger,
      recovered: colors.warning,
      pending: colors.textDim,
    };
    const c = statusColors[label.toLowerCase()] || colors.textSecondary;
    bg = c + '22';
    fg = c;
  } else if (color) {
    bg = color + '22';
    fg = color;
  }

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider"
      style={{ background: bg, color: fg }}
    >
      {label.replace(/_/g, ' ')}
    </span>
  );
}
