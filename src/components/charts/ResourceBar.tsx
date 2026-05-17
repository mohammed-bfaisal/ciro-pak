import type { Resource } from '../../types';

interface ResourceBarProps {
  resources: Resource[];
  height?: number;
}

const STATUSES = [
  { key: 'available',  label: 'Avail',  color: '#34d399' },
  { key: 'dispatched', label: 'Disp',   color: '#f59e0b' },
  { key: 'en_route',   label: 'Route',  color: '#60a5fa' },
  { key: 'on_scene',   label: 'Scene',  color: '#a78bfa' },
] as const;

export function ResourceBarChart({ resources, height = 120 }: ResourceBarProps) {
  if (resources.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 10, color: '#737373' }}>No resources loaded</span>
      </div>
    );
  }

  const counts = STATUSES.map((s) => ({
    ...s,
    n: resources.filter((r) => r.status === s.key).length,
  }));

  const max = Math.max(...counts.map((c) => c.n), 1);

  return (
    <div style={{
      width: '100%',
      height,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 7,
      padding: '0 2px',
    }}>
      {counts.map(({ key, label, color, n }) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 8, color: '#737373', width: 30, flexShrink: 0, lineHeight: 1 }}>
            {label}
          </span>
          <div style={{
            flex: 1,
            height: 5,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 3,
            overflow: 'hidden',
          }}>
            <div style={{
              width: n > 0 ? `${(n / max) * 100}%` : '0%',
              height: '100%',
              background: color,
              borderRadius: 3,
              transition: 'width 0.5s ease',
              boxShadow: n > 0 ? `0 0 6px ${color}66` : 'none',
            }} />
          </div>
          <span style={{
            fontSize: 8,
            color: n > 0 ? '#a3a3a3' : '#404040',
            width: 10,
            textAlign: 'right',
            flexShrink: 0,
            lineHeight: 1,
          }}>
            {n}
          </span>
        </div>
      ))}
    </div>
  );
}
