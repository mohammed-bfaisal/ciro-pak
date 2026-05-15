import { useState } from 'react';
import { useSignalStore } from '../store/signalStore';
import { SignalCard } from '../components/cards/SignalCard';
import { colors } from '../constants/colors';
import type { SignalSource } from '../types';

const filters: (SignalSource | 'all' | 'flagged')[] = ['all', 'social', 'field_report', 'weather', 'traffic', 'flagged'];

export function SignalsPage() {
  const signals = useSignalStore((s) => s.fusedSignals.length > 0 ? s.fusedSignals : s.signals);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filtered = signals.filter((s) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'flagged') return s.isFlagged;
    return s.source === activeFilter;
  });

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: colors.void }}>
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: colors.borderDefault }}>
        <h1 className="font-display text-xl mb-3" style={{ color: colors.textPrimary }}>Signals</h1>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                background: activeFilter === f ? colors.amber : colors.raised,
                color: activeFilter === f ? colors.void : colors.textSecondary,
                border: `1px solid ${activeFilter === f ? colors.amber : colors.borderDefault}`,
              }}
            >
              {f === 'field_report' ? 'Field Report' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && f !== 'flagged' && (
                <span className="ml-1 opacity-60">
                  ({signals.filter((s) => s.source === f).length})
                </span>
              )}
              {f === 'flagged' && (
                <span className="ml-1 opacity-60">
                  ({signals.filter((s) => s.isFlagged).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Signal list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: colors.textDim }}>
            {signals.length === 0 ? 'Run pipeline to ingest signals' : 'No signals match this filter'}
          </div>
        ) : (
          filtered.map((signal, i) => (
            <SignalCard key={signal.id} signal={signal} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
