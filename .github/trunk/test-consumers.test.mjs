import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {selectTests,validateTestSelection} from './test-consumers.mjs';
test('real imports and source reads select consumer union; mixed and unknown retain coverage',()=>{
 const root=mkdtempSync(tmpdir()+'/test-consumers-'),git=(...args)=>execFileSync('git',args,{cwd:root});
 try {
  git('init','-q');
  const files={'lib/a.ts':'export const value=1;', 'lib/b.ts':`import {value} from './a';export const doubled=value*2;`, 'lib/independent.ts':'export const other=3;',
   'tests/contracts/a.contract.test.ts':`import {doubled} from '@/lib/b';`, 'tests/contracts/b.contract.test.ts':`import {other} from '@/lib/independent';`,
   'tests/a11y/a.test.tsx':`import {value} from '@/lib/a';`};
  for(const [file,body] of Object.entries(files)){mkdirSync(root+'/'+file.slice(0,file.lastIndexOf('/')),{recursive:true});writeFileSync(root+'/'+file,body);}
  git('add','.');
  const a=selectTests(['lib/a.ts'],root);
  assert.deepEqual(a.files,['tests/a11y/a.test.tsx','tests/contracts/a.contract.test.ts']);
  assert.equal(a.mode,'consumer_union');
  assert.equal(selectTests(['lib/a.ts','lib/independent.ts'],root).files.length,3);
  assert.equal(selectTests(['lib/unknown.ts'],root).mode,'conservative_full');
  assert.equal(selectTests(['docs/readme.md'],root).contracts_required,false);
  const classification={candidate_sha:'a'.repeat(40),paths:a.paths,test_selection:a};
  assert.equal(validateTestSelection(classification,'a'.repeat(40),a.files,root),a);
  const omitted={...a,files:a.files.slice(1),shards:[1]};
  assert.throws(()=>validateTestSelection({...classification,test_selection:omitted},'a'.repeat(40),a.files,root),/CONSUMER/);
  assert.equal(selectTests(['scripts/test_native.py'],root).contracts_required,false);
  for(const changed of [{candidate_sha:'b'.repeat(40)},{paths:['lib/b.ts']},{test_selection:{...a,files:[],contracts_required:true}},{test_selection:{...a,files:['missing.ts']}}]) assert.throws(()=>validateTestSelection({...classification,...changed},'a'.repeat(40),a.files),/BINDING/);
 }finally{rmSync(root,{recursive:true,force:true});}
});

test('large tracked content inventories do not exceed the default child-process buffer',()=>{
 const root=mkdtempSync(tmpdir()+'/test-consumers-large-');
 try {
  execFileSync('git',['init','-q'],{cwd:root});
  const blob=execFileSync('git',['hash-object','-w','--stdin'],{cwd:root,input:'',encoding:'utf8'}).trim();
  const files=Array.from({length:7000},(_,i)=>`content/career-comparisons/${'career-'.repeat(24)}${i}/zh-TW.md`);
  const index=files.map(file=>`100644 ${blob}\t${file}\0`).join('');
  execFileSync('git',['update-index','-z','--index-info'],{cwd:root,input:index});
  const actual=execFileSync('git',['ls-files','-z'],{cwd:root,maxBuffer:16*1024*1024});
  assert.ok(actual.length>1024*1024);
  const plan=selectTests(['docs/readme.md'],root);
  assert.equal(plan.contracts_required,false);
  assert.deepEqual(plan.files,[]);
 }finally{rmSync(root,{recursive:true,force:true});}
});
