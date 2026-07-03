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
    p=argparse.ArgumentParser(description='Validate career KG search projection quarantine.')
    p.add_argument('--asset', required=True)
    p.add_argument('--search-projection')
    p.add_argument('--candidate', dest='search_projection')
    p.add_argument('--output')
    args=p.parse_args()
    asset_path=Path(args.asset)
    asset_text=asset_path.read_text(encoding='utf-8', errors='ignore')
    asset_json=None
    try:
        asset_json=json.loads(asset_text)
    except Exception:
        asset_json=None
    findings=[]
    forbidden_asset_terms=['search_projection','candidate_only_not_runtime_seo','backend projection review','runtime_seo']
    for term in forbidden_asset_terms:
        if term in asset_text:
            findings.append({'file': args.asset, 'term': term, 'issue': 'candidate projection or runtime SEO term found in reader asset'})
    if isinstance(asset_json, dict):
        for key in ['json_ld_runtime','noindex_runtime','sitemap_runtime','llms_runtime','canonical_runtime','search_provider_submission']:
            if key in asset_json:
                findings.append({'file': args.asset, 'field': key, 'issue': 'runtime SEO control field found in reader asset'})
        boundaries=asset_json.get('release_boundaries')
        if isinstance(boundaries, dict):
            for key, value in boundaries.items():
                if key in ['sitemap_change_authorized','llms_change_authorized','json_ld_release_authorized','canonical_change_authorized','noindex_change_authorized','search_provider_submission_authorized'] and value is not False:
                    findings.append({'file': args.asset, 'field': f'release_boundaries.{key}', 'issue': 'runtime SEO release boundary must remain false'})
    projection_exists=bool(args.search_projection and Path(args.search_projection).exists())
    candidate_report=None
    if args.search_projection:
        candidate_path=Path(args.search_projection)
        if not candidate_path.exists():
            findings.append({'file': args.search_projection, 'issue': 'search projection candidate file missing'})
        else:
            candidate=read_json(candidate_path)
            candidate_findings=[]
            if candidate.get('artifact_type') != 'career_kg_search_projection_candidate':
                candidate_findings.append({'field':'artifact_type','issue':'must be career_kg_search_projection_candidate'})
            if candidate.get('status') != 'candidate_only':
                candidate_findings.append({'field':'status','issue':'must be candidate_only'})
            for flag in ['production_import_approved','staging_write_approved','seo_runtime_release_approved','cms_write_approved']:
                if candidate.get(flag) is not False:
                    candidate_findings.append({'field':flag,'issue':'must be false'})
            release= candidate.get('release_boundaries', {})
            if not isinstance(release, dict) or any(value is not False for value in release.values()):
                candidate_findings.append({'field':'release_boundaries','issue':'all release boundaries must be false'})
            for finding in candidate_findings:
                findings.append({'file': args.search_projection, **finding})
            candidate_report={'finding_count':len(candidate_findings),'findings':candidate_findings}
    report={'asset': args.asset, 'search_projection_file_exists': projection_exists, 'candidate_report': candidate_report, 'finding_count': len(findings), 'findings': findings, 'final_conclusion': 'PASS' if not findings else 'REPAIR_REQUIRED'}
    if args.output: write_json(args.output, report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    sys.exit(0 if not findings else 1)
if __name__=='__main__': main()
