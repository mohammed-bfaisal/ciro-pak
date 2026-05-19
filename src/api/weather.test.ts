import { describe, expect, it, vi } from 'vitest';
import { fetchWeather } from './weather';

describe('weather API adapter', () => {
  it('returns mock weather when the backend is not configured', async () => {
    const signal = await fetchWeather('karachi', {
      baseUrl: null,
      now: () => new Date('2026-05-19T09:00:00Z'),
    });

    expect(signal.id).toBe('weather-karachi-mock');
    expect(signal.rawData.fallbackReason).toBe('backend_not_configured');
    expect(signal.timestamp).toBe('2026-05-19T09:00:00.000Z');
  });

  it('uses backend weather when configured', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        id: 'weather-karachi-live',
        source: 'weather',
        content: 'heavy rain',
        location: { lat: 24.8607, lng: 67.0011, label: 'Karachi' },
        timestamp: '2026-05-19T09:00:00.000Z',
        credibilityScore: 0.85,
        urgencyScore: 0.75,
        isFlagged: false,
        rawData: { provider: 'OpenWeatherMap' },
      }),
    })) as unknown as typeof fetch;

    const signal = await fetchWeather('karachi', {
      baseUrl: 'https://backend.example',
      fetcher,
    });

    expect(signal.id).toBe('weather-karachi-live');
    expect(fetcher).toHaveBeenCalledWith('https://backend.example/api/weather/karachi', {});
  });

  it('falls back to mock weather when backend weather fails', async () => {
    const fetcher = vi.fn(async () => ({
      ok: false,
      json: async () => ({ error: 'weather_unavailable' }),
    })) as unknown as typeof fetch;

    const signal = await fetchWeather('lahore', {
      baseUrl: 'https://backend.example',
      fetcher,
      now: () => new Date('2026-05-19T09:00:00Z'),
    });

    expect(signal.id).toBe('weather-lahore-mock');
    expect(signal.rawData.fallbackReason).toBe('backend_unavailable');
  });
});
