# Full Release Goal Template

```text
/goal SEO-OPS-AUTHORIZED-FULL-RELEASE-RUNNER-YYYYMMDD-00

Use repo-scoped skill:
.agents/skills/fermatmind-seo-ops/

Workflow:
seo_article_full_release

Input package:
<path-to-content-package.zip or source-package/>

Daily release mode:
- cadence=one_article_per_day
- operation_type=<new_article|update_existing_article>
- target_terminal_state=ARTICLE_RELEASE_COMPLETE_SEARCH_OBSERVATION_PENDING
- do_not_start_next_article_until=<terminal_state_or_documented_provider_hold>

Target:
- translation_group_id: <id>
- zh-CN canonical: <route>
- en canonical: <route>
- zh-CN slug: <slug>
- en slug: <slug>

Authorization Profile:
- authorization_mode=full_chain_preapproved
- allow_package_autofix=true
- allow_social_image_auto_resolve=true
- allow_image_bundle_dry_run=true
- allow_media_library_image_import=true
- allow_resolved_package_write=true
- allow_image_metadata_backfill=true
- allow_production_draft_import=true
- allow_preview_qa=true
- allow_publish_metadata_autofill=true
- allow_publish_after_rehearsal=true
- allow_make_indexable_after_smoke=true
- allow_sitemap_llms_release=true
- allow_url_truth_refresh=true
- allow_search_channel_enqueue=true
- allow_search_channel_approve=true
- allow_indexnow_bounded_submission=true
- allow_baidu_bounded_submission=true
- allow_gsc_manual_request_indexing=true
- allow_article_schema_gate=true
- allow_breadcrumb_schema_gate=true
- allow_faq_schema_gate=if_visible_faq_jsonld_parity_passes
- allow_hreflang_gate=true
- allow_scoped_pr_merge=<true|false>
- allow_scoped_backend_deploy=<true|false>
- allow_scoped_frontend_deploy=<true|false>
- schema=independent_gate
- hreflang=independent_gate
- gsc_request_indexing=preauthorized_for_target_canonicals
- baidu_live_push=preauthorized_for_bounded_queue_items

Preauthorized external search targets:
- GSC Request Indexing target URLs:
  - <ZH_CANONICAL_URL>
  - <EN_CANONICAL_URL>
- Search Channel target URLs:
  - <ZH_CANONICAL_URL>
  - <EN_CANONICAL_URL>
- Allowed Search Channel live channels:
  - indexnow
  - baidu_push
- Disallowed channels:
  - 360
  - sogou
  - shenma

Mode C media contract:
- image_bundle_required=<true|false>
- image_bundle_manifest=media/IMAGE_ASSET_MANIFEST.json
- cover_source_required=true
- cover_source_file=media/cover_source_1600x900.<jpg|jpeg|png|webp>
- body_visual_source_required=<true|false>
- media_library_importer=dry-run first using media-assets:import-seo-image-bundle
- body_visual_required=<true|false>
- body_visual_status=<verified|requires_media_library_resolution_before_preview>
- desired_body_visual_concept=<if unresolved>
- fallback_asset_candidates=<if unresolved>
- body_visual_fallback_authorized=<true|false>

Article Identity Lock:
- lock article IDs, revision IDs, translation_group_id, locale, slug, and public canonical URLs before preview QA, publish, sitemap/llms, schema, hreflang, Search Channel, GSC, or Baidu work.

Daily completion definition:
- public smoke must prove zh-CN and en URLs return 200, self-canonical, and `index, follow`.
- CTA smoke must prove localized public CTA routes and expected article `content_id`.
- discoverability parity must prove both localized URLs appear in `sitemap.xml`, `llms.txt`, and `llms-full.txt`.
- schema/hreflang parity must be run as an independent post-publish gate: Article and Breadcrumb schema enabled when public JSON-LD verifies; FAQ schema enabled only when visible FAQ and JSON-LD FAQPage parity passes, otherwise record `SEO_ENHANCEMENT_HELD_REASON=faq_schema_parity_not_verified`.
- hreflang parity must prove reciprocal `zh-CN`, `en`, and `x-default` alternates for the bilingual article pair before closeout marks hreflang complete.
- final search matrix must record URL Truth, Search Channel enqueue/approval/submission, IndexNow, Baidu, GSC evidence, schema/hreflang gate state, and D1/D7/D14 observation queue.
- final closeout must pass available evidence files to `articles:release-closeout`, including public smoke, GSC manual Request Indexing, and observation JSON artifacts.
- answer-surface FAQ must be checked. If the public article answer surface uses generic FAQ instead of package-specific FAQ, record `ANSWER_SURFACE_FAQ_ENHANCEMENT_RECOMMENDED` without blocking publish.

Search Channel flow:
- use queue readiness -> enqueue -> search-channel-approve -> search-channel-submit-approved.
- use `queue_item_ids` from enqueue output for approval and live submit; keep `batch_ids` only as correlation metadata.
- run IndexNow and Baidu as separate channel tasks.
- do not use --channels=all.
- do not open global production live gates.
- because `authorization_mode=full_chain_preapproved`, continue through enqueue,
  approve, and bounded live submit without returning for another operator phrase
  when the generated queue items match the target URLs/channels above and dry-run
  passes.

Hard stops:
- unknown_route
- missing_media_asset
- missing IMAGE_ASSET_MANIFEST.json when image bundle is required
- missing image source file
- invalid MIME/SVG/animated image
- image over 10MB or missing alt text
- competitor_asset=true
- CDN verification failed
- duplicate recent cover blocked by policy
- unresolved body visual placeholder in active import surfaces
- active private URL/token leak
- old route alias in active import surfaces
- unsafe claim gate
- article identity mismatch
- local DB / Ops UI fallback needed for CMS authority
- production command failure without rollback proof
- schema/hreflang implicit side effects outside the independent SEO enhancement gate
- schema/hreflang gate verification mismatch
- GSC Request Indexing without exact target canonical URL match
- Baidu live push without bounded queue item/channel match
- Baidu site init fail / platform_action_required
- production env/secret change
- migration deploy
- auth/payment/security risky change
- external platform blocker
- CAPTCHA/login failure

Final Decision must be one of:
- ARTICLE_PUBLISHED
- DISCOVERABILITY_COMPLETE
- SEARCH_SUBMITTED
- SEO_ENHANCEMENT_COMPLETE
- SEO_ENHANCEMENT_HELD_REASON
- FULL_RELEASE_COMPLETED_AND_SEARCH_SUBMITTED
- FULL_RELEASE_COMPLETED_GSC_HELD_BY_LOGIN_OR_CAPTCHA
- FULL_RELEASE_COMPLETED_PROVIDER_HELD
- ARTICLE_RELEASE_COMPLETE_SEARCH_OBSERVATION_PENDING
- BLOCKED_NEEDS_OPERATOR_INPUT
- BLOCKED_NEEDS_RUNTIME_FIX
- BLOCKED_NEEDS_EXACT_APPROVAL
```

## Conservative Gate-By-Gate Variant

Use the same template with `authorization_mode=gate_by_gate` and set the
following values to `false` or `hold` when the operator explicitly wants manual
approval at each write gate:

- `allow_media_library_image_import`
- `allow_resolved_package_write`
- `allow_image_metadata_backfill`
- `allow_production_draft_import`
- `allow_publish_after_rehearsal`
- `allow_sitemap_llms_release`
- `allow_url_truth_refresh`
- `allow_search_channel_enqueue`
- `allow_search_channel_approve`
- `allow_indexnow_bounded_submission`
- `allow_baidu_bounded_submission`
- `allow_gsc_manual_request_indexing`
