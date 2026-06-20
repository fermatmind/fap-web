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
    p=argparse.ArgumentParser(description='Merge a patch JSON into an agent state JSON. Writes only when --output is supplied.')
    p.add_argument('--input')
    p.add_argument('--patch', required=True)
    p.add_argument('--output')
    args=p.parse_args()
    base=read_json(args.input) if args.input else {}
    patch=read_json(args.patch)
    if not isinstance(base,dict) or not isinstance(patch,dict): fail({'error':'input and patch must be JSON objects'},2)
    merged={**base, **patch}
    if args.output: write_json(args.output, merged)
    print(json.dumps({'updated': bool(args.output), 'keys': sorted(merged.keys())}, indent=2))
if __name__=='__main__': main()
