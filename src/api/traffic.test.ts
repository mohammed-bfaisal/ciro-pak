import { describe, expect, it, vi } from 'vitest';
import { congestionFromSpeeds, fetchTrafficFlow } from './traffic';

describe('traffic API adapter', () => {
  it('uses simulated traffic when backend is not configured', async () => {
    const flow = await fetchTrafficFlow(24.8607, 67.0011, {
      baseUrl: null,
      now: () => new Date('2026-05-19T09:00:00Z'),
    });

    expect(flow.provider).toBe('simulated');
    expect(flow.fallbackReason).toBe('backend_not_configured');
    expect(flow.updatedAt).toBe('2026-05-19T09:00:00.000Z');
  });

  it('uses backend traffic when configured', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        lat: 24.8607,
        lng: 67.0011,
        congestionLevel: 'heavy',
        currentSpeed: 12,
        freeFlowSpeed: 45,
        provider: 'google',
        updatedAt: '2026-05-19T09:00:00.000Z',
        trafficSegments: [
          {
            coords: [
              [67.0, 24.86],
              [67.02, 24.87],
            ],
            congestionLevel: 'heavy',
          },
        ],
      }),
    })) as unknown as typeof fetch;

    const flow = await fetchTrafficFlow(24.8607, 67.0011, {
      baseUrl: 'https://backend.example',
      fetcher,
    });

    expect(flow.provider).toBe('google');
    expect(flow.congestionLevel).toBe('heavy');
    expect(flow.trafficSegments?.[0]?.coords).toEqual([[67.0, 24.86], [67.02, 24.87]]);
    expect(fetcher).toHaveBeenCalledWith(
      'https://backend.example/api/traffic/flow?lat=24.8607&lng=67.0011',
      {},
    );
  });

  it('falls back to simulated traffic when backend traffic fails', async () => {
    const fetcher = vi.fn(async () => ({
      ok: false,
      json: async () => ({ error: 'traffic_unavailable' }),
    })) as unknown as typeof fetch;

    const flow = await fetchTrafficFlow(24.8607, 67.0011, {
      baseUrl: 'https://backend.example',
      fetcher,
    });

    expect(flow.provider).toBe('simulated');
    expect(flow.fallbackReason).toBe('backend_unavailable');
  });

  it('derives congestion from speed ratio', () => {
    expect(congestionFromSpeeds(44, 50)).toBe('free');
    expect(congestionFromSpeeds(24, 50)).toBe('moderate');
    expect(congestionFromSpeeds(12, 50)).toBe('heavy');
    expect(congestionFromSpeeds(40, 50, true)).toBe('standstill');
  });
});
