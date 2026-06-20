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
    p=argparse.ArgumentParser(description='Detect latest PASS baseline directory for a content block.')
    p.add_argument('--root', default='generated')
    p.add_argument('--block', required=True, help='Block prefix, e.g. career-ai-impact-v5')
    p.add_argument('--output')
    args=p.parse_args()
    root=Path(args.root)
    candidates=[]
    for d in root.glob(f'{args.block}*pass-baseline'):
        if d.is_dir():
            report=d/'baseline_freeze_report.json'
            mtime=d.stat().st_mtime
            data={}
            if report.exists():
                try: data=read_json(report)
                except Exception: data={}
            candidates.append({'path': str(d), 'mtime': mtime, 'freeze_report': str(report) if report.exists() else None, 'final_conclusion': data.get('final_conclusion') or data.get('status')})
    candidates.sort(key=lambda x:x['mtime'], reverse=True)
    result={'block': args.block, 'candidate_count': len(candidates), 'latest': candidates[0] if candidates else None, 'candidates': candidates}
    if args.output: write_json(args.output, result)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(0 if candidates else 2)
if __name__=='__main__': main()
