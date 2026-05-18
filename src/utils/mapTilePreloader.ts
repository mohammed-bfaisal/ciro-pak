import type { City } from '../types';
import { ALL_CITIES, CITY_REGISTRY } from '../data/cities';
import { DARK_STYLE } from '../constants/mapStyles';

export const STADIA_TILEJSON_URL = 'https://tiles.stadiamaps.com/data/openmaptiles.json';
export const STADIA_VECTOR_TILE_TEMPLATE = 'https://tiles.stadiamaps.com/data/openmaptiles/{z}/{x}/{y}.pbf';

const WORLD_TILE_LAT_LIMIT = 85.05112878;
const BASE_PRELOAD_ZOOMS = [
  { zoom: 7, radius: 0 },
  { zoom: 9, radius: 1 },
] as const;

export interface TileCoordinate {
  z: number;
  x: number;
  y: number;
}

export interface TilePreloadTarget extends TileCoordinate {
  city: City;
  url: string;
  zoom: number;
}

interface CityTilePreloadOptions {
  detailed?: boolean;
}

interface TilePreloadStats {
  requested: number;
  skipped: number;
  failed: number;
}

type Fetcher = (url: string, init?: RequestInit) => Promise<unknown>;
type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
};

let sharedPreloader: MapTilePreloader | null = null;

export function lngLatToTile(lng: number, lat: number, zoom: number): TileCoordinate {
  const tilesPerAxis = 2 ** zoom;
  const clampedLat = Math.max(-WORLD_TILE_LAT_LIMIT, Math.min(WORLD_TILE_LAT_LIMIT, lat));
  const wrappedLng = ((((lng + 180) % 360) + 360) % 360) - 180;
  const latRad = (clampedLat * Math.PI) / 180;
  const x = Math.floor(((wrappedLng + 180) / 360) * tilesPerAxis);
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + (1 / Math.cos(latRad))) / Math.PI) / 2) * tilesPerAxis,
  );

  return {
    z: zoom,
    x: clampTileIndex(x, tilesPerAxis),
    y: clampTileIndex(y, tilesPerAxis),
  };
}

export function createCityTilePreloadPlan(
  city: City,
  options: CityTilePreloadOptions = {},
): TilePreloadTarget[] {
  const metadata = CITY_REGISTRY[city];
  const [lng, lat] = metadata.center;
  const detailZoom = Math.round(metadata.zoom);
  const specs = options.detailed
    ? [{ zoom: detailZoom, radius: 1 }, ...BASE_PRELOAD_ZOOMS]
    : BASE_PRELOAD_ZOOMS;

  return dedupeTargets(
    specs.flatMap(({ zoom, radius }) =>
      expandTile(lngLatToTile(lng, lat, zoom), radius).map((tile) => ({
        ...tile,
        city,
        zoom,
        url: formatTileUrl(tile),
      })),
    ),
  );
}

export function createAllCityTilePreloadPlan(): TilePreloadTarget[] {
  return dedupeTargets(
    ALL_CITIES.flatMap((city) => createCityTilePreloadPlan(city, { detailed: true })),
  );
}

export class MapTilePreloader {
  private readonly requestedUrls = new Set<string>();
  private readonly fetcher: Fetcher;

  constructor(fetcher: Fetcher = defaultFetcher) {
    this.fetcher = fetcher;
  }

  preloadCriticalMetadata(): Promise<TilePreloadStats> {
    return this.preloadUrls([DARK_STYLE, STADIA_TILEJSON_URL], { concurrency: 2 });
  }

  preloadCity(city: City): Promise<TilePreloadStats> {
    return this.preloadUrls(createCityTilePreloadPlan(city, { detailed: true }).map((target) => target.url));
  }

  preloadAllCities(): Promise<TilePreloadStats> {
    return this.preloadUrls(createAllCityTilePreloadPlan().map((target) => target.url), { concurrency: 3 });
  }

  async preloadUrls(
    urls: string[],
    options: { concurrency?: number } = {},
  ): Promise<TilePreloadStats> {
    const concurrency = Math.max(1, options.concurrency ?? 4);
    const pendingUrls: string[] = [];
    let skipped = 0;

    for (const url of urls) {
      if (this.requestedUrls.has(url)) {
        skipped += 1;
      } else {
        this.requestedUrls.add(url);
        pendingUrls.push(url);
      }
    }

    let failed = 0;
    let cursor = 0;
    const workers = Array.from({ length: Math.min(concurrency, pendingUrls.length) }, async () => {
      while (cursor < pendingUrls.length) {
        const url = pendingUrls[cursor];
        cursor += 1;
        try {
          const response = await this.fetcher(url, { cache: 'force-cache', mode: 'cors' });
          if (isFailedResponse(response)) failed += 1;
        } catch {
          failed += 1;
        }
      }
    });

    await Promise.all(workers);

    return {
      requested: pendingUrls.length,
      skipped,
      failed,
    };
  }
}

export function getMapTilePreloader(): MapTilePreloader | null {
  if (typeof globalThis.fetch !== 'function') return null;
  sharedPreloader ??= new MapTilePreloader();
  return sharedPreloader;
}

export function scheduleMapTilePreload(callback: () => void, timeout = 2000): void {
  if (typeof window === 'undefined') {
    callback();
    return;
  }

  const idleWindow = window as IdleWindow;
  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(callback, { timeout });
    return;
  }

  window.setTimeout(callback, Math.min(timeout, 750));
}

function expandTile(tile: TileCoordinate, radius: number): TileCoordinate[] {
  const tilesPerAxis = 2 ** tile.z;
  const tiles: TileCoordinate[] = [];

  for (let dx = -radius; dx <= radius; dx += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      tiles.push({
        z: tile.z,
        x: wrapTileIndex(tile.x + dx, tilesPerAxis),
        y: clampTileIndex(tile.y + dy, tilesPerAxis),
      });
    }
  }

  return tiles;
}

function dedupeTargets(targets: TilePreloadTarget[]): TilePreloadTarget[] {
  const seen = new Set<string>();
  return targets.filter((target) => {
    if (seen.has(target.url)) return false;
    seen.add(target.url);
    return true;
  });
}

function formatTileUrl(tile: TileCoordinate): string {
  return STADIA_VECTOR_TILE_TEMPLATE
    .replace('{z}', String(tile.z))
    .replace('{x}', String(tile.x))
    .replace('{y}', String(tile.y));
}

function clampTileIndex(value: number, tilesPerAxis: number): number {
  return Math.max(0, Math.min(tilesPerAxis - 1, value));
}

function wrapTileIndex(value: number, tilesPerAxis: number): number {
  return ((value % tilesPerAxis) + tilesPerAxis) % tilesPerAxis;
}

function defaultFetcher(url: string, init?: RequestInit): Promise<unknown> {
  return globalThis.fetch(url, init);
}

function isFailedResponse(response: unknown): boolean {
  return typeof response === 'object'
    && response !== null
    && 'ok' in response
    && (response as Response).ok === false;
}
