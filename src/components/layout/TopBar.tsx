import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, ChevronDown, Check, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '../../constants/colors';
import { useCityStore } from '../../store/cityStore';
import { ALL_CITIES, CITY_REGISTRY } from '../../data/cities';
import { getMapTilePreloader } from '../../utils/mapTilePreloader';
import { LiveDataStatus } from '../hud/LiveDataStatus';

const CITIES = ALL_CITIES.map((key) => {
  const metadata = CITY_REGISTRY[key];
  const population = metadata.population >= 1_000_000
    ? `${(metadata.population / 1_000_000).toFixed(1)}M`
    : `${Math.round(metadata.population / 1_000)}K`;
  return {
    key,
    label: metadata.label,
    sub: `${metadata.province} - ${population}`,
  };
});

export function TopBar() {
  const city = useCityStore((s) => s.city);
  const setCity = useCityStore((s) => s.setCity);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = CITIES.find((c) => c.key === city) ?? CITIES[0];
  const preloadCityTiles = (targetCity: (typeof CITIES)[number]['key']) => {
    void getMapTilePreloader()?.preloadCity(targetCity);
  };

  return (
    <header
      className="grid items-center px-4 border-b relative z-40"
      style={{
        height: 'var(--topbar-height)',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
        background: 'rgba(8,8,8,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.09)',
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
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

      <div className="relative justify-self-center" ref={dropRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
          style={{
            background: open ? colors.overlay : colors.raised,
            color: colors.textPrimary,
            border: `1px solid ${open ? colors.borderStrong : colors.borderDefault}`,
            minWidth: 148,
          }}
        >
          <MapPin size={13} style={{ color: colors.amber, flexShrink: 0 }} />
          <span className="flex-1 text-left">{current.label}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
            <ChevronDown size={13} style={{ color: colors.textDim }} />
          </motion.div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.14 }}
              className="absolute top-full mt-1.5 left-0 right-0 rounded-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
              style={{
                background: 'rgba(26,26,26,0.98)',
                border: `1px solid ${colors.borderStrong}`,
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              }}
            >
              {CITIES.map((c) => {
                const active = c.key === city;
                return (
                  <button
                    key={c.key}
                    onClick={() => { preloadCityTiles(c.key); setCity(c.key); setOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors duration-100"
                    style={{ background: active ? colors.amberMuted : 'transparent' }}
                    onFocus={() => preloadCityTiles(c.key)}
                    onMouseEnter={(e) => {
                      preloadCityTiles(c.key);
                      if (!active) (e.currentTarget as HTMLElement).style.background = colors.overlay;
                    }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = active ? colors.amberMuted : 'transparent'; }}
                  >
                    <MapPin size={12} style={{ color: active ? colors.amber : colors.textDim, flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-none mb-0.5" style={{ color: active ? colors.amber : colors.textPrimary }}>
                        {c.label}
                      </div>
                      <div className="text-[10px] leading-none" style={{ color: colors.textDim }}>{c.sub}</div>
                    </div>
                    {active && <Check size={12} style={{ color: colors.amber, flexShrink: 0 }} />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex min-w-0 items-center gap-2 justify-self-end">
        <LiveDataStatus />
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border"
          style={{
            color: colors.textSecondary,
            background: colors.raised,
            borderColor: colors.borderDefault,
          }}
          aria-label="Open settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
