import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildHealthPayload } from './health.js';
import type { BackendEnv } from '../config/env.js';

test('health payload exposes app version and active live provider stack', () => {
  const payload = buildHealthPayload(makeEnv({
    appVersion: '2026.05.20-google-routes',
    weatherApiKey: 'weather-key',
    googleMapsApiKey: 'maps-key',
    openrouterApiKey: 'openrouter-key',
    openrouterTtsModel: 'openai/tts-1',
  }), () => new Date('2026-05-20T09:00:00.000Z'));

  assert.equal(payload.appVersion, '2026.05.20-google-routes');
  assert.equal(payload.timestamp, '2026-05-20T09:00:00.000Z');
  assert.deepEqual(payload.providers, {
    weather: 'openweathermap',
    traffic: 'google_routes',
    routing: 'google_routes',
    openrouter: 'openrouter',
    speech: 'openrouter',
    mapTiles: 'google_map_tiles',
  });
  assert.deepEqual(payload.features, {
    weatherProxy: true,
    trafficProxy: true,
    routingProxy: true,
    openrouterProxy: true,
    speechProxy: true,
    mapTilesProxy: true,
  });
});

test('health payload labels deterministic fallback providers when keys are absent', () => {
  const payload = buildHealthPayload(makeEnv(), () => new Date('2026-05-20T09:00:00.000Z'));

  assert.equal(payload.appVersion, 'local');
  assert.deepEqual(payload.providers, {
    weather: 'simulated',
    traffic: 'simulated',
    routing: 'osrm',
    openrouter: 'disabled',
    speech: 'disabled',
    mapTiles: 'disabled',
  });
  assert.equal(payload.features.speechProxy, false);
  assert.equal(payload.features.mapTilesProxy, false);
});

function makeEnv(overrides: Partial<BackendEnv> = {}): BackendEnv {
  return {
    port: 8080,
    allowedOrigins: [],
    openrouterModel: 'mistralai/mistral-nemo',
    openrouterAllowedModels: ['mistralai/mistral-nemo'],
    openrouterMaxTokens: 240,
    openrouterAppTitle: 'CIRO',
    appVersion: 'local',
    ...overrides,
  };
}
