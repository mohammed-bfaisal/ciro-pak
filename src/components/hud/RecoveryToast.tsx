import { useEffect, useRef, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useTraceStore } from '../../store/traceStore';
import { colors } from '../../constants/colors';

export function RecoveryToast() {
  const logs = useTraceStore((s) => s.logs);
  const prevLenRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const newLogs = logs.slice(prevLenRef.current);
    prevLenRef.current = logs.length;

    const recoveryLine = newLogs.find((l) => l.includes('RECOVERED') || l.includes('↻'));
    if (recoveryLine) {
      setMessage(recoveryLine.replace(/^\[[\d:]+\]\s*/, '').slice(0, 80));
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setMessage(null), 5000);
    }
    // No cleanup here — intentionally let the timer run to completion even
    // when logs change again, so the toast always shows for the full 5 s.
  }, [logs]);

  if (!message) return null;

  return (
    <div
      className="fixed bottom-24 left-1/2 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(17,17,17,0.95)',
        borderColor: colors.warning,
        boxShadow: `0 0 24px rgba(251,191,36,0.15)`,
        backdropFilter: 'blur(14px)',
        maxWidth: '90vw',
      }}
    >
      <CheckCircle size={18} style={{ color: colors.warning, flexShrink: 0 }} />
      <div>
        <div className="text-xs font-bold" style={{ color: colors.warning }}>Action Recovered</div>
        <div className="text-[11px]" style={{ color: colors.textSecondary }}>{message}</div>
      </div>
    </div>
  );
}
