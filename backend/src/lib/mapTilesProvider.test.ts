import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildGoogleMapTileSessionRequest,
  createMapTileSessionDescriptor,
  type MapTileMode,
} from './mapTilesProvider.js';

test('map tile session requests use Google roadmap styling for dark and light modes', () => {
  const dark = buildGoogleMapTileSessionRequest('dark');
  const light = buildGoogleMapTileSessionRequest('light');

  assert.equal(dark.mapType, 'roadmap');
  assert.equal(light.mapType, 'roadmap');
  assert.ok((dark.styles ?? []).length > 0);
  assert.ok((light.styles ?? []).length > 0);
});

test('map tile session requests use satellite imagery with roadmap labels for satellite mode', () => {
  const request = buildGoogleMapTileSessionRequest('satellite');

  assert.equal(request.mapType, 'satellite');
  assert.deepEqual(request.layerTypes, ['layerRoadmap']);
  assert.equal(request.overlay, false);
});

test('map tile descriptor returns fallback without a Google Maps key', async () => {
  const descriptor = await createMapTileSessionDescriptor('dark', undefined, {
    now: () => new Date('2026-05-20T09:00:00.000Z'),
  });

  assert.equal(descriptor.provider, 'fallback');
  assert.equal(descriptor.fallbackReason, 'google_maps_key_missing');
  assert.equal(descriptor.tileUrl, null);
});

test('map tile descriptor returns only proxied URLs and never leaks the API key', async () => {
  const calls: Array<{ url: string; body: string | undefined }> = [];
  const fetcher = async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), body: init?.body?.toString() });
    return {
      ok: true,
      json: async () => ({
        session: 'session-token',
        expiry: `${Math.floor(Date.parse('2026-06-01T00:00:00.000Z') / 1000)}`,
        tileWidth: 256,
        tileHeight: 256,
        imageFormat: 'png',
      }),
    };
  };

  const descriptor = await createMapTileSessionDescriptor('satellite', 'secret-google-key', {
    fetcher: fetcher as typeof fetch,
    basePath: '/api/map-tiles',
    now: () => new Date('2026-05-20T09:00:00.000Z'),
  });

  assert.equal(descriptor.provider, 'google');
  assert.equal(descriptor.tileUrl, '/api/map-tiles/tiles/satellite/{z}/{x}/{y}');
  assert.equal(descriptor.tileSize, 256);
  assert.ok(calls[0].url.includes('key=secret-google-key'));
  assert.doesNotMatch(JSON.stringify(descriptor), /secret-google-key/);
});

test('invalid map tile modes fall back to dark mode', async () => {
  const descriptor = await createMapTileSessionDescriptor('unknown' as MapTileMode, undefined);

  assert.equal(descriptor.mode, 'dark');
});
