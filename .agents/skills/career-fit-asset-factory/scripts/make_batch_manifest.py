#!/usr/bin/env python3
"""Create a career-fit batch manifest from the canonical seed."""
from __future__ import annotations
import argparse, json
from fit_common import LOCALES, load_seed, normalize_seed_row, write_csv, write_json

def parse_args():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('--seed',required=True); p.add_argument('--batch-index',type=int,required=True); p.add_argument('--control-count',type=int,default=0); p.add_argument('--new-count',type=int,default=50); p.add_argument('--output-json',required=True); p.add_argument('--output-csv',required=True); p.add_argument('--validation-json',required=True); return p.parse_args()
def main():
    a=parse_args(); seed=[normalize_seed_row(r,i+1) for i,r in enumerate(load_seed(a.seed))]; by={r['seed_ordinal']:r for r in seed}
    control=[by[i] for i in range(1,a.control_count+1) if i in by]; start=a.control_count+1; end=min(a.control_count+a.new_count,len(seed)); new=[by[i] for i in range(start,end+1) if i in by]
    rows=[]
    for role,items in ((f'control_{len(control)}',control),(f'new_{len(new)}',new)):
        for item in items:
            rows.append({'batch_index':a.batch_index,'batch_role':role,'seed_ordinal':item['seed_ordinal'],'slug':item['slug'],'title_en':item['title_en'],'title_zh':item['title_zh'],'title_zh_seed':item['title_zh_seed'],'soc_code_seed':item['soc_code_seed'],'onet_code_seed':item['onet_code_seed'],'expected_locales':list(LOCALES),'requires_identity_block':True,'requires_work_activities_block':True,'requires_skills_entry_block':True})
    dup=len(rows)-len({r['slug'] for r in rows}); valid=dup==0 and len(new)==max(0,end-start+1)
    manifest={'block_type':'career-fit','batch_index':a.batch_index,'control_count':len(control),'new_count':len(new),'rows':rows}
    validation={'batch_index':a.batch_index,'control_count':len(control),'new_count':len(new),'total_rows':len(rows),'duplicate_slug_count':dup,'new_ordinal_start':start if new else None,'new_ordinal_end':end if new else None,'search_projection_generated':False,'final_conclusion':'PASS' if valid else 'REPAIR_REQUIRED'}
    write_json(a.output_json,manifest); fields=['batch_index','batch_role','seed_ordinal','slug','title_en','title_zh','title_zh_seed','soc_code_seed','onet_code_seed','expected_locales','requires_identity_block','requires_work_activities_block','requires_skills_entry_block']
    write_csv(a.output_csv,[{**r,'expected_locales':json.dumps(r['expected_locales'])} for r in rows],fields); write_json(a.validation_json,validation); print(json.dumps(validation,ensure_ascii=False,indent=2)); return 0 if valid else 1
if __name__=='__main__': raise SystemExit(main())
