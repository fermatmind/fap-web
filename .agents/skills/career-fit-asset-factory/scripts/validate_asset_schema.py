#!/usr/bin/env python3
"""Validate career-fit asset JSONL shape."""
from __future__ import annotations
import argparse
from fit_common import fail_report, read_jsonl, validate_common_rows

def parse_args():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('--input',required=True); p.add_argument('--output',required=True); return p.parse_args()
def main():
    a=parse_args(); rows=read_jsonl(a.input); findings=validate_common_rows(rows,'career-fit_asset')
    for i,row in enumerate(rows,1):
        facts=row.get('facts') or {}
        if facts.get('search_projection_generated') is not False: findings.append({'row':i,'slug':row.get('slug'),'locale':row.get('locale'),'issue':'search_projection_not_quarantined'})
        if 'asset'=='evidence':
            if not facts.get('identity_ref',{}).get('row_hash'): findings.append({'row':i,'slug':row.get('slug'),'locale':row.get('locale'),'issue':'missing_identity_dependency_hash'})
            if not facts.get('work_activities_ref',{}).get('row_hash'): findings.append({'row':i,'slug':row.get('slug'),'locale':row.get('locale'),'issue':'missing_work_activities_dependency_hash'})
            if not facts.get('skills_entry_ref',{}).get('row_hash'): findings.append({'row':i,'slug':row.get('slug'),'locale':row.get('locale'),'issue':'missing_skills_entry_dependency_hash'})
            if len(row.get('items') or []) < 5: findings.append({'row':i,'slug':row.get('slug'),'locale':row.get('locale'),'issue':'too_few_fit_evidence_items'})
        if 'asset'=='asset':
            if len(row.get('fit_signals') or []) < 4: findings.append({'row':i,'slug':row.get('slug'),'locale':row.get('locale'),'issue':'too_few_fit_signals'})
            if len(row.get('possible_friction_points') or []) < 2: findings.append({'row':i,'slug':row.get('slug'),'locale':row.get('locale'),'issue':'too_few_friction_points'})
            if len(row.get('how_to_test_fit') or []) < 2: findings.append({'row':i,'slug':row.get('slug'),'locale':row.get('locale'),'issue':'too_few_test_guidance_items'})
    return fail_report(a.output,findings,{'row_count':len(rows),'unique_slug_locale_count':len({(r.get('slug'),r.get('locale')) for r in rows})})
if __name__=='__main__': raise SystemExit(main())
