import { describe, expect, it, vi } from 'vitest';
import { ALL_CITIES, CITY_REGISTRY } from '../data/cities';
import {
  createAllCityTilePreloadPlan,
  createCityTilePreloadPlan,
  lngLatToTile,
  MapTilePreloader,
} from './mapTilePreloader';

describe('map tile preloader', () => {
  it('converts city coordinates into stable XYZ tile coordinates', () => {
    expect(lngLatToTile(67.0011, 24.8607, 9)).toEqual({ z: 9, x: 351, y: 219 });
    expect(lngLatToTile(73.0479, 33.6844, 9)).toEqual({ z: 9, x: 359, y: 205 });
  });

  it('builds a preload plan for every city without duplicate tile URLs', () => {
    const plan = createAllCityTilePreloadPlan();
    const uniqueUrls = new Set(plan.map((target) => target.url));

    expect(plan.length).toBe(uniqueUrls.size);
    expect(plan.length).toBeGreaterThan(ALL_CITIES.length);
    expect(plan.some((target) => target.city === 'karachi' && target.zoom === 11)).toBe(true);
    expect(plan.some((target) => target.city === 'gwadar' && target.zoom === 9)).toBe(true);
  });

  it('prioritizes selected city detail tiles before broad city warmup', () => {
    const city = 'islamabad';
    const plan = createCityTilePreloadPlan(city, { detailed: true });

    expect(plan[0].city).toBe(city);
    expect(plan[0].zoom).toBe(CITY_REGISTRY[city].zoom);
    expect(plan.filter((target) => target.zoom === CITY_REGISTRY[city].zoom).length).toBeGreaterThan(1);
  });

  it('does not fetch the same preload URL twice', async () => {
    const fetcher = vi.fn(async () => ({ ok: true }) as Response);
    const preloader = new MapTilePreloader(fetcher);

    await preloader.preloadUrls([
      'https://tiles.example.test/a.pbf',
      'https://tiles.example.test/a.pbf',
      'https://tiles.example.test/b.pbf',
    ]);

    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
