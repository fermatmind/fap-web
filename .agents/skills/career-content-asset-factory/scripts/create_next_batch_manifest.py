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


def extract_slug(row):
    return row.get('slug') or row.get('career_slug') or row.get('job_slug')

def main():
    p=argparse.ArgumentParser(description='Create control_N + new_M manifest from a seed and control baseline slugs.')
    p.add_argument('--seed', required=True)
    p.add_argument('--baseline-slugs', help='JSON/JSONL file with control slugs; optional for batch 1')
    p.add_argument('--output-dir', required=True)
    p.add_argument('--batch-index', type=int, required=True)
    p.add_argument('--batch-size', type=int, default=50)
    p.add_argument('--expected-locales', default='zh-CN,en')
    args=p.parse_args()
    seed_data=read_json(args.seed)
    seed_rows=seed_data.get('jobs') or seed_data.get('rows') or seed_data
    if not isinstance(seed_rows, list): fail({'error':'seed must be a list or object with jobs/rows'},2)
    controls=[]
    if args.baseline_slugs:
        path=Path(args.baseline_slugs)
        if path.suffix == '.jsonl': rows=read_jsonl(path)
        else:
            raw=read_json(path); rows=raw.get('rows') or raw.get('slugs') or raw
        for r in rows:
            if isinstance(r,str): controls.append(r)
            elif isinstance(r,dict) and extract_slug(r): controls.append(extract_slug(r))
    control_set=set(controls)
    new=[]
    for row in seed_rows:
        slug=extract_slug(row)
        if slug and slug not in control_set:
            new.append(row)
        if len(new) >= args.batch_size: break
    locales=[x.strip() for x in args.expected_locales.split(',') if x.strip()]
    manifest=[]
    seed_by_slug={extract_slug(r): r for r in seed_rows if extract_slug(r)}
    for i, slug in enumerate(controls, start=1):
        r=seed_by_slug.get(slug,{})
        manifest.append({'batch_index': args.batch_index, 'batch_role': f'control_{len(controls)}', 'seed_ordinal': r.get('seed_ordinal') or r.get('ordinal'), 'slug': slug, 'title_en': r.get('title_en') or r.get('title'), 'title_zh': r.get('title_zh') or r.get('title_zh_seed'), 'title_zh_seed': r.get('title_zh_seed') or r.get('title_zh'), 'soc_code_seed': r.get('soc_code_seed') or r.get('soc_code'), 'onet_code_seed': r.get('onet_code_seed') or r.get('onet_code'), 'expected_locales': locales})
    for r in new:
        manifest.append({'batch_index': args.batch_index, 'batch_role': f'new_{len(new)}', 'seed_ordinal': r.get('seed_ordinal') or r.get('ordinal'), 'slug': extract_slug(r), 'title_en': r.get('title_en') or r.get('title'), 'title_zh': r.get('title_zh') or r.get('title_zh_seed'), 'title_zh_seed': r.get('title_zh_seed') or r.get('title_zh'), 'soc_code_seed': r.get('soc_code_seed') or r.get('soc_code'), 'onet_code_seed': r.get('onet_code_seed') or r.get('onet_code'), 'expected_locales': locales})
    out=Path(args.output_dir); out.mkdir(parents=True, exist_ok=True)
    write_json(out/'manifest.json', {'batch_index': args.batch_index, 'control_count': len(controls), 'new_count': len(new), 'rows': manifest})
    with open(out/'manifest.csv','w',newline='',encoding='utf-8') as f:
        fields=['batch_index','batch_role','seed_ordinal','slug','title_en','title_zh','title_zh_seed','soc_code_seed','onet_code_seed','expected_locales']
        w=csv.DictWriter(f, fieldnames=fields); w.writeheader()
        for row in manifest:
            row=row.copy(); row['expected_locales']='|'.join(row['expected_locales']); w.writerow(row)
    validation={'total_rows': len(manifest), 'control_count': len(controls), 'new_count': len(new), 'duplicate_slug_count': len(manifest)-len({r['slug'] for r in manifest}), 'final_batch_smaller_than_requested': len(new) < args.batch_size, 'final_conclusion': 'PASS' if new and len(manifest)==len({r['slug'] for r in manifest}) else 'REPAIR_REQUIRED'}
    write_json(out/'manifest_validation.json', validation)
    print(json.dumps(validation, ensure_ascii=False, indent=2))
    sys.exit(0 if validation['final_conclusion']=='PASS' else 1)
if __name__=='__main__': main()
