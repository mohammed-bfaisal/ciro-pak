import { Router } from 'express';
import type { BackendEnv } from '../config/env.js';
import { getOpenRouterChatCompletion, OpenRouterValidationError } from '../lib/openRouterProvider.js';

export function createOpenRouterRouter(env: BackendEnv): Router {
  const router = Router();

  router.post('/chat', async (req, res) => {
    try {
      const result = await getOpenRouterChatCompletion(req.body, env);
      res.json(result);
    } catch (error) {
      if (error instanceof OpenRouterValidationError) {
        res.status(400).json({ error: error.code, message: error.message });
        return;
      }
      res.status(500).json({ error: 'openrouter_proxy_error' });
    }
  });

  return router;
}
