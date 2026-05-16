import type { Signal, Crisis, City } from '../types';
import { SCENARIO_REGISTRY } from '../data/mock';

export function crisisDetectionAgent(fusedSignals: Signal[], city: City): Crisis[] {
  const crises = SCENARIO_REGISTRY[city].getCrises();

  return crises.map((crisis) => {
    const crisisSignals = fusedSignals.filter((s) => crisis.signalIds.includes(s.id));
    const avgCredibility =
      crisisSignals.length > 0
        ? crisisSignals.reduce((sum, s) => sum + s.credibilityScore, 0) / crisisSignals.length
        : crisis.confidenceScore;

    const conflictingSignals = fusedSignals.filter((s) => crisis.conflictingSignalIds.includes(s.id));
    const conflictPenalty = conflictingSignals.reduce((sum, s) => sum + s.credibilityScore * 0.1, 0);

    const adjustedConfidence = Math.min(1, Math.max(0, avgCredibility - conflictPenalty));

    return {
      ...crisis,
      confidenceScore: parseFloat(adjustedConfidence.toFixed(2)),
      confidenceHistory: [
        ...crisis.confidenceHistory,
        { t: new Date().toISOString().slice(11, 16), v: adjustedConfidence },
      ],
    };
  });
}
