/* eslint-disable @typescript-eslint/no-require-imports -- Standalone deployment helper runs as CommonJS without application dependencies. */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn, spawnSync } = require('node:child_process');

const KEYS = ['TRACK_INGEST_TOKEN', 'TRACK_INGEST_API_ORIGIN'];
const ORIGINS = ['https://api.fermatmind.com', 'https://staging-api.fermatmind.com'];
function validate(values) {
  if (!values || typeof values !== 'object' || Object.keys(values).length !== KEYS.length) throw new Error('INVALID_TRACKING_KEYS');
  const token = values[KEYS[0]];
  if (typeof token !== 'string' || token.length < 32 || token.length > 8192 || !/^[A-Za-z0-9_-]+$/.test(token)) throw new Error('INVALID_TRACKING_TOKEN');
  if (!ORIGINS.includes(values[KEYS[1]])) throw new Error('INVALID_TRACKING_ORIGIN');
  return Object.fromEntries(KEYS.map(key => [key, values[key]]));
}
function readConfig(file) {
  const s = fs.lstatSync(file);
  if (!s.isFile() || s.isSymbolicLink() || s.size > 16384 || (s.mode & 0o077) !== 0 || s.uid !== process.getuid()) throw new Error('UNSAFE_TRACKING_FILE');
  return validate(JSON.parse(fs.readFileSync(file, 'utf8')));
}
function writeConfig(file, values) {
  const text = JSON.stringify(validate(values));
  if (fs.existsSync(file)) {
    if (JSON.stringify(readConfig(file)) !== text) throw new Error('IMMUTABLE_TRACKING_DRIFT');
    return;
  }
  const fd = fs.openSync(file, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
  try { fs.writeFileSync(fd, text); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}
function installRelease(source, destination) {
  if (path.basename(destination) !== '.tracking-runtime.json') throw new Error('INVALID_TRACKING_DESTINATION');
  const directory = path.dirname(destination);
  const stat = fs.lstatSync(directory);
  if (!stat.isDirectory() || stat.isSymbolicLink() || stat.uid !== process.getuid() || (stat.mode & 0o022) !== 0) throw new Error('UNSAFE_TRACKING_RELEASE');
  const revisionFile = path.join(directory, 'REVISION');
  const revisionStat = fs.lstatSync(revisionFile);
  if (!revisionStat.isFile() || revisionStat.isSymbolicLink() || revisionStat.uid !== process.getuid() || revisionStat.size > 128 || (revisionStat.mode & 0o022) !== 0) throw new Error('UNSAFE_TRACKING_REVISION');
  const revision = fs.readFileSync(revisionFile, 'utf8').trim();
  if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error('INVALID_TRACKING_REVISION');
  const values = readConfig(source);
  const marker = path.join(directory, '.tracking-runtime-managed.json');
  const text = JSON.stringify({ schema: 'fermatmind.tracking-runtime.v1', revision, origin: values.TRACK_INGEST_API_ORIGIN });
  if (fs.existsSync(marker)) {
    const stat = fs.lstatSync(marker);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== process.getuid() || (stat.mode & 0o022) !== 0 || stat.size > 512
      || fs.readFileSync(marker, 'utf8') !== text) throw new Error('IMMUTABLE_TRACKING_MARKER_DRIFT');
  }
  writeConfig(destination, values);
  if (!fs.existsSync(marker)) {
    const fd = fs.openSync(marker, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o644);
    try { fs.writeFileSync(fd, text); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  }
}
function runtimeEnv(file) {
  return fs.existsSync(file) ? readConfig(file) : Object.fromEntries(KEYS.map(key => [key, '']));
}
// Inspect metadata only. Permissions must be provisioned by the operator;
// this guard never chmods, chowns, starts PM2, or opens its dump contents.
function guardPm2(home = process.env.PM2_HOME || path.join(os.homedir(), '.pm2')) {
  for (const [name, mode, directory] of [['', 0o700, true], ['dump.pm2', 0o600, false], ['dump.pm2.bak', 0o600, false]]) {
    const file = path.join(home, name);
    if (name && !fs.existsSync(file)) continue;
    const s = fs.lstatSync(file);
    if (s.isSymbolicLink() || (directory ? !s.isDirectory() : !s.isFile()) || s.uid !== process.getuid() || (s.mode & 0o777) !== mode) throw new Error('UNSAFE_PM2_PERSISTENCE');
  }
}
function guardSystemd(source, run = spawnSync) {
  readConfig(source);
  const service = process.env.SYSTEMD_SERVICE;
  const app = process.env.APP_DIR;
  if (!/^[A-Za-z0-9_.@-]+\.service$/.test(service || '') || !app || !path.isAbsolute(app) || path.normalize(app) !== app) throw new Error('INVALID_SYSTEMD_RUNTIME');
  const result = run('systemctl', ['show', service, '--no-pager', '--property=User,Group,WorkingDirectory,ExecStart,EnvironmentFiles'], { encoding: 'utf8', timeout: 5000 });
  if (result.status !== 0) throw new Error('SYSTEMD_RUNTIME_UNAVAILABLE');
  const fields = Object.fromEntries(result.stdout.split('\n').filter(line => line.includes('=')).map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)]; }));
  const entry = fields.ExecStart?.match(/path=([^ ;]+)\s*;\s*argv\[\]=([^;]+);/);
  const args = entry ? entry[2].trim().split(/\s+/) : [];
  const group = run('id', ['-gn'], { encoding: 'utf8', timeout: 5000 });
  const working = path.join(app, '.next/standalone');
  if (fields.User !== os.userInfo().username || group.status !== 0 || fields.Group !== group.stdout.trim() || fields.WorkingDirectory !== working
    || fields.EnvironmentFiles !== '' || entry?.[1] !== '/usr/bin/node' || args.length !== 2 || args[0] !== '/usr/bin/node'
    || !['server.js', path.join(working, 'server.js')].includes(args[1])) throw new Error('UNSUPPORTED_SYSTEMD_RUNTIME');
}
async function readback(file, base, fetcher = fetch, expectedEnabled) {
  const directory = path.dirname(file);
  const revisionFile = path.join(directory, 'REVISION');
  const revisionStat = fs.lstatSync(revisionFile);
  if (!revisionStat.isFile() || revisionStat.isSymbolicLink() || revisionStat.uid !== process.getuid() || revisionStat.size > 128 || (revisionStat.mode & 0o022) !== 0) throw new Error('UNSAFE_TRACKING_REVISION');
  const revision = fs.readFileSync(revisionFile, 'utf8').trim();
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('TRACKING_REVISION_MISMATCH');
  const marker = path.join(directory, '.tracking-runtime-managed.json');
  const configured = fs.existsSync(file);
  if (expectedEnabled !== undefined && !['0', '1'].includes(expectedEnabled)) throw new Error('INVALID_TRACKING_EXPECTATION');
  if (expectedEnabled !== undefined && configured !== (expectedEnabled === '1')) throw new Error('TRACKING_EXPECTATION_MISMATCH');
  if (configured) {
    const values = readConfig(file);
    const stat = fs.lstatSync(marker);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== process.getuid() || (stat.mode & 0o022) !== 0 || stat.size > 512) throw new Error('UNSAFE_TRACKING_MARKER');
    const authority = JSON.parse(fs.readFileSync(marker, 'utf8'));
    if (!authority || Object.keys(authority).sort().join(',') !== 'origin,revision,schema' || authority.schema !== 'fermatmind.tracking-runtime.v1'
      || authority.revision !== revision || authority.origin !== values.TRACK_INGEST_API_ORIGIN) throw new Error('TRACKING_REVISION_MISMATCH');
  } else {
    for (const trace of [file, marker]) {
      try { fs.lstatSync(trace); throw new Error('TRACKING_AUTHORITY_MISSING'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
  }
  const url = new URL(base);
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('INVALID_TRACKING_READBACK_TARGET');
  const response = await fetcher(new URL('/api/track', url), { method: 'HEAD', redirect: 'error', signal: AbortSignal.timeout(15000) });
  if (response.status !== 200 || response.headers.get('X-FermatMind-Tracking-Configured') !== (configured ? '1' : '0')
    || response.headers.get('X-FermatMind-Tracking-Revision') !== revision) throw new Error('TRACKING_READBACK_FAILED');
}
async function probe(file, fetcher = fetch) {
  const values = readConfig(file);
  // Existing ingest authorizes before requiring eventName. An empty envelope
  // can prove authentication but cannot reach Event::create; never emit a probe event.
  const response = await fetcher(`${values.TRACK_INGEST_API_ORIGIN}/api/v0.5/seo/attribution/events`, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${values.TRACK_INGEST_TOKEN}` }, body: '{}',
  });
  if (response.status !== 422) throw new Error('TRACKING_AUTH_PROBE_FAILED');
  const body = await response.json();
  if (body?.ok !== false || body.error_code !== 'VALIDATION_FAILED' || !Array.isArray(body?.details?.eventName) || body.details.eventName.length === 0) throw new Error('TRACKING_AUTH_PROBE_CONTRACT_FAILED');
}
module.exports = { KEYS, validate, readConfig, writeConfig, runtimeEnv, guardPm2, probe, installRelease, readback, guardSystemd };
if (require.main === module) {
  (async () => {
  try {
    const [operation, source, destination, expectedEnabled] = process.argv.slice(2);
    if (operation === 'from-env') writeConfig(source, Object.fromEntries(KEYS.map(key => [key, process.env[key]])));
    else if (operation === 'install') installRelease(source, destination);
    else if (operation === 'guard-pm2') { readConfig(source); guardPm2(); }
    else if (operation === 'guard-systemd') guardSystemd(source);
    else if (operation === 'auth-probe') await probe(source);
    else if (operation === 'readback') await readback(source, destination, fetch, expectedEnabled);
    else if (operation === 'serve') {
      const child = spawn(process.execPath, [destination], { stdio: 'inherit', env: { ...process.env, ...runtimeEnv(source) } });
      for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
      child.on('error', () => { console.error('tracking_runtime=CHILD_FAILED'); process.exitCode = 1; });
      child.on('exit', (code, signal) => { process.exitCode = signal ? 1 : (code ?? 1); });
    } else throw new Error('INVALID_TRACKING_OPERATION');
    if (operation !== 'serve') console.log('tracking_runtime=verified');
  } catch {
    // Never echo malformed inputs, values, private paths or exception messages.
    console.error('tracking_runtime=CONFIGURATION_REJECTED'); process.exitCode = 1;
  }
  })();
}
