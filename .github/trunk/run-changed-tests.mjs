import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
export function selectE2eTests(inputs,root=process.cwd()) {
 const directory=path.join(root,'tests/e2e');
 const files=existsSync(directory)?readdirSync(directory,{recursive:true}).filter(file=>/\.[jt]s$/.test(file)).map(file=>'tests/e2e/'+file):[];
 const known=new Set(files),edges=new Map();
 for(const file of files){
  const body=readFileSync(path.join(root,file),'utf8');
  const dependencies=[];
  for(const match of body.matchAll(/(?:from\s*|import\s*\(|require\s*\()(['"])(\.[^'"]+)\1/g)){
   const base=path.posix.normalize(path.posix.join(path.posix.dirname(file),match[2]));
   const resolved=[base,base+'.ts',base+'.js',base+'/index.ts'].find(value=>known.has(value));
   if(resolved)dependencies.push(resolved);
  }
  edges.set(file,dependencies);
 }
 const selected=[];const consumed=new Set();
 for(const file of files.filter(file=>/\.spec\.[jt]s$/.test(file))){
  const closure=new Set([file]),pending=[file];
  while(pending.length)for(const dependency of edges.get(pending.pop())??[])if(!closure.has(dependency)){closure.add(dependency);pending.push(dependency);}
  const matches=inputs.filter(input=>closure.has(input));
  if(matches.length){selected.push(file);for(const input of matches)consumed.add(input);}
 }
 if(inputs.some(input=>!consumed.has(input)))throw new Error('CHANGED_E2E_CONSUMER_SELECTION_EMPTY');
 return selected.sort();
}
export function changedTestPlan(changes, {vitest=false,root=process.cwd()}={}) {
 const plan={php:[],node:[],python:[],shell:[],removed:[],vitest:[],e2e:[],unsupported:[]};
 const e2eInputs=[];
 for(const {status,path} of changes){
  // Assessment routes, components, and helpers are product code; named/nested tests remain fail-closed.
  const productRoot=['app/(localized)/[locale]/tests/','components/tests/','components/marketing/tests/','lib/tests/'].find(root=>path.startsWith(root));
  if(productRoot && /\.[jt]sx?$/.test(path)
    && !/(?:^|\/)(?:tests?|__tests__)\/|\.test\.[cm]?[jt]sx?$/.test(path.slice(productRoot.length)))continue;
  if(!/(?:^|\/)(?:tests?|__tests__)\/|(?:Test\.php|\.test\.[cm]?[jt]sx?|(?:test_[^/]+|[^/]+_test)\.(?:py|sh))$/.test(path))continue;
  if(/(?:fixtures|snapshots)\//.test(path)||/\.(?:json|md|xml|yaml|yml|snap|csv|png)$/.test(path))continue;
  if(status==='D'){plan.removed.push(path);continue;}
  if(/Test\.php$/.test(path))plan.php.push(path);
  else if(vitest && /^tests\/e2e\/(?:.*\.spec\.[jt]s|helpers\/.*\.[jt]s)$/.test(path))e2eInputs.push(path);
  else if(vitest && /^tests\/.*\.test\.[jt]sx?$/.test(path))plan.vitest.push(path);
  else if(/\.test\.[cm]?js$/.test(path))plan.node.push(path);
  else if(/(?:^|\/)(?:test_[^/]+|[^/]+_test)\.py$/.test(path))plan.python.push(path);
  else if(/\.sh$/.test(path))plan.shell.push(path);
  else plan.unsupported.push(path);
 }
 if(e2eInputs.length)plan.e2e=selectE2eTests(e2eInputs,root);
 for(const key of Object.keys(plan))plan[key]=[...new Set(plan[key])].sort();
 if(plan.unsupported.length)throw new Error(`Unsupported changed tests: ${plan.unsupported.join(',')}`);
 return plan;
}
export function runChangedTests(plan,{mode='legacy',root='.',run=(cmd,args,options)=>spawnSync(cmd,args,options)}={}){
 const calls=[];const execute=(cmd,args,cwd)=>{
  const env={...process.env}; delete env.NODE_TEST_CONTEXT;
  const result=run(cmd,args,{cwd:root==='.'?cwd:`${root}/${cwd}`,env,stdio:'inherit'});calls.push({command:cmd,args,status:result.status});
  if(result.status!==0)throw new Error(`Changed test execution failed: ${cmd}`);
 };
 // Mode-independent language checks run once; PHP inherits the matrix FEATURE environment.
 if(mode==='legacy'){
  if(plan.node.length)execute('node',['--test',...plan.node],'.');
  for(const path of plan.python)execute('python3',['-c', `import importlib.util,sys,unittest
spec=importlib.util.spec_from_file_location('changed_test',sys.argv[1])
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
suite=unittest.defaultTestLoader.loadTestsFromModule(module)
if suite.countTestCases()==0: raise RuntimeError('CHANGED_PYTHON_TEST_SELECTION_EMPTY')
sys.exit(0 if unittest.TextTestRunner().run(suite).wasSuccessful() else 1)`,path],'.');
  for(const path of plan.shell)execute('bash',[path],'.');
 }
 if(mode==='e2e'||mode==='e2e-release'){
  // The changed-file plan is already bounded. Every selected scenario must
  // execute against production too, including files without an @release tag.
  if(plan.e2e.length)execute('pnpm',['exec','playwright','test',...plan.e2e],'.');
 }else if(mode!=='legacy')throw new Error('UNKNOWN_CHANGED_TEST_MODE');
 if(mode==='legacy'&&plan.php.length)execute('php',['artisan','test',...plan.php.map(p=>p.replace(/^backend\//,'')),'--no-ansi'],'backend');
 return calls;
}
if(import.meta.url===`file://${process.argv[1]}`){
 const [base,head,mode='legacy',output]=process.argv.slice(2);
 const typed=process.env.GITHUB_REPOSITORY==='fermatmind/fap-web';
 if(!/^[a-f0-9]{40}$/.test(base??'')||!/^[a-f0-9]{40}$/.test(head??''))throw new Error('Changed test SHA binding is required');
 const fields=execFileSync('git',['diff','--no-renames','--name-status','-z',base,head]).toString().split('\0').filter(Boolean);
 const changes=[];for(let i=0;i<fields.length;i+=2)changes.push({status:fields[i],path:fields[i+1]});
 const plan=changedTestPlan(changes,{vitest:typed});
 // The classifier already ran all tracked trunk Node contracts on this SHA.
 if(process.env.TRUNK_TESTS_VERIFIED_SHA){
   if(process.env.TRUNK_TESTS_VERIFIED_SHA!==head || process.env.GITHUB_SHA!==head)throw new Error('CHANGED_TEST_REUSE_SHA_HOLD');
   plan.node=plan.node.filter(p=>!p.startsWith('.github/trunk/'));
 }
 const calls=runChangedTests(plan,{mode});
 if(output)writeFileSync(output,JSON.stringify({sha:head,base,mode,plan,calls})+'\n');
}
