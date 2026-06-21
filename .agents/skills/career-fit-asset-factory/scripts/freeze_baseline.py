#!/usr/bin/env python3
"""Freeze a PASS career-fit baseline with SHA manifests."""
from __future__ import annotations
import argparse, datetime, json, shutil
from pathlib import Path
from fit_common import read_jsonl, sha256_file, write_json

def parse_args():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('--evidence',required=True); p.add_argument('--synthesis',required=True); p.add_argument('--assets',required=True); p.add_argument('--audit',required=True); p.add_argument('--output-dir',required=True); return p.parse_args()
def main():
    a=parse_args(); out=Path(a.output_dir)
    if out.exists(): raise SystemExit(f'Refusing to overwrite existing baseline: {out}')
    for d in ('evidence','synthesis','assets','asset_audit'): (out/d).mkdir(parents=True, exist_ok=True)
    shutil.copy2(a.evidence,out/'evidence'/Path(a.evidence).name); shutil.copy2(a.synthesis,out/'synthesis'/Path(a.synthesis).name); shutil.copy2(a.assets,out/'assets'/Path(a.assets).name); shutil.copy2(a.audit,out/'asset_audit'/Path(a.audit).name)
    evidence=read_jsonl(a.evidence); synthesis=read_jsonl(a.synthesis); assets=read_jsonl(a.assets); now=datetime.datetime.now(datetime.timezone.utc).isoformat()
    validation={'generated_at':now,'final_conclusion':'CAREER_FIT_BASELINE_FROZEN','baseline_slug_count':len({r.get('slug') for r in assets}),'evidence_line_count':len(evidence),'synthesis_line_count':len(synthesis),'asset_line_count':len(assets),'zh_CN_asset_count':sum(1 for r in assets if r.get('locale')=='zh-CN'),'en_asset_count':sum(1 for r in assets if r.get('locale')=='en'),'search_projection_generated':False,'runtime_modified':False,'seo_modified':False,'cms_imported':False,'staging_created':False,'production_imported':False}
    write_json(out/'baseline_validation.json',validation); files=[]
    for p in sorted(out.rglob('*')):
        if p.is_file() and p.name!='baseline_sha256_manifest.json': files.append({'path':str(p),'sha256':sha256_file(p),'bytes':p.stat().st_size})
    write_json(out/'baseline_sha256_manifest.json',{'generated_at':now,'files':files})
    (out/'baseline_freeze_report.md').write_text('# Career Fit Baseline Freeze\n\n- final_conclusion: `CAREER_FIT_BASELINE_FROZEN`\n- baseline_slug_count: `'+str(validation['baseline_slug_count'])+'`\n- search_projection/runtime/SEO/CMS/staging/production: `false`\n',encoding='utf-8')
    print(json.dumps(validation,ensure_ascii=False,indent=2)); return 0
if __name__=='__main__': raise SystemExit(main())
