import type { Signal, Crisis, City } from '../types';
import { getKarachiCrises } from '../data/mock/karachi/scenario';
import { getIslamabadCrises } from '../data/mock/islamabad/scenario';

export function crisisDetectionAgent(fusedSignals: Signal[], city: City): Crisis[] {
  // Use pre-computed crises from scenario data
  // In a real system, this would cluster signals by proximity, classify crisis types,
  // and estimate severity + confidence scores dynamically.
  const crises = city === 'karachi' ? getKarachiCrises() : getIslamabadCrises();

  // Attach the fused signal IDs to verify the pipeline
  return crises.map((crisis) => {
    // Calculate real-time confidence from fused signals
    const crisisSignals = fusedSignals.filter((s) => crisis.signalIds.includes(s.id));
    const avgCredibility =
      crisisSignals.length > 0
        ? crisisSignals.reduce((sum, s) => sum + s.credibilityScore, 0) / crisisSignals.length
        : crisis.confidenceScore;

    // Conflicting signals reduce confidence
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
