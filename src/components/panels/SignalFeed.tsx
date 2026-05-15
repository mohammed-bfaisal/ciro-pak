import { useSignalStore } from '../../store/signalStore';
import { SignalCard } from '../cards/SignalCard';
import { colors } from '../../constants/colors';
import { Radio } from 'lucide-react';

export function SignalFeed() {
  const signals = useSignalStore((s) => s.signals);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: colors.borderDefault }}>
        <Radio size={16} style={{ color: colors.amber }} />
        <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Signal Feed</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: colors.amberMuted, color: colors.amber }}>
          {signals.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {signals.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: colors.textDim }}>
            Run pipeline to see signals stream in
          </div>
        ) : (
          [...signals].reverse().map((signal, i) => (
            <SignalCard key={signal.id} signal={signal} index={i} />
          ))
        )}
      </div>
      {signals.length > 0 && (
        <div className="px-4 py-2 border-t text-[11px] font-mono truncate" style={{ borderColor: colors.borderDefault, color: colors.textDim }}>
          Latest: {signals[signals.length - 1]?.source} — {signals[signals.length - 1]?.location.label}
        </div>
      )}
    </div>
  );
}
