import test from 'node:test';import assert from 'node:assert/strict';
import {changedTestPlan,runChangedTests,browserShardNumbers} from './run-changed-tests.mjs';
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
test('Taiwan assessment directory and category are product routes without skipping real tests',()=>{
 const root='app/(traditional)/zh-TW/tests/';
 const sources=[root+'page.tsx',root+'category/[slug]/page.tsx'];
 const native=root+'category/reader.test.mjs';
 const changes=[...sources,native].map(path=>({status:'A',path}));
 assert.deepEqual(changedTestPlan(changes,{vitest:true}).node,[native]);
 assert.throws(()=>changedTestPlan([{status:'A',path:root+'category/__tests__/reader.tsx'}],{vitest:true}),/Unsupported/);
 assert.throws(()=>changedTestPlan([{status:'A',path:root+'category/reader.test.tsx'}],{vitest:true}),/Unsupported/);
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


test('assessment CSS assets are product code while named and nested CSS tests remain fail-closed',()=>{
 const assets=['components/tests/explore-hero.css','components/tests/explore-landing.css','components/tests/tests-catalog.css','components/tests/tests-design.css'];
 const plan=changedTestPlan(assets.map(path=>({status:'M',path})),{vitest:true});
 for(const paths of Object.values(plan))assert.deepEqual(paths,[]);
 for(const path of ['components/tests/explore.test.css','components/tests/__tests__/explore.css','components/tests/tests/explore.css']){
  assert.throws(()=>changedTestPlan([{status:'A',path}],{vitest:true}),/Unsupported changed tests/);
 }
});

test('media-heavy browser selections retain all scenarios in both modes and bind the complete shard matrix',()=>{
 const files=['age-preferences','aura-color','bleach','chiikawa','cyberpunk-edgerunners','moon-phase','philosopher-personality-test','space-marine-chapter'].map(slug=>`tests/e2e/questionnaire-${slug}.spec.ts`);
 assert.deepEqual(browserShardNumbers(files.slice(0,4)),[1]);
 assert.deepEqual(browserShardNumbers(files.slice(0,5)),[1,2]);
 assert.deepEqual(browserShardNumbers(files),[1,2]);
 const plan=changedTestPlan([],{vitest:true});plan.e2e=files;
 for(const mode of ['e2e','e2e-release'])for(const shard of ['1/2','2/2']){
  const calls=runChangedTests(plan,{mode,browserShard:shard,run:()=>({status:0})});
  assert.deepEqual(calls[0].args,['exec','playwright','test',...files,`--shard=${shard}`,'--fully-parallel','--workers=2']);
 }
 assert.throws(()=>runChangedTests(plan,{mode:'e2e',browserShard:'1/1',run:()=>{throw Error('must not run');}}),/CHANGED_BROWSER_SHARD_BINDING_HOLD/);
});

test('large browser selections preserve all files in bounded native case shards and reject incomplete matrices',()=>{
 const files=Array.from({length:87},(_,i)=>`tests/e2e/product-${i}.spec.ts`);
 const plan=changedTestPlan([],{vitest:true});plan.e2e=files;
 assert.deepEqual(browserShardNumbers(files),[1,2,3,4,5,6,7,8]);
 assert.deepEqual(browserShardNumbers(files.slice(0,1)),[1]);
 for(const mode of ['e2e','e2e-release'])for(let shard=1;shard<=8;shard++){
  const calls=runChangedTests(plan,{mode,browserShard:`${shard}/8`,run:()=>({status:0})});
  assert.deepEqual(calls[0].args,['exec','playwright','test',...files,`--shard=${shard}/8`,'--fully-parallel','--workers=2']);
 }
 for(const browserShard of ['0/8','9/8','1/4','1/9','../8',''])assert.throws(()=>runChangedTests(plan,{mode:'e2e',browserShard,run:()=>{throw Error('must not run');}}),/CHANGED_BROWSER_SHARD_BINDING_HOLD/);
 const small={...plan,e2e:files.slice(0,1)};
 assert.deepEqual(runChangedTests(small,{mode:'e2e',browserShard:'1/1',run:()=>({status:0})})[0].args,['exec','playwright','test',files[0],'--shard=1/1']);
});
