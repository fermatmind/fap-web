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
    p=argparse.ArgumentParser(description='Validate orchestrator state files exist and satisfy required top-level keys from schemas.')
    p.add_argument('--state-dir', required=True)
    p.add_argument('--schema-dir', default=str(Path(__file__).resolve().parents[1] / 'schemas'))
    p.add_argument('--output')
    args=p.parse_args()
    state=Path(args.state_dir); schemas=Path(args.schema_dir)
    checks=[]
    mapping={
      'global_content_state.json':'career_content_global_state.schema.json','career_block_status.json':'career_block_status.schema.json','personality_block_status.json':'personality_block_status.schema.json','bridge_asset_status.json':'bridge_asset_status.schema.json','latest_pass_baselines.json':'latest_pass_baselines.schema.json','batch_registry.json':'batch_registry.schema.json','open_failures.json':'open_failures.schema.json','import_state.json':'import_state.schema.json'}
    for fname,sname in mapping.items():
        fp=state/fname; sp=schemas/sname
        ok=fp.exists(); missing=[]
        if ok:
            data=read_json(fp); schema=read_json(sp); missing=[k for k in schema.get('required',[]) if k not in data]
            ok=not missing
        checks.append({'file': fname, 'exists': fp.exists(), 'missing_required_keys': missing, 'status': 'PASS' if ok else 'REPAIR_REQUIRED'})
    report={'checks':checks, 'finding_count': sum(1 for c in checks if c['status']!='PASS'), 'final_conclusion': 'PASS' if all(c['status']=='PASS' for c in checks) else 'REPAIR_REQUIRED'}
    if args.output: write_json(args.output, report)
    print(json.dumps(report, indent=2))
    sys.exit(0 if report['final_conclusion']=='PASS' else 1)
if __name__=='__main__': main()
