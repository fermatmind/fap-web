# Batch 250 Evidence Repair Prompt

Current gate state: schema PASS, evidence audit REJECT, trust audit REJECT.

Scope: repair `generated/career-salary-evidence-v3-6-batch-250/career_job_salary_evidence_250_v3_6.jsonl` only. Preserve the first 200 control rows byte-for-byte from `generated/career-salary-v3-6-batch-200-pass-baseline/career_job_salary_evidence_200_v3_6.jsonl`.

Process repair packs one at a time:

1. `new_10_repair_pack_1.json`
2. `new_10_repair_pack_2.json`
3. `new_10_repair_pack_3.json`
4. `new_10_repair_pack_4.json`
5. `new_10_repair_pack_5.json`

For each job, capture real third-party/official evidence:

- CN: exact or cleaned Chinese title first; close adjacent only with explicit boundary. Raw salary text must include visible salary/range/average/sample/distribution/job-posting text. Do not estimate China salary from the model.
- US: BLS OEWS / BLS OOH / CareerOneStop / My Next Move / O*NET. Employment Projections is outlook only, not wage source.
- UK: UK National Careers direct profile first; adjacent profile only after direct-not-found boundary. Avoid generic adjacent fallback.
- EU: macro context only unless occupation-specific source is captured.

After each pack, rerun schema validation, evidence audit, and trust audit. Do not compute estimates or generate assets until both evidence audit and trust audit PASS for all 250 rows.
