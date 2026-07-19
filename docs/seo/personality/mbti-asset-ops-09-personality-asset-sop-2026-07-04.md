# MBTI-ASSET-OPS-09 Personality Asset SOP

Generated at: 2026-07-04T12:00:00.000Z

## Decision

- Final decision: PASS_MBTI_ASSET_OPS_09_PERSONALITY_ASSET_SOP_READY
- Train: mbti-personality-asset-operations-train
- Next PR: MBTI-ASSET-SKILL-10
- Scope: documentation, generated asset-status artifacts, contract guard, and PR-train ledger only.
- Runtime, CMS write/import, sitemap, llms, canonical, noindex, JSON-LD, GSC API, and deployment mutations are out of scope.

## Current Asset Status

| State | Count | Current status | Authority | Next PR | Gate |
| --- | ---: | --- | --- | --- | --- |
| top10_profile_assets | 10 | non_production_cms_review_package_ready | fap-api CMS/public personality profile authority | MBTI-CMS-12 | No production CMS write until dry-run, QA, and operator approval pass. |
| comparison20_assets | 20 | non_production_cms_review_package_ready | fap-api CMS/public personality comparison authority | MBTI-CMS-13 | No production CMS write until dry-run, QA, and operator approval pass. |
| remaining58 | 58 | historical_review_input_ready_for_stronger_duplicate_gate | content QA package, not runtime or CMS authority | MBTI-QA-14 | Do not promote as CMS-ready until QA-14 passes against current query and content evidence. |
| pending_gsc_query_export | 10 | pending_manual_or_api_query_evidence | GSC evidence export, operator/API supplied | MBTI-GSC-11 | Stop if real GSC OAuth, credentials, or production Search Console mutation is required. |
| pending_cms_import | 30 | awaiting_backend_dry_run_no_production_write | fap-api import dry-run only | MBTI-CMS-12 / MBTI-CMS-13 | Production import is out of this train and requires exact approval. |

## PR Execution Route

| PR | Repo | Scope | Consumes | Produces | Next |
| --- | --- | --- | --- | --- | --- |
| MBTI-ASSET-OPS-09 | fap-web | Personality asset execution overview and batch SOP. | top10_profile_assets, comparison20_assets, remaining58, pending_gsc_query_export, pending_cms_import | asset_ops_sop_ready | MBTI-ASSET-SKILL-10 |
| MBTI-ASSET-SKILL-10 | fap-web | Optimize public-profile-seo-asset-factory MBTI runbook and agent matrix. | asset_ops_sop_ready | mbti_asset_factory_runbook_ready | MBTI-GSC-11 |
| MBTI-GSC-11 | fap-web | Stabilize GSC query evidence export artifacts without credentials or Search Console mutation. | pending_gsc_query_export, mbti_asset_factory_runbook_ready | query_evidence_packet_ready_or_blocked_for_credentials | MBTI-CMS-12 |
| MBTI-CMS-12 | fap-api | Backend CMS profile import dry-run and schema/field mapping. | top10_profile_assets, query_evidence_packet_ready_or_blocked_for_credentials | profile_import_dry_run_ready | MBTI-CMS-13 |
| MBTI-CMS-13 | fap-api | Backend CMS comparison import dry-run and schema/field mapping. | comparison20_assets, profile_import_dry_run_ready | comparison_import_dry_run_ready | MBTI-QA-14 |
| MBTI-QA-14 | fap-web | Semantic quality and duplicate-risk gate for remaining58 and comparison batches. | remaining58, comparison_import_dry_run_ready | semantic_duplicate_gate_ready |  |

## Discoverability Gate

- Current llms authority: backend sitemap-source authority
- Current sitemap detail policy: accepted only from backend sitemap-source authority when canonical/indexability gates are ready
- Do not widen sitemap or llms URL sets until CMS/backend import dry-run, public/indexable API flags, and exact route-source evidence are ready.

## Safety Boundary

- cms_write_attempted: false
- production_import_attempted: false
- production_deploy_attempted: false
- frontend_runtime_change_attempted: false
- sitemap_llms_mutation_attempted: false
- canonical_noindex_jsonld_runtime_mutation_attempted: false
- gsc_api_call_attempted: false
- search_console_mutation_attempted: false
- local_editorial_fallback_added: false
