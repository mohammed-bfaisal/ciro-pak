import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readEnv } from './env.js';

test('readEnv defaults OpenRouter to the currently available free model with a tight token cap', () => {
  const env = readEnv({});

  assert.equal(env.openrouterModel, 'google/gemma-4-26b-a4b-it:free');
  assert.deepEqual(env.openrouterAllowedModels, ['google/gemma-4-26b-a4b-it:free']);
  assert.equal(env.openrouterMaxTokens, 240);
});
