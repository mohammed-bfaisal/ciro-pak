import { useEffect, useState } from 'react';
import { CheckCircle2, CloudOff, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';
import { checkFoundationStatus, simulateFoundationContracts } from '../api/foundation';
import { Badge } from '../components/ui/Badge';
import { GlassPanel } from '../components/ui/GlassPanel';
import { colors } from '../constants/colors';
import { useCityStore } from '../store/cityStore';
import { useSessionStore } from '../store/sessionStore';
import { useSettingsStore } from '../store/settingsStore';

export function SettingsPage() {
  const city = useCityStore((state) => state.city);
  const p00 = useSettingsStore((state) => state.p00);
  const loadP00Settings = useSettingsStore((state) => state.loadP00Settings);
  const setP00Enabled = useSettingsStore((state) => state.setP00Enabled);
  const setP00MobileParity = useSettingsStore((state) => state.setP00MobileParity);
  const markP00Reviewed = useSettingsStore((state) => state.markP00Reviewed);
  const p00Status = useSessionStore((state) => state.p00Status);
  const p00LastUpdatedAt = useSessionStore((state) => state.p00LastUpdatedAt);
  const p00ErrorState = useSessionStore((state) => state.p00ErrorState);
  const setP00Status = useSessionStore((state) => state.setP00Status);
  const setP00ErrorState = useSessionStore((state) => state.setP00ErrorState);
  const [message, setMessage] = useState('Bundled fallback is available when the hosted backend is not configured.');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadP00Settings();
  }, [loadP00Settings]);

  const runStatusCheck = async () => {
    setBusy(true);
    setP00Status('checking', new Date().toISOString());
    const result = await checkFoundationStatus();
    setP00Status(result.status, result.checkedAt);
    setMessage(result.message);
    setP00ErrorState(result.status === 'error' ? result.message : null);
    setBusy(false);
  };

  const runSimulation = async () => {
    setBusy(true);
    const requestedAt = new Date().toISOString();
    const result = await simulateFoundationContracts({
      request: {
        city,
        requestedAt,
        source: 'settings',
      },
    });
    setP00Status(result.status, result.simulatedAt);
    markP00Reviewed(result.simulatedAt);
    setMessage(`${result.message} ${result.events.join(' ')}`);
    setP00ErrorState(result.status === 'error' ? result.message : null);
    setBusy(false);
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4 desktop:px-6 desktop:py-6" style={{ background: colors.void }}>
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <header className="flex flex-col gap-3 desktop:flex-row desktop:items-end desktop:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck size={18} style={{ color: colors.amber }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textDim }}>
                P00
              </span>
            </div>
            <h1 className="font-display text-3xl leading-tight" style={{ color: colors.textPrimary }}>
              Foundation Settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: colors.textSecondary }}>
              Backend Contracts, operator preferences, mobile parity, and bundled fallback behavior for later CIRO features.
            </p>
          </div>
          <Badge label={p00Status} variant="status" />
        </header>

        <div className="grid gap-4 desktop:grid-cols-[1.2fr_0.8fr]">
          <GlassPanel className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  Backend Contracts
                </h2>
                <p className="mt-1 text-xs leading-5" style={{ color: colors.textSecondary }}>
                  Calls use the configured CIRO API base URL. If the APK has no safe hosted backend, P00 uses bundled fallback data.
                </p>
              </div>
              <CloudOff size={18} style={{ color: colors.amber }} />
            </div>

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={runStatusCheck}
                disabled={busy}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
                style={{
                  background: colors.raised,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.borderDefault}`,
                  opacity: busy ? 0.7 : 1,
                }}
              >
                <RefreshCw size={15} />
                Check status
              </button>
              <button
                type="button"
                onClick={runSimulation}
                disabled={busy}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
                style={{
                  background: colors.amberMuted,
                  color: colors.amber,
                  border: `1px solid ${colors.borderAmber}`,
                  opacity: busy ? 0.7 : 1,
                }}
              >
                <CheckCircle2 size={15} />
                Simulate contract
              </button>
            </div>

            <div className="mt-4 rounded-lg p-3 text-xs leading-5" style={{ background: colors.raised, color: colors.textSecondary }}>
              {message}
            </div>
          </GlassPanel>

          <GlassPanel className="p-4">
            <div className="flex items-center gap-2">
              <Smartphone size={18} style={{ color: colors.amber }} />
              <h2 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                Mobile parity
              </h2>
            </div>

            <label className="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-lg p-3" style={{ background: colors.raised }}>
              <span className="text-sm" style={{ color: colors.textSecondary }}>Foundation enabled</span>
              <input
                type="checkbox"
                checked={p00.enabled}
                onChange={(event) => setP00Enabled(event.currentTarget.checked)}
              />
            </label>

            <label className="mt-2 flex min-h-11 items-center justify-between gap-3 rounded-lg p-3" style={{ background: colors.raised }}>
              <span className="text-sm" style={{ color: colors.textSecondary }}>Mobile parity</span>
              <input
                type="checkbox"
                checked={p00.mobileParity}
                onChange={(event) => setP00MobileParity(event.currentTarget.checked)}
              />
            </label>

            <dl className="mt-4 grid gap-2 text-xs" style={{ color: colors.textSecondary }}>
              <div className="flex justify-between gap-3">
                <dt>Last reviewed</dt>
                <dd style={{ color: colors.textPrimary }}>{p00.lastReviewedAt ?? 'Not reviewed'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Last backend check</dt>
                <dd style={{ color: colors.textPrimary }}>{p00LastUpdatedAt ?? 'Not checked'}</dd>
              </div>
              {p00ErrorState && (
                <div className="rounded-lg p-2" style={{ background: 'rgba(248,113,113,0.12)', color: colors.danger }}>
                  {p00ErrorState}
                </div>
              )}
            </dl>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
