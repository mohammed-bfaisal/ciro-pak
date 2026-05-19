import { Router } from 'express';
import type { BackendEnv } from '../config/env.js';
import { getWeatherSignal } from '../lib/weatherProvider.js';
import { isCity } from '../types.js';

export function createWeatherRouter(env: BackendEnv): Router {
  const router = Router();

  router.get('/:city', async (req, res) => {
    const city = req.params.city;
    if (!isCity(city)) {
      res.status(400).json({ error: 'unknown_city' });
      return;
    }

    const signal = await getWeatherSignal(city, env);
    res.json(signal);
  });

  return router;
}
