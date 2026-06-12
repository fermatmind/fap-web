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

Hard stops:
- unknown_route
- missing_media_asset
- active private URL/token leak
- unsafe claim gate
- local DB / Ops UI fallback needed for CMS authority
- production command failure without rollback proof
- schema/hreflang requested implicitly
- GSC Request Indexing
- Baidu live push
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
