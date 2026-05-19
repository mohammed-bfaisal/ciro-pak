import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getOpenRouterChatCompletion, OpenRouterValidationError } from './openRouterProvider.js';

test('openrouter provider returns fallback without a server key', async () => {
  let called = false;
  const fetcher = async () => {
    called = true;
    return new Response('{}');
  };

  const result = await getOpenRouterChatCompletion(
    { prompt: 'Summarize the Karachi flood response.' },
    {
      openrouterModel: 'google/gemma-4-26b-a4b-it:free',
      openrouterAllowedModels: ['google/gemma-4-26b-a4b-it:free'],
      openrouterMaxTokens: 240,
      openrouterAppTitle: 'CIRO',
    },
    { fetcher },
  );

  assert.equal(called, false);
  assert.equal(result.provider, 'fallback');
  assert.equal(result.fallbackReason, 'openrouter_key_missing');
  assert.equal(result.model, 'google/gemma-4-26b-a4b-it:free');
  assert.equal(result.content.includes('AI briefing unavailable'), true);
});

test('openrouter provider maps live chat completion without leaking the API key', async () => {
  const fetcher = async (url: string | URL | Request, init?: RequestInit) => {
    assert.equal(String(url), 'https://openrouter.ai/api/v1/chat/completions');
    assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer test-openrouter-key');
    assert.equal((init?.headers as Record<string, string>)['HTTP-Referer'], 'https://ciro.example');
    assert.equal((init?.headers as Record<string, string>)['X-OpenRouter-Title'], 'CIRO Judge Demo');

    const body = JSON.parse(String(init?.body));
    assert.equal(body.model, 'google/gemma-4-26b-a4b-it:free');
    assert.equal(body.max_tokens, 180);
    assert.equal(body.stream, false);
    assert.deepEqual(body.messages, [
      { role: 'system', content: 'You are a concise emergency operations assistant.' },
      { role: 'user', content: 'Summarize current dispatch risk.' },
    ]);

    return new Response(JSON.stringify({
      id: 'chatcmpl-test',
      model: 'google/gemma-4-26b-a4b-it:free',
      choices: [
        { message: { role: 'assistant', content: 'Dispatch risk is concentrated near the flooded corridor.' } },
      ],
      usage: {
        prompt_tokens: 19,
        completion_tokens: 11,
        total_tokens: 30,
      },
    }), { status: 200 });
  };

  const result = await getOpenRouterChatCompletion(
    {
      prompt: 'Summarize current dispatch risk.',
      systemPrompt: 'You are a concise emergency operations assistant.',
      model: 'google/gemma-4-26b-a4b-it:free',
      maxTokens: 999,
      temperature: 0.4,
    },
    {
      openrouterApiKey: 'test-openrouter-key',
      openrouterModel: 'google/gemma-4-26b-a4b-it:free',
      openrouterAllowedModels: ['google/gemma-4-26b-a4b-it:free'],
      openrouterMaxTokens: 180,
      openrouterSiteUrl: 'https://ciro.example',
      openrouterAppTitle: 'CIRO Judge Demo',
    },
    { fetcher },
  );

  assert.equal(result.provider, 'openrouter');
  assert.equal(result.content, 'Dispatch risk is concentrated near the flooded corridor.');
  assert.equal(result.model, 'google/gemma-4-26b-a4b-it:free');
  assert.equal(result.usage?.totalTokens, 30);
  assert.equal(JSON.stringify(result).includes('test-openrouter-key'), false);
});

test('openrouter provider rejects models outside the allowlist', async () => {
  await assert.rejects(
    () => getOpenRouterChatCompletion(
      { prompt: 'Use an expensive model.', model: 'openai/gpt-5.2' },
      {
        openrouterApiKey: 'test-openrouter-key',
        openrouterModel: 'google/gemma-4-26b-a4b-it:free',
        openrouterAllowedModels: ['google/gemma-4-26b-a4b-it:free'],
        openrouterMaxTokens: 240,
        openrouterAppTitle: 'CIRO',
      },
    ),
    (error) => {
      assert.equal(error instanceof OpenRouterValidationError, true);
      assert.equal((error as OpenRouterValidationError).code, 'model_not_allowed');
      return true;
    },
  );
});
