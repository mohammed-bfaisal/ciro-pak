import { useEffect, useState } from 'react';
import { CheckCircle2, CloudOff, Eye, Palette, RefreshCw, ShieldCheck, Smartphone, Type } from 'lucide-react';
import { checkDisplayAccessibilityStatus, simulateDisplayAccessibilitySettings } from '../api/displayAccessibility';
import { checkFoundationStatus, simulateFoundationContracts } from '../api/foundation';
import { Badge } from '../components/ui/Badge';
import { GlassPanel } from '../components/ui/GlassPanel';
import { colors } from '../constants/colors';
import { resolveP02DisplayPreferences } from '../displayAccessibility/contracts';
import { useCityStore } from '../store/cityStore';
import { useSessionStore } from '../store/sessionStore';
import { useSettingsStore } from '../store/settingsStore';

export function SettingsPage() {
  const city = useCityStore((state) => state.city);
  const p00 = useSettingsStore((state) => state.p00);
  const p02 = useSettingsStore((state) => state.p02);
  const loadP00Settings = useSettingsStore((state) => state.loadP00Settings);
  const loadP02Settings = useSettingsStore((state) => state.loadP02Settings);
  const setP00Enabled = useSettingsStore((state) => state.setP00Enabled);
  const setP00MobileParity = useSettingsStore((state) => state.setP00MobileParity);
  const markP00Reviewed = useSettingsStore((state) => state.markP00Reviewed);
  const setP02Enabled = useSettingsStore((state) => state.setP02Enabled);
  const setP02MobileParity = useSettingsStore((state) => state.setP02MobileParity);
  const markP02Reviewed = useSettingsStore((state) => state.markP02Reviewed);
  const p00Status = useSessionStore((state) => state.p00Status);
  const p00LastUpdatedAt = useSessionStore((state) => state.p00LastUpdatedAt);
  const p00ErrorState = useSessionStore((state) => state.p00ErrorState);
  const setP00Status = useSessionStore((state) => state.setP00Status);
  const setP00ErrorState = useSessionStore((state) => state.setP00ErrorState);
  const p02Status = useSessionStore((state) => state.p02Status);
  const p02LastUpdatedAt = useSessionStore((state) => state.p02LastUpdatedAt);
  const p02ErrorState = useSessionStore((state) => state.p02ErrorState);
  const setP02Status = useSessionStore((state) => state.setP02Status);
  const setP02ErrorState = useSessionStore((state) => state.setP02ErrorState);
  const p02Preferences = resolveP02DisplayPreferences(p02);
  const [p00Message, setP00Message] = useState('Bundled fallback is available when the hosted backend is not configured.');
  const [p02Message, setP02Message] = useState('Bundled display preferences are available when the hosted backend is not configured.');
  const [busy, setBusy] = useState<'p00' | 'p02' | null>(null);

  useEffect(() => {
    loadP00Settings();
    loadP02Settings();
  }, [loadP00Settings, loadP02Settings]);

  const runP00StatusCheck = async () => {
    setBusy('p00');
    setP00Status('checking', new Date().toISOString());
    const result = await checkFoundationStatus();
    setP00Status(result.status, result.checkedAt);
    setP00Message(result.message);
    setP00ErrorState(result.status === 'error' ? result.message : null);
    setBusy(null);
  };

  const runP00Simulation = async () => {
    setBusy('p00');
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
    setP00Message(`${result.message} ${result.events.join(' ')}`);
    setP00ErrorState(result.status === 'error' ? result.message : null);
    setBusy(null);
  };

  const runP02StatusCheck = async () => {
    setBusy('p02');
    setP02Status('checking', new Date().toISOString());
    const result = await checkDisplayAccessibilityStatus();
    setP02Status(result.status, result.checkedAt);
    setP02Message(result.message);
    setP02ErrorState(result.status === 'error' ? result.message : null);
    setBusy(null);
  };

  const runP02Simulation = async () => {
    setBusy('p02');
    const requestedAt = new Date().toISOString();
    const result = await simulateDisplayAccessibilitySettings({
      request: {
        city,
        requestedAt,
        source: 'settings',
      },
    });
    setP02Status(result.status, result.simulatedAt);
    markP02Reviewed(result.simulatedAt);
    setP02Enabled(true);
    setP02Message(`${result.message} ${result.events.join(' ')}`);
    setP02ErrorState(result.status === 'error' ? result.message : null);
    setBusy(null);
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
              Backend Contracts, operator preferences, mobile parity, bundled fallback behavior, and accessible display controls.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge label={`P00 ${p00Status}`} variant="status" />
            <Badge label={`P02 ${p02Status}`} variant="status" />
          </div>
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
                onClick={runP00StatusCheck}
                disabled={busy === 'p00'}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
                style={{
                  background: colors.raised,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.borderDefault}`,
                  opacity: busy === 'p00' ? 0.7 : 1,
                }}
              >
                <RefreshCw size={15} />
                Check status
              </button>
              <button
                type="button"
                onClick={runP00Simulation}
                disabled={busy === 'p00'}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
                style={{
                  background: colors.amberMuted,
                  color: colors.amber,
                  border: `1px solid ${colors.borderAmber}`,
                  opacity: busy === 'p00' ? 0.7 : 1,
                }}
              >
                <CheckCircle2 size={15} />
                Simulate contract
              </button>
            </div>

            <div className="mt-4 rounded-lg p-3 text-xs leading-5" style={{ background: colors.raised, color: colors.textSecondary }}>
              {p00Message}
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

        <div className="grid gap-4 desktop:grid-cols-[0.8fr_1.2fr]">
          <GlassPanel className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Eye size={18} style={{ color: colors.info }} />
                  <h2 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    Display Accessibility
                  </h2>
                </div>
                <p className="mt-1 text-xs leading-5" style={{ color: colors.textSecondary }}>
                  P02 applies a larger text, comfortable density, and colorblind-safe operator display preset.
                </p>
              </div>
              <Badge label={p02Status} variant="status" />
            </div>

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={runP02StatusCheck}
                disabled={busy === 'p02'}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
                style={{
                  background: colors.raised,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.borderDefault}`,
                  opacity: busy === 'p02' ? 0.7 : 1,
                }}
              >
                <RefreshCw size={15} />
                Check display status
              </button>
              <button
                type="button"
                onClick={runP02Simulation}
                disabled={busy === 'p02'}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
                style={{
                  background: 'rgba(96,165,250,0.14)',
                  color: colors.info,
                  border: '1px solid rgba(96,165,250,0.32)',
                  opacity: busy === 'p02' ? 0.7 : 1,
                }}
              >
                <CheckCircle2 size={15} />
                Simulate display settings
              </button>
            </div>

            <div className="mt-4 rounded-lg p-3 text-xs leading-5" style={{ background: colors.raised, color: colors.textSecondary }}>
              {p02Message}
            </div>
          </GlassPanel>

          <GlassPanel className="p-4">
            <div className="flex items-center gap-2">
              <Type size={18} style={{ color: colors.info }} />
              <h2 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                Operator display preset
              </h2>
            </div>

            <label className="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-lg p-3" style={{ background: colors.raised }}>
              <span className="text-sm" style={{ color: colors.textSecondary }}>Larger text and accessible palette</span>
              <input
                type="checkbox"
                checked={p02.enabled}
                onChange={(event) => setP02Enabled(event.currentTarget.checked)}
              />
            </label>

            <label className="mt-2 flex min-h-11 items-center justify-between gap-3 rounded-lg p-3" style={{ background: colors.raised }}>
              <span className="text-sm" style={{ color: colors.textSecondary }}>Mobile parity</span>
              <input
                type="checkbox"
                checked={p02.mobileParity}
                onChange={(event) => setP02MobileParity(event.currentTarget.checked)}
              />
            </label>

            <div className="mt-4 grid gap-2 text-xs desktop:grid-cols-3" style={{ color: colors.textSecondary }}>
              <DisplayMetric icon={Type} label="Larger text" value={p02Preferences.largeText ? 'Enabled' : 'Standard'} />
              <DisplayMetric icon={Palette} label="Colorblind-safe" value={p02Preferences.colorblindSafe ? 'Enabled' : 'Standard'} />
              <DisplayMetric icon={Smartphone} label="Text density" value={p02Preferences.textDensity} />
            </div>

            <dl className="mt-4 grid gap-2 text-xs" style={{ color: colors.textSecondary }}>
              <div className="flex justify-between gap-3">
                <dt>Last reviewed</dt>
                <dd style={{ color: colors.textPrimary }}>{p02.lastReviewedAt ?? 'Not reviewed'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Last backend check</dt>
                <dd style={{ color: colors.textPrimary }}>{p02LastUpdatedAt ?? 'Not checked'}</dd>
              </div>
              {p02ErrorState && (
                <div className="rounded-lg p-2" style={{ background: 'rgba(248,113,113,0.12)', color: colors.danger }}>
                  {p02ErrorState}
                </div>
              )}
            </dl>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

function DisplayMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Type;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg p-3" style={{ background: colors.raised }}>
      <div className="flex items-center gap-2">
        <Icon size={14} style={{ color: colors.info }} />
        <span className="font-semibold" style={{ color: colors.textPrimary }}>{label}</span>
      </div>
      <div className="mt-2 capitalize" style={{ color: colors.textSecondary }}>{value}</div>
    </div>
  );
}
