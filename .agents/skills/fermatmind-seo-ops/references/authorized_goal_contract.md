# Authorized Goal Contract

Use this reference before any V2 authorized full-release runner action.

## Required Authorization Profile

The current `/goal` must state the target package, article pair, allowed locales, target slugs/canonicals, and the following booleans or explicit holds:

- `allow_package_autofix`
- `allow_social_image_auto_resolve`
- `allow_image_bundle_dry_run`
- `allow_media_library_image_import`
- `allow_resolved_package_write`
- `allow_image_metadata_backfill`
- `allow_production_draft_import`
- `allow_preview_qa`
- `allow_publish_metadata_autofill`
- `allow_publish_after_rehearsal`
- `allow_make_indexable_after_smoke`
- `allow_sitemap_llms_release`
- `allow_url_truth_refresh`
- `allow_search_channel_enqueue`
- `allow_search_channel_approve`
- `allow_indexnow_bounded_submission`
- `allow_baidu_bounded_submission`
- `allow_gsc_manual_request_indexing`
- `allow_scoped_pr_merge`
- `allow_scoped_backend_deploy`
- `allow_scoped_frontend_deploy`

Missing values default to `false` or `hold`.

## Hard Stops

Stop immediately on:

- `unknown_route`
- `missing_media_asset`
- `missing_image_asset_manifest`
- `image_source_file_missing`
- `image_mime_invalid`
- `image_oversize`
- `image_alt_missing`
- `competitor_asset`
- `cdn_verification_failed`
- `duplicate_recent_cover_blocked`
- `claim_override`
- `schema_hreflang_enablement`
- `gsc_request_indexing_without_target_urls`
- `baidu_live_push_without_bounded_queue_items`
- `production_env_secret_change`
- `migration_or_destructive_db_change`
- `dependency_upgrade_out_of_scope`
- `auth_payment_security_risk_change`
- `external_platform_blocker`
- `captcha_or_login_failure`

## Action Classes

| Class | Meaning |
| --- | --- |
| `auto_allowed` | Safe local/read-only work inside the goal, including package QA, deterministic reports, and dry-run validation. |
| `pre_authorizable` | May execute only when the profile explicitly allows the action family and preflight passes. |
| `requires_exact_approval` | Must stop unless exact operator text, target IDs/URLs, and target SHA/release where relevant are present. |
| `must_stop` | Must stop regardless of broad profile approval. |

## Full-Chain Preauthorization

For daily SEO article release work, the operator may provide one full-chain `/goal`
instead of approving each write gate one at a time. A valid full-chain profile
must include:

- `authorization_mode=full_chain_preapproved`.
- package path or package id.
- translation group id.
- target locales.
- target article slugs and canonical URLs.
- permitted article operation type.
- Media Library import/register permission.
- resolved package write permission.
- CMS draft import permission.
- publish metadata/editorial readiness repair permission.
- controlled publish permission after dry-run/rehearsal passes.
- discoverability release permission for sitemap, llms, and llms-full after smoke passes.
- URL Truth refresh/write permission after discoverability parity passes.
- Search Channel enqueue and approve permission for the target canonical URLs.
- bounded IndexNow live submission permission after queue dry-run and approval pass.
- bounded Baidu live submission permission after queue dry-run and approval pass.
- GSC manual Request Indexing permission for the exact target canonical URLs.
- schema/hreflang gate permission when the goal should complete SEO enhancement in the same run:
  - Article schema and Breadcrumb schema may be enabled after public JSON-LD verification.
  - FAQ schema may be enabled only after visible FAQ and JSON-LD FAQPage parity verifies; otherwise record a hold reason.
  - Hreflang may be enabled only after reciprocal localized counterparts verify.

The runner may continue through all preauthorized stages without returning for
another operator phrase when each stage dry-run/preflight passes and the action
remains inside the target package, article ids, canonical URLs, locales, and
queue item set created by the same run.

Full-chain preauthorization does not override hard blockers. Stop on login
failure, CAPTCHA, platform-side provider block, missing runtime command, failed
preflight, failed dry-run, private URL leak, claim-safety failure, identity
mismatch, rollback-required failure, schema/hreflang side effect outside the
independent gate, deploy need
without an allowed deploy profile, or any action not named by the profile.

## Output

Produce an authorization boundary matrix with each action marked `allowed`, `held`, `exact_approval_required`, or `hard_stop`.
