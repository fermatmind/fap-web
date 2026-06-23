# RIASEC Career Graph Source Authority Packet

Task: `RIASEC-CAREER-GRAPH-SOURCE-AUTHORITY-PACKET-01`

Verdict: `MAPPED_PARTIAL`

Mode: fap-web docs/contracts only. fap-api is a read-only evidence source only and was not modified.

Dependency: `RIASEC-CAREER-GRAPH-BRIDGE-COMMON-CONTRACT-01` is merged in PR #1378 with merge commit `46d968520d0e4cf612da04e3fc45696e126dc073`.

## Authority Summary

- Canonical RIASEC landing: `holland-career-interest-test-riasec`
- Supported forms only: `riasec_60`, `riasec_140`
- Bridge consumption rule: `reviewed_public_projection_only`
- Backend public projection authority is stronger than any fap-web fallback.
- `frontend_fallback_copy` is not authority.
- `unreviewed_cms_text` is not authority.
- Career and major examples remain examples-only exploration prompts.
- RIASEC graph entities in the current graph map are blocked/partial and must not be promoted to public pages or recommendations.

## fap-api Evidence

Read-only fap-api evidence consumed by reference:

- `backend/docs/riasec/riasec-result-page-agent-runtime-career-analytics-handoff-2026-06-23.md`
  - Career bridge policy status: `READY_FOR_POLICY_HANDOFF`
  - Runtime status: `HOLD`
- `backend/app/Services/Riasec/RiasecPublicProjectionService.php`
  - Public projection contract: `riasec.public_projection.v2`
  - Public form fields include `form_code`, quality state, profile shape, public content boundary, module visibility policy, and deep content slot envelope.
  - Even when public projection contains score-shaped rows, this bridge packet does not authorize raw scores, vectors, percentiles, or selector traces as bridge inputs.
- `backend/app/Services/Report/RiasecReportComposer.php`
  - Report wrapper evidence includes redaction boundaries such as raw identifier export being false and attempt id not included.
- `backend/app/Services/Riasec/RiasecContentRegistrySlotContract.php`
  - Required boundaries include `interest_evidence_only`, `not_career_recommendation`, `not_job_fit`, `not_success_prediction`, `not_ability_or_skill_measure`, and `frontend_fallback_forbidden`.
  - Forbidden fields include career match, occupation match, job fit, fit score, ranking, raw delta, percentile, and norm-style fields.

## fap-web Career And Graph Evidence

Read-only fap-web evidence consumed by reference:

- `docs/career/generated/career-public-authority-inventory.v1.json`
  - Status: `partial`
  - `runtimeExpansionAllowed`: false
  - Frontend fallback authority is not allowed.
- `docs/career/generated/career-route-trust-matrix.v1.json`
  - Status: `partial`
  - Career job detail/index routes are backend-authoritative; recommendation surfaces are guarded and not a live RIASEC recommender.
- `docs/career/generated/career-backend-asset-taxonomy-export.v1.json`
  - Export status: `incomplete`
  - Missing backend asset taxonomy readiness fields remain a blocker for authority promotion.
- `docs/graph/generated/core-topic-graph-inventory.v1.json`
  - RIASEC graph readiness: blocked 7, partial 1.
  - Missing public routes: 7.
- `docs/seo/generated/riasec-gaokao-major-cluster-ia-claim-boundary.v1.json`
  - Status: `planning_contract_only`
  - Major cluster index/detail, career bridge panel, evidence review ledger, and backend authority ledger are planned, not implemented.

## Missing Or Blocked Authority

- `major_cluster_authority`: missing for runtime or public page promotion.
- `review_ledger`: missing for indexability or claim approval.
- `cms_dry_run_package`: missing for CMS write or page generation.
- `riasec_graph_entities`: blocked or partial; do not promote to public pages or recommendations.

## HOLD Actions

Still held: production import, runtime, CMS, search, private data, Career Graph runtime mutation, generated pages, deterministic career recommendation, provider calls, and deploy.

Negative guarantees: fap-api mutation: none; runtime code changed: no; CMS writes: none; search submission: none; provider calls: none; deployment triggered: no; private result data accessed: none.
