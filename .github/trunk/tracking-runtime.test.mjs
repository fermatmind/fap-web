import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, readFileSync, rmSync, statSync, chmodSync, symlinkSync, unlinkSync, realpathSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { tmpdir, userInfo } from 'node:os';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { validate, writeConfig, readConfig, runtimeEnv, guardPm2, probe } = require('./tracking-runtime.cjs');
const values = { TRACK_INGEST_TOKEN: 'fixture_only_not_a_live_token_123456789', TRACK_INGEST_API_ORIGIN: 'https://api.fermatmind.com' };
const temporary = (fn) => { const root = mkdtempSync(path.join(tmpdir(), 'tracking-contract-')); try { fn(root); } finally { rmSync(root, { recursive: true, force: true }); } };

test('runtime input is private, bounded, immutable, and confined to the two native origins', () => temporary(root => {
  const file = path.join(root, 'runtime.json'); writeConfig(file, values);
  assert.equal(statSync(file).mode & 0o777, 0o600); assert.deepEqual(readConfig(file), values);
  writeConfig(file, values);
  assert.throws(() => writeConfig(file, { ...values, TRACK_INGEST_TOKEN: values.TRACK_INGEST_TOKEN + 'different' }), /DRIFT/);
  for (const origin of ['http://api.fermatmind.com', 'https://api.fermatmind.com@evil.test', 'https://api.fermatmind.com/path', 'https://evil.test']) assert.throws(() => validate({ ...values, TRACK_INGEST_API_ORIGIN: origin }));
  assert.throws(() => validate({ ...values, TRACK_INGEST_TOKEN: 'short' }));
  assert.throws(() => validate({ ...values, OTHER: 'extra' }));
  chmodSync(file, 0o644); assert.throws(() => readConfig(file), /UNSAFE/);
}));
test('symlinks and malformed files are rejected without echoing contents', () => temporary(root => {
  const file = path.join(root, 'runtime.json'); writeConfig(file, values);
  const link = path.join(root, 'link.json'); symlinkSync(file, link); assert.throws(() => readConfig(link), /UNSAFE/);
  writeFileSync(path.join(root, 'invalid'), '{fixture-input', { mode: 0o600 });
  const p = spawnSync(process.execPath, ['.github/trunk/tracking-runtime.cjs', 'install', path.join(root, 'invalid'), path.join(root, 'out')], { encoding: 'utf8' });
  assert.equal(p.status, 1); assert.equal(p.stderr.trim(), 'tracking_runtime=CONFIGURATION_REJECTED');
  assert.equal(p.stderr.includes('fixture-input'), false); assert.equal(p.stderr.includes(root), false);
}));
test('PM2 metadata guard rejects broad directory/dump/backup permissions without changing them', () => temporary(root => {
  chmodSync(root, 0o700); guardPm2(root);
  for (const name of ['dump.pm2', 'dump.pm2.bak']) writeFileSync(path.join(root, name), 'fixture-only', { mode: 0o600 });
  guardPm2(root);
  chmodSync(path.join(root, 'dump.pm2.bak'), 0o664);
  assert.throws(() => guardPm2(root), /UNSAFE_PM2/);
  assert.equal(statSync(path.join(root, 'dump.pm2.bak')).mode & 0o777, 0o664);
  chmodSync(path.join(root, 'dump.pm2.bak'), 0o600); chmodSync(root, 0o755);
  assert.throws(() => guardPm2(root), /UNSAFE_PM2/);
  assert.equal(statSync(root).mode & 0o777, 0o755);
}));
test('PM2 loads the active runtime and explicitly clears token/origin for legacy LKG', () => temporary(root => {
  mkdirSync(path.join(root, '.next')); mkdirSync(path.join(root, 'new')); mkdirSync(path.join(root, 'old'));
  const config = path.join(root, 'ecosystem.config.cjs'); copyFileSync('ecosystem.config.cjs', config);
  writeConfig(path.join(root, 'new/.tracking-runtime.json'), values);
  symlinkSync(path.join(root, 'new'), path.join(root, '.next/standalone'));
  assert.deepEqual(Object.fromEntries(Object.keys(values).map(k => [k, require(config).apps[0].env[k]])), values);
  unlinkSync(path.join(root, '.next/standalone')); symlinkSync(path.join(root, 'old'), path.join(root, '.next/standalone'));
  delete require.cache[require.resolve(config)];
  assert.deepEqual(Object.fromEntries(Object.keys(values).map(k => [k, require(config).apps[0].env[k]])), runtimeEnv(path.join(root, 'absent')));
}));
test('candidate reads the same private input without secret command arguments or output', () => temporary(root => {
  const file = path.join(root, 'runtime.json'); writeConfig(file, values);
  const server = path.join(root, 'server.cjs');
  writeFileSync(server, `console.log(JSON.stringify({configured:!!process.env.TRACK_INGEST_TOKEN,originMatched:process.env.TRACK_INGEST_API_ORIGIN==='https://api.fermatmind.com'}));`);
  const args = ['.github/trunk/tracking-runtime.cjs', 'serve', file, server];
  assert.equal(args.join(' ').includes(values.TRACK_INGEST_TOKEN), false);
  const run = spawnSync(process.execPath, args, { encoding: 'utf8' });
  assert.equal(run.status, 0); assert.deepEqual(JSON.parse(run.stdout), { configured: true, originMatched: true });
  assert.equal(run.stdout.includes(values.TRACK_INGEST_TOKEN), false);
}));
test('only environment-bound activation handles tracking secrets; existing runtime contract is unchanged', () => {
  const workflow = readFileSync('.github/workflows/deploy.yml', 'utf8');
  assert.equal(workflow.split('\n  staging:')[0].includes('secrets.TRACK_INGEST_TOKEN'), false);
  assert.equal((workflow.match(/secrets\.TRACK_INGEST_TOKEN/g) || []).length, 2);
  assert.equal((workflow.match(/vars\.TRACK_INGEST_ENABLED == '1'/g) || []).length, 4);
  const staging = workflow.split('\n  staging:')[1].split('\n  production:')[0];
  assert.ok(staging.includes('https://staging-api.fermatmind.com')); assert.ok(staging.includes('environment: staging'));
  const production = workflow.split('\n  production:')[1];
  assert.ok(production.includes('environment: production-web-auto')); assert.ok(production.includes('https://api.fermatmind.com'));
  const transport = readFileSync('.github/trunk/deploy-web-release.sh', 'utf8');
  assert.ok(transport.includes('unset TRACK_INGEST_TOKEN')); assert.equal(transport.includes("TRACK_INGEST_TOKEN='$"), false);
  assert.ok(transport.includes('REQUIRE_TRACKING_INGEST_RUNTIME="${REQUIRE_TRACKING_INGEST_RUNTIME:-0}"'));
  assert.ok(transport.includes('if [[ "$REQUIRE_TRACKING_INGEST_RUNTIME" == "1" ]]'));
  const installer = readFileSync('scripts/install_standalone_release.sh', 'utf8');
  assert.ok(installer.indexOf('guard-pm2 "$TRACKING_RUNTIME_SOURCE"') < installer.indexOf('"$release_dir/.tracking-runtime.json"'));
  const deploy = readFileSync('scripts/deploy_web_pm2.sh', 'utf8');
  assert.ok(deploy.includes('serve "$STANDALONE_DIR/.tracking-runtime.json" server.js'));
  assert.ok(deploy.includes('(umask 077; pm2 save)'));
});

test('authentication probe sends no event and requires the missing-eventName validation response', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'tracking-probe-'));
  try {
    const file = path.join(root, 'runtime.json'); writeConfig(file, values);
    await probe(file, async (url, options) => {
      assert.equal(url, 'https://api.fermatmind.com/api/v0.5/seo/attribution/events');
      assert.equal(options.body, '{}'); assert.equal(options.redirect, 'error');
      assert.equal(options.headers.Authorization, `Bearer ${values.TRACK_INGEST_TOKEN}`);
      return Response.json({ ok: false, error_code: 'VALIDATION_FAILED', details: { eventName: ['required'] } }, { status: 422 });
    });
    for (const status of [200, 202, 401, 503]) await assert.rejects(probe(file, async () => Response.json({}, { status })), /PROBE_FAILED/);
    for (const body of [
      { ok: false, error_code: 'VALIDATION_FAILED', details: { path: ['unrelated'] } },
      { errors: { eventName: ['required'] } },
      { ok: true, error_code: 'VALIDATION_FAILED', details: { eventName: ['required'] } },
    ]) await assert.rejects(probe(file, async () => Response.json(body, { status: 422 })), /CONTRACT_FAILED/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

for (const secure of [true, false]) {
  test(`installer validates PM2 metadata before private tracking activation (secure=${secure})`, () => temporary(root => {
    const sha = 'a'.repeat(40), oldSha = 'b'.repeat(40);
    const app = path.join(root, 'app'), old = path.join(app, 'releases', oldSha), packageRoot = path.join(root, `fap-web-${sha}`);
    mkdirSync(old, { recursive: true }); mkdirSync(path.join(app, '.next')); mkdirSync(packageRoot);
    writeFileSync(path.join(old, 'REVISION'), oldSha); symlinkSync(old, path.join(app, '.next/standalone'));
    writeFileSync(path.join(packageRoot, 'REVISION'), sha); writeFileSync(path.join(packageRoot, 'server.js'), ''); writeFileSync(path.join(packageRoot, 'RELEASE_MANIFEST.json'), '{}');
    const archive = path.join(root, 'release.tar.gz'); assert.equal(spawnSync('tar', ['-czf', archive, '-C', root, `fap-web-${sha}`]).status, 0);
    const controller = path.join(root, 'deploy.sh'); writeFileSync(controller, '#!/usr/bin/env bash\nset -eu\nif [[ "${PREFLIGHT_ONLY:-0}" == 1 ]]; then test -f "$CANDIDATE_RELEASE_DIR/.tracking-runtime.json"; fi\n', { mode: 0o700 });
    const home = path.join(root, 'pm2'); mkdirSync(home, { mode: secure ? 0o700 : 0o755 });
    const source = path.join(root, 'tracking-input.json'); writeConfig(source, values);
    const outcome = path.join(root, 'outcome.json');
    const digest = value => createHash('sha256').update(value).digest('hex');
    const run = spawnSync('bash', ['scripts/install_standalone_release.sh'], { encoding: 'utf8', timeout: 10000,
      env: { ...process.env, APP_DIR: app, APP_USER: userInfo().username, APP_MANAGER: 'pm2', DEPLOY_SHA: sha, ARTIFACT_DIGEST: `sha256:${'c'.repeat(64)}`,
        ARCHIVE_SHA256: digest(readFileSync(archive)), RELEASE_MANIFEST_DIGEST: `sha256:${digest('{}')}`, RELEASE_ARCHIVE: archive,
        DEPLOY_SCRIPT: controller, ROLLING_RELOAD_SCRIPT: controller, DEPLOY_OUTCOME_PATH: outcome,
        REQUIRE_CONTENT_RELEASE_REVALIDATION: '0', REQUIRE_TRACKING_INGEST_RUNTIME: '1', TRACKING_RUNTIME_SOURCE: source,
        TRACKING_RUNTIME_HELPER: path.resolve('.github/trunk/tracking-runtime.cjs'), PM2_HOME: home } });
    assert.equal(run.error, undefined); assert.equal(run.status === 0, secure, run.stdout + run.stderr);
    assert.equal(run.stdout.includes(values.TRACK_INGEST_TOKEN), false); assert.equal(run.stderr.includes(values.TRACK_INGEST_TOKEN), false);
    assert.equal(existsSync(source), false); assert.equal(statSync(home).mode & 0o777, secure ? 0o700 : 0o755);
    if (secure) assert.deepEqual(readConfig(path.join(realpathSync(path.join(app, '.next/standalone')), '.tracking-runtime.json')), values);
    else assert.equal(realpathSync(path.join(app, '.next/standalone')), realpathSync(old));
    assert.equal(JSON.parse(readFileSync(outcome, 'utf8')).status, secure ? 'success' : 'failed');
  }));
}

for (const mode of ['download-failure', 'upload-failure', 'transport-disconnect', 'transport-signal', 'installer-success', 'installer-failure', 'installer-running', 'installer-wrong-sha', 'installer-signal', 'cleanup-failure']) {
  test(`tracking transport cleans only its exact input and preserves ambiguous installation (${mode})`, () => temporary(root => {
    const sha = 'a'.repeat(40), bin = path.join(root, 'bin'), runner = path.join(root, 'runner');
    const control = path.join(root, 'app/.deploy-incoming', `1-1-${sha.slice(0, 12)}`);
    mkdirSync(bin); mkdirSync(runner); mkdirSync(control, { recursive: true });
    const otherInput = path.join(control, 'other-input.json'); writeFileSync(otherInput, 'unrelated-fixture');
    const fixture = path.join(root, 'outcome.json');
    const status = ['installer-success', 'cleanup-failure'].includes(mode) ? 'success' : mode === 'installer-running' ? 'running' : 'failed';
    writeFileSync(fixture, JSON.stringify({ schema_version: 'fermatmind.deploy-outcome.v1', revision: mode === 'installer-wrong-sha' ? 'b'.repeat(40) : sha, status, phase: 'complete', exit_code: status === 'success' ? 0 : 7 }));
    const log = path.join(root, 'calls');
    const mocks = {
      ssh: `#!/usr/bin/env bash
set -eu
command="\${@: -1}"
if [[ "$command" == "mkdir -p '$MOCK_CONTROL' && chmod 700 '$MOCK_CONTROL'" ]]; then
  echo create >> "$CALL_LOG"; exit 0
elif [[ "$command" == "rm -f -- '$MOCK_CONTROL/tracking-runtime.json'" ]]; then
  echo cleanup >> "$CALL_LOG"
  [[ "$TEST_MODE" != cleanup-failure ]] || exit 7
  rm -f -- "$MOCK_CONTROL/tracking-runtime.json"; exit 0
elif [[ "$command" == *fetch-oss-release.sh* ]]; then
  echo fetch >> "$CALL_LOG"
  case "$TEST_MODE" in
    download-failure) exit 7 ;;
    transport-disconnect) exit 255 ;;
    transport-signal) kill -TERM "$PPID"; exit 143 ;;
    *) exit 0 ;;
  esac
elif [[ "$command" == *install_standalone_release.sh* ]]; then
  echo install >> "$CALL_LOG"
  if [[ "$TEST_MODE" == installer-signal ]]; then kill -TERM "$PPID"; exit 143; fi
  exit 255
fi
exit 91
`,
      scp: `#!/usr/bin/env bash
set -eu
last="\${@: -1}"
previous="\${@: -2:1}"
if [[ "$last" == "test@test.invalid:$MOCK_CONTROL/tracking-runtime.json" ]]; then
  echo upload >> "$CALL_LOG"; cp "$previous" "$MOCK_CONTROL/tracking-runtime.json"
  [[ "$TEST_MODE" != upload-failure ]] || exit 7
elif [[ "$last" != *:* ]]; then
  [[ "$previous" == "test@test.invalid:$MOCK_CONTROL/deploy-outcome.json" ]] || exit 92
  echo outcome >> "$CALL_LOG"; cp "$FIXTURE_OUTCOME" "$last"
fi
`,
      curl: `#!/usr/bin/env bash\nprintf '%s' '{"revision":"${sha}"}'\n`,
      sleep: '#!/usr/bin/env bash\nexit 0\n',
    };
    for (const [name, script] of Object.entries(mocks)) writeFileSync(path.join(bin, name), script, { mode: 0o700 });
    const run = spawnSync('bash', ['.github/trunk/deploy-web-release.sh'], { encoding: 'utf8', timeout: 15000,
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, TEST_MODE: mode, MOCK_CONTROL: control, CALL_LOG: log, FIXTURE_OUTCOME: fixture,
        DEPLOY_HOST: 'test.invalid', DEPLOY_USER: 'test', DEPLOY_PORT: '22', APP_DIR: path.join(root, 'app'), APP_NAME: 'fixture', APP_PORT: '3000',
        PUBLIC_BASE_URL: 'https://test.invalid', DEPLOY_SHA: sha, RELEASE_ARCHIVE_SHA256: 'b'.repeat(64), RELEASE_MANIFEST_DIGEST: `sha256:${'c'.repeat(64)}`, ARTIFACT_DIGEST: `sha256:${'d'.repeat(64)}`,
        GITHUB_RUN_ID: '1', GITHUB_RUN_ATTEMPT: '1', RUNNER_TEMP: runner, RELEASE_TRANSPORT_MODE: 'oss',
        OSS_BUCKET: 'fixture-bucket', OSS_INTERNAL_ENDPOINT: 'https://oss-cn-shanghai-internal.aliyuncs.com', OSS_REGION: 'cn-shanghai', OSS_OBJECT_KEY: 'fixture/archive.tar.gz', OSS_ECS_ROLE_NAME: 'fixture-role',
        REQUIRE_LLMS_FULL_ARTIFACT: '0', REQUIRE_CONTENT_RELEASE_REVALIDATION: '0', REQUIRE_TRACKING_INGEST_RUNTIME: '1', ...values } });
    assert.equal(run.error, undefined, run.stderr);
    assert.equal(run.status === 0, mode === 'installer-success', run.stdout + run.stderr);
    const calls = readFileSync(log, 'utf8').trim().split('\n');
    const installerStarted = mode.startsWith('installer-') || mode === 'cleanup-failure';
    const ambiguous = ['installer-running', 'installer-wrong-sha', 'installer-signal'].includes(mode);
    assert.equal(calls.filter(c => c === 'install').length, installerStarted ? 1 : 0);
    assert.equal(calls.includes('cleanup'), !ambiguous);
    assert.equal(existsSync(path.join(control, 'tracking-runtime.json')), ambiguous || mode === 'cleanup-failure');
    if (installerStarted && !ambiguous) assert.ok(calls.indexOf('outcome') < calls.indexOf('cleanup'));
    if (ambiguous) assert.ok(run.stderr.includes('deferred_until_exact_sha_terminal_outcome'));
    if (mode === 'cleanup-failure') assert.ok(run.stderr.includes('tracking_input_cleanup=unconfirmed'));
    if (mode.endsWith('signal')) assert.equal(run.status, 143);
    assert.equal(readdirSync(runner).some(f => f.startsWith('tracking-runtime.')), false);
    assert.equal(readFileSync(otherInput, 'utf8'), 'unrelated-fixture');
    assert.equal((run.stdout + run.stderr).includes(values.TRACK_INGEST_TOKEN), false);
  }));
}
