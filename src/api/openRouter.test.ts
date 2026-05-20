import { describe, expect, it, vi } from 'vitest';
import { chatWithOpenRouter } from './openRouter';

describe('frontend OpenRouter proxy client', () => {
  it('posts chat prompts only to the configured backend proxy', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        provider: 'openrouter',
        model: 'mistralai/mistral-nemo',
        content: 'Dispatch high-confidence rescue units first.',
      }),
    })) as unknown as typeof fetch;

    const result = await chatWithOpenRouter(
      {
        prompt: 'Summarise dispatch tradeoffs.',
        systemPrompt: 'You are a disaster response advisor.',
        maxTokens: 120,
        temperature: 0.2,
      },
      {
        baseUrl: 'https://backend.example',
        fetcher,
      },
    );

    expect(result.provider).toBe('openrouter');
    expect(result.content).toContain('Dispatch');
    expect(fetcher).toHaveBeenCalledWith(
      'https://backend.example/api/openrouter/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Summarise dispatch tradeoffs.',
          systemPrompt: 'You are a disaster response advisor.',
          maxTokens: 120,
          temperature: 0.2,
        }),
      },
    );
  });
});
