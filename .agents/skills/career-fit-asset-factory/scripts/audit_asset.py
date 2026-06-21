#!/usr/bin/env python3
"""Audit reader-safe career-fit assets."""
from __future__ import annotations
import argparse, re
from fit_common import RAW_INTERNAL, RUNTIME_OR_SEO, fail_report, read_jsonl, source_safe_text, text_values, unsafe_fit_text
CJK=re.compile(r'[\u4e00-\u9fff]')

def parse_args():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('--input',required=True); p.add_argument('--output',required=True); return p.parse_args()
def main():
    a=parse_args(); rows=read_jsonl(a.input); findings=[]; phrases={}
    for row in rows:
        slug=row.get('slug'); loc=row.get('locale'); text='\n'.join(text_values(row))
        if RUNTIME_OR_SEO.search(text): findings.append({'slug':slug,'locale':loc,'issue':'runtime_or_search_instruction_leakage'})
        if RAW_INTERNAL.search(text): findings.append({'slug':slug,'locale':loc,'issue':'raw_internal_metadata_leakage'})
        if unsafe_fit_text(text): findings.append({'slug':slug,'locale':loc,'issue':'deterministic_or_outcome_fit_claim'})
        if not source_safe_text(text): findings.append({'slug':slug,'locale':loc,'issue':'disallowed_salary_ai_or_job_board_fit_evidence'})
        if loc=='en' and CJK.search(text): findings.append({'slug':slug,'locale':loc,'issue':'english_contains_chinese'})
        if loc=='zh-CN' and len(re.findall(r'[A-Za-z]{20,}', text))>2: findings.append({'slug':slug,'locale':loc,'issue':'zh_contains_long_english_prose'})
        for item in (row.get('fit_signals') or [])+(row.get('possible_friction_points') or [])+(row.get('how_to_test_fit') or []):
            body=item.get('body') or ''
            if body: phrases.setdefault(body,0); phrases[body]+=1
        if not (row.get('derived_from_synthesis') or {}).get('synthesis_row_hash'): findings.append({'slug':slug,'locale':loc,'issue':'missing_synthesis_derivation_hash'})
    over=[p for p,c in phrases.items() if c>20]
    if over: findings.append({'issue':'duplicate_phrase_overuse','count':len(over),'examples':over[:5]})
    return fail_report(a.output,findings,{'row_count':len(rows)})
if __name__=='__main__': raise SystemExit(main())
