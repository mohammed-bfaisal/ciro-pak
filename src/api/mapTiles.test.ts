import { describe, expect, it, vi } from 'vitest';
import { fetchMapTileSession, toAbsoluteTileUrl } from './mapTiles';

describe('map tile API adapter', () => {
  it('fetches only a proxied map tile session descriptor', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        provider: 'google',
        mode: 'dark',
        tileUrl: '/api/map-tiles/tiles/dark/{z}/{x}/{y}',
        attribution: 'Map data (c) Google',
        tileSize: 256,
      }),
    })) as unknown as typeof fetch;

    const descriptor = await fetchMapTileSession('dark', {
      baseUrl: 'https://backend.example',
      fetcher,
    });

    expect(descriptor.tileUrl).toBe('/api/map-tiles/tiles/dark/{z}/{x}/{y}');
    expect(JSON.stringify(descriptor)).not.toContain('AIza');
    expect(fetcher).toHaveBeenCalledWith(
      'https://backend.example/api/map-tiles/session?mode=dark',
      {},
    );
  });

  it('turns relative proxied tile templates into absolute backend URLs', () => {
    expect(toAbsoluteTileUrl('/api/map-tiles/tiles/satellite/{z}/{x}/{y}', 'https://backend.example/')).toBe(
      'https://backend.example/api/map-tiles/tiles/satellite/{z}/{x}/{y}',
    );
  });
});
