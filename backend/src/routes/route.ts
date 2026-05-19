import { Router } from 'express';
import type { BackendEnv } from '../config/env.js';
import { getRoute } from '../lib/routeProvider.js';

export function createRouteRouter(env: BackendEnv): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    const fromLng = Number(req.query.fromLng);
    const fromLat = Number(req.query.fromLat);
    const toLng = Number(req.query.toLng);
    const toLat = Number(req.query.toLat);

    if (![fromLng, fromLat, toLng, toLat].every(Number.isFinite)) {
      res.status(400).json({ error: 'invalid_coordinates' });
      return;
    }

    try {
      const route = await getRoute(fromLng, fromLat, toLng, toLat, env);
      res.json(route);
    } catch {
      res.status(503).json({ error: 'route_unavailable' });
    }
  });

  return router;
}
