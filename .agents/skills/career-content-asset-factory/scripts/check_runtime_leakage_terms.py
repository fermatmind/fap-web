#!/usr/bin/env python3

import argparse, json, sys, csv, hashlib, shutil, re
from pathlib import Path

def read_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def read_jsonl(path):
    rows=[]
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line=line.strip()
            if line:
                rows.append(json.loads(line))
    return rows

def write_json(path, data):
    path=Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n", encoding='utf-8')

def sha256_file(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda:f.read(1024*1024), b''):
            h.update(chunk)
    return h.hexdigest()

def fail(report, code=1):
    print(json.dumps(report, ensure_ascii=False, indent=2))
    sys.exit(code)


def main():
    p=argparse.ArgumentParser(description='Scan files for runtime leakage terms.')
    p.add_argument('--inputs', nargs='+', required=True)
    p.add_argument('--output')
    p.add_argument('--terms', default='audit_fields,evidence_id,source_id,row_hash,search_projection,candidate_only,internal lineage,repair changes prose')
    args=p.parse_args()
    terms=[t.strip() for t in args.terms.split(',') if t.strip()]
    findings=[]
    for pattern in args.inputs:
        for fp in Path().glob(pattern):
            if fp.is_file():
                text=fp.read_text(encoding='utf-8', errors='ignore')
                for term in terms:
                    if term in text:
                        findings.append({'file': str(fp), 'term': term})
    report={'finding_count': len(findings), 'findings': findings, 'final_conclusion': 'PASS' if not findings else 'REPAIR_REQUIRED'}
    if args.output: write_json(args.output, report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    sys.exit(0 if not findings else 1)
if __name__=='__main__': main()
