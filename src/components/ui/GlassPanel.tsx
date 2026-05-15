import type { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  amber?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function GlassPanel({ children, amber, className = '', style }: GlassPanelProps) {
  return (
    <div className={`${amber ? 'glass-amber' : 'glass'} ${className}`} style={style}>
      {children}
    </div>
  );
}
