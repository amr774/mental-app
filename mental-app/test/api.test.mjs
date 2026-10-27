import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = (await readFile(new URL('../src/services/api.js', import.meta.url), 'utf8'))
  .replace('import.meta.env.VITE_API_URL', '"http://api.example.test"');
const { journalService, emotionService } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
test('permission denial preserves the session; authentication failure expires it', async () => {
  let removed = false; let expired = false;
  globalThis.localStorage = { getItem: () => JSON.stringify({ token: 'test-token' }), removeItem: () => { removed = true; } };
  globalThis.window = { dispatchEvent: () => { expired = true; } };
  globalThis.fetch = async () => new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
  await assert.rejects(journalService.getAll(), /Forbidden/);
  assert.equal(removed, false); assert.equal(expired, false);
  globalThis.fetch = async () => new Response('{}', { status: 401 });
  await assert.rejects(journalService.getAll(), /Session expired/);
  assert.equal(removed, true); assert.equal(expired, true);
});
test('emotion requests use the backend and bearer authentication', async () => {
  globalThis.localStorage = { getItem: () => JSON.stringify({ token: 'test-token' }) };
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'http://api.example.test/emotion/predict');
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    assert.deepEqual(JSON.parse(options.body), { image_base64: 'synthetic' });
    return new Response('{}');
  };
  await emotionService.predict('synthetic');
});
