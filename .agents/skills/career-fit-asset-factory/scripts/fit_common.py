#!/usr/bin/env python3
"""Shared helpers for the career-fit block."""
from __future__ import annotations
import csv, hashlib, json, re
from pathlib import Path
from typing import Any, Iterable

BLOCK_TYPE='career-fit'
VERSION='career_fit_v1'
LOCALES=('zh-CN','en')
REQUIRED={'ledger_type','asset_version','block_type','slug','locale','occupation','seed_ordinal','batch_role','sources','audit_fields'}
RUNTIME_OR_SEO=re.compile(r"\b(search_projection|sitemap|noindex|json-ld|jsonld|robots\.txt|llms\.txt|cms import|production import|staging_preview|canonical)\b", re.I)
RAW_INTERNAL=re.compile(r"\b(evidence_id|source_id|row_hash|audit_fields|internal lineage|repair note|gate label|source_id)\b", re.I)
DETERMINISTIC_FIT=re.compile(r"\b(must choose|cannot choose|guarantees? fit|perfect career|best career for your type|will succeed|will fail|destiny|mental health diagnosis|clinical diagnosis|therapy)\b|必须选择|不能从事|一定适合|一定不适合|命中注定|心理诊断|心理疾病|保证成功", re.I)
OUTCOME_CLAIMS=re.compile(r"\b(will get hired|job offer|salary|wage|income|promotion|admission|certification guaranteed|employment guaranteed|guarantee[sd]?)\b|保证(?:就业|入职|录取|拿证|收入|薪资|工资|升职)", re.I)
DISALLOWED_EVIDENCE_TERMS=re.compile(r"\b(ai impact|automation score|salary|wage|income|job board|indeed|linkedin job|glassdoor)\b|薪资|工资|收入|招聘网站|岗位广告|AI影响", re.I)

def read_json(path: str|Path)->Any:
    return json.loads(Path(path).read_text(encoding='utf-8'))
def write_json(path: str|Path, payload: Any)->None:
    p=Path(path); p.parent.mkdir(parents=True, exist_ok=True); p.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def read_jsonl(path: str|Path)->list[dict[str,Any]]:
    rows=[]
    with Path(path).open(encoding='utf-8') as h:
        for line in h:
            line=line.strip()
            if line: rows.append(json.loads(line))
    return rows
def write_jsonl(path: str|Path, rows: Iterable[dict[str,Any]])->None:
    p=Path(path); p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('w',encoding='utf-8') as h:
        for row in rows: h.write(json.dumps(row,ensure_ascii=False,sort_keys=True)+'\n')
def write_csv(path: str|Path, rows: list[dict[str,Any]], fields: list[str])->None:
    p=Path(path); p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('w',newline='',encoding='utf-8') as h:
        w=csv.DictWriter(h, fieldnames=fields); w.writeheader(); w.writerows(rows)
def sha256_file(path: str|Path)->str:
    d=hashlib.sha256()
    with Path(path).open('rb') as h:
        for chunk in iter(lambda:h.read(1024*1024), b''): d.update(chunk)
    return d.hexdigest()
def row_hash(row: dict[str,Any])->str:
    clone=json.loads(json.dumps(row,ensure_ascii=False,sort_keys=True)); clone.setdefault('audit_fields',{}).pop('row_hash',None)
    return hashlib.sha256(json.dumps(clone,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def load_seed(path: str|Path)->list[dict[str,Any]]:
    data=read_json(path)
    if isinstance(data,dict):
        for k in ('jobs','rows','careers','items'):
            if isinstance(data.get(k),list): return data[k]
    if isinstance(data,list): return data
    raise ValueError(f'Unsupported seed shape: {path}')
def nested_get(row: dict[str,Any], *keys: str, default: Any=None)->Any:
    for key in keys:
        if row.get(key) not in (None,''): return row[key]
    for source in [row.get('occupation') if isinstance(row.get('occupation'),dict) else {}, (row.get('existing_fermatmind_context') or {}).get('en') if isinstance(row.get('existing_fermatmind_context'),dict) else {}, (row.get('existing_fermatmind_context') or {}).get('zh-CN') if isinstance(row.get('existing_fermatmind_context'),dict) else {}]:
        if not isinstance(source,dict): continue
        for key in keys:
            if source.get(key) not in (None,''): return source[key]
    return default
def normalize_seed_row(row: dict[str,Any], ordinal: int|None=None)->dict[str,Any]:
    seed_ordinal=int(nested_get(row,'seed_ordinal','ordinal','index', default=ordinal or 0))
    return {'seed_ordinal':seed_ordinal,'slug':nested_get(row,'slug'),'title_en':nested_get(row,'title_en','occupation_en','name_en','title'),'title_zh':nested_get(row,'title_zh','title_zh_seed','occupation_zh','name_zh'),'title_zh_seed':nested_get(row,'title_zh_seed','title_zh','occupation_zh','name_zh'),'soc_code_seed':nested_get(row,'soc_code_seed','soc_code','soc'),'onet_code_seed':nested_get(row,'onet_code_seed','onet_code','onet')}
def fail_report(output: str|Path, findings: list[dict[str,Any]], summary: dict[str,Any])->int:
    final='PASS' if not findings else 'REPAIR_REQUIRED'; write_json(output,{**summary,'finding_count':len(findings),'findings':findings,'final_conclusion':final}); return 0 if final=='PASS' else 1
def text_values(v: Any)->Iterable[str]:
    if isinstance(v,str): yield v
    elif isinstance(v,list):
        for i in v: yield from text_values(i)
    elif isinstance(v,dict):
        for k,i in v.items():
            if k in {'audit_fields','evidence_used','derived_from_evidence','derived_from_synthesis'}: continue
            yield from text_values(i)
def validate_common_rows(rows: list[dict[str,Any]], ledger_type: str)->list[dict[str,Any]]:
    findings=[]; seen=set()
    for index,row in enumerate(rows,1):
        missing=sorted(REQUIRED-row.keys())
        if missing: findings.append({'row':index,'slug':row.get('slug'),'locale':row.get('locale'),'issue':'missing_required_fields','fields':missing})
        if row.get('ledger_type')!=ledger_type: findings.append({'row':index,'slug':row.get('slug'),'locale':row.get('locale'),'issue':'bad_ledger_type'})
        if row.get('block_type')!=BLOCK_TYPE: findings.append({'row':index,'slug':row.get('slug'),'locale':row.get('locale'),'issue':'bad_block_type'})
        if row.get('locale') not in LOCALES: findings.append({'row':index,'slug':row.get('slug'),'locale':row.get('locale'),'issue':'bad_locale'})
        key=(row.get('slug'),row.get('locale'))
        if key in seen: findings.append({'row':index,'slug':row.get('slug'),'locale':row.get('locale'),'issue':'duplicate_slug_locale'})
        seen.add(key)
        if not row.get('sources'): findings.append({'row':index,'slug':row.get('slug'),'locale':row.get('locale'),'issue':'missing_sources'})
    return findings
def first_jsonl_in(baseline_dir: str|Path, subdir: str)->Path:
    root=Path(baseline_dir)/subdir; matches=sorted(root.glob('*.jsonl'))
    if not matches: raise FileNotFoundError(f'No JSONL found under {root}')
    return matches[0]
def rows_by_slug_locale(path: str|Path)->dict[tuple[str,str],dict[str,Any]]:
    return {(r['slug'],r['locale']):r for r in read_jsonl(path)}
def _is_negative_boundary(sentence: str) -> bool:
    lowered = sentence.lower()
    return any(marker in lowered for marker in ("not ", "no ", "does not", "do not", "cannot", "must not", "without", "rather than", "不是", "不能", "不得", "不会", "并非", "不预测", "不作为"))

def unsafe_fit_text(text: str)->bool:
    for sentence in re.split(r"(?<=[。.!?])\s+", text):
        if _is_negative_boundary(sentence):
            continue
        if DETERMINISTIC_FIT.search(sentence) or OUTCOME_CLAIMS.search(sentence):
            return True
    return False

def source_safe_text(text: str)->bool:
    for sentence in re.split(r"(?<=[。.!?])\s+", text):
        if _is_negative_boundary(sentence):
            continue
        if DISALLOWED_EVIDENCE_TERMS.search(sentence):
            return False
    return True
