import { useState, useEffect } from 'react';
import { CiroMap } from '../components/map/CiroMap';
import { SignalFeed } from '../components/panels/SignalFeed';
import { CrisisPanel } from '../components/panels/CrisisPanel';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useCrisisStore } from '../store/crisisStore';
import { useSignalStore } from '../store/signalStore';
import { useCityStore } from '../store/cityStore';
import { colors } from '../constants/colors';
import { Radio, X } from 'lucide-react';

export function Dashboard() {
  const city = useCityStore((s) => s.city);
  const [showSignals, setShowSignals] = useState(false);
  const selectedCrisisId = useCrisisStore((s) => s.selectedCrisisId);
  const selectCrisis = useCrisisStore((s) => s.selectCrisis);
  const signalCount = useSignalStore((s) => s.signals.length);
  const crisisCount = useCrisisStore((s) => s.crises.length);

  // Close both panels whenever the city changes
  useEffect(() => {
    selectCrisis(null);
    setShowSignals(false);
  }, [city]);

  return (
    <div className="absolute inset-0">
      {/* Map fills entire viewport */}
      <CiroMap city={city} onCrisisClick={(id) => selectCrisis(id)} />

      {/* Signal feed toggle */}
      <div className="absolute top-3 left-3 z-20">
        <button
          onClick={() => setShowSignals(!showSignals)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: showSignals ? colors.amber : 'rgba(17,17,17,0.85)',
            color: showSignals ? colors.void : colors.amber,
            backdropFilter: 'blur(12px)',
            border: `1px solid ${colors.borderAmber}`,
          }}
        >
          <Radio size={16} />
          <span className="hidden tablet:inline">Signals</span>
          {signalCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{
              background: showSignals ? 'rgba(0,0,0,0.2)' : colors.amberMuted,
              color: showSignals ? colors.void : colors.amber,
            }}>
              {signalCount}
            </span>
          )}
        </button>
      </div>

      {/* Stats overlay */}
      {(signalCount > 0 || crisisCount > 0) && (
        <div className="absolute top-3 right-3 z-20 flex gap-2">
          {crisisCount > 0 && (
            <GlassPanel amber className="px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: colors.danger }} />
              <span className="text-xs font-semibold" style={{ color: colors.textPrimary }}>{crisisCount} Active Crises</span>
            </GlassPanel>
          )}
        </div>
      )}

      {/* Signal feed panel */}
      {showSignals && (
        <div className="absolute top-0 left-0 bottom-0 z-20 w-[320px] mobile:w-full border-r" style={{
          background: 'rgba(17,17,17,0.92)',
          backdropFilter: 'blur(20px)',
          borderColor: colors.borderDefault,
        }}>
          <div className="absolute top-3 right-3 z-10">
            <button onClick={() => setShowSignals(false)} style={{ color: colors.textDim }}>
              <X size={18} />
            </button>
          </div>
          <SignalFeed />
        </div>
      )}

      {/* Crisis detail panel */}
      {selectedCrisisId && (
        <CrisisPanel crisisId={selectedCrisisId} onClose={() => selectCrisis(null)} />
      )}
    </div>
  );
}
