import { motion } from 'framer-motion';
import type { Crisis } from '../../types';
import { Badge } from '../ui/Badge';
import { CredibilityBar } from '../ui/CredibilityBar';
import { getCrisisColor } from '../../constants/colors';
import { colors } from '../../constants/colors';
import { formatTimestamp, formatNumber, capitalize } from '../../utils/formatting';
import { MapPin, Users, Clock } from 'lucide-react';

interface CrisisCardProps {
  crisis: Crisis;
  onClick?: () => void;
  index?: number;
}

export function CrisisCard({ crisis, onClick, index = 0 }: CrisisCardProps) {
  const crisisColor = getCrisisColor(crisis.type);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onClick={onClick}
      className="p-4 rounded-xl border cursor-pointer transition-all hover:border-opacity-50 group"
      style={{
        background: colors.raised,
        borderColor: colors.borderDefault,
        borderLeft: `4px solid ${crisisColor}`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full animate-pulse-dot"
            style={{ background: crisisColor, boxShadow: `0 0 8px ${crisisColor}` }}
          />
          <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
            {capitalize(crisis.type)}
          </span>
        </div>
        <Badge label={crisis.severity} variant="severity" severity={crisis.severity} />
      </div>

      <h3 className="text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
        {crisis.title}
      </h3>

      <div className="flex flex-wrap gap-3 text-[11px] mb-3" style={{ color: colors.textSecondary }}>
        <span className="flex items-center gap-1"><MapPin size={12} /> {crisis.location.label}</span>
        <span className="flex items-center gap-1"><Users size={12} /> {formatNumber(crisis.affectedPopulation)}</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {crisis.estimatedDuration}</span>
      </div>

      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px]" style={{ color: colors.textDim }}>Confidence</span>
          <Badge label={crisis.status} variant="status" />
        </div>
        <CredibilityBar score={crisis.confidenceScore} height={4} />
      </div>

      <div className="flex items-center justify-between text-[11px]" style={{ color: colors.textDim }}>
        <span>{crisis.signalIds.length} signals</span>
        <span>{formatTimestamp(crisis.detectedAt)}</span>
      </div>
    </motion.div>
  );
}
