#!/usr/bin/env python3
"""Audit career-fit synthesis for overclaims and source boundaries."""
from __future__ import annotations
import argparse
from fit_common import RUNTIME_OR_SEO, fail_report, read_jsonl, source_safe_text, text_values, unsafe_fit_text

def parse_args():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('--input',required=True); p.add_argument('--output',required=True); return p.parse_args()
def main():
    a=parse_args(); rows=read_jsonl(a.input); findings=[]
    for row in rows:
        slug=row.get('slug'); loc=row.get('locale'); text='\n'.join(text_values(row))
        if RUNTIME_OR_SEO.search(text): findings.append({'slug':slug,'locale':loc,'issue':'runtime_or_search_instruction_leakage'})
        if unsafe_fit_text(text): findings.append({'slug':slug,'locale':loc,'issue':'deterministic_or_outcome_fit_claim'})
        if not source_safe_text(text): findings.append({'slug':slug,'locale':loc,'issue':'disallowed_salary_ai_or_job_board_fit_evidence'})
        if not (row.get('derived_from_evidence') or {}).get('evidence_row_hash'): findings.append({'slug':slug,'locale':loc,'issue':'missing_evidence_derivation_hash'})
    return fail_report(a.output,findings,{'row_count':len(rows)})
if __name__=='__main__': raise SystemExit(main())
