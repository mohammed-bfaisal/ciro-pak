import { useState } from 'react';
import { Activity, Play, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors } from '../../constants/colors';
import type { City } from '../../types';
import { useTraceStore } from '../../store/traceStore';
import { runCIROPipeline } from '../../agents/orchestrator';
import { CITIES_BY_PROVINCE, CITY_REGISTRY } from '../../data/cities';

export function TopBar() {
  const [city, setCity] = useState<City>('karachi');
  const isRunning = useTraceStore((s) => s.isRunning);

  const handleRun = async () => {
    if (isRunning) return;
    await runCIROPipeline(city);
  };

  return (
    <header
      className="flex items-center justify-between px-4 border-b relative z-40"
      style={{
        height: 'var(--topbar-height)',
        background: 'rgba(8,8,8,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.09)',
      }}
    >
      {/* Left: Logo + LIVE */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Activity size={20} style={{ color: colors.amber }} />
          <span className="font-display text-lg hidden tablet:inline" style={{ color: colors.textPrimary }}>
            CIRO
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.15)' }}>
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: '#ef4444' }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-xs font-medium" style={{ color: '#f87171' }}>LIVE</span>
        </div>
      </div>

      {/* Center: City selector */}
      <div className="flex items-center gap-2">
        <select
          id="city-selector"
          value={city}
          onChange={(e) => setCity(e.target.value as City)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border-0 outline-none cursor-pointer"
          style={{
            background: colors.raised,
            color: colors.textPrimary,
            border: `1px solid ${colors.borderDefault}`,
          }}
        >
          {Object.entries(CITIES_BY_PROVINCE).map(([province, cityIds]) => (
            <optgroup key={province} label={province}>
              {cityIds.map((id) => (
                <option key={id} value={id}>{CITY_REGISTRY[id].label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Right: Run button */}
      <div className="flex items-center gap-3">
        <button
          id="run-pipeline-btn"
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
          style={{
            background: isRunning ? colors.amberMuted : colors.amber,
            color: isRunning ? colors.amber : colors.void,
            cursor: isRunning ? 'not-allowed' : 'pointer',
          }}
        >
          {isRunning ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span className="hidden tablet:inline">Running...</span>
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" />
              <span className="hidden tablet:inline">Run Pipeline</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
