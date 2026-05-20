import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readEnv } from './env.js';

test('readEnv defaults OpenRouter to the cheap hosted model with a tight token cap', () => {
  const env = readEnv({});

  assert.equal(env.openrouterModel, 'mistralai/mistral-nemo');
  assert.deepEqual(env.openrouterAllowedModels, ['mistralai/mistral-nemo']);
  assert.equal(env.openrouterMaxTokens, 240);
});

test('readEnv permits common local web and Capacitor origins by default', () => {
  const env = readEnv({});

  assert.ok(env.allowedOrigins.includes('http://localhost:5173'));
  assert.ok(env.allowedOrigins.includes('http://127.0.0.1:5173'));
  assert.ok(env.allowedOrigins.includes('http://localhost:5177'));
  assert.ok(env.allowedOrigins.includes('capacitor://localhost'));
});

test('readEnv reads Google Maps key with Google Routes alias fallback', () => {
  assert.equal(readEnv({ GOOGLE_MAPS_API_KEY: ' maps-key ' }).googleMapsApiKey, 'maps-key');
  assert.equal(readEnv({ GOOGLE_ROUTES_API_KEY: ' routes-key ' }).googleMapsApiKey, 'routes-key');
  assert.equal(
    readEnv({ GOOGLE_MAPS_API_KEY: ' maps-key ', GOOGLE_ROUTES_API_KEY: ' routes-key ' }).googleMapsApiKey,
    'maps-key',
  );
});
