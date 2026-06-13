# Full Release Goal Template

```text
/goal SEO-OPS-AUTHORIZED-FULL-RELEASE-RUNNER-YYYYMMDD-00

Use repo-scoped skill:
.agents/skills/fermatmind-seo-ops/

Workflow:
seo_article_full_release

Input package:
<path-to-content-package.zip or source-package/>

Target:
- translation_group_id: <id>
- zh-CN canonical: <route>
- en canonical: <route>
- zh-CN slug: <slug>
- en slug: <slug>

Authorization Profile:
- allow_package_autofix=true
- allow_social_image_auto_resolve=true
- allow_production_draft_import=true
- allow_preview_qa=true
- allow_publish_metadata_autofill=true
- allow_publish_after_rehearsal=true
- allow_make_indexable_after_smoke=true
- allow_sitemap_llms_release=true
- allow_url_truth_refresh=true
- allow_search_channel_enqueue=true
- allow_indexnow_bounded_submission=<true|false>
- allow_scoped_pr_merge=<true|false>
- allow_scoped_backend_deploy=<true|false>
- allow_scoped_frontend_deploy=<true|false>
- schema=hold
- hreflang=hold
- gsc_request_indexing=hold
- baidu_live_push=hold

Mode C media contract:
- body_visual_required=<true|false>
- body_visual_status=<verified|requires_media_library_resolution_before_preview>
- desired_body_visual_concept=<if unresolved>
- fallback_asset_candidates=<if unresolved>
- body_visual_fallback_authorized=<true|false>

Article Identity Lock:
- lock article IDs, revision IDs, translation_group_id, locale, slug, and public canonical URLs before preview QA, publish, sitemap/llms, schema, hreflang, Search Channel, GSC, or Baidu work.

Search Channel flow:
- use queue readiness -> enqueue -> operator review -> search-channel-approve -> search-channel-submit-approved.
- run IndexNow and Baidu as separate channel tasks.
- do not use --channels=all.
- do not open global production live gates.

Hard stops:
- unknown_route
- missing_media_asset
- unresolved body visual placeholder in active import surfaces
- active private URL/token leak
- old route alias in active import surfaces
- unsafe claim gate
- article identity mismatch
- local DB / Ops UI fallback needed for CMS authority
- production command failure without rollback proof
- schema/hreflang requested implicitly
- GSC Request Indexing
- Baidu live push
- Baidu site init fail / platform_action_required
- production env/secret change
- migration deploy
- auth/payment/security risky change
- external platform blocker
- CAPTCHA/login failure

Final Decision must be one of:
- FULL_RELEASE_COMPLETED_WITH_SEARCH_LIVE_HOLDS
- FULL_RELEASE_COMPLETED_AND_SEARCH_SUBMITTED
- BLOCKED_NEEDS_OPERATOR_INPUT
- BLOCKED_NEEDS_RUNTIME_FIX
- BLOCKED_NEEDS_EXACT_APPROVAL
```
