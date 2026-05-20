import { describe, expect, it } from 'vitest';
import {
  buildAllocationReasoningPrompt,
  buildBaselineComparisonPrompt,
  buildDispatchBriefingPrompt,
  buildRadioChatterPrompt,
  buildRecoveryBriefingPrompt,
} from './openRouterPrompts';
import type { Crisis, Resource } from '../types';

const crisis = {
  id: 'khi-c1',
  title: 'Lyari flood breach',
  type: 'flood',
  severity: 'critical',
  status: 'active',
  confidenceScore: 0.91,
  confidenceHistory: [{ t: '2026-05-20T09:00:00.000Z', v: 0.91 }],
  affectedPopulation: 24000,
  location: { lat: 24.86, lng: 67.01, label: 'Lyari River', affectedRadiusKm: 3 },
  detectedAt: '2026-05-20T09:00:00.000Z',
  estimatedDuration: '4 hours',
  spreadRisk: 'expanding',
  signalIds: ['khi-s1'],
  conflictingSignalIds: [],
  verificationStatus: 'verified',
  agentReasoning: 'Corroborated by field report and weather signal.',
  actions: [],
  stakeholderMessages: [],
  city: 'karachi',
} satisfies Crisis;

const resource = {
  id: 'khi-r1',
  label: 'Rescue Boat 1',
  type: 'rescue_team',
  status: 'available',
  location: { lat: 24.85, lng: 67.0, label: 'Station 4' },
  assignedCrisisId: null,
  currentPosition: { lat: 24.85, lng: 67.0, label: 'Station 4' },
  capacity: 6,
  currentLoad: 0,
  movementProgress: 0,
} satisfies Resource;

describe('OpenRouter prompt builders', () => {
  it.each([
    ['dispatch', buildDispatchBriefingPrompt('karachi', [crisis], [resource])],
    ['allocation', buildAllocationReasoningPrompt({ city: 'karachi', crisis, resource, score: 0.87, etaMinutes: 8, trafficDelaySeconds: 90 })],
    ['recovery', buildRecoveryBriefingPrompt({ actionId: 'a7', failure: '503 Service Unavailable', fallback: 'cached fallback applied' })],
    ['baseline', buildBaselineComparisonPrompt({ city: 'karachi', ciroActions: 7, baselineActions: 4, recoveredActions: 1 })],
    ['radio', buildRadioChatterPrompt({ city: 'karachi', eventType: 'dispatch', crisis, resource, etaMinutes: 8 })],
  ])('includes operational reasoning constraints in %s prompt', (_name, prompt) => {
    expect(prompt).toContain('risk');
    expect(prompt).toContain('uncertainty');
    expect(prompt).toContain('resource tradeoff');
    expect(prompt).toContain('route/traffic impact');
    expect(prompt).toContain('next action');
  });

  it('keeps radio chatter short and caption-friendly', () => {
    const prompt = buildRadioChatterPrompt({ city: 'karachi', eventType: 'traffic_slowdown', crisis, resource, etaMinutes: 12 });

    expect(prompt).toContain('one radio line');
    expect(prompt).toContain('18 words or fewer');
    expect(prompt).toContain('caption');
  });
});
