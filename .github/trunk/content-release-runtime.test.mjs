import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, chmodSync, copyFileSync, readFileSync, rmSync, statSync, symlinkSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { KEYS, validate, writeConfig, readConfig, probe } from './content-release-runtime.mjs';

const values = { [KEYS[0]]: 'fixture-secret-only-for-runtime-tests', [KEYS[1]]: 'https://redis.example.test', [KEYS[2]]: 'fixture-replay-token' };
test('runtime credentials stay private and immutable; malformed or missing inputs fail closed', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'runtime-config-'));
  try {
    const file = path.join(root, 'runtime.json');
    writeConfig(file, values);
    assert.equal(statSync(file).mode & 0o777, 0o600);
    assert.deepEqual(readConfig(file), values);
    writeConfig(file, values);
    assert.throws(() => writeConfig(file, { ...values, [KEYS[0]]: values[KEYS[0]] + 'changed' }), /DRIFT/);
    assert.throws(() => validate({ ...values, [KEYS[0]]: '' }), /MISSING/);
    assert.throws(() => validate({ ...values, [KEYS[1]]: 'http://redis.example.test' }), /URL/);
    assert.throws(() => validate({ ...values, EXTRA: 'not allowed' }), /KEYS/);
    chmodSync(file, 0o644);
    assert.throws(() => readConfig(file), /UNSAFE/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test('PM2 authentication follows the active release and clears values on legacy rollback', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'runtime-lkg-'));
  const require = createRequire(import.meta.url);
  try {
    mkdirSync(path.join(root, '.next')); mkdirSync(path.join(root, 'new')); mkdirSync(path.join(root, 'old'));
    const config = path.join(root, 'ecosystem.config.cjs');
    copyFileSync('ecosystem.config.cjs', config);
    writeConfig(path.join(root, 'new/.content-release-runtime.json'), values);
    symlinkSync(path.join(root, 'new'), path.join(root, '.next/standalone'));
    const first = require(config).apps[0].env;
    for (const key of KEYS) assert.equal(first[key], values[key]);
    unlinkSync(path.join(root, '.next/standalone'));
    symlinkSync(path.join(root, 'old'), path.join(root, '.next/standalone'));
    delete require.cache[require.resolve(config)];
    const rollback = require(config).apps[0].env;
    for (const key of KEYS) assert.equal(rollback[key], '');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test('live authentication smoke signs the exact bytes and never invalidates content', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'runtime-probe-'));
  try {
    const file = path.join(root, 'config.json'); writeConfig(file, values);
    await probe(file, 'https://example.test/api/content-release/revalidate', async (_url, options) => {
      const headers = options.headers;
      assert.equal(options.body, '{}'); assert.equal(options.redirect, 'error'); assert.ok(options.signal instanceof AbortSignal);
      const signed = `${headers['X-FM-Content-Release-Timestamp']}.${headers['X-FM-Content-Release-Nonce']}.${options.body}`;
      assert.equal(headers['X-FM-Content-Release-Signature'], `sha256=${createHmac('sha256', values[KEYS[0]]).update(signed).digest('hex')}`);
      return Response.json({ ok: true, revalidated_paths: [], rejected_paths: [], invalidated_tags: [] });
    });
    await assert.rejects(probe(file, 'https://example.test/api/content-release/revalidate', async () => Response.json({}, { status: 401 })), /HTTP_401/);
    await assert.rejects(probe(file, 'https://example.test/api/content-release/revalidate', async () => Response.json({ ok: true, revalidated_paths: ['/llms-full.txt'], rejected_paths: [], invalidated_tags: [] })), /CONTRACT/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test('only the existing production activation receives credentials; builds and staging remain independent', () => {
  const workflow = readFileSync('.github/workflows/deploy.yml', 'utf8');
  const production = workflow.split('\n  production:')[1];
  for (const key of KEYS) {
    assert.ok(production.includes(`secrets.${key}`));
    assert.equal(workflow.split('\n  production:')[0].includes(`secrets.${key}`), false);
  }
  assert.ok(production.includes('REQUIRE_CONTENT_RELEASE_REVALIDATION: "1"'));
});
