import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';

// Imports and literal source/fixture reads connect contracts to their real inputs.
// Unresolved/dynamic repository inputs retain the complete regression selection.
export function selectTests(changed, root=process.cwd()) {
  const tracked=execFileSync('git',['ls-files','-z'],{cwd:root}).toString().split('\0').filter(Boolean);
  const known=new Set(tracked), edges=new Map();
  const tests=tracked.filter(p=>/^tests\/(?:contracts|a11y)\//.test(p)&&/\.test\.[jt]sx?$/.test(p));
  const resolve=(value, parent)=>{
    const base=value.startsWith('@/')?value.slice(2):value.startsWith('.')?path.posix.normalize(path.posix.join(path.posix.dirname(parent),value)):value;
    return [base,...['.ts','.tsx','.js','.mjs','.json','/index.ts','/index.tsx'].map(ext=>base+ext)].find(p=>known.has(p));
  };
  for(const file of tracked.filter(p=>/\.[cm]?[jt]sx?$/.test(p))) {
    if(!existsSync(path.join(root,file))) continue;
    const body=readFileSync(path.join(root,file),'utf8');
    const inputs=[...body.matchAll(/(?:from\s*|import\s*\(|require\s*\()(['"])([^'"]+)\1/g)].map(m=>resolve(m[2],file));
    // Source-inspection contracts and fixtures are executable consumers too.
    for(const match of body.matchAll(/(['"])((?:app|components|lib|hooks|scripts|tests|deploy|docs|\.github)\/[^'"\n]+)\1/g)) inputs.push(resolve(match[2],file));
    edges.set(file,[...new Set(inputs.filter(Boolean))]);
  }
  const dependencies=file=>{
    const found=new Set([file]),todo=[file];
    while(todo.length) for(const input of edges.get(todo.pop())??[]) if(!found.has(input)){found.add(input);todo.push(input);}
    return found;
  };
  const closures=new Map(tests.map(p=>[p,dependencies(p)]));
  const consumed=new Set([...closures.values()].flatMap(s=>[...s]));
  const runtime=changed.filter(p=>!/(?:^|\/)(?:test_[^/]+|[^/]+_test)\.(?:py|sh)$/.test(p)&&!/^(?:docs|tests|\.agents)\//.test(p)&&!p.endsWith('AGENTS.md')&&!/\.test\.[cm]?[jt]sx?$/.test(p));
  const full=runtime.some(p=>/^(?:package\.json|pnpm-lock\.yaml|tsconfig|next\.config|vitest\.config|\.github\/|scripts\/testing\/)/.test(p)||!consumed.has(p));
  const core=tests.filter(p=>[...closures.get(p)].some(input=>/^lib\/(?:api|auth|payments?)(?:\/|\.)/.test(input)));
  const selected=full?tests:tests.filter(p=>changed.some(input=>closures.get(p).has(input))||(runtime.length&&core.includes(p)));
  // Changed test files are never silently excluded by a quarantine/group list.
  for(const file of changed.filter(p=>/^tests\/.*\.test\.[jt]sx?$/.test(p))) if(known.has(file)&&!selected.includes(file)) selected.push(file);
  selected.sort();
  if(runtime.length&&!selected.length) throw new Error('REQUIRED_TEST_SELECTION_EMPTY');
  return {schema_version:'fap.test_selection.v1',paths:[...new Set(changed)].sort(),mode:full?'conservative_full':'consumer_union',files:selected,contracts_required:selected.length>0,shards:[1,2,3,4].filter(n=>selected.some((_,i)=>i%4===n-1))};
}
export function validateTestSelection(classification,sha,knownFiles,root=null) {
  const plan=classification?.test_selection;
  if(classification?.candidate_sha!==sha||! /^[a-f0-9]{40}$/.test(sha??'')||plan?.schema_version!=='fap.test_selection.v1'
    ||JSON.stringify(plan.paths)!==JSON.stringify([...new Set(classification.paths)].sort())||!Array.isArray(plan.files)
    ||plan.files.some(p=>!knownFiles.includes(p))||new Set(plan.files).size!==plan.files.length
    ||(plan.contracts_required&&plan.files.length===0)||plan.contracts_required!==(plan.files.length>0)) throw new Error('TEST_SELECTION_BINDING_HOLD');
  const shards=[1,2,3,4].filter(n=>plan.files.some((_,i)=>i%4===n-1));
  if(JSON.stringify(plan.shards)!==JSON.stringify(shards)) throw new Error('TEST_SELECTION_BINDING_HOLD');
  if(root && JSON.stringify(selectTests(classification.paths,root))!==JSON.stringify(plan)) throw new Error('TEST_SELECTION_CONSUMER_SCOPE_HOLD');
  return plan;
}
