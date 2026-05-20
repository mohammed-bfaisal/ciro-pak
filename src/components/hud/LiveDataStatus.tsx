import { Cloud, CloudOff, Gauge } from 'lucide-react';
import { colors } from '../../constants/colors';
import { useLiveDataStore, type LiveDataStatus as LiveDataStatusValue } from '../../store/liveDataStore';
import { formatTrafficMode } from '../../utils/liveDataStatusLabels';

const STALE_MS = 5 * 60 * 1000;

function isStale(updatedAt?: string) {
  if (!updatedAt) return true;
  return Date.now() - new Date(updatedAt).getTime() > STALE_MS;
}

function WeatherBadge({ status }: { status: LiveDataStatusValue }) {
  if (status.state === 'disabled' || status.state === 'idle') return null;
  const stale = isStale(status.updatedAt);
  return (
    <span
      className="px-1 py-0.5 rounded text-[9px] font-bold tracking-wide"
      style={{
        background: stale ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)',
        color: stale ? colors.warning : colors.success,
      }}
      title={status.updatedAt ? `Weather updated ${new Date(status.updatedAt).toLocaleTimeString()}` : undefined}
    >
      {stale ? 'CACHED' : 'LIVE'}
    </span>
  );
}

export function LiveDataStatus() {
  const weatherStatus = useLiveDataStore((state) => state.weatherStatus);
  const trafficStatus = useLiveDataStore((state) => state.trafficStatus);
  const liveCount = [weatherStatus, trafficStatus].filter((status) => status.state === 'live').length;
  const fallbackCount = [weatherStatus, trafficStatus].filter((status) => status.state === 'fallback').length;
  const hasData = liveCount + fallbackCount > 0;
  const Icon = hasData && fallbackCount === 0 ? Cloud : hasData ? CloudOff : Gauge;

  return (
    <div
      className="flex min-w-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold"
      style={{
        color: hasData && fallbackCount === 0 ? colors.success : hasData ? colors.warning : colors.textDim,
        background: colors.raised,
        borderColor: hasData && fallbackCount === 0 ? 'rgba(52,211,153,0.24)' : colors.borderDefault,
      }}
      title={`${formatTitle('Weather', weatherStatus)} | ${formatTitle('Traffic', trafficStatus)}`}
      aria-label={`${formatTitle('Weather', weatherStatus)}. ${formatTitle('Traffic', trafficStatus)}.`}
    >
      <Icon size={13} />
      <WeatherBadge status={weatherStatus} />
      <span className="hidden desktop:inline">
        {hasData
          ? `${liveCount} live / ${fallbackCount} fallback`
          : 'Data idle'}
      </span>
      <span className="desktop:hidden">
        {hasData ? `${liveCount}/${liveCount + fallbackCount}` : 'Idle'}
      </span>
    </div>
  );
}

function formatTitle(label: string, status: LiveDataStatusValue): string {
  if (status.state === 'disabled') return `${label}: disabled`;
  if (status.state === 'idle') return `${label}: idle`;
  const reason = status.fallbackReason ? `, ${status.fallbackReason}` : '';
  const trafficMode = status.trafficMode ? `, ${formatTrafficMode(status.trafficMode)}` : '';
  const segmentCount = typeof status.segmentCount === 'number' ? `, ${status.segmentCount} segment${status.segmentCount === 1 ? '' : 's'}` : '';
  return `${label}: ${status.provider}${trafficMode}${segmentCount}${reason}`;
}
