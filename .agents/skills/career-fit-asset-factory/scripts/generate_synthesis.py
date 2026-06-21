#!/usr/bin/env python3
"""Generate career-fit synthesis rows from PASS evidence rows."""
from __future__ import annotations
import argparse, datetime, json
from fit_common import VERSION, read_jsonl, row_hash, write_jsonl

ZH_WORKFLOW_PATTERNS = [
    (("payroll", "paycheck", "wage", "time sheet", "earnings", "deduction", "pay adjustment"), "核对工时、薪酬项目、扣款和工资单记录"),
    (("diagnos", "examin", "patient"), "接诊、问诊、体征观察和检查结果解释"),
    (("medical histor", "patient"), "整理患者病史并把关键变化记录清楚"),
    (("spine", "musculoskeletal", "adjust"), "评估脊柱和肌肉骨骼问题并执行手法调整"),
    (("x-ray", "imaging"), "结合影像或检查信息判断是否需要进一步处理"),
    (("treatment", "therapy", "care plan"), "把服务方案、调整步骤和复查节奏解释给服务对象"),
    (("counsel", "advise", "communicat"), "与服务对象沟通建议、限制和后续行动"),
    (("inspect", "evaluate", "assess"), "检查现场、材料或对象状态并判断异常"),
    (("record", "document", "report"), "记录关键信息、形成文档并支持后续复核"),
    (("coordinate", "schedule", "plan"), "协调流程、安排步骤并处理时间压力"),
    (("operate", "maintain", "repair"), "操作、维护或修复设备并确认结果"),
    (("analy", "calculat", "estimate"), "分析数据、计算结果并解释关键差异"),
    (("design", "develop", "draw"), "把需求转成方案、图纸或可执行设计"),
    (("teach", "train", "instruct"), "讲解任务、观察学习反应并调整反馈方式"),
    (("sell", "customer", "client"), "理解客户需求、解释选择并跟进反馈"),
    (("supervis", "manage", "direct"), "分配任务、跟踪执行并处理协作摩擦"),
]

def parse_args():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('--evidence',required=True); p.add_argument('--output',required=True); return p.parse_args()

def zh_workflow_label(workflow: str, occupation: str, index: int) -> str:
    lowered=(workflow or '').lower()
    for keys, label in ZH_WORKFLOW_PATTERNS:
        if any(key in lowered for key in keys):
            return f"{occupation}工作中的{label}"
    cleaned=' '.join((workflow or '').split())
    if len(cleaned) <= 28 and not any(ch.isalpha() for ch in cleaned):
        return cleaned
    fallback=[
        f"处理{occupation}的核心材料、流程和异常信息",
        f"在{occupation}工作中跟踪任务节奏、协作对象和复核要求",
        f"把{occupation}的现场或服务信息转成可检查的行动记录",
        f"围绕{occupation}常见任务判断细节、边界和交付质量",
    ]
    return fallback[index % len(fallback)]

def en_workflow_label(workflow: str, occupation: str) -> str:
    cleaned=' '.join((workflow or '').split())
    if not cleaned:
        return occupation
    first=cleaned[0].lower()+cleaned[1:] if len(cleaned)>1 else cleaned.lower()
    return f"In {occupation}, {first}"

def main():
    a=parse_args(); now=datetime.datetime.now(datetime.timezone.utc).isoformat(); rows=[]
    for ev in read_jsonl(a.evidence):
        loc=ev['locale']; occ=ev['occupation']; facts=ev.get('facts') or {}; lenses=facts.get('riasec_lenses') or []
        workflows=[i.get('captured_fact') for i in ev.get('items',[]) if i.get('item_type')=='workflow_fit_signal'][:4]
        display_workflows=[zh_workflow_label(w, occ, i) for i,w in enumerate(workflows)] if loc=='zh-CN' else [en_workflow_label(w, occ) for w in workflows]
        lens_text=', '.join([l.get('riasec_code') for l in lenses if l.get('riasec_code')]) or 'work-structure'
        if loc=='zh-CN':
            summary=f"{occ}的匹配度应先看工作结构：{lens_text} 只是需要用霍兰德/RIASEC继续验证的兴趣线索，不是人格结论。"
            boundary='测评只能帮助你验证兴趣、工作风格和摩擦点；不能决定职业命运、就业、收入或个人价值。'
        else:
            summary=f"Fit for {occ} should start with the work structure: {lens_text} is an interest signal to test with RIASEC, not a personality verdict."
            boundary='Tests can help verify interests, work style, and friction points; they do not decide destiny, employment, income, or personal value.'
        fit_strengths=[{'title':('可验证的匹配信号' if loc=='zh-CN' else 'testable fit signal'),'body':w} for w in display_workflows[:4]]
        friction=[{'title':('可能的摩擦点' if loc=='zh-CN' else 'possible friction point'),'body':(('如果你长期抗拒这类工作结构，需要用真实任务样本再验证：' if loc=='zh-CN' else 'If this work structure drains you over time, test it with real task samples: ')+w)} for w in display_workflows[:2]]
        primary_workflow = display_workflows[0] if display_workflows else occ
        secondary_workflow = display_workflows[1] if len(display_workflows) > 1 else primary_workflow
        guidance=[{'title':('先做兴趣验证' if loc=='zh-CN' else 'start with interest validation'),'body':(f'用 RIASEC/霍兰德验证你是否愿意长期面对“{primary_workflow}”这类{occ}核心任务，而不是只凭职业名称判断。' if loc=='zh-CN' else f'Use RIASEC/Holland-style testing to check whether you can sustain interest in {occ} tasks such as “{primary_workflow}”, rather than judging from the title alone.')},{'title':('再做工作样本验证' if loc=='zh-CN' else 'then test with work samples'),'body':(f'选择一个接近“{secondary_workflow}”的小型任务样本，记录你对材料、节奏、协作和复核压力的真实反应。' if loc=='zh-CN' else f'Try a small work sample close to “{secondary_workflow}” and record how you respond to the materials, pace, collaboration, and review pressure.')}]
        row={'ledger_type':'career-fit_synthesis','asset_version':VERSION,'block_type':'career-fit','slug':ev['slug'],'locale':loc,'occupation':occ,'seed_ordinal':ev['seed_ordinal'],'batch_role':ev['batch_role'],'summary':summary,'facts':{'riasec_summary':lens_text,'work_style_summary':workflows[:3],'work_value_summary':'bounded by verified work activities','personality_bridge_boundary':facts.get('personality_bridge_boundary'),'reader_boundary':boundary,'search_projection_generated':False},'items':[{'section':'fit_strengths','items':fit_strengths},{'section':'fit_friction_points','items':friction},{'section':'preparation_or_verification_guidance','items':guidance}],'sources':ev.get('sources') or [],'evidence_used':ev.get('evidence_used') or [],'limitations':ev.get('limitations') or [],'derived_from_synthesis':None,'derived_from_evidence':{'evidence_row_hash':ev.get('audit_fields',{}).get('row_hash')},'audit_fields':{'generator':'career-fit generate_synthesis.py','generated_at':now}}
        row['audit_fields']['row_hash']=row_hash(row); rows.append(row)
    write_jsonl(a.output,rows); print(json.dumps({'row_count':len(rows),'output':a.output},ensure_ascii=False,indent=2)); return 0
if __name__=='__main__': raise SystemExit(main())
