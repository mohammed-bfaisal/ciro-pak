import assert from 'node:assert/strict';
import { test } from 'node:test';
import { congestionFromSpeeds, getTrafficFlow } from './trafficProvider.js';

test('traffic provider returns simulated flow without a server key', async () => {
  const flow = await getTrafficFlow(24.8607, 67.0011, {}, { now: () => new Date('2026-05-19T09:00:00Z') });

  assert.equal(flow.provider, 'simulated');
  assert.equal(flow.fallbackReason, 'tomtom_key_missing');
  assert.equal(flow.updatedAt, '2026-05-19T09:00:00.000Z');
  assert.equal(flow.currentSpeed > 0, true);
});

test('traffic provider maps live flow data without leaking the API key', async () => {
  const fetcher = async (url: string | URL | Request) => {
    assert.equal(String(url).includes('test-traffic-key'), true);
    return new Response(JSON.stringify({
      flowSegmentData: {
        currentSpeed: 11,
        freeFlowSpeed: 48,
        currentTravelTime: 400,
        freeFlowTravelTime: 130,
        confidence: 0.92,
      },
    }), { status: 200 });
  };

  const flow = await getTrafficFlow(
    24.8607,
    67.0011,
    { tomtomApiKey: 'test-traffic-key' },
    { fetcher, now: () => new Date('2026-05-19T09:00:00Z') },
  );

  assert.equal(flow.provider, 'tomtom');
  assert.equal(flow.congestionLevel, 'heavy');
  assert.equal(JSON.stringify(flow.rawData).includes('test-traffic-key'), false);
});

test('congestion levels are derived from speed ratio and road closure', () => {
  assert.equal(congestionFromSpeeds(45, 50), 'free');
  assert.equal(congestionFromSpeeds(25, 50), 'moderate');
  assert.equal(congestionFromSpeeds(12, 50), 'heavy');
  assert.equal(congestionFromSpeeds(40, 50, true), 'standstill');
});
