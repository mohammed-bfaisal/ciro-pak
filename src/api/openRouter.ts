import { apiFetch, type ApiClientOptions } from './client';

export interface OpenRouterChatRequest {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
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

export async function chatWithOpenRouter(
  request: OpenRouterChatRequest,
  options: ApiClientOptions = {},
): Promise<OpenRouterChatResult> {
  return await apiFetch<OpenRouterChatResult>(
    '/api/openrouter/chat',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    },
    options,
  );
}
