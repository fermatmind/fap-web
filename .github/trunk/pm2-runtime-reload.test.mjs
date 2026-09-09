import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, readFileSync, rmSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { KEYS, writeConfig } from './content-release-runtime.mjs';

for (const failReload of [false, true]) {
  test(`existing PM2 workers load active credentials and clear them on LKG rollback (fallback=${failReload})`, () => {
    const root = mkdtempSync(path.join(tmpdir(), 'pm2-reload-'));
    try {
      mkdirSync(path.join(root, '.next/standalone'), { recursive: true });
      copyFileSync('ecosystem.config.cjs', path.join(root, 'ecosystem.config.cjs'));
      const runtimeFile = path.join(root, '.next/standalone/.content-release-runtime.json');
      const credentials = { [KEYS[0]]: 'fixture-active-signing-secret', [KEYS[1]]: 'https://redis.example.test', [KEYS[2]]: 'fixture-token' };
      writeConfig(runtimeFile, credentials);
      const fake = path.join(root, 'pm2');
      writeFileSync(fake, `#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const [command, target, ...flags] = process.argv.slice(2);
const root = process.env.APP_DIR;
if (command === 'jlist') {
  console.log(JSON.stringify(Array.from({length: 2}, () => ({ name: 'fap-web', pm2_env: { status: 'online', exec_mode: 'cluster_mode', pm_exec_path: path.join(root, '.next/standalone/server.js') } }))));
} else if (command === 'reload' || command === 'restart') {
  if (command === 'reload' && process.env.FAIL_RELOAD === '1') process.exit(1);
  if (target !== path.join(root, 'ecosystem.config.cjs') || flags.join(' ') !== '--only fap-web --update-env') process.exit(2);
  fs.writeFileSync(path.join(root, 'worker-env.json'), JSON.stringify(require(target).apps[0].env));
} else { process.exit(3); }
`, { mode: 0o755 });
      const run = () => {
        const result = spawnSync('bash', ['scripts/rolling_reload_pm2.sh', 'fap-web'], {
          encoding: 'utf8', env: { ...process.env, APP_DIR: root, PM2_BIN: fake, PM2_INSTANCES: '2', FAIL_RELOAD: failReload ? '1' : '0' },
        });
        assert.equal(result.status, 0, result.stderr + result.stdout);
        return JSON.parse(readFileSync(path.join(root, 'worker-env.json'), 'utf8'));
      };
      const active = run();
      for (const key of KEYS) assert.equal(active[key], credentials[key]);
      unlinkSync(runtimeFile);
      const rollback = run();
      for (const key of KEYS) assert.equal(rollback[key], '');
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
}

test('post-reload retirement also loads the active ecosystem configuration', () => {
  const script = readFileSync('scripts/deploy_web_pm2.sh', 'utf8');
  assert.ok(script.includes('pm2 restart "${APP_DIR}/ecosystem.config.cjs" --only "$APP_NAME" --update-env'));
  assert.equal(script.includes('pm2 restart "$APP_NAME" --update-env'), false);
});
