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
| Schema | Default hold unless explicitly allowed by CMS/runtime gate and operator approval. |
| Hreflang | Default hold unless both routes and routing tree are approved. |
| Sitemap/llms | Default hold until explicit parity/release decision. |
| Search Channel | Default hold until queue readiness and exact operator approval. |

## Outputs

- `BILINGUAL_ARTICLE_PAIR_READINESS_REPORT.md` using `assets/bilingual_article_pair_readiness_template.md`.
- one `CMS_FIELD_MAPPING_REPORT.md` per locale or a paired report with locale columns.
- one `PREVIEW_CHECKLIST_<locale>_<slug>.md` per preview.
- pair-level `READY_FOR_OPERATOR_PUBLISH_REVIEW.md`.

## Decisions

- `GO_FOR_PAIR_DRAFT_PREVIEW`.
- `GO_FOR_SINGLE_LOCALE_DRAFT_PREVIEW_ONLY`.
- `NO_GO_FOR_PAIR_DRAFT_PREVIEW`.
- `ACCESS_REQUIRED`.

## Hard gates

Do not write CMS, publish, make indexable, mark sitemap/llms eligible, enable schema/hreflang, enqueue/submit Search Channel, call GSC/Baidu/IndexNow/360/Sogou/Shenma, or trigger revalidation.
