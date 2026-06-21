#!/usr/bin/env python3
"""Audit career-fit evidence for traceability and source safety."""
from __future__ import annotations
import argparse
from fit_common import RUNTIME_OR_SEO, fail_report, read_jsonl, source_safe_text, text_values, unsafe_fit_text

def parse_args():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('--input',required=True); p.add_argument('--output',required=True); return p.parse_args()
def main():
    a=parse_args(); rows=read_jsonl(a.input); findings=[]
    for row in rows:
        slug=row.get('slug'); loc=row.get('locale'); text='\n'.join(text_values(row)); facts=row.get('facts') or {}; source_ids={s.get('source_id') for s in row.get('sources') or [] if s.get('source_id')}
        if RUNTIME_OR_SEO.search(text): findings.append({'slug':slug,'locale':loc,'issue':'runtime_or_search_instruction_leakage'})
        if unsafe_fit_text(text): findings.append({'slug':slug,'locale':loc,'issue':'deterministic_or_outcome_fit_claim'})
        if not source_safe_text(text): findings.append({'slug':slug,'locale':loc,'issue':'disallowed_salary_ai_or_job_board_fit_evidence'})
        for ref in ('identity_ref','work_activities_ref','skills_entry_ref'):
            if not facts.get(ref,{}).get('row_hash'): findings.append({'slug':slug,'locale':loc,'issue':f'missing_{ref}_hash'})
        for item in row.get('items') or []:
            if item.get('source_id') and item.get('source_id') not in source_ids: findings.append({'slug':slug,'locale':loc,'issue':'item_source_id_not_in_sources','source_id':item.get('source_id')})
    return fail_report(a.output,findings,{'row_count':len(rows)})
if __name__=='__main__': raise SystemExit(main())
