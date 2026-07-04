# MBTI-QA-14 Semantic Quality And Duplicate Risk Gate

Generated at: 2026-07-04T23:30:00.000Z

This is an artifact-only QA gate for MBTI remaining58 profile recommendations and comparison20 content assets. It does not write CMS content, import production data, mutate sitemap/llms, or touch frontend runtime rendering.

## Summary

| Batch | Count | Passed | Blocked |
| --- | ---: | ---: | ---: |
| remaining58 | 58 | 25 | 33 |
| comparison20 | 20 | 0 | 20 |

## Gates

| Gate | Passed | Failed |
| --- | ---: | ---: |
| structure_gate | 78 | 0 |
| answer_surface_gate | 49 | 29 |
| scenario_specificity_gate | 29 | 49 |
| faq_gate | 29 | 49 |
| template_marker_gate | 45 | 33 |
| private_route_gate | 78 | 0 |
| exact_duplicate_gate | 78 | 0 |
| quick_judgment_gate | 20 | 0 |

## Blockers

- /en/personality/entj-a: template_marker_gate
- /en/personality/entj-t: template_marker_gate
- /en/personality/entp-a: template_marker_gate
- /en/personality/entp-t: template_marker_gate
- /zh/personality/enfj-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/enfp-a: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/enfp-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/entj-a: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/entj-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/entp-a: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/entp-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/esfj-a: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/esfj-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/esfp-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/estj-a: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/estj-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/estp-a: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/estp-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/infj-a: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/infj-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/infp-a: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/infp-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/intj-a: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/intj-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/intp-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/isfj-a: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/isfj-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/isfp-a: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/isfp-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/istj-a: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/istj-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/istp-a: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/istp-t: answer_surface_gate, scenario_specificity_gate, faq_gate, template_marker_gate
- /zh/personality/intj-a-vs-intj-t: scenario_specificity_gate, faq_gate
- /zh/personality/intp-a-vs-intp-t: scenario_specificity_gate, faq_gate
- /zh/personality/entj-a-vs-entj-t: scenario_specificity_gate, faq_gate
- /zh/personality/entp-a-vs-entp-t: scenario_specificity_gate, faq_gate
- /zh/personality/infj-a-vs-infj-t: scenario_specificity_gate, faq_gate
- /zh/personality/infp-a-vs-infp-t: scenario_specificity_gate, faq_gate
- /zh/personality/enfj-a-vs-enfj-t: scenario_specificity_gate, faq_gate
- /zh/personality/enfp-a-vs-enfp-t: scenario_specificity_gate, faq_gate
- /zh/personality/istj-a-vs-istj-t: scenario_specificity_gate, faq_gate
- /zh/personality/isfj-a-vs-isfj-t: scenario_specificity_gate, faq_gate
- /zh/personality/estj-a-vs-estj-t: scenario_specificity_gate, faq_gate
- /zh/personality/esfj-a-vs-esfj-t: scenario_specificity_gate, faq_gate
- /zh/personality/istp-a-vs-istp-t: scenario_specificity_gate, faq_gate
- /zh/personality/isfp-a-vs-isfp-t: scenario_specificity_gate, faq_gate
- /zh/personality/estp-a-vs-estp-t: scenario_specificity_gate, faq_gate
- /zh/personality/esfp-a-vs-esfp-t: scenario_specificity_gate, faq_gate
- /zh/personality/intj-vs-intp: scenario_specificity_gate, faq_gate
- /zh/personality/entj-vs-intj: scenario_specificity_gate, faq_gate
- /zh/personality/infj-vs-infp: scenario_specificity_gate, faq_gate
- /zh/personality/istj-vs-isfj: scenario_specificity_gate, faq_gate

## Next Use

- Use failed rows, if any, as CMS review blockers before import dry-run promotion.
- Use pass rows as evidence that assets have extractable answer surfaces and no exact duplicate answer/module bodies.
- Keep production CMS import and sitemap/llms expansion in separate authorized PRs.
