#!/usr/bin/env python3
"""Generate career-fit evidence rows from PASS identity/work/skills baselines."""
from __future__ import annotations
import argparse, datetime, json, re
from fit_common import VERSION, first_jsonl_in, read_json, row_hash, rows_by_slug_locale, write_jsonl

def parse_args():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('--manifest',required=True); p.add_argument('--identity-baseline',required=True); p.add_argument('--work-activities-baseline',required=True); p.add_argument('--skills-entry-baseline',required=True); p.add_argument('--output',required=True); return p.parse_args()
def pick_items(row, limit=6):
    items=[]
    for it in row.get('items') or []:
        txt=it.get('captured_fact') or it.get('body') or it.get('workflow_fact')
        if txt and len(txt)>20:
            items.append((it,txt))
    facts=row.get('facts') or {}
    for key in ('task_clusters','rhythm_and_environment','settings','tools_and_systems','stakeholders'):
        for txt in facts.get(key) or []:
            if txt and len(txt)>20:
                items.append(({'source_field':f'facts.{key}'},txt))
            if len(items)>=limit:
                return items[:limit]
    for key in ('summary','core_responsibilities','work_context'):
        txt=row.get(key)
        if isinstance(txt,str) and len(txt)>20:
            items.append(({'source_field':key},txt))
        if len(items)>=limit:
            return items[:limit]
    return items[:limit]
def infer_lenses(texts):
    t=' '.join(texts).lower(); lenses=[]
    rules=[('investigative','analysis, diagnosis, modeling, research, or problem decomposition',('analy','research','model','diagnos','inspect','evaluate','calculate','measure')),('conventional','records, compliance, schedules, documentation, or structured follow-through',('record','document','schedule','compliance','file','data','report')),('social','service, teaching, care, advising, or stakeholder communication',('teach','train','advise','counsel','patient','customer','client','student','public')),('realistic','hands-on tools, equipment, field conditions, installation, repair, or physical operations',('install','repair','operate','equipment','machine','field','inspect','maintain')),('enterprising','persuasion, coordination, negotiation, leadership, or resource decisions',('manage','lead','sell','negotiate','coordinate','supervis','direct')),('artistic','creative output, performance, design, expression, or style judgment',('design','write','perform','create','art','music','visual','edit'))]
    for code,why,keys in rules:
        if any(k in t for k in keys): lenses.append({'riasec_code':code,'reason':why})
    return lenses[:3] or [{'riasec_code':'undetermined','reason':'fit must be tested against the verified work structure rather than inferred from title alone'}]
def main():
    a=parse_args(); manifest=read_json(a.manifest); identity=rows_by_slug_locale(first_jsonl_in(a.identity_baseline,'assets')); work=rows_by_slug_locale(first_jsonl_in(a.work_activities_baseline,'evidence')); skills=rows_by_slug_locale(first_jsonl_in(a.skills_entry_baseline,'assets')); now=datetime.datetime.now(datetime.timezone.utc).isoformat(); rows=[]
    for item in manifest.get('rows',[]):
        if not str(item.get('batch_role','')).startswith('new_'): continue
        for locale in item.get('expected_locales',['zh-CN','en']):
            slug=item['slug']; occupation=item['title_zh'] if locale=='zh-CN' else item['title_en']; identity_row=identity.get((slug,locale),{}); work_row=work.get((slug,locale),{}); skills_row=skills.get((slug,locale),{})
            selected=pick_items(work_row,6); texts=[txt for _,txt in selected]; lenses=infer_lenses(texts)
            onet=item.get('onet_code_seed'); sid=f'onet:{onet}' if onet else f'seed:{slug}:fit-boundary'
            sources=[{'source_id':sid,'source_name':'O*NET OnLine occupational profile','url':f'https://www.onetonline.org/link/summary/{onet}' if onet else None,'source_relation':'direct' if onet else 'dependency_boundary','source_type':'official_occupation_profile','boundary':'Used as occupation/work-structure and interest/work-style context only; not destiny, diagnosis, salary, employment, or personal-value evidence.'},{'source_id':'identity-pass-baseline','source_name':'FermatMind PASS career-identity baseline','url':a.identity_baseline,'source_relation':'pass_dependency','source_type':'internal_pass_baseline','boundary':'Occupation identity and official boundary only.'},{'source_id':'work-activities-pass-baseline','source_name':'FermatMind PASS career-work-activities baseline','url':a.work_activities_baseline,'source_relation':'pass_dependency','source_type':'internal_pass_baseline','boundary':'Verified workflow context for fit interpretation.'},{'source_id':'skills-entry-pass-baseline','source_name':'FermatMind PASS career-skills-entry baseline','url':a.skills_entry_baseline,'source_relation':'pass_dependency','source_type':'internal_pass_baseline','boundary':'Preparation context only; not proof of fit.'}]
            ev=[]
            for idx,(work_item,txt) in enumerate(selected[:6],1):
                ev.append({'evidence_id':f'{slug}:fit:workflow:{idx}','item_type':'workflow_fit_signal','source_id':'work-activities-pass-baseline','captured_fact':txt,'fit_use':'Use as a work-structure signal to test interest and work-style fit; do not infer suitability from title or personality type.','source_boundary':'PASS work-activities dependency.'})
            for idx,lens in enumerate(lenses,1):
                ev.append({'evidence_id':f'{slug}:fit:riasec:{idx}','item_type':'bounded_riasec_lens','source_id':sid,'captured_fact':f"{lens['riasec_code']} lens: {lens['reason']}",'fit_use':'Candidate interest lens for FermatMind/RIASEC verification, not an occupational fact or destiny claim.','source_boundary':'Derived from verified work structure and O*NET profile context.'})
            row={'ledger_type':'career-fit_evidence','asset_version':VERSION,'block_type':'career-fit','slug':slug,'locale':locale,'occupation':occupation,'seed_ordinal':int(item['seed_ordinal']),'batch_role':item['batch_role'],'summary':None,'facts':{'identity_ref':{'baseline':a.identity_baseline,'row_hash':identity_row.get('audit_fields',{}).get('row_hash')},'work_activities_ref':{'baseline':a.work_activities_baseline,'row_hash':work_row.get('audit_fields',{}).get('row_hash')},'skills_entry_ref':{'baseline':a.skills_entry_baseline,'row_hash':skills_row.get('audit_fields',{}).get('row_hash')},'soc_code_seed':item.get('soc_code_seed'),'onet_code_seed':onet,'riasec_lenses':lenses,'personality_bridge_boundary':'MBTI/Big Five language may describe work-style questions only; it is not evidence that a type must or cannot choose this occupation.','reader_boundary':'Career fit is framed as signals to test, not diagnosis, destiny, employment, salary, or success prediction.','search_projection_generated':False},'items':ev,'sources':sources,'evidence_used':[e['evidence_id'] for e in ev],'derived_from_synthesis':None,'limitations':['Fit evidence is bounded to work-structure and interest/work-style signals.','No personality type, salary result, AI score, job-board signal, or outcome promise is used as fit proof.'],'audit_fields':{'generator':'career-fit collect_evidence.py','generated_at':now}}
            row['audit_fields']['row_hash']=row_hash(row); rows.append(row)
    write_jsonl(a.output,rows); print(json.dumps({'row_count':len(rows),'output':a.output},ensure_ascii=False,indent=2)); return 0
if __name__=='__main__': raise SystemExit(main())
