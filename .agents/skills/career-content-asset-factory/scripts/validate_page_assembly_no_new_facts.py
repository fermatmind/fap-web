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
    p=argparse.ArgumentParser(description='Validate page assembly rows declare source blocks and do not mark new facts.')
    p.add_argument('--assembly', required=True)
    p.add_argument('--output')
    args=p.parse_args()
    path=Path(args.assembly)
    rows=read_jsonl(path) if path.suffix=='.jsonl' else (read_json(path).get('rows') if isinstance(read_json(path),dict) else read_json(path))
    findings=[]
    for i,row in enumerate(rows or [], start=1):
        blocks=row.get('source_blocks') or row.get('derived_from_blocks') or row.get('block_sources')
        if not blocks:
            findings.append({'row': i, 'issue': 'missing source_blocks'})
        if row.get('new_facts') is True:
            findings.append({'row': i, 'issue': 'new_facts true is forbidden in page assembly'})
    report={'row_count': len(rows or []), 'finding_count': len(findings), 'findings': findings, 'final_conclusion': 'PASS' if not findings else 'REPAIR_REQUIRED'}
    if args.output: write_json(args.output, report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    sys.exit(0 if not findings else 1)
if __name__=='__main__': main()
