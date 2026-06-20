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
    p=argparse.ArgumentParser(description='Validate search_projection is outside reader asset.')
    p.add_argument('--asset', required=True)
    p.add_argument('--search-projection')
    p.add_argument('--output')
    args=p.parse_args()
    asset_text=Path(args.asset).read_text(encoding='utf-8', errors='ignore')
    findings=[]
    for term in ['search_projection','candidate_only_not_runtime_seo','backend projection review','runtime_seo','json_ld','canonical','noindex','sitemap']:
        if term in asset_text:
            findings.append({'file': args.asset, 'term': term, 'issue': 'candidate projection or runtime SEO term found in reader asset'})
    projection_exists=bool(args.search_projection and Path(args.search_projection).exists())
    report={'asset': args.asset, 'search_projection_file_exists': projection_exists, 'finding_count': len(findings), 'findings': findings, 'final_conclusion': 'PASS' if not findings else 'REPAIR_REQUIRED'}
    if args.output: write_json(args.output, report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    sys.exit(0 if not findings else 1)
if __name__=='__main__': main()
