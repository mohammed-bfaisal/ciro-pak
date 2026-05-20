import { Router } from 'express';
import type { BackendEnv } from '../config/env.js';

export interface BackendHealthPayload {
  status: 'ok';
  service: 'ciro-backend';
  appVersion: string;
  timestamp: string;
  providers: {
    weather: 'openweathermap' | 'simulated';
    traffic: 'google_routes' | 'simulated';
    routing: 'google_routes' | 'osrm';
    openrouter: 'openrouter' | 'disabled';
    speech: 'openrouter' | 'disabled';
    mapTiles: 'google_map_tiles' | 'disabled';
  };
  features: {
    weatherProxy: boolean;
    trafficProxy: boolean;
    routingProxy: boolean;
    openrouterProxy: boolean;
    speechProxy: boolean;
    mapTilesProxy: boolean;
  };
}

export function createHealthRouter(env: BackendEnv): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json(buildHealthPayload(env));
  });

  return router;
}

export function buildHealthPayload(
  env: BackendEnv,
  now: () => Date = () => new Date(),
): BackendHealthPayload {
  const hasGoogleMaps = Boolean(env.googleMapsApiKey);
  const hasOpenRouter = Boolean(env.openrouterApiKey);
  const hasSpeech = hasOpenRouter && Boolean(env.openrouterTtsModel);

  return {
    status: 'ok',
    service: 'ciro-backend',
    appVersion: env.appVersion,
    timestamp: now().toISOString(),
    providers: {
      weather: env.weatherApiKey ? 'openweathermap' : 'simulated',
      traffic: hasGoogleMaps ? 'google_routes' : 'simulated',
      routing: hasGoogleMaps ? 'google_routes' : 'osrm',
      openrouter: hasOpenRouter ? 'openrouter' : 'disabled',
      speech: hasSpeech ? 'openrouter' : 'disabled',
      mapTiles: hasGoogleMaps ? 'google_map_tiles' : 'disabled',
    },
    features: {
      weatherProxy: Boolean(env.weatherApiKey),
      trafficProxy: hasGoogleMaps,
      routingProxy: true,
      openrouterProxy: hasOpenRouter,
      speechProxy: hasSpeech,
      mapTilesProxy: hasGoogleMaps,
    },
  };
}
