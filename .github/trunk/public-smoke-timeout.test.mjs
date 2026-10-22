import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const source = readFileSync('scripts/deploy_web_pm2.sh', 'utf8');
const headers = source.slice(source.indexOf('probe_headers() {'), source.indexOf('wait_for_local_app_ready() {'));
const sitemap = source.slice(source.indexOf('require_sitemap_health() {'), source.indexOf('\nrequire_bin node'));
const patterns = ['PRIVATE_SITEMAP_PATH_PATTERN', 'PRIVATE_TEST_TAKE_SITEMAP_PATH_PATTERN']
  .map(name => source.match(new RegExp(`^${name}=.+$`, 'm'))[0]).join('\n');
const curl = String.raw`#!/usr/bin/env bash
set -euo pipefail
n="$(cat "$CALL_COUNT")"
n=$((n + 1))
printf '%s' "$n" > "$CALL_COUNT"
printf '%s\n' "$*" >> "$CURL_ARGS"
output=''
previous=''
for argument in "$@"; do
  if [[ "$previous" == '-o' ]]; then output="$argument"; fi
  previous="$argument"
done
case "$TEST_MODE" in
  timeout-then-success)
    if [[ "$n" == 1 ]]; then
      if [[ -n "$output" ]]; then printf '<urlset><url><loc>https://test.invalid/zh/result/private</loc></url>' >> "$output"; fi
      exit 28
    fi ;;
  timeout-always) exit 28 ;;
  tls-error) exit 60 ;;
  http-error) if [[ -z "$output" ]]; then exit 22; fi ;;
esac
if [[ -n "$output" ]]; then
  case "$TEST_MODE" in
    private) printf '<urlset><url><loc>https://test.invalid/en/orders/private</loc></url></urlset>' >> "$output" ;;
    empty) printf '<urlset></urlset>' >> "$output" ;;
    *) printf '<urlset><url><loc>https://test.invalid/en/career</loc></url></urlset>' >> "$output" ;;
  esac
  if [[ "$TEST_MODE" == http-error ]]; then printf '404'; else printf '200'; fi
else
  printf 'HTTP/2 200 OK\n'
fi
`;

function probe(kind, mode, followRedirects = 1) {
  const root = mkdtempSync(path.join(tmpdir(), 'public-smoke-timeout-'));
  try {
    mkdirSync(path.join(root, 'bin'));
    writeFileSync(path.join(root, 'bin/curl'), curl, { mode: 0o700 });
    writeFileSync(path.join(root, 'count'), '0');
    const harness = path.join(root, 'probe.sh');
    writeFileSync(harness, `set -euo pipefail
HTTP_CONNECT_TIMEOUT_SEC=5
HTTP_REQUEST_TIMEOUT_SEC=20
SITEMAP_CURL_TIMEOUT_SEC=20
log() { printf '%s\\n' "$*"; }
${patterns}
${headers}
${sitemap}
${kind === 'headers' ? `probe_headers https://test.invalid/zh ${followRedirects}` : 'require_sitemap_health https://test.invalid/sitemap.xml'}
`);
    const result = spawnSync('bash', [harness], {
      env: { ...process.env, PATH: `${path.join(root, 'bin')}:${process.env.PATH}`, TMPDIR: root,
        TEST_MODE: mode, CALL_COUNT: path.join(root, 'count'), CURL_ARGS: path.join(root, 'args') },
      encoding: 'utf8', timeout: 5000,
    });
    assert.equal(result.error, undefined);
    const calls = Number(readFileSync(path.join(root, 'count'), 'utf8'));
    const argumentsText = readFileSync(path.join(root, 'args'), 'utf8');
    assert.doesNotMatch(argumentsText, /(?:^|\s)(?:-k|--insecure)(?:\s|$)/);
    for (const line of argumentsText.trim().split('\n')) assert.match(line, /--max-time 20/);
    return { status: result.status, calls, output: result.stdout + result.stderr };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

for (const [mode, status, calls] of [
  ['success', 0, 1], ['timeout-then-success', 0, 2], ['timeout-always', 28, 2],
  ['tls-error', 60, 1], ['http-error', 22, 1],
]) {
  test(`public header probe preserves transport and HTTP boundaries: ${mode}`, () => {
    const result = probe('headers', mode);
    assert.equal(result.status, status, result.output);
    assert.equal(result.calls, calls);
  });
}
test('local header probes keep their original single-read behavior', () => {
  const result = probe('headers', 'timeout-always', 0);
  assert.equal(result.status, 28);
  assert.equal(result.calls, 1);
});
for (const [mode, status, calls] of [
  ['success', 0, 1], ['timeout-then-success', 0, 2], ['timeout-always', 1, 2],
  ['tls-error', 1, 1], ['http-error', 1, 1], ['private', 1, 1], ['empty', 1, 1],
]) {
  test(`sitemap probe validates only a complete successful transfer: ${mode}`, () => {
    const result = probe('sitemap', mode);
    assert.equal(result.status, status, result.output);
    assert.equal(result.calls, calls);
  });
}
