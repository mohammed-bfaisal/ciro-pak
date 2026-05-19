import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getRoute } from './routeProvider.js';

test('route provider falls back to OSRM when TomTom key is absent', async () => {
  const fetcher = async (url: string | URL | Request) => {
    assert.equal(String(url).startsWith('https://router.project-osrm.org'), true);
    return new Response(JSON.stringify({
      code: 'Ok',
      routes: [{
        duration: 610,
        distance: 1250,
        geometry: { coordinates: [[67.0, 24.86], [67.05, 24.9]] },
      }],
    }), { status: 200 });
  };

  const route = await getRoute(67.0, 24.86, 67.05, 24.9, {}, { fetcher });

  assert.equal(route.provider, 'osrm');
  assert.equal(route.fallbackReason, 'tomtom_key_missing');
  assert.equal(route.etaSeconds, 610);
  assert.deepEqual(route.coords, [[67.0, 24.86], [67.05, 24.9]]);
});

test('route provider uses TomTom traffic route when key is present', async () => {
  const fetcher = async (url: string | URL | Request) => {
    assert.equal(String(url).includes('test-route-key'), true);
    return new Response(JSON.stringify({
      routes: [{
        summary: {
          lengthInMeters: 1900,
          travelTimeInSeconds: 320,
          noTrafficTravelTimeInSeconds: 280,
          trafficDelayInSeconds: 40,
        },
        legs: [{
          points: [
            { longitude: 67.0, latitude: 24.86 },
            { longitude: 67.05, latitude: 24.9 },
          ],
        }],
      }],
    }), { status: 200 });
  };

  const route = await getRoute(
    67.0,
    24.86,
    67.05,
    24.9,
    { tomtomApiKey: 'test-route-key' },
    { fetcher, now: () => new Date('2026-05-19T09:00:00Z') },
  );

  assert.equal(route.provider, 'tomtom');
  assert.equal(route.trafficDelaySeconds, 40);
  assert.equal(route.trafficUpdatedAt, '2026-05-19T09:00:00.000Z');
  assert.equal(JSON.stringify(route).includes('test-route-key'), false);
});
