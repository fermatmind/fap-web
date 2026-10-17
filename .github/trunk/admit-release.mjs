import {appendFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolveProductionBaseline} from './classify-release.mjs';
import {githubProductionEvidence} from './production-evidence.mjs';
export function candidateDisposition(candidate,baseline,isAncestor) {
  if(![candidate,baseline].every(s=>/^[a-f0-9]{40}$/.test(s??'')&&s!=='0'.repeat(40))) throw new Error('INVALID_ADMISSION_IDENTITY');
  if(candidate===baseline) return 'already_accepted';
  if(isAncestor(candidate,baseline)) return 'stale_accepted_ancestor';
  if(!isAncestor(baseline,candidate)) throw new Error('NON_FORWARD_ADMISSION_HOLD');
  return 'forward_candidate';
}
export function activeDisposition(candidate, accepted, active, isAncestor) {
  const reason = candidateDisposition(candidate, accepted, isAncestor);
  if (!active || active === accepted) return reason;
  if (!/^[a-f0-9]{40}$/.test(active) || active === '0'.repeat(40)
    || reason !== 'forward_candidate' || active === candidate
    || !isAncestor(accepted, active) || !isAncestor(active, candidate)) {
    throw new Error('NON_FORWARD_ACTIVE_ADMISSION_HOLD');
  }
  return reason;
}
if(import.meta.url===`file://${process.argv[1]}`) {
  const sha=process.env.DEPLOY_SHA;
  const baseline=await resolveProductionBaseline(process.env.GITHUB_REPOSITORY);
  const isAncestor=(a,b)=>spawnSync('git',['merge-base','--is-ancestor',a,b]).status===0;
  const active=process.env.ACTIVE_SHA;
  const reason=activeDisposition(sha,baseline.sha,active,isAncestor);
  if(active && active!==baseline.sha) {
    const installed=await githubProductionEvidence(process.env.GITHUB_REPOSITORY).installed(active,baseline);
    if(installed.sha!==active) throw new Error('UNVERIFIED_ACTIVE_INSTALLATION');
  }
  const deploy=reason==='forward_candidate';
  appendFileSync(process.env.GITHUB_OUTPUT,`deploy=${deploy}\nskip=${!deploy}\nreason=${reason}\naccepted_sha=${baseline.sha}\naccepted_run_id=${baseline.runId}\n`);
  if(!deploy) writeFileSync('trunk-deploy-skip.json',JSON.stringify({schema_version:'fermatmind.trunk-deploy-skip.v1',repository:process.env.GITHUB_REPOSITORY,sha,ci_run_id:process.env.CI_RUN_ID,deploy_run_id:process.env.GITHUB_RUN_ID,deploy_run_attempt:1,reason,accepted_sha:baseline.sha,accepted_run_id:baseline.runId,mutation_started:false})+'\n');
}
