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
      const route = await fetchRoute(73.02, 33.69, 73.05, 33.7, { apiBaseUrl: null });

      expect(route?.coords).toHaveLength(3);
      expect(fetcher).toHaveBeenCalledOnce();
    } finally {
      vi.stubGlobal('fetch', originalFetch);
    }
  });

  it('uses backend Google traffic-aware route when an API base URL is configured', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        coords: [
          [67.01, 24.86],
          [67.04, 24.88],
        ],
        etaSeconds: 720,
        etaMinutes: 12,
        distanceMeters: 4800,
        provider: 'google',
        trafficDelaySeconds: 180,
        freeFlowEtaSeconds: 540,
        trafficUpdatedAt: '2026-05-18T08:00:00.000Z',
        trafficSegments: [
          {
            coords: [
              [67.01, 24.86],
              [67.04, 24.88],
            ],
            congestionLevel: 'heavy',
          },
        ],
      }),
    })) as unknown as typeof fetch;

    const route = await fetchRoute(67.01, 24.86, 67.04, 24.88, {
      fetcher,
      apiBaseUrl: 'https://backend.example',
    });

    expect(route).toEqual({
      coords: [
        [67.01, 24.86],
        [67.04, 24.88],
      ],
      etaSeconds: 720,
      etaMinutes: 12,
      distanceMeters: 4800,
      provider: 'google',
      trafficDelaySeconds: 180,
      freeFlowEtaSeconds: 540,
      trafficUpdatedAt: '2026-05-18T08:00:00.000Z',
      trafficSegments: [
        {
          coords: [
            [67.01, 24.86],
            [67.04, 24.88],
          ],
          congestionLevel: 'heavy',
        },
      ],
    });
    expect(fetcher).toHaveBeenCalledWith(
      'https://backend.example/api/route?fromLng=67.01&fromLat=24.86&toLng=67.04&toLat=24.88',
      {},
    );
  });

  it('falls back to OSRM without a Google Maps key and marks the route non-traffic-aware', async () => {
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

    const route = await fetchRoute(73.02, 33.69, 73.05, 33.7, { fetcher, apiBaseUrl: null });

    expect(route?.provider).toBe('osrm');
    expect(route?.etaSeconds).toBe(610);
    expect(route?.etaMinutes).toBe(11);
    expect(route?.trafficDelaySeconds).toBeUndefined();
    expect(route?.fallbackReason).toBe('google_maps_key_missing');
  });

  it('falls back to direct OSRM if the configured backend route is unavailable', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'route_unavailable' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 'Ok',
          routes: [
            {
              duration: 550,
              distance: 3900,
              geometry: {
                coordinates: [
                  [73.02, 33.69],
                  [73.05, 33.7],
                ],
              },
            },
          ],
        }),
      }) as unknown as typeof fetch;

    const route = await fetchRoute(73.02, 33.69, 73.05, 33.7, {
      fetcher,
      apiBaseUrl: 'https://backend.example/',
    });

    expect(route?.provider).toBe('osrm');
    expect(route?.fallbackReason).toBe('google_routes_unavailable');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
