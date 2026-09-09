import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const source = readFileSync('scripts/deploy_web_pm2.sh', 'utf8');
const code = source.slice(source.indexOf("# Reap only")).split("node <<'NODE'\n")[1].split('\nNODE')[0];
test('reaps only the failed preflight process, preserving active and foreign processes', () => {
  const failed = 'a'.repeat(40), active = 'b'.repeat(40), unknown = 'c'.repeat(40);
  const revisions = {101:failed,102:active,103:unknown,104:failed};
  const killed = [];
  const digest = 'd'.repeat(64);
  const fs = {
    realpathSync(p) {
      if (p === '/app') return p;
      if (p === '/app/.next/standalone') return `/app/releases/${active}-${digest}`;
      return `/app/releases/${revisions[p.split('/')[2]]}-${digest}`;
    },
    readdirSync(p) { return p === '/proc' ? Object.keys(revisions) : ['failed','active']; },
    statSync() { return {uid:1000}; },
    readFileSync(p) {
      if (p.endsWith('deploy-outcome.json')) return JSON.stringify({status:'failed',phase:'preflight',revision:p.includes('/failed/')?failed:active});
      if (p.endsWith('/REVISION')) return p.split('/')[3].slice(0, 40);
      const pid = p.split('/')[2], rev = revisions[pid];
      return `PORT=${pid === '104'?'3000':'3101'}\0HOSTNAME=127.0.0.1\0FERMATMIND_DEPLOYED_REVISION_FILE=/app/releases/${rev}-${digest}/REVISION`;
    }
  };
  vm.runInNewContext(code,{require:n=>n==='node:fs'?fs:path,console:{log(){}},process:{env:{APP_DIR:'/app',CANDIDATE_APP_PORT:'3101'},getuid:()=>1000,kill:(pid,signal)=>killed.push([pid,signal])}});
  assert.deepEqual(killed,[[101,'SIGTERM']]);
});
