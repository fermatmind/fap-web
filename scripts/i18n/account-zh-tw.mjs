import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {convertText} from './convert-zh-tw.mjs';

const root=new URL('../../',import.meta.url);
const sourceFiles=['components/account/AccountCenter.tsx','app/(localized)/[locale]/account/page.tsx'];
const converter='opencc-js@1.4.2:cn:twp';
const glossary='fermatmind-tw-account-1';
const phrases=[['情商测试','情緒智力測試'],['职业探索','職涯探索'],['邮箱','電子郵件地址'],['账号','帳號'],['账户','帳戶'],['身份','身分'],['关联','連結'],['连接','連結'],['通过','透過'],['退出登录','登出'],['收件箱','收件匣']];
const hash=x=>createHash('sha256').update(x).digest('hex');
const protectedTokens=/https?:\/\/[^\s<>）)]+|`[^`]*`|\{\{[^}]*\}\}|\$?\{[^}]*\}|%\d*\$?[sdif]|\d+(?:[.,:/-]\d+)*/g;
export function buildAccountTraditional(previous={}) {
 const sourceHashes={},texts=new Set();
 for(const file of sourceFiles){
  const raw=readFileSync(new URL(file,root),'utf8');sourceHashes[file]=hash(raw);
  const ast=ts.createSourceFile(file,raw,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  function visit(node){
   if((ts.isStringLiteralLike(node)||ts.isJsxText(node)||ts.isTemplateHead(node)||ts.isTemplateMiddle(node)||ts.isTemplateTail(node))&&/\p{Script=Han}/u.test(node.text))texts.add(node.text);
   ts.forEachChild(node,visit);
  }
  visit(ast);
 }
 const converterSourceHash=hash(readFileSync(new URL('scripts/i18n/convert-zh-tw.mjs',root)));
 const units={};
 for(const source of [...texts].sort()){
  const sourceHash=hash(JSON.stringify(['zh-TW','account-ui',source,converter,converterSourceHash,glossary,phrases]));
  const prior=previous.units?.[source];
  const text=prior?.sourceHash===sourceHash?prior.text:convertText(source,phrases);
  if(JSON.stringify(source.match(protectedTokens)??[])!==JSON.stringify(text.match(protectedTokens)??[]))throw new Error('Account reader token changed');
  units[source]={sourceHash,text};
 }
 return {targetLocale:'zh-TW',converter,converterSourceHash,glossary,sourceHashes,units};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const output=new URL('lib/i18n/zh-TW/account.generated.json',root);
 const previous=existsSync(output)?readFileSync(output,'utf8'):'';
 const next=JSON.stringify(buildAccountTraditional(previous?JSON.parse(previous):{}),null,2)+'\n';
 if(process.argv.includes('--check')){if(previous!==next)throw new Error('Account Traditional reader fields are missing or stale');}
 else if(previous!==next)writeFileSync(output,next);
 console.log('zh-TW account: '+Object.keys(JSON.parse(next).units).length+' explicit reader strings; '+(process.argv.includes('--check')?'verified':'generated'));
}
