const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateEnvironment } = require('../src/config/environment');
test('reject missing signing secret and incomplete production configuration', () => {
    assert.throws(() => validateEnvironment({}), /JWT_SECRET/);
    assert.throws(() => validateEnvironment({ JWT_SECRET: 'x'.repeat(40), NODE_ENV: 'production' }), /MONGO_URI/);
    const env = { JWT_SECRET: 'x'.repeat(40), NODE_ENV: 'production', MONGO_URI: 'mongodb://db/demo', UPLOAD_DIR: '/data/uploads' };
    assert.throws(() => validateEnvironment({ ...env, ALLOWED_ORIGINS: '*' }), /HTTPS/);
    assert.throws(() => validateEnvironment({ ...env, ALLOWED_ORIGINS: 'https://example.test/path' }), /HTTPS/);
    assert.doesNotThrow(() => validateEnvironment({ ...env, ALLOWED_ORIGINS: 'https://example.test' }));
});
