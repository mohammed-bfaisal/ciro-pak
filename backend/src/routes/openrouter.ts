import { Router } from 'express';
import type { BackendEnv } from '../config/env.js';
import { getOpenRouterChatCompletion, OpenRouterValidationError } from '../lib/openRouterProvider.js';

const MAX_CHARS_PER_LINE = 200;
const MAX_CHARS_PER_SESSION = 2000;
const sessionCharMap = new Map<string, number>();

function getSessionId(req: Parameters<Parameters<ReturnType<typeof Router>['post']>[1]>[0]): string {
  return (req.headers['x-session-id'] as string | undefined) ?? 'default';
}

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

  router.post('/speech', async (req, res) => {
    const { text, model, voice, responseFormat, speed } = req.body as {
      text?: string;
      model?: string;
      voice?: string;
      responseFormat?: string;
      speed?: number;
    };

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'text_required' });
      return;
    }

    if (!env.openrouterApiKey) {
      res.status(503).json({ error: 'tts_disabled', message: 'No OpenRouter key configured for TTS' });
      return;
    }

    const truncated = text.slice(0, MAX_CHARS_PER_LINE);
    const sessionId = getSessionId(req);
    const used = sessionCharMap.get(sessionId) ?? 0;
    if (used + truncated.length > MAX_CHARS_PER_SESSION) {
      res.status(429).json({ error: 'session_speech_cap_reached' });
      return;
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.openrouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model ?? process.env['OPENROUTER_TTS_MODEL'] ?? 'openai/tts-1',
          input: truncated,
          voice: voice ?? process.env['OPENROUTER_TTS_VOICE'] ?? 'alloy',
          response_format: responseFormat ?? 'mp3',
          speed: speed ?? 1.0,
        }),
      });

      if (!response.ok) {
        res.status(response.status).json({ error: 'tts_upstream_error', status: response.status });
        return;
      }

      sessionCharMap.set(sessionId, used + truncated.length);
      const audioBuffer = await response.arrayBuffer();
      res.set('Content-Type', 'audio/mpeg');
      res.send(Buffer.from(audioBuffer));
    } catch {
      res.status(503).json({ error: 'tts_unavailable' });
    }
  });

  return router;
}
