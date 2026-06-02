# IQ Result Page Design Input Map

Generated: 2026-06-02T17:03:49Z

Design direction: make the web result page a score-and-reliability experience, not a copied PDF deck. Use strong hero hierarchy, transparent reliability, three dimension deep dives, and backend-owned report content.

| Section | Purpose | Current assets | Missing assets | Backend fields needed | Frontend components | Copy requirements | Design risk | Claim-safety risk | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Hero IQ Score section | Communicate overall result quickly | iq_estimate/raw_score/percentile/CI fields; IqResultShell | score band, claim eligibility, norm version, bank/form metadata | summary.iq_estimate, summary.percentile, confidence_interval, claim_policy, norm_version | IqResultShell, buildIqResultViewModel | Short title, safe estimate qualifier | High if overclaims | High | P1 |
| Score reliability section | Explain quality/stability/confidence | quality/stability fields and boundary copy | plain-language quality mapping | quality.level, quality.flags, stability.status, stability.reason | IqResultShell/result.ts | Reviewed reliability copy | Medium | High | P0 |
| Percentile / CI explanation | Make percentile and CI understandable | fields render today | distribution chart metadata and reviewed explanation | percentile, confidence_interval, population_reference, norm_version | new score explanation component | Reviewed norm copy | Medium | High | P0 |
| Three dimension overview | Show VSI/VSPR/NPR at a glance | dimension labels and cards exist | visual hierarchy and comparison copy | dimension scores, bands, insights | IqResultShell | Dimension one-liners | Medium | Medium | P1 |
| Dimension deep-dive cards | Map PDF pages 5-10 to web | dimension fields and paid detail blocks | band tables, descriptions, visualizations | dimension band_table, interpretation_copy, comparison_level | IqReportModule or new component | Backend/report-owned explanations | Medium | Medium | P1 |
| Result quality and stability | Prevent overtrust | quality/stability render | better user-friendly display | quality/stability plus reason codes | IqResultShell | Caution copy | Low | High | P0 |
| Method boundary | State online estimate limits | method boundary copy exists | reviewed CMS/backend authority version | method_copy_version, review_status | IqReportModule/result.ts | Reviewed method copy | Low | High | P0 |
| Report preview teaser | Preview value without checkout | report module state machine exists | real backend preview content | iq_pro.preview_sections, entitlement_state | IqReportModule | Deferred-commerce-safe teaser | Medium | Medium | P1 |
| PDF / certificate placeholder | Show delivery status safely | placeholders exist | download links and certificate claim policy | pdf_payload, certificate_payload, claim_eligible | IqReportModule | Delivery copy | High | High | sidecar |
| Retest / next steps | Guide user after result | generic routes/actions possible | backend/CMS next-step copy | recommended_next_steps, retest_window | new action section | Reviewed next-step copy | Low | Medium | P2 |
| Share/save section | Support user retention | result route/access actions exist | IQ-specific safe share copy and media | share_url, saved_state, privacy flags | result action component | Privacy-safe copy | Medium | Medium | P2 |
| Deferred-commerce or entitlement state | Keep paid logic backend-owned | accessView and entitlement state exist | backend unlock integration | access_state, unlock_stage, modulesAllowed | IqReportModule | No checkout until authorized | Medium | High | P1 |
