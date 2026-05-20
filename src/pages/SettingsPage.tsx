import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Activity,
  Cloud,
  CloudOff,
  DatabaseZap,
  Gauge,
  LocateFixed,
  Map,
  Radio,
  RefreshCw,
  Route,
  ShieldCheck,
} from 'lucide-react';
import { fetchBackendHealth, type BackendHealth } from '../api/backendHealth';
import { isBackendConfigured } from '../api/client';
import { SettingsRow } from '../components/settings/SettingsRow';
import { colors } from '../constants/colors';
import { type SettingKey, useSettingsStore } from '../store/settingsStore';

const liveDataRows: Array<{
  key: SettingKey;
  title: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    key: 'preferBackendData',
    title: 'Prefer backend data',
    description: 'Use the Cloud Run API first, then fall back locally if it is unavailable.',
    icon: <DatabaseZap size={16} />,
  },
  {
    key: 'enableWeatherUpdates',
    title: 'Weather updates',
    description: 'Refresh weather signals through the backend-aware adapter.',
    icon: <Cloud size={16} />,
  },
  {
    key: 'enableTrafficUpdates',
    title: 'Traffic updates',
    description: 'Refresh Google road traffic around city arteries, active incidents, and moving routes.',
    icon: <Gauge size={16} />,
  },
];

const mapRows: Array<{
  key: SettingKey;
  title: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    key: 'showTrafficLayer',
    title: 'Traffic layer',
    description: 'Show Google traffic-aware road segments when the map overlay is available.',
    icon: <Route size={16} />,
  },
  {
    key: 'showSignalHeatmap',
    title: 'Signal heatmap',
    description: 'Show the signal density layer and source pins on the map.',
    icon: <Radio size={16} />,
  },
  {
    key: 'showCrisisRadius',
    title: 'Crisis radius',
    description: 'Show affected-area rings around active incidents.',
    icon: <LocateFixed size={16} />,
  },
  {
    key: 'showResourceCoverage',
    title: 'Resource coverage',
    description: 'Show coverage ranges for available response resources.',
    icon: <Map size={16} />,
  },
];

export function SettingsPage() {
  const settings = useSettingsStore();
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const backendConfigured = isBackendConfigured();

  const refreshHealth = useCallback(async () => {
    setChecking(true);
    const result = await fetchBackendHealth();
    setHealth(result);
    setCheckedAt(new Date().toISOString());
    setChecking(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refreshHealth();
    }, 0);
    return () => window.clearTimeout(id);
  }, [refreshHealth]);

  return (
    <div className="h-full overflow-y-auto px-3 py-3 tablet:px-5 tablet:py-5" style={{ background: colors.void }}>
      <div className="mx-auto flex max-w-5xl flex-col gap-4 pb-6">
        <header className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
          <div>
            <h1 className="font-display text-2xl leading-tight" style={{ color: colors.textPrimary }}>
              Settings
            </h1>
            <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
              Data sources, backend status, and map controls.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshHealth}
            className="flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold"
            style={{
              background: colors.raised,
              color: colors.amber,
              border: `1px solid ${colors.borderAmber}`,
            }}
          >
            <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
            Refresh
          </button>
        </header>

        <section className="grid gap-3 tablet:grid-cols-3">
          <StatusCard
            icon={health ? <ShieldCheck size={18} /> : <CloudOff size={18} />}
            label="Backend"
            value={health ? 'Online' : backendConfigured ? 'Unavailable' : 'Not configured'}
            tone={health ? 'good' : backendConfigured ? 'warn' : 'muted'}
            detail={checkedAt ? `Checked ${formatTime(checkedAt)}` : 'Not checked yet'}
          />
          <StatusCard
            icon={<Cloud size={18} />}
            label="Weather proxy"
            value={health?.features.weatherProxy ? 'Ready' : 'Fallback'}
            tone={health?.features.weatherProxy ? 'good' : 'warn'}
            detail={settings.enableWeatherUpdates ? 'Updates enabled' : 'Updates disabled'}
          />
          <StatusCard
            icon={<Activity size={18} />}
            label="Google traffic proxy"
            value={health?.features.trafficProxy ? 'Ready' : 'Fallback'}
            tone={health?.features.trafficProxy ? 'good' : 'warn'}
            detail={settings.enableTrafficUpdates ? 'Updates enabled' : 'Updates disabled'}
          />
        </section>

        <SettingsSection title="Live Data">
          {liveDataRows.map((row) => (
            <SettingsRow
              key={row.key}
              title={row.title}
              description={row.description}
              checked={settings[row.key]}
              icon={row.icon}
              onChange={(checked) => settings.setSetting(row.key, checked)}
            />
          ))}
        </SettingsSection>

        <SettingsSection title="Map Layers">
          {mapRows.map((row) => (
            <SettingsRow
              key={row.key}
              title={row.title}
              description={row.description}
              checked={settings[row.key]}
              icon={row.icon}
              onChange={(checked) => settings.setSetting(row.key, checked)}
            />
          ))}
        </SettingsSection>

        <button
          type="button"
          onClick={settings.resetSettings}
          className="h-11 rounded-lg text-sm font-semibold"
          style={{
            background: colors.raised,
            color: colors.textSecondary,
            border: `1px solid ${colors.borderDefault}`,
          }}
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border" style={{ background: colors.base, borderColor: colors.borderDefault }}>
      <div className="border-b px-4 py-3" style={{ borderColor: colors.borderSubtle }}>
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: colors.amber }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function StatusCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone: 'good' | 'warn' | 'muted';
}) {
  const toneColor = tone === 'good' ? colors.success : tone === 'warn' ? colors.warning : colors.textDim;
  return (
    <div className="rounded-xl border p-4" style={{ background: colors.base, borderColor: colors.borderDefault }}>
      <div className="flex items-center justify-between gap-2">
        <span style={{ color: toneColor }}>{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textDim }}>
          {label}
        </span>
      </div>
      <div className="mt-4 text-xl font-semibold" style={{ color: toneColor }}>
        {value}
      </div>
      <div className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
        {detail}
      </div>
    </div>
  );
}

function formatTime(timestamp: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}
