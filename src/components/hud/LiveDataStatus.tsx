import { Cloud, CloudOff, Gauge } from 'lucide-react';
import { colors } from '../../constants/colors';
import { useLiveDataStore, type LiveDataStatus as LiveDataStatusValue } from '../../store/liveDataStore';

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
  return `${label}: ${status.provider}${reason}`;
}
