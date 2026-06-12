# Authorized Goal Contract

Use this reference before any V2 authorized full-release runner action.

## Required Authorization Profile

The current `/goal` must state the target package, article pair, allowed locales, target slugs/canonicals, and the following booleans or explicit holds:

- `allow_package_autofix`
- `allow_social_image_auto_resolve`
- `allow_production_draft_import`
- `allow_preview_qa`
- `allow_publish_metadata_autofill`
- `allow_publish_after_rehearsal`
- `allow_make_indexable_after_smoke`
- `allow_sitemap_llms_release`
- `allow_url_truth_refresh`
- `allow_search_channel_enqueue`
- `allow_indexnow_bounded_submission`
- `allow_scoped_pr_merge`
- `allow_scoped_backend_deploy`
- `allow_scoped_frontend_deploy`

Missing values default to `false` or `hold`.

## Hard Stops

Stop immediately on:

- `unknown_route`
- `missing_media_asset`
- `claim_override`
- `schema_hreflang_enablement`
- `gsc_request_indexing`
- `baidu_live_push`
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

## Output

Produce an authorization boundary matrix with each action marked `allowed`, `held`, `exact_approval_required`, or `hard_stop`.
