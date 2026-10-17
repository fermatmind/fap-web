import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyInstalledBinding, verifyProductionBinding } from './production-evidence.mjs';

const candidate = 'b'.repeat(40);
const repository = 'fermatmind/fap-web';
const fixture = () => ({
  repository, active: candidate,
  run: { id: 20, status: 'completed', conclusion: 'failure', head_branch: 'main', event: 'workflow_run', run_attempt: 1 },
  artifact: { name: `trunk-production-${candidate}` },
  timing: { schema_version: 'fermatmind.trunk-delivery-timing.v1', sha: candidate, repository, deploy_run_id: '20',
    deploy_run_attempt: 1, ci_run_id: '10', production_outcome: 'failure', production_smoke_completed_at: null,
    production_finished_at: '2026-10-17T12:34:00Z' },
  ci: { id: 10, head_sha: candidate, head_branch: 'main', event: 'push', status: 'completed', conclusion: 'success',
    run_attempt: 1, repository: { full_name: repository } },
  receipt: { schema_version: 'fermatmind.trunk-validation.v1', sha: candidate, ci_run_id: '10', result: 'success', classification: { deploy: true } },
  outcome: { schema_version: 'fermatmind.deploy-outcome.v1', revision: candidate, status: 'success', phase: 'complete', exit_code: 0,
    rollback: 'not_needed', archive_sha256: 'c'.repeat(64) },
  jobs: [
    { name: 'Bind successful main CI and release artifact', status: 'completed', conclusion: 'success' },
    { name: 'Staging artifact activation and smoke', status: 'completed', conclusion: 'success' },
    { name: 'Production ordered activation with atomic LKG fallback', status: 'completed', conclusion: 'failure',
      steps: [{ name: 'Activate production candidate; installer restores previous release on failed smoke', conclusion: 'failure' }] },
  ],
});

test('complete installation in a failed outer run is identified but remains unaccepted', () => {
  const input = fixture();
  assert.deepEqual(verifyInstalledBinding(input), { sha: candidate, runId: 20 });
  assert.throws(() => verifyProductionBinding({ ...input, job: input.jobs[2] }), /Invalid production/);
});

const mutations = [
  ['active', s => { s.active = 'd'.repeat(40); }],
  ['run status', s => { s.run.status = 'in_progress'; }],
  ['run attempt', s => { s.run.run_attempt = 2; }],
  ['run branch', s => { s.run.head_branch = 'feature'; }],
  ['run event', s => { s.run.event = 'workflow_dispatch'; }],
  ['run conclusion', s => { s.run.conclusion = 'success'; }],
  ['policy', s => { s.jobs[0].conclusion = 'failure'; }],
  ['staging', s => { s.jobs[1].conclusion = 'failure'; }],
  ['staging pending', s => { s.jobs[1].status = 'in_progress'; }],
  ['production', s => { s.jobs[2].conclusion = 'success'; }],
  ['activation', s => { s.jobs[2].steps[0].conclusion = 'skipped'; }],
  ['missing job', s => { s.jobs.pop(); }],
  ['duplicate job', s => { s.jobs.push(s.jobs[1]); }],
  ['timing SHA', s => { s.timing.sha = 'd'.repeat(40); }],
  ['timing repository', s => { s.timing.repository = 'other/repo'; }],
  ['timing run', s => { s.timing.deploy_run_id = '21'; }],
  ['timing attempt', s => { s.timing.deploy_run_attempt = 2; }],
  ['timing CI', s => { s.timing.ci_run_id = '11'; }],
  ['timing outcome', s => { s.timing.production_outcome = 'success'; }],
  ['timing smoke', s => { s.timing.production_smoke_completed_at = '2026-10-17T12:34:00Z'; }],
  ['timing finish', s => { delete s.timing.production_finished_at; }],
  ['CI SHA', s => { s.ci.head_sha = 'd'.repeat(40); }],
  ['CI conclusion', s => { s.ci.conclusion = 'failure'; }],
  ['CI attempt', s => { s.ci.run_attempt = 2; }],
  ['CI repository', s => { s.ci.repository.full_name = 'other/repo'; }],
  ['validation SHA', s => { s.receipt.sha = 'd'.repeat(40); }],
  ['validation result', s => { s.receipt.result = 'failure'; }],
  ['validation run', s => { s.receipt.ci_run_id = '11'; }],
  ['validation deployment', s => { s.receipt.classification.deploy = false; }],
  ['outcome SHA', s => { s.outcome.revision = 'd'.repeat(40); }],
  ['outcome failure', s => { s.outcome.status = 'failed'; }],
  ['outcome incomplete', s => { s.outcome.phase = 'verify'; }],
  ['outcome code', s => { s.outcome.exit_code = 7; }],
  ['outcome rollback', s => { s.outcome.rollback = 'restored'; }],
  ['archive digest', s => { delete s.outcome.archive_sha256; }],
];
for (const [name, mutate] of mutations) {
  test(`installed evidence rejects inconsistent ${name}`, () => {
    const input = fixture(); mutate(input);
    assert.throws(() => verifyInstalledBinding(input), /UNVERIFIED_INSTALLED_ACTIVE/);
  });
}
