import { createHmac, randomBytes } from 'node:crypto';
import { closeSync, constants, existsSync, fsyncSync, lstatSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const KEYS = ['CONTENT_RELEASE_REVALIDATE_SECRET', 'CONTENT_RELEASE_REVALIDATE_REDIS_URL', 'CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN'];
export function validate(values) {
  if (!values || typeof values !== 'object' || Object.keys(values).length !== KEYS.length) throw new Error('INVALID_RUNTIME_KEYS');
  for (const key of KEYS) {
    const value = values[key];
    if (typeof value !== 'string' || !value || value.length > 8192 || value !== value.trim() || /[\x00-\x1f\x7f]/.test(value)) throw new Error(`MISSING_OR_INVALID_${key}`);
  }
  if (values[KEYS[0]].length < 24) throw new Error('INVALID_RUNTIME_SECRET');
  const url = new URL(values[KEYS[1]]);
  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.hash) throw new Error('INVALID_REPLAY_STORE_URL');
  return Object.fromEntries(KEYS.map(key => [key, values[key]]));
}
export function readConfig(file) {
  const stat = lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 32768 || (stat.mode & 0o077) !== 0) throw new Error('UNSAFE_RUNTIME_CONFIG');
  return validate(JSON.parse(readFileSync(file, 'utf8')));
}
export function writeConfig(file, values) {
  const text = JSON.stringify(validate(values));
  if (existsSync(file)) {
    if (JSON.stringify(readConfig(file)) !== text) throw new Error('IMMUTABLE_RUNTIME_CONFIG_DRIFT');
    return;
  }
  const fd = openSync(file, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  try { writeFileSync(fd, text); fsyncSync(fd); } finally { closeSync(fd); }
}
export async function probe(file, endpoint, fetcher = fetch) {
  const values = readConfig(file);
  const url = new URL(endpoint);
  if (url.protocol !== 'https:' || url.username || url.password || url.hash || url.search) throw new Error('INVALID_PROBE_ENDPOINT');
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = randomBytes(24).toString('hex');
  const body = '{}'; // Existing endpoint: authenticate, with no paths or tags to invalidate.
  const response = await fetcher(url, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', 'X-FM-Content-Release-Timestamp': timestamp,
      'X-FM-Content-Release-Nonce': nonce, 'X-FM-Content-Release-Signature': `sha256=${createHmac('sha256', values[KEYS[0]]).update(`${timestamp}.${nonce}.${body}`).digest('hex')}` }, body });
  if (!response.ok) throw new Error(`AUTH_PROBE_HTTP_${response.status}`);
  const result = await response.json();
  if (result.ok !== true || !['revalidated_paths', 'rejected_paths', 'invalidated_tags'].every(key => Array.isArray(result[key]) && result[key].length === 0)) throw new Error('AUTH_PROBE_CONTRACT_MISMATCH');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [operation, source, destination] = process.argv.slice(2);
    if (operation === 'from-env') writeConfig(source, Object.fromEntries(KEYS.map(key => [key, process.env[key]])));
    else if (operation === 'install') writeConfig(destination, readConfig(source));
    else if (operation === 'probe') await probe(source, destination);
    else throw new Error('INVALID_RUNTIME_OPERATION');
    console.log('content_release_runtime=verified');
  } catch (error) {
    const code = error instanceof Error && /^[A-Z_0-9]+$/.test(error.message) ? error.message : 'RUNTIME_CONFIGURATION_FAILED';
    console.error(`content_release_runtime=${code}`); process.exitCode = 1;
  }
}
