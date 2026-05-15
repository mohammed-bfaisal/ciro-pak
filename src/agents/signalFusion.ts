import type { Signal, SignalSource, City } from '../types';

const BASE_CREDIBILITY: Record<SignalSource, number> = {
  field_report:    0.90,
  weather:         0.85,
  traffic:         0.80,
  emergency_call:  0.88,
  sensor:          0.82,
  social:          0.50,
};

export function scoreCredibility(signal: Signal): number {
  let score = BASE_CREDIBILITY[signal.source];

  if (signal.source === 'social') {
    // Age penalty/bonus
    const ageMin = (new Date('2026-05-20T09:30:00Z').getTime() - new Date(signal.timestamp).getTime()) / 60000;
    if (ageMin < 10) score += 0.15;
    if (ageMin > 45) score -= 0.25;

    // Mention velocity
    const vel = signal.mentionVelocity ?? 0;
    if (vel > 10) score += 0.12;
    if (vel < 2) score -= 0.18;

    // Engagement scoring
    const likes = (signal.rawData.likes as number) ?? 0;
    const retweets = (signal.rawData.retweets as number) ?? 0;
    const shares = (signal.rawData.shares as number) ?? 0;
    const comments = (signal.rawData.comments as number) ?? 0;
    const eng = likes + retweets + shares + comments;

    if (eng > 50) score += 0.10;
    if (eng === 0) score -= 0.20;
  }

  // Field reports with verified flag get a bonus
  if (signal.source === 'field_report' && signal.rawData.verified) {
    score += 0.03;
  }

  return Math.max(0, Math.min(1, parseFloat(score.toFixed(2))));
}

export function detectConflicts(signals: Signal[]): Signal[] {
  // Find signals about the same location with contradicting urgency
  return signals.map((signal) => {
    const nearby = signals.filter(
      (other) =>
        other.id !== signal.id &&
        haversineDistance(signal.location.lat, signal.location.lng, other.location.lat, other.location.lng) < 2 &&
        Math.abs(signal.urgencyScore - other.urgencyScore) > 0.6
    );

    if (nearby.length > 0 && signal.urgencyScore < 0.3) {
      return {
        ...signal,
        isFlagged: true,
        conflictsWith: nearby.map((n) => n.id),
      };
    }
    return signal;
  });
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function applyCorroboration(signals: Signal[]): Signal[] {
  return signals.map((signal) => {
    // If a field report corroborates social signals nearby, boost both
    if (signal.source === 'social') {
      const fieldNearby = signals.filter(
        (other) =>
          other.source === 'field_report' &&
          haversineDistance(signal.location.lat, signal.location.lng, other.location.lat, other.location.lng) < 3
      );
      if (fieldNearby.length > 0 && !signal.isFlagged) {
        return {
          ...signal,
          credibilityScore: Math.min(1, signal.credibilityScore + 0.08),
        };
      }
    }
    return signal;
  });
}

export function signalFusionAgent(signals: Signal[], _city: City): Signal[] {
  // Step 1: Score credibility
  let scored = signals.map((s) => ({
    ...s,
    credibilityScore: s.credibilityScore > 0 ? s.credibilityScore : scoreCredibility(s),
  }));

  // Step 2: Detect conflicts
  scored = detectConflicts(scored);

  // Step 3: Apply corroboration bonuses
  scored = applyCorroboration(scored);

  return scored;
}
