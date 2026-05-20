import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { useCrisisStore } from '../../store/crisisStore';
import { useResourceStore } from '../../store/resourceStore';
import { colors } from '../../constants/colors';

export function SessionCompleteBanner() {
  const crises = useCrisisStore((s) => s.crises);
  const resources = useResourceStore((s) => s.resources);
  const simulationRunning = useResourceStore((s) => s.simulationRunning);
  const [visible, setVisible] = useState(false);
  const [shownForSession, setShownForSession] = useState(false);

  const allResolved = crises.length > 0 && crises.every(
    (c) => c.status === 'resolved' || c.status === 'false_alarm',
  );
  const allReturned = resources.length > 0 && resources.every(
    (r) => r.status === 'available' || r.status === 'returning',
  );

  useEffect(() => {
    if (!simulationRunning || shownForSession) return;
    if (allResolved && allReturned) {
      setVisible(true);
      setShownForSession(true);
      const id = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(id);
    }
  }, [allResolved, allReturned, simulationRunning, shownForSession]);

  // Reset when simulation restarts
  useEffect(() => {
    if (!simulationRunning) setShownForSession(false);
  }, [simulationRunning]);

  if (!visible) return null;

  return (
    <div
      className="session-complete-enter fixed top-4 left-1/2 z-50 flex items-center gap-3 rounded-xl border px-5 py-3 shadow-2xl"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(17,17,17,0.96)',
        borderColor: colors.success,
        boxShadow: `0 0 32px rgba(52,211,153,0.2)`,
        backdropFilter: 'blur(16px)',
      }}
    >
      <CheckCircle size={20} style={{ color: colors.success }} />
      <div>
        <div className="text-sm font-bold" style={{ color: colors.success }}>Session Complete</div>
        <div className="text-[11px]" style={{ color: colors.textSecondary }}>
          All crises resolved · All units returned
        </div>
      </div>
      <button onClick={() => setVisible(false)} style={{ color: colors.textDim }}>
        <X size={16} />
      </button>
    </div>
  );
}
