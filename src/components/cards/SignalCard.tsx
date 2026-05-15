import { motion } from 'framer-motion';
import type { Signal } from '../../types';
import { Badge } from '../ui/Badge';
import { CredibilityBar } from '../ui/CredibilityBar';
import { formatTimestamp } from '../../utils/formatting';
import { AlertTriangle } from 'lucide-react';
import { colors } from '../../constants/colors';

interface SignalCardProps {
  signal: Signal;
  index?: number;
}

export function SignalCard({ signal, index = 0 }: SignalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="p-3 rounded-lg border transition-all"
      style={{
        background: signal.isFlagged ? 'rgba(248,113,113,0.06)' : colors.raised,
        borderColor: signal.isFlagged ? 'rgba(248,113,113,0.3)' : colors.borderDefault,
        borderLeft: signal.isFlagged ? `3px solid ${colors.danger}` : `3px solid transparent`,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Badge label={signal.source} variant="source" />
          {signal.isFlagged && (
            <span className="flex items-center gap-1 text-xs" style={{ color: colors.danger }}>
              <AlertTriangle size={12} /> Flagged
            </span>
          )}
        </div>
        <span className="text-[11px] whitespace-nowrap" style={{ color: colors.textDim }}>
          {formatTimestamp(signal.timestamp)}
        </span>
      </div>

      <p className="text-sm mb-2 leading-relaxed" style={{ color: colors.textPrimary }}>
        {signal.content}
      </p>

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <CredibilityBar score={signal.credibilityScore} height={4} />
        </div>
        <span className="text-[10px] whitespace-nowrap" style={{ color: colors.textDim }}>
          📍 {signal.location.label}
        </span>
      </div>

      {signal.conflictsWith && signal.conflictsWith.length > 0 && (
        <div className="mt-2 text-[11px] px-2 py-1 rounded" style={{ background: 'rgba(248,113,113,0.1)', color: colors.danger }}>
          ⚠ Conflicts with: {signal.conflictsWith.join(', ')}
        </div>
      )}
    </motion.div>
  );
}
