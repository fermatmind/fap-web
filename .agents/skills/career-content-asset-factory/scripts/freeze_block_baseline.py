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
    p=argparse.ArgumentParser(description='Copy PASS block artifacts to a new frozen baseline directory and write SHA manifest. Requires --output-dir.')
    p.add_argument('--input-dir', required=True)
    p.add_argument('--output-dir', required=True)
    p.add_argument('--final-conclusion', required=True)
    p.add_argument('--force', action='store_true')
    args=p.parse_args()
    src=Path(args.input_dir); dst=Path(args.output_dir)
    if not src.exists(): fail({'error':'input missing', 'input_dir': str(src)},2)
    if dst.exists() and any(dst.iterdir()) and not args.force: fail({'error':'output exists; use --force only for explicit overwrite', 'output_dir': str(dst)},2)
    dst.mkdir(parents=True, exist_ok=True)
    copied=[]
    for fp in src.iterdir():
        if fp.is_file():
            target=dst/fp.name
            shutil.copy2(fp,target)
            copied.append({'path': str(target), 'sha256': sha256_file(target)})
    report={'source_dir': str(src), 'baseline_dir': str(dst), 'copied_count': len(copied), 'files': copied, 'final_conclusion': args.final_conclusion}
    write_json(dst/'baseline_sha256_manifest.json', {'files': copied})
    write_json(dst/'baseline_freeze_report.json', report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
if __name__=='__main__': main()
