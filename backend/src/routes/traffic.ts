import { Router } from 'express';
import type { BackendEnv } from '../config/env.js';
import { getTrafficFlow } from '../lib/trafficProvider.js';

export function createTrafficRouter(env: BackendEnv): Router {
  const router = Router();

  router.get('/flow', async (req, res) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      res.status(400).json({ error: 'invalid_coordinates' });
      return;
    }

    const flow = await getTrafficFlow(lat, lng, env);
    res.json(flow);
  });

  return router;
}
