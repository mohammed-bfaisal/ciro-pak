export const colors = {
  // Backgrounds
  void:    '#080808',
  base:    '#111111',
  raised:  '#1a1a1a',
  overlay: '#222222',
  overlay2: '#2a2a2a',

  // Primary — amber/orange emergency ops
  amber:       '#f59e0b',
  amberDim:    '#d97706',
  amberMuted:  'rgba(245,158,11,0.15)',
  amberGlow:   'rgba(245,158,11,0.25)',
  orange:      '#ea580c',
  orangeMuted: 'rgba(234,88,12,0.12)',

  // Text
  textPrimary:   '#f5f5f5',
  textSecondary: '#a3a3a3',
  textDim:       '#525252',
  textAmber:     '#fbbf24',

  // Borders
  borderSubtle:  'rgba(255,255,255,0.05)',
  borderDefault: 'rgba(255,255,255,0.09)',
  borderStrong:  'rgba(255,255,255,0.16)',
  borderAmber:   'rgba(245,158,11,0.28)',

  // Crisis types
  crisis: {
    flood:          '#38bdf8',
    heatwave:       '#f59e0b',
    accident:       '#ef4444',
    infrastructure: '#a78bfa',
    power_outage:   '#fb923c',
    protest:        '#f97316',
    disease_cluster:'#34d399',
    unknown:        '#6b7280',
  } as Record<string, string>,

  // Status
  success: '#34d399',
  warning: '#fbbf24',
  danger:  '#f87171',
  info:    '#60a5fa',

  // Credibility
  credHigh: '#34d399',   // > 0.7
  credMed:  '#fbbf24',   // 0.4–0.7
  credLow:  '#f87171',   // < 0.4
} as const;

export function getCrisisColor(type: string): string {
  return (colors.crisis as Record<string, string>)[type] || colors.crisis.unknown;
}

export function getCredColor(score: number): string {
  if (score > 0.7) return colors.credHigh;
  if (score >= 0.4) return colors.credMed;
  return colors.credLow;
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return colors.danger;
    case 'high': return colors.amber;
    case 'medium': return colors.warning;
    case 'low': return colors.success;
    default: return colors.textDim;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'available': return colors.success;
    case 'dispatched': case 'en_route': return colors.amber;
    case 'on_scene': return colors.info;
    case 'returning': return colors.textSecondary;
    default: return colors.textDim;
  }
}
