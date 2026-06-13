# New Bilingual Article Pair Runner

Use this workflow when a task introduces a pair of new zh/en SEO article URLs. Do not use it for Chinese legacy overwrite; use `chinese_overwrite_diff_runner` for overwrite work.

## Inputs

- Shared article-pair manifest.
- zh page draft and CMS draft payload.
- en page draft and CMS draft payload.
- shared `translation_group_id` plan.
- `CANONICAL_PLAN` for both URLs.
- `HREFLANG_ROUTING_TREE_CONTRACT` with default hold decision.
- `SCHEMA_ELIGIBILITY_PLAN` with default hold decision.
- `DYNAMIC_CTA_CONTRACT` per locale.
- `INTERNAL_LINK_PLAN` per locale.
- `claim_gate.md` per locale or pair-level with locale sections.
- `operator_review.md` per locale or pair-level with locale sections.
- `PRIVATE_URL_GUARD` per locale.
- social image metadata plan.
- image asset bundle manifest and resolved image import report when a unique cover/social/body visual is required.
- body visual metadata plan or explicit `body_visual_status: requires_media_library_resolution_before_preview`.

## Checks

| Check | Requirement |
|---|---|
| Pair identity | zh and en pages share the same topic, translation group plan, and operator intent. |
| Locale isolation | Each locale has its own slug, title, meta, body, FAQ, CTA, canonical, and preview checklist. |
| New URL confirmation | Neither URL is treated as a legacy overwrite unless operator explicitly says overwrite. |
| Claim safety | Both locales pass claim gate, including translated claim boundaries. |
| Private URL guard | No result/order/payment/share/history/take URL or raw token/ID appears in either locale. |
| CTA safety | CTAs point only to public canonical routes and avoid deterministic career claims. |
| Internal links | Links are clickable anchors and public canonical routes. |
| Social image | Run `social_image_metadata_gate` before publish or search readiness. |
| Image bundle | Run `image_asset_bundle_preflight_and_media_library_resolution` before draft import dry-run when `media/` exists or when the package requires a unique cover/body visual. |
| Body visual | Social/cover image readiness does not satisfy body visual readiness. Body visual must be verified, authorized as fallback, or explicitly blocked for operator resolution before preview/import. |
| Resolved image metadata | CMS draft payloads must include resolved cover/social fields before draft import. Body visual fields are required when the article body references a visual. |
| Active surfaces | Page body/frontmatter, CMS import JSON, CTA targets, internal links, SEO fields, and canonical drafts contain no private route examples, unresolved placeholders, old aliases, or sensitive query keys. |
| Schema | Default hold unless explicitly allowed by CMS/runtime gate and operator approval. |
| Hreflang | Default hold unless both routes and routing tree are approved. |
| Sitemap/llms | Default hold until explicit parity/release decision. |
| Search Channel | Default hold until queue readiness and exact operator approval. |

## Outputs

- `BILINGUAL_ARTICLE_PAIR_READINESS_REPORT.md` using `assets/bilingual_article_pair_readiness_template.md`.
- one `CMS_FIELD_MAPPING_REPORT.md` per locale or a paired report with locale columns.
- one `PREVIEW_CHECKLIST_<locale>_<slug>.md` per preview.
- `IMAGE_ASSET_BUNDLE_PREFLIGHT_REPORT.md`.
- `MEDIA_LIBRARY_IMPORT_REPORT.md`.
- `CMS_IMAGE_FIELD_BACKFILL_REPORT.md`.
- `RECENT_ARTICLE_IMAGE_DUPLICATE_CHECK.md`.
- pair-level `READY_FOR_OPERATOR_PUBLISH_REVIEW.md`.

## Decisions

- `GO_FOR_PAIR_DRAFT_PREVIEW`.
- `GO_FOR_SINGLE_LOCALE_DRAFT_PREVIEW_ONLY`.
- `NO_GO_FOR_PAIR_DRAFT_PREVIEW`.
- `ACCESS_REQUIRED`.

## Hard gates

Do not write CMS, publish, make indexable, mark sitemap/llms eligible, enable schema/hreflang, enqueue/submit Search Channel, call GSC/Baidu/IndexNow/360/Sogou/Shenma, or trigger revalidation. Stop before draft dry-run/preview/import on unresolved active body visual placeholders, unverified selected Media Library asset keys, missing required image bundle files, or image importer dry-run failures.
