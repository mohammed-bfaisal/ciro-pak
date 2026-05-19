import type { HTMLAttributes, ReactNode } from 'react';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  amber?: boolean;
  className?: string;
}

export function GlassPanel({ children, amber, className = '', style, ...rest }: GlassPanelProps) {
  return (
    <div className={`${amber ? 'glass-amber' : 'glass'} ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
}
