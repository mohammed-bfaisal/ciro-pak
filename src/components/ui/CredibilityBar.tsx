import { motion } from 'framer-motion';
import { getCredColor } from '../../constants/colors';

interface CredibilityBarProps {
  score: number;
  showLabel?: boolean;
  height?: number;
}

export function CredibilityBar({ score, showLabel = true, height = 6 }: CredibilityBarProps) {
  const color = getCredColor(score);

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height, background: 'rgba(255,255,255,0.08)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(score * 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono font-medium tabular-nums" style={{ color, minWidth: 36 }}>
          {(score * 100).toFixed(0)}%
        </span>
      )}
    </div>
  );
}
