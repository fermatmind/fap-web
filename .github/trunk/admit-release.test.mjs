import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activeDisposition } from './admit-release.mjs';

const accepted = 'a'.repeat(40);
const active = 'b'.repeat(40);
const candidate = 'c'.repeat(40);
const ancestor = (a, b) => [[accepted, active], [accepted, candidate], [active, candidate]].some(([x, y]) => a === x && b === y);

test('a new strict successor can proceed without promoting the installed version to accepted', () => {
  assert.equal(activeDisposition(candidate, accepted, active, ancestor), 'forward_candidate');
});

test('ordinary admission and accepted skips retain their behavior', () => {
  assert.equal(activeDisposition(candidate, accepted, accepted, ancestor), 'forward_candidate');
  assert.equal(activeDisposition(candidate, accepted, undefined, ancestor), 'forward_candidate');
  assert.equal(activeDisposition(accepted, accepted, accepted, ancestor), 'already_accepted');
  assert.equal(activeDisposition(accepted, candidate, candidate, ancestor), 'stale_accepted_ancestor');
});

test('installed but unaccepted candidates cannot be retried or bypass either ancestry edge', () => {
  assert.throws(() => activeDisposition(active, accepted, active, ancestor), /ACTIVE_ADMISSION_HOLD/);
  assert.throws(() => activeDisposition(accepted, accepted, active, ancestor), /ACTIVE_ADMISSION_HOLD/);
  for (const missing of [[accepted, active], [active, candidate]]) {
    assert.throws(() => activeDisposition(candidate, accepted, active,
      (a, b) => !(a === missing[0] && b === missing[1]) && ancestor(a, b)), /ACTIVE_ADMISSION_HOLD/);
  }
  for (const value of ['invalid', '0'.repeat(40)]) {
    assert.throws(() => activeDisposition(candidate, accepted, value, ancestor), /ACTIVE_ADMISSION_HOLD/);
  }
});
