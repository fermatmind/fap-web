#!/usr/bin/env python3
"""Generate reader-safe career-fit assets from PASS synthesis rows."""
from __future__ import annotations
import argparse, datetime, json
from fit_common import VERSION, read_jsonl, row_hash, write_jsonl

def parse_args():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('--synthesis',required=True); p.add_argument('--output',required=True); return p.parse_args()
def main():
    a=parse_args(); now=datetime.datetime.now(datetime.timezone.utc).isoformat(); rows=[]
    for syn in read_jsonl(a.synthesis):
        loc=syn['locale']; facts=syn.get('facts') or {}; sections={s.get('section'):s.get('items',[]) for s in syn.get('items',[])}
        if loc=='zh-CN':
            personality_boundary='MBTI、大五或霍兰德结果只能作为探索线索；不能说明你必须选择或不能选择这个职业。'
            reader_boundary='本模块只帮助你判断需要测试哪些兴趣和工作风格，不预测就业、收入、成功或心理状态。'
            cta='测我的职业兴趣是否匹配'
        else:
            personality_boundary='MBTI, Big Five, and Holland/RIASEC results are exploration signals only; they do not say you must or cannot choose this career.'
            reader_boundary='This block helps identify interests and work-style signals to test; it does not forecast employment, income, success, or mental health.'
            cta='Test whether my career interests match'
        row={'ledger_type':'career-fit_asset','asset_version':VERSION,'block_type':'career-fit','slug':syn['slug'],'locale':loc,'occupation':syn['occupation'],'seed_ordinal':syn['seed_ordinal'],'batch_role':syn['batch_role'],'summary':syn.get('summary'),'facts':{'riasec_summary':facts.get('riasec_summary'),'personality_boundary':personality_boundary,'reader_boundary':reader_boundary,'cta_label':cta,'search_projection_generated':False},'fit_signals':sections.get('fit_strengths',[])[:6],'possible_friction_points':sections.get('fit_friction_points',[])[:4],'how_to_test_fit':sections.get('preparation_or_verification_guidance',[])[:4],'items':[{'section':'fit_signals','items':sections.get('fit_strengths',[])[:6]},{'section':'possible_friction_points','items':sections.get('fit_friction_points',[])[:4]},{'section':'how_to_test_fit','items':sections.get('preparation_or_verification_guidance',[])[:4]},{'section':'personality_boundary','items':[{'title':'personality boundary' if loc=='en' else '测评边界','body':personality_boundary}]}],'sources':[{'name':s.get('source_name') or s.get('name'),'url':s.get('url'),'boundary':s.get('boundary')} for s in syn.get('sources',[])],'evidence_used':syn.get('evidence_used') or [],'derived_from_synthesis':{'synthesis_row_hash':syn.get('audit_fields',{}).get('row_hash'),'evidence_row_hash':(syn.get('derived_from_evidence') or {}).get('evidence_row_hash')},'limitations':syn.get('limitations') or [],'audit_fields':{'generator':'career-fit generate_asset.py','generated_at':now}}
        row['audit_fields']['row_hash']=row_hash(row); rows.append(row)
    write_jsonl(a.output,rows); print(json.dumps({'row_count':len(rows),'output':a.output},ensure_ascii=False,indent=2)); return 0
if __name__=='__main__': raise SystemExit(main())
