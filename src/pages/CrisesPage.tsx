import { useCrisisStore } from '../store/crisisStore';
import { CrisisCard } from '../components/cards/CrisisCard';
import { CrisisPanel } from '../components/panels/CrisisPanel';
import { colors } from '../constants/colors';

export function CrisesPage() {
  const crises = useCrisisStore((s) => s.crises);
  const selectedCrisisId = useCrisisStore((s) => s.selectedCrisisId);
  const selectCrisis = useCrisisStore((s) => s.selectCrisis);

  return (
    <div className="h-full flex flex-col overflow-hidden relative" style={{ background: colors.void }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: colors.borderDefault }}>
        <h1 className="font-display text-xl" style={{ color: colors.textPrimary }}>Crises</h1>
        <p className="text-xs mt-1" style={{ color: colors.textDim }}>
          {crises.length} detected • Sorted by severity
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {crises.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: colors.textDim }}>
            Run pipeline to detect crises
          </div>
        ) : (
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3">
            {[...crises]
              .sort((a, b) => {
                const order = { critical: 4, high: 3, medium: 2, low: 1 };
                return (order[b.severity] || 0) - (order[a.severity] || 0);
              })
              .map((crisis, i) => (
                <CrisisCard
                  key={crisis.id}
                  crisis={crisis}
                  onClick={() => selectCrisis(crisis.id)}
                  index={i}
                />
              ))}
          </div>
        )}
      </div>

      {selectedCrisisId && (
        <CrisisPanel crisisId={selectedCrisisId} onClose={() => selectCrisis(null)} />
      )}
    </div>
  );
}
