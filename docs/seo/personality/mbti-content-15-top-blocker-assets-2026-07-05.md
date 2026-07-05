# MBTI-CONTENT-15 Top Blocker Content Asset Repair

Generated at: 2026-07-05T12:00:00.000Z

This artifact is a backend CMS dry-run handoff package. It does not write production CMS data, mutate sitemap/llms, submit GSC indexing, or add frontend editorial fallback content.

## Summary

- Final decision: PASS_MBTI_CONTENT_15_READY_FOR_FAP_API_DRY_RUN
- Repair profile packages: 4
- Verify-only profile packages: 1
- Comparison packages: 5
- Package validation failures: 0

## Targets

| Priority | Path | Type | Status | GSC evidence | QA-14 blockers |
| --- | --- | --- | --- | --- | --- |
| P0 | /zh/personality/istj-a | personality_profile_variant | repair_package | OPS08 28d: 1 click / 23 impressions / position 9.0 | answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate |
| P0 | /zh/personality/istp-a | personality_profile_variant | repair_package | OPS08 28d: 0 clicks / 7 impressions / position 7.3; query export pending | answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate |
| P0 | /zh/personality/isfp-a | personality_profile_variant | repair_package | Chrome GSC 7d: 1 click / 4 impressions / position 5.3 | answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate |
| P0 | /zh/personality/esfj-a | personality_profile_variant | repair_package | OPS08 28d: 0 clicks / 1 impression / position 8.0 | answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate |
| P0 | /zh/personality/intp-a | personality_profile_variant | verify_only_no_body_rewrite | Chrome GSC 7d: 1 click / 25 impressions / position 6.3; GSC11 captured query row: intp-a |  |
| P0 | /zh/personality/intp-a-vs-intp-t | at_comparison | repair_package | OPS08 28d: 0 clicks / 2 impressions / position 11.0; query export pending | scenario_specificity_gate, faq_gate |
| P1 | /zh/personality/intj-vs-intp | hot_comparison | repair_package | OPS08 comparison backlog; no captured query row yet | scenario_specificity_gate, faq_gate |
| P1 | /zh/personality/entj-vs-intj | hot_comparison | repair_package | OPS08 comparison backlog; no captured query row yet | scenario_specificity_gate, faq_gate |
| P1 | /zh/personality/infj-vs-infp | hot_comparison | repair_package | OPS08 comparison backlog; no captured query row yet | scenario_specificity_gate, faq_gate |
| P1 | /zh/personality/istj-vs-isfj | hot_comparison | repair_package | OPS08 comparison backlog; no captured query row yet | scenario_specificity_gate, faq_gate |

## Gates

- Schema validation: pass
- Content depth: pass
- Template risk: pass
- Private route boundary: pass
- Indexability boundary: pass

## Next Gate

Run a fap-api import dry-run after operator approval. Do not promote, index, or submit these URLs until backend authority, duplicate risk, and indexability gates pass.
