import test from 'node:test';import assert from 'node:assert/strict';
import {changedTestPlan,runChangedTests} from './run-changed-tests.mjs';
test('localized assessment modules are product routes while named and nested tests remain selected',()=>{
 const route='app/(localized)/[locale]/tests/[slug]/take/';
 const contract='tests/contracts/big5-take-attempt-priming.contract.test.tsx';
 const native=route+'reader.test.mjs';
 const plan=changedTestPlan([{status:'M',path:route+'Big5TakeClient.tsx'},
  {status:'M',path:contract},{status:'A',path:native}],{vitest:true});
 assert.deepEqual(plan.vitest,[contract]);assert.deepEqual(plan.node,[native]);
 assert.deepEqual(plan.unsupported,[]);
 assert.throws(()=>changedTestPlan([{status:'A',path:route+'__tests__/reader.tsx'}],{vitest:true}),/Unsupported/);
 assert.throws(()=>changedTestPlan([{status:'A',path:route+'tests/reader.tsx'}],{vitest:true}),/Unsupported/);
 assert.throws(()=>changedTestPlan([{status:'A',path:route+'reader.test.tsx'}],{vitest:true}),/Unsupported/);
 assert.throws(()=>changedTestPlan([{status:'A',path:route+'reader.rs'}],{vitest:true}),/Unsupported/);
 assert.deepEqual(changedTestPlan([{status:'D',path:native}],{vitest:true}).removed,[native]);
});
test('assessment component and helper directories distinguish product sources from actual tests',()=>{
 const sources=['components/tests/AssessmentLandingIntro.tsx','components/tests/MbtiEditorialSections.tsx','components/marketing/tests/TestsHubExperience.tsx','lib/tests/assessmentLandingUi.ts'];
 assert.deepEqual(changedTestPlan(sources.map(path=>({status:'M',path})),{vitest:true}).unsupported,[]);
 for(const root of ['components/tests/','components/marketing/tests/','lib/tests/']){
  const native=root+'reader.test.mjs';
  assert.deepEqual(changedTestPlan([{status:'A',path:native}],{vitest:true}).node,[native]);
  assert.deepEqual(changedTestPlan([{status:'D',path:native}],{vitest:true}).removed,[native]);
  for(const suffix of ['__tests__/reader.tsx','tests/reader.tsx','reader.test.tsx','reader.rs']){
   assert.throws(()=>changedTestPlan([{status:'A',path:root+suffix}],{vitest:true}),/Unsupported/);
  }
 }
});
test('career assessment index is product code without suppressing real tests',()=>{
 const route='app/(localized)/[locale]/career/tests/';
 const contract='tests/contracts/riasec-growth-sprint.contract.test.tsx';
 const native=route+'reader.test.mjs';
 const plan=changedTestPlan([{status:'M',path:route+'page.tsx'},
  {status:'A',path:contract},{status:'A',path:native}],{vitest:true});
 assert.deepEqual(plan.vitest,[contract]);assert.deepEqual(plan.node,[native]);
 assert.deepEqual(plan.unsupported,[]);
 for(const suffix of ['__tests__/reader.tsx','tests/reader.tsx','reader.test.tsx','reader.rs']){
  assert.throws(()=>changedTestPlan([{status:'A',path:route+suffix}],{vitest:true}),/Unsupported/);
 }
 assert.deepEqual(changedTestPlan([{status:'D',path:native}],{vitest:true}).removed,[native]);
});
test('changed PHP JS Python Shell execute real runner commands; removed and unsupported are explicit',()=>{
 const p=changedTestPlan(['backend/tests/Feature/AmbtiTest.php','.github/trunk/x.test.mjs','backend/tests/Sre/test_a.py','backend/tests/Sre/test_a.sh'].map(path=>({status:'A',path})).concat([{status:'D',path:'backend/tests/Feature/RemovedTest.php'}]));
 assert.equal(p.removed.length,1);const calls=[];
 const old=process.env.FEATURE_CONTENT_STORE_V2;process.env.FEATURE_CONTENT_STORE_V2='true';
 try{runChangedTests(p,{run:(cmd,args,options)=>{calls.push({cmd,args,env:options.env.FEATURE_CONTENT_STORE_V2});return {status:0};}});}finally{if(old===undefined)delete process.env.FEATURE_CONTENT_STORE_V2;else process.env.FEATURE_CONTENT_STORE_V2=old;}
 assert.deepEqual(calls.map(c=>c.cmd),['node','python3','bash','php']);assert.ok(calls.every(c=>c.env==='true'));
 assert.throws(()=>changedTestPlan([{status:'A',path:'backend/tests/Sre/test.rs'}]),/Unsupported/);
 assert.throws(()=>runChangedTests(p,{run:()=>({status:1})}),/failed/);
});

import {mkdtempSync,mkdirSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
test('changed E2E helpers select their transitive browser consumers and execute both server modes',()=>{
 const root=mkdtempSync(tmpdir()+'/changed-e2e-');
 try{
  mkdirSync(root+'/tests/e2e/helpers',{recursive:true});
  const helper='tests/e2e/helpers/api.ts',bridge='tests/e2e/helpers/flow.ts',spec='tests/e2e/iq.spec.ts';
  writeFileSync(root+'/'+helper,'export const api=true;');
  writeFileSync(root+'/'+bridge,"export {api} from './api';");
  writeFileSync(root+'/'+spec,"import {api} from './helpers/flow';\ntest('unlabelled required business scenario',()=>{});");
  writeFileSync(root+'/tests/e2e/other.spec.ts','export {};');
  const plan=changedTestPlan([{status:'M',path:helper}],{vitest:true,root});
  assert.deepEqual(plan.e2e,[spec]);
  assert.deepEqual(changedTestPlan([{status:'M',path:spec}],{vitest:true,root}).e2e,[spec]);
  assert.equal(runChangedTests(plan,{root,run:()=>{throw new Error('must defer browser execution');}}).length,0);
  for(const mode of ['e2e','e2e-release']){
   const calls=[];
   runChangedTests(plan,{mode,root,run:(cmd,args)=>{calls.push({cmd,args});return {status:0};}});
   assert.deepEqual(calls,[{cmd:'pnpm',args:['exec','playwright','test',spec]}]);
   assert.throws(()=>runChangedTests(plan,{mode,root,run:()=>({status:1})}),/execution failed/);
  }
  const unused='tests/e2e/helpers/unused.ts';writeFileSync(root+'/'+unused,'export {};');
  assert.throws(()=>changedTestPlan([{status:'M',path:unused}],{vitest:true,root}),/CONSUMER_SELECTION_EMPTY/);
  assert.throws(()=>changedTestPlan([{status:'M',path:helper}],{root}),/Unsupported/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('language fixtures really execute assertions and propagate failures',()=>{
 const root=mkdtempSync(tmpdir()+'/changed-runners-');
 try {
  mkdirSync(root+'/tests');
  writeFileSync(root+'/tests/x.test.mjs',`import test from 'node:test';import assert from 'node:assert/strict';import {writeFileSync} from 'node:fs';test('env',()=>{assert.equal(process.env.FEATURE_CONTENT_STORE_V2,'true');writeFileSync('tests/node-executed','executed');});`);
  writeFileSync(root+'/tests/test_x.py',`import unittest
class TestEnvironment(unittest.TestCase):
 def test_assertion(self): self.assertEqual(2+2,4)
`);
  writeFileSync(root+'/tests/test_x.sh',`set -euo pipefail
test "$FEATURE_CONTENT_STORE_V2" = true
printf executed > tests/shell-executed
`);
  const plan=changedTestPlan(['tests/x.test.mjs','tests/test_x.py','tests/test_x.sh'].map(path=>({path,status:'A'})));
  const old=process.env.FEATURE_CONTENT_STORE_V2;process.env.FEATURE_CONTENT_STORE_V2='true';
  try{assert.equal(runChangedTests(plan,{root}).length,3);}finally{if(old===undefined)delete process.env.FEATURE_CONTENT_STORE_V2;else process.env.FEATURE_CONTENT_STORE_V2=old;}
  assert.equal(readFileSync(root+'/tests/node-executed','utf8'),'executed');
  assert.equal(readFileSync(root+'/tests/shell-executed','utf8'),'executed');
  writeFileSync(root+'/tests/test_x.py','value=42');
  assert.throws(()=>runChangedTests({...plan,node:[],shell:[]},{root}),/execution failed/);
  writeFileSync(root+'/tests/test_x.sh','exit 4');
  assert.throws(()=>runChangedTests({...plan,node:[],python:[]},{root}),/execution failed/);
 }finally{rmSync(root,{recursive:true,force:true});}
});

test('filenames stay individual argv and never execute shell metacharacters',()=>{
 const root=mkdtempSync(tmpdir()+'/changed-argv-');
 try {
  mkdirSync(root+'/tests');
  const file=`tests/space ' " ; $(touch INJECTED) &.test.mjs`;
  writeFileSync(root+'/'+file,`import test from 'node:test';test('literal path',()=>{});`);
  const plan=changedTestPlan([{path:file,status:'A'}]);
  runChangedTests(plan,{root,run:(cmd,args,options)=>{
   assert.equal(options.shell,false);assert.deepEqual(args,['--test',file]);
   return {status:0};
  }});
  assert.equal(runChangedTests(plan,{root})[0].status,0);
  assert.throws(()=>readFileSync(root+'/INJECTED'),/ENOENT/);
  writeFileSync(root+'/'+file,'process.exitCode=7;');
  assert.throws(()=>runChangedTests(plan,{root}),/execution failed/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
