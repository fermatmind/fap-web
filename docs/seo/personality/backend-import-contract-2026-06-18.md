# MBTI64 Backend Import Contract

## Summary
- Artifact: MBTI64-BACKEND-IMPORT-CONTRACT-01
- Final status: conditional
- Reviewed package: docs/seo/personality/content-packages/pilot-v2.1/mbti64-content-package-pilot-v2.1.json
- Package version: pilot-v2.1
- Package SHA-256: 09acd30cfd7a8dd3eb0eacf8bef1ed10b54cfa0b89277e328faa6583fdf602a3
- Rows: 8
- Contract mode: dry-run only, no CMS mutation

This PR did not import CMS drafts, create CMS revisions, publish pages, change sitemap, change llms, change llms-full, change frontend rendering, change scoring/result/payment/account routes, or submit search URLs.

## Backend / CMS Discovery
- lib/cms/personality.ts: Frontend consumer declares CMS personality detail, SEO, sections, comparison projection, and public projection response shapes.
- app/(localized)/[locale]/personality/[type]/page.tsx: Personality detail route consumes backend personality detail/comparison APIs and renders variant/comparison pages from API projection data.
- lib/cms/personality-sections.tsx: Frontend supports rich_text, bullets, faq, trait_dimension_grid, preferred_role_list and section payload rendering.
- /Users/rainie/Desktop/GitHub/fap-api/backend/app/Models/PersonalityProfileVariantRevision.php: Backend model supports variant revision snapshots through snapshot_json, revision_no, note, admin user, and created_at fields.
- /Users/rainie/Desktop/GitHub/fap-api/backend/database/migrations/2026_03_16_000110_create_personality_profile_variant_authority_tables.php: Backend variant tables support variant sections, variant SEO meta, and variant revisions; comparison page storage appears derived from paired variants.
- /Users/rainie/Desktop/GitHub/fap-api/backend/app/Http/Controllers/API/V0_5/Cms/PersonalityController.php: Backend exposes public variant and comparison read APIs, including comparison_public_projection_v1.

Discovery verdict:
- content_model_found: true
- import_path_found: unknown

Notes:
- Variant profile/section/SEO/revision models exist in fap-api.
- Comparison pages are exposed through a backend comparison API built from paired A/T variants; no separate comparison write/import model was proven in this scan.
- No dedicated importer for the MBTI64 V2.1 GPT content package was found in the local fap-web scope; future backend PR must implement or adapt a dry-run/write command.
- Because backend field support for method_boundary, trademark_boundary, information_gain, SERP CTR metadata, and source artifact metadata is not proven as first-class fields, final status is conditional.

## 8-Row Import Contract
| url | locale | page_type | slug | canonical | data_loss_risk | route_safety | operation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /en/personality/intj-a-vs-intj-t | en | comparison | intj-a-vs-intj-t | pass | medium | pass | create_revision_draft_only |
| /zh/personality/istj-a | zh-CN | variant | istj-a | pass | medium | pass | create_revision_draft_only |
| /en/personality/intp-a-vs-intp-t | en | comparison | intp-a-vs-intp-t | pass | medium | pass | create_revision_draft_only |
| /zh/personality/infp-t | zh-CN | variant | infp-t | pass | medium | pass | create_revision_draft_only |
| /en/personality/intj-a | en | variant | intj-a | pass | medium | pass | create_revision_draft_only |
| /en/personality/intj-t | en | variant | intj-t | pass | medium | pass | create_revision_draft_only |
| /zh/personality/intj-a | zh-CN | variant | intj-a | pass | medium | pass | create_revision_draft_only |
| /zh/personality/intj-t | zh-CN | variant | intj-t | pass | medium | pass | create_revision_draft_only |

## Field Mapping
### Variant Pages
- Top-level: url, locale, page_type, primary_query, secondary_queries, excluded_queries, target_intent, target_test_route, canonical_target, status
- SEO: seo.seo_title, seo.seo_description, seo.breadcrumb_title, seo.h1, seo.quick_answer_summary
- Content: content.quick_answer, content.meaning, content.a_t_difference, content.core_traits, content.strengths_blind_spots, content.careers_work_style, content.relationships_communication, content.common_misreads, content.similar_types
- Shared: faq, internal_links, method_boundary, trademark_boundary, information_gain, claim_risk_notes, route_safety, above_the_fold_module, serp_ctr_package_v2, v2_optimization

### Comparison Pages
- Top-level: url, locale, page_type, primary_query, secondary_queries, excluded_queries, target_intent, target_test_route, canonical_target, status
- SEO: seo.seo_title, seo.seo_description, seo.breadcrumb_title, seo.h1, seo.quick_answer_summary
- Content: content.quick_answer, content.side_by_side_summary, content.core_traits_comparison, content.stress_confidence, content.career_work_style, content.relationships_love, content.which_one_fits
- Shared: faq, internal_links, method_boundary, trademark_boundary, information_gain, claim_risk_notes, route_safety, above_the_fold_module, serp_ctr_package_v2, v2_optimization

### Revision Metadata
- source_artifact
- source_artifact_sha256
- generated_by
- qa_state
- operator_review_required
- rollback_required
- previous_revision_id
- new_revision_id
- publish_allowed
- search_release_allowed

## Validation
| check | result |
| --- | --- |
| row_count_ok | pass |
| row_order_ok | pass |
| every_row_existing_url | pass |
| no_new_url_creation | pass |
| canonical_target_equals_url | pass |
| locale_preserved | pass |
| page_type_preserved | pass |
| slug_preserved | pass |
| forbidden_route_patterns_absent_from_import_payload | pass |
| official_mbti_claims_absent | pass |
| clinical_claims_absent | pass |
| guarantee_claims_absent | pass |
| internal_links_safe_public_routes | pass |
| big_five_and_riasec_related_tests_present | pass |
| comparison_rows_use_comparison_contract | pass |
| variant_rows_use_variant_contract | pass |
| review_state_draft_for_operator_review | pass |
| publish_allowed_false | pass |
| sitemap_allowed_false | pass |
| llms_allowed_false | pass |
| llms_full_allowed_false | pass |
| search_release_allowed_false | pass |
| rollback_metadata_required | pass |
| no_cms_mutation_occurred | pass |

## Dry-Run Plan Summary
- Would create exactly 8 CMS revision drafts only.
- Would not change production URLs, canonicals, sitemap, llms, llms-full, or search submission.
- Revision IDs remain unknown until the future CMS draft creation task.
- Rollback metadata is required for every row.

## Blockers
- None

## Warnings
- Backend import path for this exact MBTI64 V2.1 package is unknown; future backend PR must implement dry-run/write support.
- Some V2.1 fields have uncertain first-class backend support and may need structured snapshot_json/payload_json storage.
- Carried from gates: Medium duplicate-risk signals are present but justified as non-blocking sibling/topic similarity.

## Holds
- Result lookup route classification remains a separate sidecar and blocks publish/search release.
- No CMS import in this PR.
- No sitemap/llms/llms-full/search-release work in this PR.
- Operator approval required before CMS revision draft creation.

## Recommended Next Task
MBTI64-BACKEND-IMPORT-DRY-RUN-01
