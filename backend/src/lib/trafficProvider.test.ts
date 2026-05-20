import assert from 'node:assert/strict';
import { test } from 'node:test';
import { congestionFromSpeeds, getTrafficFlow } from './trafficProvider.js';

test('traffic provider returns simulated flow without a Google Maps server key', async () => {
  const flow = await getTrafficFlow(24.8607, 67.0011, {}, { now: () => new Date('2026-05-19T09:00:00Z') });

  assert.equal(flow.provider, 'simulated');
  assert.equal(flow.fallbackReason, 'google_maps_key_missing');
  assert.equal(flow.updatedAt, '2026-05-19T09:00:00.000Z');
  assert.equal(flow.currentSpeed > 0, true);
});

test('traffic provider derives live flow and road segments from Google Routes without leaking the API key', async () => {
  const fetcher = async (url: string | URL | Request, init?: RequestInit) => {
    assert.equal(String(url), 'https://routes.googleapis.com/directions/v2:computeRoutes');
    assert.equal(init?.method, 'POST');
    const headers = init?.headers as Record<string, string>;
    assert.equal(headers['X-Goog-Api-Key'], 'test-google-key');
    assert.equal(String(init?.body).includes('test-google-key'), false);
    return new Response(JSON.stringify({
      routes: [{
        distanceMeters: 1800,
        duration: '360s',
        staticDuration: '120s',
        polyline: {
          geoJsonLinestring: {
            coordinates: [
              [67.0, 24.86],
              [67.02, 24.87],
              [67.04, 24.88],
            ],
          },
        },
        travelAdvisory: {
          speedReadingIntervals: [
            { startPolylinePointIndex: 0, endPolylinePointIndex: 1, speed: 'TRAFFIC_JAM' },
            { startPolylinePointIndex: 1, endPolylinePointIndex: 2, speed: 'SLOW' },
          ],
        },
      }],
    }), { status: 200 });
  };

  const flow = await getTrafficFlow(
    24.8607,
    67.0011,
    { googleMapsApiKey: 'test-google-key' },
    { fetcher, now: () => new Date('2026-05-19T09:00:00Z') },
  );

  assert.equal(flow.provider, 'google');
  assert.equal(flow.congestionLevel, 'heavy');
  assert.equal(flow.currentSpeed, 18);
  assert.equal(flow.freeFlowSpeed, 54);
  assert.deepEqual(flow.trafficSegments, [
    { coords: [[67.0, 24.86], [67.02, 24.87]], congestionLevel: 'standstill' },
    { coords: [[67.02, 24.87], [67.04, 24.88]], congestionLevel: 'heavy' },
  ]);
  assert.equal(JSON.stringify(flow.rawData).includes('test-google-key'), false);
});

test('traffic provider falls back when Google Routes has no route geometry', async () => {
  const fetcher = async () => {
    return new Response(JSON.stringify({
      routes: [{
        distanceMeters: 1800,
        duration: '360s',
        staticDuration: '120s',
        polyline: {
          geoJsonLinestring: {
            coordinates: [[67.0, 24.86]],
          },
        },
      }],
    }), { status: 200 });
  };

  const flow = await getTrafficFlow(
    24.8607,
    67.0011,
    { googleMapsApiKey: 'test-google-key' },
    { fetcher, now: () => new Date('2026-05-19T09:00:00Z') },
  );

  assert.equal(flow.provider, 'simulated');
  assert.equal(flow.fallbackReason, 'google_routes_unavailable');
});

test('congestion levels are derived from speed ratio and road closure', () => {
  assert.equal(congestionFromSpeeds(45, 50), 'free');
  assert.equal(congestionFromSpeeds(25, 50), 'moderate');
  assert.equal(congestionFromSpeeds(12, 50), 'heavy');
  assert.equal(congestionFromSpeeds(40, 50, true), 'standstill');
});
