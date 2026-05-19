import { describe, expect, it, vi } from 'vitest';
import { fetchRoute } from './routing';

describe('traffic-aware routing', () => {
  it('calls the default browser fetch with its global receiver', async () => {
    const originalFetch = globalThis.fetch;
    const fetcher = vi.fn(function (this: typeof globalThis) {
      if (this !== globalThis) {
        throw new TypeError('Illegal invocation');
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({
          code: 'Ok',
          routes: [
            {
              duration: 610,
              distance: 4100,
              geometry: {
                coordinates: [
                  [73.02, 33.69],
                  [73.03, 33.695],
                  [73.05, 33.7],
                ],
              },
            },
          ],
        }),
      } as Response);
    });

    vi.stubGlobal('fetch', fetcher);

    try {
      const route = await fetchRoute(73.02, 33.69, 73.05, 33.7, { tomtomApiKey: '' });

      expect(route?.coords).toHaveLength(3);
      expect(fetcher).toHaveBeenCalledOnce();
    } finally {
      vi.stubGlobal('fetch', originalFetch);
    }
  });

  it('uses TomTom traffic travel time when an API key is available', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        routes: [
          {
            summary: {
              lengthInMeters: 4800,
              travelTimeInSeconds: 720,
              noTrafficTravelTimeInSeconds: 540,
              trafficDelayInSeconds: 180,
            },
            legs: [
              {
                points: [
                  { latitude: 24.86, longitude: 67.01 },
                  { latitude: 24.88, longitude: 67.04 },
                ],
              },
            ],
          },
        ],
      }),
    })) as unknown as typeof fetch;

    const route = await fetchRoute(67.01, 24.86, 67.04, 24.88, {
      fetcher,
      tomtomApiKey: 'test-key',
      now: () => new Date('2026-05-18T08:00:00Z'),
    });

    expect(route).toEqual({
      coords: [
        [67.01, 24.86],
        [67.04, 24.88],
      ],
      etaSeconds: 720,
      etaMinutes: 12,
      distanceMeters: 4800,
      provider: 'tomtom',
      trafficDelaySeconds: 180,
      freeFlowEtaSeconds: 540,
      trafficUpdatedAt: '2026-05-18T08:00:00.000Z',
    });
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining('computeTravelTimeFor=all'));
  });

  it('falls back to OSRM without a TomTom key and marks the route non-traffic-aware', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        code: 'Ok',
        routes: [
          {
            duration: 610,
            distance: 4100,
            geometry: {
              coordinates: [
                [73.02, 33.69],
                [73.05, 33.7],
              ],
            },
          },
        ],
      }),
    })) as unknown as typeof fetch;

    const route = await fetchRoute(73.02, 33.69, 73.05, 33.7, { fetcher, tomtomApiKey: '' });

    expect(route?.provider).toBe('osrm');
    expect(route?.etaSeconds).toBe(610);
    expect(route?.etaMinutes).toBe(11);
    expect(route?.trafficDelaySeconds).toBeUndefined();
    expect(route?.fallbackReason).toBe('tomtom_key_missing');
  });
});
