import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readEnv } from './env.js';

test('readEnv defaults OpenRouter to the cheap hosted model with a tight token cap', () => {
  const env = readEnv({});

  assert.equal(env.openrouterModel, 'mistralai/mistral-nemo');
  assert.deepEqual(env.openrouterAllowedModels, ['mistralai/mistral-nemo']);
  assert.equal(env.openrouterMaxTokens, 240);
});
