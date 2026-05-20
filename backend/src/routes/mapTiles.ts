import { Router } from 'express';
import type { BackendEnv } from '../config/env.js';
import {
  createMapTileSessionDescriptor,
  fetchGoogleMapTile,
  normalizeMapTileMode,
} from '../lib/mapTilesProvider.js';

export function createMapTilesRouter(env: BackendEnv): Router {
  const router = Router();

  router.get('/session', async (req, res) => {
    const mode = normalizeMapTileMode(String(req.query.mode ?? 'dark'));
    const descriptor = await createMapTileSessionDescriptor(mode, env.googleMapsApiKey);
    res.json(descriptor);
  });

  router.get('/tiles/:mode/:z/:x/:y', async (req, res) => {
    if (!env.googleMapsApiKey) {
      res.status(503).json({ error: 'google_maps_key_missing' });
      return;
    }

    const z = Number.parseInt(req.params.z, 10);
    const x = Number.parseInt(req.params.x, 10);
    const y = Number.parseInt(req.params.y, 10);
    if (!Number.isFinite(z) || !Number.isFinite(x) || !Number.isFinite(y)) {
      res.status(400).json({ error: 'invalid_tile_coordinates' });
      return;
    }

    const tile = await fetchGoogleMapTile(req.params.mode, z, x, y, env.googleMapsApiKey);
    if (!tile) {
      res.status(502).json({ error: 'google_map_tile_unavailable' });
      return;
    }

    res
      .type(tile.contentType)
      .set('Cache-Control', 'public, max-age=86400')
      .send(tile.bytes);
  });

  return router;
}
