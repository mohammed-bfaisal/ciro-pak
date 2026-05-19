import type { ReactNode } from 'react';
import { colors } from '../../constants/colors';

interface SettingsRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: ReactNode;
}

export function SettingsRow({ title, description, checked, onChange, icon }: SettingsRowProps) {
  return (
    <div
      className="flex min-h-[64px] items-center gap-3 border-b px-4 py-3 last:border-b-0"
      style={{ borderColor: colors.borderSubtle }}
    >
      {icon && (
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: checked ? colors.amberMuted : colors.raised, color: checked ? colors.amber : colors.textDim }}
        >
          {icon}
        </div>
      )}

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="min-w-0 flex-1 text-left"
      >
        <span className="block text-sm font-semibold leading-snug" style={{ color: colors.textPrimary }}>
          {title}
        </span>
        <span className="mt-1 block text-xs leading-snug" style={{ color: colors.textSecondary }}>
          {description}
        </span>
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className="relative h-8 w-14 flex-shrink-0 rounded-full transition-colors"
        style={{ background: checked ? colors.amber : colors.overlay2 }}
      >
        <span
          className="absolute top-1 h-6 w-6 rounded-full transition-transform"
          style={{
            left: 4,
            background: checked ? colors.void : colors.textSecondary,
            transform: checked ? 'translateX(24px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  );
}
