import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getWeatherSignal } from './weatherProvider.js';

test('weather provider returns deterministic mock data without a server key', async () => {
  const signal = await getWeatherSignal('karachi', {}, { now: () => new Date('2026-05-19T09:00:00Z') });

  assert.equal(signal.source, 'weather');
  assert.equal(signal.id, 'weather-karachi-mock');
  assert.equal(signal.location.label, 'Karachi');
  assert.equal(signal.rawData.fallbackReason, 'weather_key_missing');
  assert.equal(signal.timestamp, '2026-05-19T09:00:00.000Z');
});

test('weather provider maps live provider data without leaking the API key', async () => {
  const fetcher = async (url: string | URL | Request) => {
    assert.equal(String(url).includes('test-weather-key'), true);
    return new Response(JSON.stringify({
      weather: [{ description: 'heavy rain' }],
      main: { temp: 35, humidity: 87 },
      rain: { '1h': 18 },
    }), { status: 200 });
  };

  const signal = await getWeatherSignal(
    'karachi',
    { weatherApiKey: 'test-weather-key' },
    { fetcher, now: () => new Date('2026-05-19T09:00:00Z') },
  );

  assert.equal(signal.id, 'weather-karachi-live');
  assert.equal(signal.rawData.provider, 'OpenWeatherMap');
  assert.equal(JSON.stringify(signal.rawData).includes('test-weather-key'), false);
  assert.equal(signal.urgencyScore > 0.5, true);
});
