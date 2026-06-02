# IQ PDF Demo Structure to Web Result Mapping

Generated: 2026-06-02T17:03:49Z

Reference use only: do not copy the PDF visual layout directly. Map it into web-native sections and keep backend authority for claims.

| PDF page | Reference content | Web section | Current support | Backend fields needed | Frontend component needed | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | certificate/report cover with three skills | hero + report identity summary | IQ title, score fields, dimension labels exist; certificate payload placeholder only | attempt_id, scale_code, bank_id/form_code, claim_eligible, certificate_payload optional, three dimension labels/levels | IQ result hero score section plus certificate teaser | Do not copy cover layout; use web-native hero and compact skill chips. |
| 2 | about IQ/fluid intelligence + ring diagram | method explainer / what this test measures | method boundary copy exists; no ring diagram/media asset | method_copy_version, dimension_model_copy, review_status | reviewed method explainer card or CMS-backed block | CMS/backend should own reviewed educational copy. |
| 3 | score distribution bell curve | percentile and CI explanation | percentile and confidence_interval fields render when present | norm_version, population_reference, standard_deviation, claim_eligible, percentile, confidence_interval | score distribution explainer chart | Blocked from strong claims until norm authority. |
| 4 | overall IQ score + band table | overall score hero and performance band table | iq_estimate/raw_score/percentile render; no band table for overall score | iq_estimate, overall_band, band_table, claim_policy | hero score ring + band table | Band labels must be backend/review owned. |
| 5 | VSI explanation + band table | VSI deep-dive explanation | VSI card renders score/band/insight when backend sends it | dimensions.visual_spatial_insight.band, insight, band_table, interpretation_copy | dimension deep-dive card | Use current label 视觉空间洞察. |
| 6 | VSI score visualization | VSI score visual module | numeric fields render; no score circle/cylinder visual | VSI normalized_score, percentile, band, comparison_level | dimension score visualization | Prefer accessible bars/rings over decorative cylinders. |
| 7 | VSPR explanation + band table | VSPR deep-dive explanation | VSPR card renders score/band/insight when backend sends it | dimensions.visual_spatial_pattern_reasoning.band, insight, band_table, interpretation_copy | dimension deep-dive card | Use current label 视觉空间模式推理. |
| 8 | VSPR score visualization | VSPR score visual module | numeric fields render; no dedicated visual | VSPR normalized_score, percentile, band, comparison_level | dimension score visualization | Keep comparison claims gated. |
| 9 | NPR explanation + band table | NPR deep-dive explanation | NPR card renders score/band/insight when backend sends it | dimensions.numerical_pattern_reasoning.band, insight, band_table, interpretation_copy | dimension deep-dive card | Use current label 数字规律推理. |
| 10 | NPR score visualization | NPR score visual module | numeric fields render; no dedicated visual | NPR normalized_score, percentile, band, comparison_level | dimension score visualization | Avoid implying math achievement or occupational diagnosis. |
| 11 | final summary table | summary matrix + next steps | dimension list exists; no final summary table/next steps | dimension_summary_table, recommended_next_steps, retest_guidance, share/save eligibility | summary table and action row | Actions should be no-payment unless commerce is authorized. |
