import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { chmodSync, lstatSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validate, readConfig, writeConfig } from './pdf-print-runtime.mjs';

const key = 'a'.repeat(64);
const helper = path.resolve('.github/trunk/pdf-print-runtime.mjs');
const temporary = fn => { const root = mkdtempSync(path.join(tmpdir(), 'pdf-print-runtime-')); try { fn(root); } finally { rmSync(root, { recursive: true, force: true }); } };

test('private release config is immutable and readable only by its owner', () => temporary(root => {
  const file = path.join(root, '.env.production.local');
  writeConfig(file, validate(key));
  writeConfig(file, validate(key));
  assert.equal(lstatSync(file).mode & 0o777, 0o600);
  assert.throws(() => writeConfig(file, validate('b'.repeat(64))), /IMMUTABLE_CONFLICT/);
  assert.equal(readConfig(file), validate(key));
}));

test('invalid values, publicly readable files and symlinks fail closed without leaking keys', () => temporary(root => {
  for (const invalid of ['', 'x'.repeat(64), key+'\n', 'short']) assert.throws(() => validate(invalid), /KEY_INVALID/);
  const file = path.join(root, 'input');
  writeConfig(file, validate(key));
  chmodSync(file, 0o644);
  assert.throws(() => readConfig(file), /FILE_UNSAFE/);
  chmodSync(file, 0o600);
  const link = path.join(root, 'link'); symlinkSync(file, link);
  assert.throws(() => writeConfig(link, validate(key)), /FILE_UNSAFE/);
  writeFileSync(file, validate(key)+'APP_KEY=unrelated\n');
  assert.throws(() => readConfig(file), /FILE_INVALID/);
  const run = spawnSync(process.execPath, [helper, 'from-env', path.join(root, 'new')], { env: { ...process.env, GOTENBERG_RESULT_PRINT_TOKEN_SECRET: key+'\n' }, encoding: 'utf8' });
  assert.notEqual(run.status, 0); assert.equal(run.stderr.includes(key), false);
}));

test('only activation jobs receive the dedicated secret and installer config precedes candidate preflight', () => {
  const workflow = readFileSync('.github/workflows/deploy.yml', 'utf8');
  assert.equal((workflow.match(/GOTENBERG_RESULT_PRINT_TOKEN_SECRET: \$\{\{ secrets.GOTENBERG_RESULT_PRINT_TOKEN_SECRET \}\}/g) || []).length, 2);
  assert.equal(readFileSync('.github/workflows/ci.yml', 'utf8').includes('secrets.GOTENBERG_RESULT_PRINT_TOKEN_SECRET'), false);
  const installer = readFileSync('scripts/install_standalone_release.sh', 'utf8');
  assert.ok(installer.indexOf('"$release_dir/.env.production.local"') < installer.indexOf('PREFLIGHT_ONLY=1 CANDIDATE_RELEASE_DIR='));
});
