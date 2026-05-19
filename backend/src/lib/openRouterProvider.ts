import type { BackendEnv } from '../config/env.js';
import { fetchJson, type Fetcher } from './http.js';

const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_PROMPT_CHARS = 4000;
const MAX_SYSTEM_PROMPT_CHARS = 1200;
const MIN_COMPLETION_TOKENS = 16;

export interface OpenRouterChatRequest {
  prompt?: unknown;
  systemPrompt?: unknown;
  model?: unknown;
  maxTokens?: unknown;
  temperature?: unknown;
}

export interface OpenRouterChatResult {
  provider: 'openrouter' | 'fallback';
  model: string;
  content: string;
  fallbackReason?: 'openrouter_key_missing' | 'openrouter_unavailable';
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

interface OpenRouterResponse {
  model?: string;
  choices?: {
    message?: {
      content?: string;
    };
  }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export class OpenRouterValidationError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'OpenRouterValidationError';
  }
}

export async function getOpenRouterChatCompletion(
  request: OpenRouterChatRequest,
  env: Pick<BackendEnv,
    'openrouterApiKey' |
    'openrouterModel' |
    'openrouterAllowedModels' |
    'openrouterMaxTokens' |
    'openrouterSiteUrl' |
    'openrouterAppTitle'
  >,
  options: { fetcher?: Fetcher } = {},
): Promise<OpenRouterChatResult> {
  const prompt = cleanText(request.prompt, 'prompt', MAX_PROMPT_CHARS);
  const systemPrompt = request.systemPrompt === undefined
    ? undefined
    : cleanText(request.systemPrompt, 'system_prompt', MAX_SYSTEM_PROMPT_CHARS);
  const model = cleanModel(request.model, env);
  const maxTokens = clampTokens(request.maxTokens, env.openrouterMaxTokens);
  const temperature = clampTemperature(request.temperature);

  if (!env.openrouterApiKey) {
    return fallback(model, 'openrouter_key_missing');
  }

  try {
    const response = await fetchJson<OpenRouterResponse>(
      OPENROUTER_CHAT_URL,
      {
        method: 'POST',
        headers: buildHeaders(env),
        body: JSON.stringify({
          model,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
          max_tokens: maxTokens,
          temperature,
          stream: false,
        }),
      },
      { fetcher: options.fetcher, timeoutMs: 12000 },
    );

    const content = response.choices?.[0]?.message?.content?.trim();
    if (!content) return fallback(model, 'openrouter_unavailable');

    return {
      provider: 'openrouter',
      model: response.model ?? model,
      content,
      usage: {
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens,
      },
    };
  } catch {
    return fallback(model, 'openrouter_unavailable');
  }
}

function cleanText(value: unknown, code: string, maxLength: number): string {
  if (typeof value !== 'string') {
    throw new OpenRouterValidationError(code, `${code} must be a string`);
  }
  const cleaned = value.trim();
  if (!cleaned) {
    throw new OpenRouterValidationError(code, `${code} is required`);
  }
  if (cleaned.length > maxLength) {
    throw new OpenRouterValidationError(code, `${code} must be ${maxLength} characters or fewer`);
  }
  return cleaned;
}

function cleanModel(requestedModel: unknown, env: Pick<BackendEnv, 'openrouterModel' | 'openrouterAllowedModels'>): string {
  const model = typeof requestedModel === 'string' && requestedModel.trim()
    ? requestedModel.trim()
    : env.openrouterModel;
  if (!env.openrouterAllowedModels.includes(model)) {
    throw new OpenRouterValidationError('model_not_allowed', 'model is not allowed for this deployment');
  }
  return model;
}

function clampTokens(value: unknown, envMaxTokens: number): number {
  const requested = typeof value === 'number' && Number.isFinite(value)
    ? Math.floor(value)
    : envMaxTokens;
  return Math.min(Math.max(requested, MIN_COMPLETION_TOKENS), envMaxTokens);
}

function clampTemperature(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0.3;
  return Math.min(Math.max(value, 0), 1);
}

function buildHeaders(env: Pick<BackendEnv, 'openrouterApiKey' | 'openrouterSiteUrl' | 'openrouterAppTitle'>): Record<string, string> {
  return {
    Authorization: `Bearer ${env.openrouterApiKey}`,
    'Content-Type': 'application/json',
    ...(env.openrouterSiteUrl ? { 'HTTP-Referer': env.openrouterSiteUrl } : {}),
    'X-OpenRouter-Title': env.openrouterAppTitle,
  };
}

function fallback(model: string, fallbackReason: OpenRouterChatResult['fallbackReason']): OpenRouterChatResult {
  return {
    provider: 'fallback',
    model,
    fallbackReason,
    content: 'AI briefing unavailable from the hosted provider. Use the current signal feed, crisis severity, route ETA, and resource status shown in CIRO to continue dispatch decisions.',
  };
}
