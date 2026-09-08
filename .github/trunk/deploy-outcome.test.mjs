import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, symlinkSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir, userInfo } from 'node:os';
import path from 'node:path';

const sha = 'a'.repeat(40);
const oldSha = 'b'.repeat(40);
const digest = (value) => createHash('sha256').update(value).digest('hex');

for (const mode of ['success', 'preflight-failure', 'failure', 'timeout', 'rollback-failure', 'signal', 'hangup']) {
  test(`installer records ${mode} without losing the previous release`, () => {
    const root = mkdtempSync(path.join(tmpdir(), 'release-outcome-'));
    try {
      const app = path.join(root, 'app');
      const old = path.join(app, 'releases', oldSha);
      const packageRoot = path.join(root, `fap-web-${sha}`);
      mkdirSync(old, { recursive: true });
      mkdirSync(path.join(app, '.next'), { recursive: true });
      mkdirSync(packageRoot);
      writeFileSync(path.join(old, 'REVISION'), oldSha);
      symlinkSync(old, path.join(app, '.next/standalone'));
      writeFileSync(path.join(packageRoot, 'REVISION'), sha);
      writeFileSync(path.join(packageRoot, 'server.js'), '');
      writeFileSync(path.join(packageRoot, 'RELEASE_MANIFEST.json'), '{}');
      const archive = path.join(root, 'release.tar.gz');
      assert.equal(spawnSync('tar', ['-czf', archive, '-C', root, `fap-web-${sha}`]).status, 0);
      const deploy = path.join(root, 'deploy.sh');
      writeFileSync(deploy, `#!/usr/bin/env bash
set -eu
if [[ "\${PREFLIGHT_ONLY:-0}" == 1 ]]; then
  [[ "$TEST_MODE" != preflight-failure ]]
  exit $?
fi
if [[ "$DEPLOY_SHA" == '${oldSha}' ]]; then
  [[ "$TEST_MODE" != rollback-failure ]]
  exit $?
fi
case "$TEST_MODE" in
  success) exit 0 ;;
  timeout) sleep 10 ;;
  signal) kill -TERM "$(ps -o ppid= -p "$PPID" | tr -d ' ')"; sleep 1 ;;
  hangup) kill -HUP "$(ps -o ppid= -p "$PPID" | tr -d ' ')"; sleep 1 ;;
  *) exit 7 ;;
esac
`, { mode: 0o700 });
      const outcome = path.join(root, 'outcome.json');
      const result = spawnSync('bash', ['scripts/install_standalone_release.sh'], {
        env: { ...process.env, APP_DIR: app, APP_USER: userInfo().username, DEPLOY_SHA: sha,
          ARTIFACT_DIGEST: `sha256:${'c'.repeat(64)}`, ARCHIVE_SHA256: digest(readFileSync(archive)),
          RELEASE_MANIFEST_DIGEST: `sha256:${digest('{}')}`, RELEASE_ARCHIVE: archive,
          DEPLOY_SCRIPT: deploy, ROLLING_RELOAD_SCRIPT: deploy, TEST_MODE: mode,
          DEPLOY_OUTCOME_PATH: outcome, DEPLOY_VERIFY_TIMEOUT_SECONDS: '1' },
        encoding: 'utf8', timeout: 15000,
      });
      assert.equal(result.error, undefined, result.stderr);
      const receipt = JSON.parse(readFileSync(outcome, 'utf8'));
      assert.equal(receipt.revision, sha);
      if (mode === 'success') {
        assert.equal(result.status, 0, result.stdout + result.stderr);
        assert.equal(receipt.status, 'success');
        assert.equal(receipt.phase, 'complete');
        assert.equal(realpathSync(path.join(app, 'releases/previous')), realpathSync(old));
      } else {
        assert.notEqual(result.status, 0);
        assert.equal(receipt.status, 'failed');
        assert.equal(realpathSync(path.join(app, '.next/standalone')), realpathSync(old));
        assert.equal(receipt.rollback, mode === 'preflight-failure' ? 'not_needed' : mode === 'rollback-failure' ? 'failed' : 'restored', result.stdout + result.stderr);
        if (mode === 'timeout') assert.equal(receipt.exit_code, 124);
        if (mode === 'signal') assert.equal(receipt.signal, 'TERM');
        if (mode === 'hangup') assert.equal(receipt.signal, 'HUP');
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
}

for (const status of ['success', 'failed']) {
  test(`SSH disconnect reconciles ${status} by reading receipts without a second activation`, () => {
    const root = mkdtempSync(path.join(tmpdir(), 'release-transport-'));
    try {
      const bin = path.join(root, 'bin');
      mkdirSync(bin);
      const receipt = path.join(root, 'fixture.json');
      writeFileSync(receipt, JSON.stringify({ schema_version: 'fermatmind.deploy-outcome.v1', revision: sha, status, phase: 'complete', exit_code: status === 'success' ? 0 : 7 }));
      const calls = path.join(root, 'calls');
      writeFileSync(path.join(bin, 'ssh'), '#!/usr/bin/env bash\necho call >> "$CALL_LOG"\ncase "$*" in *install_standalone_release.sh*) exit 255 ;; esac\n', { mode: 0o700 });
      writeFileSync(path.join(bin, 'scp'), '#!/usr/bin/env bash\nlast="${@: -1}"\nif [[ "$last" != *:* ]]; then cp "$FIXTURE_OUTCOME" "$last"; fi\n', { mode: 0o700 });
      writeFileSync(path.join(bin, 'curl'), `#!/usr/bin/env bash\nprintf '%s' '{"revision":"${sha}"}'\n`, { mode: 0o700 });
      const result = spawnSync('bash', ['.github/trunk/deploy-web-release.sh'], {
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, CALL_LOG: calls, FIXTURE_OUTCOME: receipt,
          DEPLOY_HOST: 'test.invalid', DEPLOY_USER: 'test', DEPLOY_PORT: '22', APP_DIR: `${root}/app`, APP_NAME: 'test', APP_PORT: '3000',
          PUBLIC_BASE_URL: 'https://test.invalid', DEPLOY_SHA: sha, RELEASE_ARCHIVE: `${root}/archive`, RELEASE_ARCHIVE_SHA256: 'd'.repeat(64),
          RELEASE_MANIFEST_DIGEST: `sha256:${'c'.repeat(64)}`, ARTIFACT_DIGEST: `sha256:${'e'.repeat(64)}`,
          GITHUB_RUN_ID: '1', GITHUB_RUN_ATTEMPT: '1', RUNNER_TEMP: root, REQUIRE_LLMS_FULL_ARTIFACT: '0' },
        encoding: 'utf8', timeout: 10000,
      });
      assert.equal(result.error, undefined);
      assert.equal(result.status === 0, status === 'success', result.stdout + result.stderr);
      assert.equal(readFileSync(calls, 'utf8').trim().split('\n').length, 2);
      assert.equal(JSON.parse(readFileSync(path.join(root, 'deploy-outcome.json'), 'utf8')).status, status);
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });
}
