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
    p=argparse.ArgumentParser(description='Plan the next safe goal from state files without executing it.')
    p.add_argument('--state-dir', required=True)
    p.add_argument('--block', required=True)
    p.add_argument('--output')
    args=p.parse_args()
    state=Path(args.state_dir)
    failures=read_json(state/'open_failures.json') if (state/'open_failures.json').exists() else {'failures':[]}
    if failures.get('failures'):
        goal='repair_open_failures'
    else:
        goal=f'detect_latest_baseline_then_create_next_{args.block}_manifest'
    text=f"# Next Goal Recommendation\n\nRecommended goal: `{goal}`.\n\nDo not generate content unless the next goal explicitly authorizes it.\n"
    if args.output: Path(args.output).write_text(text, encoding='utf-8')
    print(text)
if __name__=='__main__': main()
