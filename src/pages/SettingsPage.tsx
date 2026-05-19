import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList, CloudOff, Languages, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';
import { checkFoundationStatus, simulateFoundationContracts } from '../api/foundation';
import { checkTriggeredMissionBriefingStatus, simulateTriggeredMissionBriefing } from '../api/triggeredMissionBriefing';
import { checkUrduRtlLanguageStatus, simulateUrduRtlLanguage } from '../api/urduRtlLanguage';
import { createMissionBriefing } from '../foundation/triggeredMissionBriefing';
import {
  P01_LANGUAGE_PROFILES,
  resolveP01Runtime,
  type P01LanguageProfile,
} from '../foundation/urduRtlLanguage';
import { Badge } from '../components/ui/Badge';
import { GlassPanel } from '../components/ui/GlassPanel';
import { colors } from '../constants/colors';
import { useCityStore } from '../store/cityStore';
import { useSessionStore } from '../store/sessionStore';
import { useSettingsStore } from '../store/settingsStore';

export function SettingsPage() {
  const city = useCityStore((state) => state.city);
  const p00 = useSettingsStore((state) => state.p00);
  const p01 = useSettingsStore((state) => state.p01);
  const p04 = useSettingsStore((state) => state.p04);
  const loadP00Settings = useSettingsStore((state) => state.loadP00Settings);
  const loadP01Settings = useSettingsStore((state) => state.loadP01Settings);
  const loadP04Settings = useSettingsStore((state) => state.loadP04Settings);
  const setP00Enabled = useSettingsStore((state) => state.setP00Enabled);
  const setP00MobileParity = useSettingsStore((state) => state.setP00MobileParity);
  const markP00Reviewed = useSettingsStore((state) => state.markP00Reviewed);
  const setP01Enabled = useSettingsStore((state) => state.setP01Enabled);
  const setP01MobileParity = useSettingsStore((state) => state.setP01MobileParity);
  const markP01Reviewed = useSettingsStore((state) => state.markP01Reviewed);
  const setP04Enabled = useSettingsStore((state) => state.setP04Enabled);
  const setP04MobileParity = useSettingsStore((state) => state.setP04MobileParity);
  const markP04Reviewed = useSettingsStore((state) => state.markP04Reviewed);
  const p00Status = useSessionStore((state) => state.p00Status);
  const p00LastUpdatedAt = useSessionStore((state) => state.p00LastUpdatedAt);
  const p00ErrorState = useSessionStore((state) => state.p00ErrorState);
  const setP00Status = useSessionStore((state) => state.setP00Status);
  const setP00ErrorState = useSessionStore((state) => state.setP00ErrorState);
  const p01Status = useSessionStore((state) => state.p01Status);
  const p01LastUpdatedAt = useSessionStore((state) => state.p01LastUpdatedAt);
  const p01ErrorState = useSessionStore((state) => state.p01ErrorState);
  const setP01Status = useSessionStore((state) => state.setP01Status);
  const setP01ErrorState = useSessionStore((state) => state.setP01ErrorState);
  const p04Status = useSessionStore((state) => state.p04Status);
  const p04LastUpdatedAt = useSessionStore((state) => state.p04LastUpdatedAt);
  const p04ErrorState = useSessionStore((state) => state.p04ErrorState);
  const setP04Status = useSessionStore((state) => state.setP04Status);
  const setP04ErrorState = useSessionStore((state) => state.setP04ErrorState);
  const [p00Message, setP00Message] = useState('Bundled fallback is available when the hosted backend is not configured.');
  const [p01Message, setP01Message] = useState('Bundled Urdu, Roman Urdu, English, and RTL runtime data is available offline.');
  const [p04Message, setP04Message] = useState('Bundled scenario metadata can prepare a mission briefing before simulation or AI dispatch.');
  const [p00Busy, setP00Busy] = useState(false);
  const [p01Busy, setP01Busy] = useState(false);
  const [p04Busy, setP04Busy] = useState(false);

  const p01Runtime = resolveP01Runtime(p01);

  useEffect(() => {
    loadP00Settings();
    loadP01Settings();
    loadP04Settings();
  }, [loadP00Settings, loadP01Settings, loadP04Settings]);

  const runStatusCheck = async () => {
    setP00Busy(true);
    setP00Status('checking', new Date().toISOString());
    const result = await checkFoundationStatus();
    setP00Status(result.status, result.checkedAt);
    setP00Message(result.message);
    setP00ErrorState(result.status === 'error' ? result.message : null);
    setP00Busy(false);
  };

  const runSimulation = async () => {
    setP00Busy(true);
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
    setP00Busy(false);
  };

  const runP01StatusCheck = async () => {
    setP01Busy(true);
    setP01Status('checking', new Date().toISOString());
    const result = await checkUrduRtlLanguageStatus();
    setP01Status(result.status, result.checkedAt);
    setP01Message(result.message);
    setP01ErrorState(result.status === 'error' ? result.message : null);
    setP01Busy(false);
  };

  const runP01Simulation = async () => {
    setP01Busy(true);
    const requestedAt = new Date().toISOString();
    const result = await simulateUrduRtlLanguage({
      request: {
        city,
        requestedAt,
        source: 'settings',
        mode: p01Runtime.mode,
      },
    });
    setP01Status(result.status, result.simulatedAt);
    markP01Reviewed(result.simulatedAt);
    setP01Message(`${result.message} ${result.events.join(' ')}`);
    setP01ErrorState(result.status === 'error' ? result.message : null);
    setP01Busy(false);
  };

  const runP04StatusCheck = async () => {
    setP04Busy(true);
    setP04Status('checking', new Date().toISOString());
    const result = await checkTriggeredMissionBriefingStatus();
    setP04Status(result.status, result.checkedAt);
    setP04Message(result.message);
    if (result.status === 'error') setP04ErrorState(result.message);
    setP04Busy(false);
  };

  const runP04Simulation = async () => {
    setP04Busy(true);
    const requestedAt = new Date().toISOString();
    const result = await simulateTriggeredMissionBriefing({
      request: {
        city,
        requestedAt,
        source: 'settings',
        trigger: 'simulation',
      },
    });
    setP04Status(result.status, result.simulatedAt);
    markP04Reviewed(result.simulatedAt);
    setP04Message(`${result.message} ${result.briefing.summary} ${result.events.join(' ')}`);
    if (result.status === 'error') setP04ErrorState(result.message);
    setP04Busy(false);
  };

  const p04Preview = createMissionBriefing(city, 'simulation', p04.lastReviewedAt ?? new Date().toISOString());

  return (
    <div className="h-full overflow-y-auto px-4 py-4 desktop:px-6 desktop:py-6" style={{ background: colors.void }}>
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <header className="flex flex-col gap-3 desktop:flex-row desktop:items-end desktop:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck size={18} style={{ color: colors.amber }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textDim }}>
                P00 / P01 / P04
              </span>
            </div>
            <h1 className="font-display text-3xl leading-tight" style={{ color: colors.textPrimary }}>
              Foundation Settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: colors.textSecondary }}>
              Backend contracts, operator preferences, mobile parity, bundled fallback behavior, and Urdu RTL language runtime foundations for CIRO.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge label={`P00 ${p00Status}`} variant="status" />
            <Badge label={`P01 ${p01Status}`} variant="status" />
            <Badge label={`P04 ${p04Status}`} variant="status" />
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
                onClick={runStatusCheck}
                disabled={p00Busy}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
                style={{
                  background: colors.raised,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.borderDefault}`,
                  opacity: p00Busy ? 0.7 : 1,
                }}
              >
                <RefreshCw size={15} />
                Check status
              </button>
              <button
                type="button"
                onClick={runSimulation}
                disabled={p00Busy}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
                style={{
                  background: colors.amberMuted,
                  color: colors.amber,
                  border: `1px solid ${colors.borderAmber}`,
                  opacity: p00Busy ? 0.7 : 1,
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

        <div className="grid gap-4 desktop:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Languages size={18} style={{ color: colors.info }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textDim }}>
                    P01
                  </span>
                </div>
                <h2 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  Urdu & RTL Language
                </h2>
                <p className="mt-1 text-xs leading-5" style={{ color: colors.textSecondary }}>
                  Runtime language attributes are applied without storing credentials or assuming localhost from the APK.
                </p>
              </div>
              <Badge label={p01Runtime.label} variant="status" />
            </div>

            <label className="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-lg p-3" style={{ background: colors.raised }}>
              <span className="text-sm" style={{ color: colors.textSecondary }}>Urdu RTL foundation enabled</span>
              <input
                type="checkbox"
                checked={p01.enabled}
                onChange={(event) => setP01Enabled(event.currentTarget.checked)}
              />
            </label>

            <label className="mt-2 flex min-h-11 items-center justify-between gap-3 rounded-lg p-3" style={{ background: colors.raised }}>
              <span className="text-sm" style={{ color: colors.textSecondary }}>Mobile RTL parity</span>
              <input
                type="checkbox"
                checked={p01.mobileParity}
                onChange={(event) => setP01MobileParity(event.currentTarget.checked)}
              />
            </label>

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={runP01StatusCheck}
                disabled={p01Busy}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
                style={{
                  background: colors.raised,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.borderDefault}`,
                  opacity: p01Busy ? 0.7 : 1,
                }}
              >
                <RefreshCw size={15} />
                Check language status
              </button>
              <button
                type="button"
                onClick={runP01Simulation}
                disabled={p01Busy}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
                style={{
                  background: 'rgba(96,165,250,0.14)',
                  color: colors.info,
                  border: '1px solid rgba(96,165,250,0.30)',
                  opacity: p01Busy ? 0.7 : 1,
                }}
              >
                <CheckCircle2 size={15} />
                Simulate language
              </button>
            </div>
          </GlassPanel>

          <GlassPanel className="p-4">
            <h2 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
              Language runtime preview
            </h2>
            <div className="mt-3 grid gap-2 tablet:grid-cols-3">
              {Object.values(P01_LANGUAGE_PROFILES).map((profile) => (
                <LanguagePreview key={profile.mode} profile={profile} />
              ))}
            </div>
            <dl className="mt-4 grid gap-2 text-xs" style={{ color: colors.textSecondary }}>
              <div className="flex justify-between gap-3">
                <dt>Document runtime</dt>
                <dd style={{ color: colors.textPrimary }}>{`lang=${p01Runtime.lang} dir=${p01Runtime.dir}`}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Last reviewed</dt>
                <dd style={{ color: colors.textPrimary }}>{p01.lastReviewedAt ?? 'Not reviewed'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Last language check</dt>
                <dd style={{ color: colors.textPrimary }}>{p01LastUpdatedAt ?? 'Not checked'}</dd>
              </div>
            </dl>
            <div className="mt-4 rounded-lg p-3 text-xs leading-5" style={{ background: colors.raised, color: colors.textSecondary }}>
              {p01Message}
            </div>
            {p01ErrorState && (
              <div className="mt-2 rounded-lg p-2 text-xs" style={{ background: 'rgba(248,113,113,0.12)', color: colors.danger }}>
                {p01ErrorState}
              </div>
            )}
          </GlassPanel>
        </div>

        <div className="grid gap-4 desktop:grid-cols-[1fr_1fr]">
          <GlassPanel className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <ClipboardList size={18} style={{ color: colors.success }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textDim }}>
                    P04
                  </span>
                </div>
                <h2 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  Triggered Mission Briefing
                </h2>
                <p className="mt-1 text-xs leading-5" style={{ color: colors.textSecondary }}>
                  Shows a compact operator briefing with Start, Edit Scenario, and Cancel before simulation or AI dispatch.
                </p>
              </div>
              <Badge label={p04Status} variant="status" />
            </div>

            <label className="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-lg p-3" style={{ background: colors.raised }}>
              <span className="text-sm" style={{ color: colors.textSecondary }}>Mission briefing enabled</span>
              <input
                type="checkbox"
                checked={p04.enabled}
                onChange={(event) => setP04Enabled(event.currentTarget.checked)}
              />
            </label>

            <label className="mt-2 flex min-h-11 items-center justify-between gap-3 rounded-lg p-3" style={{ background: colors.raised }}>
              <span className="text-sm" style={{ color: colors.textSecondary }}>Mobile briefing parity</span>
              <input
                type="checkbox"
                checked={p04.mobileParity}
                onChange={(event) => setP04MobileParity(event.currentTarget.checked)}
              />
            </label>

            <div className="mt-4 grid gap-2 tablet:grid-cols-2">
              <button
                type="button"
                onClick={runP04StatusCheck}
                disabled={p04Busy}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
                style={{
                  background: colors.raised,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.borderDefault}`,
                  opacity: p04Busy ? 0.7 : 1,
                }}
              >
                <RefreshCw size={15} />
                Check briefing status
              </button>
              <button
                type="button"
                onClick={runP04Simulation}
                disabled={p04Busy}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
                style={{
                  background: 'rgba(52,211,153,0.14)',
                  color: colors.success,
                  border: '1px solid rgba(52,211,153,0.30)',
                  opacity: p04Busy ? 0.7 : 1,
                }}
              >
                <CheckCircle2 size={15} />
                Simulate briefing
              </button>
            </div>
          </GlassPanel>

          <GlassPanel className="p-4">
            <h2 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
              Current briefing preview
            </h2>
            <div className="mt-3 rounded-lg p-3" style={{ background: colors.raised, border: `1px solid ${colors.borderSubtle}` }}>
              <div className="text-xs font-semibold" style={{ color: colors.textPrimary }}>
                {p04Preview.cityLabel} - {p04Preview.scenarioTitle}
              </div>
              <p className="mt-2 text-xs leading-5" style={{ color: colors.textSecondary }}>
                {p04Preview.summary}
              </p>
            </div>
            <dl className="mt-4 grid gap-2 text-xs" style={{ color: colors.textSecondary }}>
              <div className="flex justify-between gap-3">
                <dt>Last reviewed</dt>
                <dd style={{ color: colors.textPrimary }}>{p04.lastReviewedAt ?? 'Not reviewed'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Last briefing check</dt>
                <dd style={{ color: colors.textPrimary }}>{p04LastUpdatedAt ?? 'Not checked'}</dd>
              </div>
            </dl>
            <div className="mt-4 rounded-lg p-3 text-xs leading-5" style={{ background: colors.raised, color: colors.textSecondary }}>
              {p04Message}
            </div>
            {p04ErrorState && (
              <div className="mt-2 rounded-lg p-2 text-xs" style={{ background: 'rgba(248,113,113,0.12)', color: colors.danger }}>
                {p04ErrorState}
              </div>
            )}
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

function LanguagePreview({ profile }: { profile: P01LanguageProfile }) {
  return (
    <div
      dir={profile.dir}
      lang={profile.lang}
      className="min-w-0 rounded-lg p-3"
      style={{ background: colors.raised, border: `1px solid ${colors.borderSubtle}` }}
    >
      <div className="text-xs font-semibold" style={{ color: colors.textPrimary }}>
        {profile.nativeLabel}
      </div>
      <div className="mt-1 text-[10px]" style={{ color: colors.textDim }}>
        {`${profile.label} / dir="${profile.dir}"`}
      </div>
      <p className="mt-3 text-xs leading-5" style={{ color: colors.textSecondary }}>
        {profile.sample}
      </p>
    </div>
  );
}
