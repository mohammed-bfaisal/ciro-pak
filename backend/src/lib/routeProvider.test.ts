import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getRoute } from './routeProvider.js';

test('route provider falls back to OSRM when Google Maps key is absent', async () => {
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
  assert.equal(route.fallbackReason, 'google_maps_key_missing');
  assert.equal(route.etaSeconds, 610);
  assert.deepEqual(route.coords, [[67.0, 24.86], [67.05, 24.9]]);
});

test('route provider uses Google Routes traffic-aware polylines when key is present', async () => {
  const fetcher = async (url: string | URL | Request, init?: RequestInit) => {
    assert.equal(String(url), 'https://routes.googleapis.com/directions/v2:computeRoutes');
    assert.equal(init?.method, 'POST');
    const headers = init?.headers as Record<string, string>;
    assert.equal(headers['X-Goog-Api-Key'], 'test-google-key');
    assert.match(headers['X-Goog-FieldMask'], /routes\.travelAdvisory\.speedReadingIntervals/);
    assert.equal(JSON.stringify(init?.body).includes('test-google-key'), false);
    return new Response(JSON.stringify({
      routes: [{
        distanceMeters: 1900,
        duration: '320s',
        staticDuration: '280s',
        polyline: {
          geoJsonLinestring: {
            coordinates: [
              [67.0, 24.86],
              [67.02, 24.88],
              [67.05, 24.9],
            ],
          },
        },
        travelAdvisory: {
          speedReadingIntervals: [
            { startPolylinePointIndex: 0, endPolylinePointIndex: 1, speed: 'NORMAL' },
            { startPolylinePointIndex: 1, endPolylinePointIndex: 2, speed: 'SLOW' },
          ],
        },
      }],
    }), { status: 200 });
  };

  const route = await getRoute(
    67.0,
    24.86,
    67.05,
    24.9,
    { googleMapsApiKey: 'test-google-key' },
    { fetcher, now: () => new Date('2026-05-19T09:00:00Z') },
  );

  assert.equal(route.provider, 'google');
  assert.equal(route.trafficDelaySeconds, 40);
  assert.equal(route.freeFlowEtaSeconds, 280);
  assert.equal(route.trafficUpdatedAt, '2026-05-19T09:00:00.000Z');
  assert.deepEqual(route.coords, [[67.0, 24.86], [67.02, 24.88], [67.05, 24.9]]);
  assert.deepEqual(route.trafficSegments, [
    { coords: [[67.0, 24.86], [67.02, 24.88]], congestionLevel: 'free' },
    { coords: [[67.02, 24.88], [67.05, 24.9]], congestionLevel: 'heavy' },
  ]);
  assert.equal(JSON.stringify(route).includes('test-google-key'), false);
});

test('route provider falls back to OSRM when Google Routes is unavailable', async () => {
  const seenUrls: string[] = [];
  const fetcher = async (url: string | URL | Request) => {
    seenUrls.push(String(url));
    if (String(url).startsWith('https://routes.googleapis.com')) {
      return new Response(JSON.stringify({ error: { message: 'quota' } }), { status: 429 });
    }
    return new Response(JSON.stringify({
      code: 'Ok',
      routes: [{
        duration: 410,
        distance: 980,
        geometry: { coordinates: [[73.04, 33.68], [73.08, 33.7]] },
      }],
    }), { status: 200 });
  };

  const route = await getRoute(
    73.04,
    33.68,
    73.08,
    33.7,
    { googleMapsApiKey: 'test-google-key' },
    { fetcher },
  );

  assert.equal(seenUrls.length, 2);
  assert.equal(seenUrls[0], 'https://routes.googleapis.com/directions/v2:computeRoutes');
  assert.equal(seenUrls[1].startsWith('https://router.project-osrm.org'), true);
  assert.equal(route.provider, 'osrm');
  assert.equal(route.fallbackReason, 'google_routes_unavailable');
});
