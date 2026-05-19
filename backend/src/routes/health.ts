import { Router } from 'express';
import type { BackendEnv } from '../config/env.js';

export function createHealthRouter(env: BackendEnv): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'ciro-backend',
      timestamp: new Date().toISOString(),
      features: {
        weatherProxy: Boolean(env.weatherApiKey),
        trafficProxy: Boolean(env.tomtomApiKey),
        routingProxy: true,
        openrouterProxy: Boolean(env.openrouterApiKey),
      },
    });
  });

  return router;
}
