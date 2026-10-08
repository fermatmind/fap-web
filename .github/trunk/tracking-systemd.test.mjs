import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, realpathSync, symlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir, userInfo } from 'node:os';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { writeConfig, installRelease, guardSystemd, readback } = require('./tracking-runtime.cjs');
const token = 'fixture_only_not_a_live_token_123456789';
const values = { TRACK_INGEST_TOKEN: token, TRACK_INGEST_API_ORIGIN: 'https://staging-api.fermatmind.com' };
const sha = 'a'.repeat(40), oldSha = 'b'.repeat(40);
async function temporary(fn) { const root = mkdtempSync(path.join(tmpdir(), 'systemd-contract-')); try { await fn(root); } finally { rmSync(root, { recursive: true, force: true }); } }
function installed(root) {
  const source = path.join(root, 'input.json'); writeConfig(source, values); writeFileSync(path.join(root, 'REVISION'), sha);
  const file = path.join(root, '.tracking-runtime.json'); installRelease(source, file); return file;
}
test('systemd guard inspects the existing entry and never performs a write or restart', () => temporary(root => {
  const source = path.join(root, 'input.json'); writeConfig(source, values);
  const previous = { APP_DIR: process.env.APP_DIR, SYSTEMD_SERVICE: process.env.SYSTEMD_SERVICE };
  process.env.APP_DIR = root; process.env.SYSTEMD_SERVICE = 'fap-web-staging.service';
  try {
    const base = { User: userInfo().username, Group: 'fixture-group', WorkingDirectory: `${root}/.next/standalone`, EnvironmentFiles: '', ExecStart: '{ path=/usr/bin/node ; argv[]=/usr/bin/node server.js ; ignore_errors=no ; }' };
    for (const mode of ['valid', 'user', 'group', 'directory', 'environment-file', 'binary', 'extra-argument', 'unparsed', 'unavailable']) {
      const fields = { ...base }; if (mode === 'user') fields.User = 'root'; if (mode === 'group') fields.Group = 'other';
      if (mode === 'directory') fields.WorkingDirectory = `${root}/other`; if (mode === 'environment-file') fields.EnvironmentFiles = '/fixture/env';
      if (mode === 'binary') fields.ExecStart = fields.ExecStart.replaceAll('/usr/bin/node', '/other/node');
      if (mode === 'extra-argument') fields.ExecStart = fields.ExecStart.replace('server.js ;', 'server.js --extra ;');
      if (mode === 'unparsed') fields.ExecStart = 'not-supported';
      const calls = []; const run = (command, args) => {
        calls.push([command, ...args]);
        if (command === 'id') return { status: 0, stdout: 'fixture-group\n' };
        return { status: mode === 'unavailable' ? 1 : 0, stdout: Object.entries(fields).map(([k, v]) => `${k}=${v}`).join('\n') };
      };
      if (mode === 'valid') guardSystemd(source, run); else assert.throws(() => guardSystemd(source, run));
      assert.equal(calls.some(call => call.includes('restart') || call.includes('daemon-reload')), false);
      assert.equal(JSON.stringify(calls).includes(token), false);
    }
  } finally { for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } }
}));
test('release install binds a nonsecret marker, preserves immutable values, and rejects unsafe authority', () => temporary(root => {
  const file = installed(root); const marker = path.join(root, '.tracking-runtime-managed.json');
  const text = readFileSync(marker, 'utf8'); assert.equal(text.includes(token), false);
  assert.equal(JSON.parse(text).revision, sha); installRelease(path.join(root, 'input.json'), file);
  writeFileSync(marker, '{}'); assert.throws(() => installRelease(path.join(root, 'input.json'), file), /DRIFT/);
  assert.equal(JSON.parse(readFileSync(file)).TRACK_INGEST_TOKEN, token);
}));
test('runtime readback uses only loopback HEAD and rejects absent, wrong, disabled, or malformed receipts', () => temporary(async root => {
  const file = installed(root);
  const response = (mode) => new Response(null, { status: mode === 'http' ? 503 : 200, headers: {
    'X-FermatMind-Tracking-Configured': mode === 'disabled' ? '0' : mode === 'missing' ? '' : '1',
    'X-FermatMind-Tracking-Revision': mode === 'wrong-sha' ? oldSha : mode === 'missing' ? '' : sha,
  } });
  let calls = 0;
  await readback(file, 'http://127.0.0.1:3101', async (url, options) => {
    calls++; assert.equal(String(url), 'http://127.0.0.1:3101/api/track'); assert.equal(options.method, 'HEAD');
    assert.equal(options.redirect, 'error'); assert.equal(options.body, undefined); assert.equal(options.headers, undefined);
    return response('valid');
  }, '1'); assert.equal(calls, 1);
  for (const mode of ['http', 'disabled', 'missing', 'wrong-sha']) await assert.rejects(readback(file, 'http://127.0.0.1:3101', async () => response(mode), '1'));
  for (const base of ['https://fermatmind.com', 'http://evil.test', 'http://127.0.0.1:3101/other', 'http://127.0.0.1:3101/?secret=fixture']) await assert.rejects(readback(file, base, async () => { throw new Error('must not fetch'); }, '1'));
  await assert.rejects(readback(file, 'http://127.0.0.1:3101', async () => response('valid'), '0'), /EXPECTATION/);
}));
test('explicit disabled readback rejects a legacy HTTP200 and missing managed authority cannot downgrade', () => temporary(async root => {
  writeFileSync(path.join(root, 'REVISION'), sha); const file = path.join(root, '.tracking-runtime.json');
  await readback(file, 'http://127.0.0.1:3101', async () => new Response(null, { headers: { 'X-FermatMind-Tracking-Configured': '0', 'X-FermatMind-Tracking-Revision': sha } }), '0');
  await assert.rejects(readback(file, 'http://127.0.0.1:3101', async () => new Response(null), '0'));
  await assert.rejects(readback(file, 'http://127.0.0.1:3101', async () => new Response(null), '1'), /EXPECTATION/);
  writeFileSync(path.join(root, '.tracking-runtime-managed.json'), '{}');
  await assert.rejects(readback(file, 'http://127.0.0.1:3101', async () => new Response(null), '0'), /AUTHORITY_MISSING/);
}));

for (const mode of ['enabled', 'disabled', 'unsupported-unit', 'failed-preflight', 'failed-active-old-enabled', 'failed-active-old-disabled', 'signal-term', 'signal-hup']) {
  test(`real installer and server consumer preserve systemd release boundaries (${mode})`, () => temporary(root => {
    const app = path.join(root, 'app'), old = path.join(app, 'releases', oldSha), packageRoot = path.join(root, `fap-web-${sha}`);
    mkdirSync(old, { recursive: true }); mkdirSync(path.join(app, '.next')); mkdirSync(packageRoot);
    writeFileSync(path.join(old, 'REVISION'), oldSha); symlinkSync(old, path.join(app, '.next/standalone'));
    const oldEnabled = mode !== 'failed-active-old-disabled';
    if (oldEnabled) {
      const oldInput = path.join(root, 'old-input.json'); writeConfig(oldInput, { ...values, TRACK_INGEST_TOKEN: 'old_fixture_only_not_a_live_token_123456' });
      installRelease(oldInput, path.join(old, '.tracking-runtime.json'));
    }
    writeFileSync(path.join(packageRoot, 'REVISION'), sha); writeFileSync(path.join(packageRoot, 'server.js'), ''); writeFileSync(path.join(packageRoot, 'RELEASE_MANIFEST.json'), '{}');
    const archive = path.join(root, 'release.tar.gz'); assert.equal(spawnSync('tar', ['-czf', archive, '-C', root, `fap-web-${sha}`]).status, 0);
    const bin = path.join(root, 'bin'); mkdirSync(bin); const group = spawnSync('id', ['-gn'], { encoding: 'utf8' }).stdout.trim();
    writeFileSync(path.join(bin, 'systemctl'), `#!/usr/bin/env bash\n[[ "$1" == show ]] || exit 92\nprintf '%s\\n' 'User=${userInfo().username}' 'Group=${group}' 'WorkingDirectory=${app}/${mode === 'unsupported-unit' ? 'wrong' : '.next/standalone'}' 'EnvironmentFiles=' 'ExecStart={ path=/usr/bin/node ; argv[]=/usr/bin/node server.js ; }'\n`, { mode: 0o700 });
    const harness = path.join(root, 'consumer.mts'), events = path.join(root, 'consumer-events');
    writeFileSync(harness, `import { resolveTrackingRuntime } from ${JSON.stringify(path.resolve('lib/tracking/serverRuntime.ts'))};\nimport { appendFileSync, realpathSync } from 'node:fs';\nconst r=resolveTrackingRuntime(realpathSync(process.argv[2]),{});appendFileSync(process.env.CONSUMER_LOG!,JSON.stringify({revision:r.revision,configured:!!r.token,oldMatched:r.token==='old_fixture_only_not_a_live_token_123456'})+'\\n');\n`);
    const controller = path.join(root, 'controller.sh');
    writeFileSync(controller, `#!/usr/bin/env bash\nset -eu\nnode --disable-warning=ExperimentalWarning --experimental-strip-types '${harness}' "\${CANDIDATE_RELEASE_DIR:-$APP_DIR/.next/standalone}"\nif [[ "$DEPLOY_SHA" == '${sha}' ]]; then\n if [[ "$TEST_MODE" == failed-preflight && "\${PREFLIGHT_ONLY:-0}" == 1 ]]; then exit 7; fi\n if [[ "$TEST_MODE" == failed-active-* && "\${PREFLIGHT_ONLY:-0}" == 0 ]]; then exit 7; fi\n if [[ "$TEST_MODE" == signal-* && "\${PREFLIGHT_ONLY:-0}" == 0 ]]; then signal=TERM; [[ "$TEST_MODE" != signal-hup ]] || signal=HUP; kill -"$signal" "$(cat "$INSTALLER_PID_FILE")"; exit 7; fi\nfi\n`, { mode: 0o700 });
    const source = path.join(root, 'input.json'); const enabled = mode !== 'disabled'; if (enabled) writeConfig(source, values);
    const outcome = path.join(root, 'outcome.json'); const digest = data => createHash('sha256').update(data).digest('hex');
    const run = spawnSync('bash', ['-c', 'echo $$ > "$INSTALLER_PID_FILE"; exec bash scripts/install_standalone_release.sh'], { encoding: 'utf8', timeout: 15000, env: {
      ...process.env, PATH: `${bin}:${process.env.PATH}`, APP_DIR: app, APP_USER: userInfo().username, APP_MANAGER: 'systemd', SYSTEMD_SERVICE: 'fap-web-staging.service',
      DEPLOY_SHA: sha, ARTIFACT_DIGEST: `sha256:${'c'.repeat(64)}`, ARCHIVE_SHA256: digest(readFileSync(archive)), RELEASE_MANIFEST_DIGEST: `sha256:${digest('{}')}`,
      RELEASE_ARCHIVE: archive, DEPLOY_SCRIPT: controller, ROLLING_RELOAD_SCRIPT: controller, DEPLOY_OUTCOME_PATH: outcome, REQUIRE_CONTENT_RELEASE_REVALIDATION: '0',
      REQUIRE_TRACKING_INGEST_RUNTIME: enabled ? '1' : '0', TRACKING_RUNTIME_SOURCE: source, TRACKING_RUNTIME_HELPER: path.resolve('.github/trunk/tracking-runtime.cjs'),
      TEST_MODE: mode, CONSUMER_LOG: events, INSTALLER_PID_FILE: path.join(root, 'installer.pid'), TRACK_INGEST_TOKEN: 'stale_fixture_inherited_token_12345678',
    } });
    assert.equal(run.error, undefined); const success = ['enabled', 'disabled'].includes(mode);
    assert.equal(run.status === 0, success, run.stdout + run.stderr); const result = JSON.parse(readFileSync(outcome));
    assert.equal(result.status, success ? 'success' : 'failed'); assert.equal(existsSync(source), false);
    assert.equal(run.stdout.includes(token), false); assert.equal(run.stderr.includes(token), false);
    assert.equal(run.stdout.includes('old_fixture_only_not_a_live_token_123456'), false); assert.equal(run.stderr.includes('old_fixture_only_not_a_live_token_123456'), false);
    if (!success) assert.equal(realpathSync(path.join(app, '.next/standalone')), realpathSync(old));
    if (mode.startsWith('failed-active') || mode.startsWith('signal-')) {
      if (mode.startsWith('signal-')) assert.equal(result.signal, mode === 'signal-hup' ? 'HUP' : 'TERM');
      assert.equal(result.rollback, 'restored'); const reads = readFileSync(events, 'utf8').trim().split('\n').map(JSON.parse);
      assert.deepEqual(reads.at(-1), { revision: oldSha, configured: oldEnabled, oldMatched: oldEnabled });
    }
    if (success) { const reads = readFileSync(events, 'utf8').trim().split('\n').map(JSON.parse); assert.equal(reads.length, 2); assert.equal(reads[1].configured, enabled); assert.equal(reads[1].revision, sha); }
    if (mode === 'unsupported-unit') assert.equal(existsSync(events), false);
  }));
}
