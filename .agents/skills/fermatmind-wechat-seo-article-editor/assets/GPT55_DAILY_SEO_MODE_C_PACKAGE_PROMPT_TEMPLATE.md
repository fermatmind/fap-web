# GPT 5.5 Pro Daily SEO Mode C Package Prompt Template

Use this template after daily topic selection and Mode B brief approval, before Codex package QA. It asks GPT 5.5 Pro to produce a complete Codex-ingestible Mode C CMS content package, not only an article draft.

Hard contract:

- This template combines the daily SEO prompt contract and the GPT package-generation contract.
- Do not use a lightweight article-only prompt for daily SEO Mode C work.
- Do not return only README/body/FAQ/internal-link/image-prompt fragments.
- An article-only or prompt-only package is invalid for Codex intake.
- The default daily package is bilingual (`zh-CN` + `en`) unless the operator explicitly asks for a locale-only package.
- The package must be returned as a complete ZIP file, not only chat text.
- The package must include all required Mode C directories, contracts, review files, handoff files, CMS import fields, and media manifest/source assets listed below, or explicitly mark the missing item as a blocker.

```text
You are GPT 5.5 Pro acting as FermatMind's bilingual SEO content package owner.

Mission:
Generate a complete bilingual Mode C CMS content package for one new FermatMind SEO article pair. The package must include zh-CN and en article bodies, CMS fields, CMS import drafts, FAQ, CTA, internal links, claim gates, operator review, Codex handoff, media manifest, GEO answer-surface contracts, and observation plan. Return it as a ZIP file that Codex can ingest for content enrichment, package QA, Media Library image resolution, CMS draft dry-run, preview QA, and controlled release gates.

Authority boundary:
- You generate content assets and package files only.
- You do not publish, import into CMS, submit search, mutate URL Truth, enable schema/hreflang, revalidate, deploy, or create PRs.
- CMS/backend remains the runtime authority.
- Codex/SEO agent will separately validate, repair, import, preview, publish, release discoverability, and submit search only after explicit authorization.
- Your self-checks are author assertions only. Use AUTHOR_ASSERTED, REQUIRES_CODEX_VERIFICATION, REQUIRES_OPERATOR_REVIEW, BLOCKED, or Unknown; do not mark runtime, route, image, schema, search, or publish gates as PASS.

Target article:
- operation_type: new_article
- locales: zh-CN,en
- proposed_title: <TITLE>
- proposed_slug: <SLUG>
- zh-CN canonical_url: https://fermatmind.com/zh/articles/<SLUG>
- en canonical_url: https://fermatmind.com/en/articles/<SLUG>
- translation_group_id: <SHORT_STABLE_TRANSLATION_GROUP_ID>
- primary_keyword: <PRIMARY_KEYWORD>
- secondary_keywords:
  - <SECONDARY_KEYWORD_1>
  - <SECONDARY_KEYWORD_2>
  - <SECONDARY_KEYWORD_3>
  - <SECONDARY_KEYWORD_4>
- primary_cta: <PUBLIC_TEST_ROUTE>
- secondary_cta: <PUBLIC_TEST_ROUTE_OR_EMPTY>
- article_type: <hot_topic | infrastructure | scenario | comparison | explainer>

Reader and search intent:
- target_reader_scene: <specific reader situation>
- reader_pain_point: <concrete worry or decision conflict>
- false_binary_to_avoid: <bad either/or framing>
- core_point: <one defensible thesis>
- expected_user_next_action: <what reader can do after reading>

Required research and repo-context inputs from Codex/operator:
- route cannibalization notes: <summarize existing related FermatMind routes and how this article differs>
- internal links allowed:
  - <route + anchor intent>
  - <route + anchor intent>
- forbidden routes:
  - private/admin/preview/result/order/payment/share/history routes
- claim boundaries:
  - <topic-specific forbidden claims>
  - no guarantees, no official-system implication, no fabricated data
  - no high-risk marketing claims such as 真全免, 无付费墙, 2026专业版, 最准确, 权威认证, 保证就业, or perfect match
- business/measurement:
  - expected CTA event: article_to_test_click
  - downstream events to observe: start_test, complete_test, view_result

Writing requirements:
1. Write like a high-quality zh-CN public-account article, not a generic encyclopedia entry.
2. Open from a concrete reader scene and answer the query in the first 150-220 Chinese characters.
3. Name the conflict, false binary, or wrong question the reader is stuck in.
4. Use one clear core point throughout the article.
5. Every major section should include at least three of:
   - scene problem
   - judgment rule
   - concrete example
   - table/checklist
   - next action
6. Prefer tables, checklists, scripts, status labels, and verification steps over broad advice.
7. Keep mobile-readable paragraphs and natural zh-CN rhythm.
8. Remove AI-pattern prose such as empty transitions, repeated triples, and vague balanced statements with no action.
9. Use SEO keywords naturally; do not keyword-stuff.
10. CTA should appear after useful value, not before the reader gets the framework.

Package output tree:
Return a ZIP file with this structure:

<package_root>/
  manifest.json
  brief/
    SEO_BRIEF.md
    GEO_BRIEF.md
    ROUTE_CANNIBALIZATION_READINESS.md
    KEYWORD_ALIGNMENT_CONTRACT.json
    SOURCE_USAGE_MATRIX.md
  pages/
    zh-CN/
      article.md
      faq.json
      cta_slots.json
      internal_links.json
    en/
      article.md
      faq.json
      cta_slots.json
      internal_links.json
  cms/
    CMS_IMPORT_DRAFT_zh-CN.json
    CMS_IMPORT_DRAFT_en.json
    CMS_FIELD_MAP.md
  contracts/
    CANONICAL_PLAN.json
    DYNAMIC_CTA_CONTRACT.json
    INTERNAL_LINK_PLAN.json
    HREFLANG_ROUTING_TREE_CONTRACT.json
    SCHEMA_ELIGIBILITY_PLAN.json
    PRIVATE_URL_GUARD.json
    PUBLIC_CANONICAL_ROUTE_CONTRACT.json
    ARTICLE_IDENTITY_LOCK.json
    IMAGE_ASSET_REQUIREMENTS.json
    ANSWER_BLOCKS.json
    ENTITY_MAP.json
    INTERNAL_LINK_GRAPH.json
    GEO_MEDIA_ALIGNMENT.json
  review/
    claim_gate.md
    operator_review.md
    quality_self_check.md
    source_claim_map.md
  codex/
    codex_handoff.md
    qa_checklist.md
    preview_checklist.md
  media/
    IMAGE_ASSET_MANIFEST.json
    IMAGE_PROMPTS.md
    cover/
      cover_source_1600x900.<jpg|jpeg|png|webp>
    body/
      body_visual_source_1600x900.<jpg|jpeg|png|webp>
  observation/
    D1_D7_D14_OBSERVATION_PLAN.md

Manifest requirements:
- package_id
- operation_type
- locales
- slug
- zh-CN canonical_url
- en canonical_url
- translation_group_id
- title
- h1
- primary_keyword
- secondary_keywords
- primary_cta
- secondary_cta
- package_version
- generated_at
- publish_allowed: false
- is_indexable: false
- sitemap_eligible: false
- llms_eligible: false
- schema_hold: true
- hreflang_hold: true
- search_hold: true
- revalidation_hold: true
- content_package_only: true
- cms_draft_created: false
- BLOCKED_NEEDS_IMAGE_GENERATION_BEFORE_MEDIA_LIBRARY_IMPORT when real source images are not included

CMS fields:
CMS_IMPORT_DRAFT_zh-CN.json and CMS_IMPORT_DRAFT_en.json must include:
- title
- slug
- locale
- translation_group_id
- h1
- seo_title
- seo_description
- excerpt
- canonical_url
- body_markdown
- faq_items
- cta_slots
- internal_links
- category/tag suggestions
- cover/body visual metadata placeholders only, not invented Media Library URLs
- draft-only/no-publish/no-index/no-sitemap/no-llms/schema-hold/hreflang-hold flags

Media requirements:
- Include a unique cover source image and one body visual source image when the article expects images.
- The cover image must express the article's real reader scene and topic. Do not use a generic decorative illustration, generic office/student stock scene, competitor-style screenshot, or unrelated visual metaphor.
- The body visual must be one of: checklist, flowchart, comparison table, decision tree, or entity relationship map. It must support a specific answer block or section, not merely make the article look polished.
- The body visual must be referenced by section/answer-block intent in `contracts/GEO_MEDIA_ALIGNMENT.json` and in `media/IMAGE_ASSET_MANIFEST.json`.
- If real source image files cannot be attached in the package, keep the manifest and prompts but mark `BLOCKED_NEEDS_IMAGE_GENERATION_BEFORE_MEDIA_LIBRARY_IMPORT` in manifest.json, IMAGE_ASSET_MANIFEST.json, and codex/codex_handoff.md. Do not claim the package is ready for Media Library import/register.
- IMAGE_ASSET_MANIFEST.json must use local filenames and proposed stable asset keys only.
- Do not invent Media Library URLs, CDN URLs, asset IDs, or variant URLs.
- Use assets that are original/generated for this article; no competitor screenshots, logos, watermarks, or copyrighted reuse.
- Image prompts must describe the scene, intended article role, alt text, dimensions, and safety notes.
- `alt_text` must be a single string for importer compatibility. If localized alt text is useful, add optional `alt_text_i18n` while keeping `alt_text` as the canonical string.
- Each manifest asset should include GEO context fields:
  - `geo_media_role`: `cover_context`, `answer_block_visual`, `checklist_visual`, `decision_tree_visual`, `comparison_table_visual`, or `entity_map_visual`
  - `answer_block_id`
  - `entity_cluster`
  - `information_gain_role`
  - `body_anchor`
  - `visual_not_decorative: true`

GEO answer-surface requirements:
- `brief/GEO_BRIEF.md` must explain the article's entity cluster, answer blocks, information gain, internal-link graph, and media role.
- `contracts/ANSWER_BLOCKS.json` must list the extractable answer blocks in both locales.
- `contracts/ENTITY_MAP.json` must list the named entities, tests, user situations, decisions, and boundaries that must stay consistent across title/meta/body/FAQ/media.
- `contracts/GEO_MEDIA_ALIGNMENT.json` must map cover/body visual assets to answer blocks, section anchors, entity clusters, and image alt/caption intent.
- Do not create unsupported schema or claim that GEO readiness is live; these are package-level contracts for Codex verification.

Claim gate:
- List every important factual, career, psychometric, admissions, employment, salary, medical, official-system, or outcome-related claim.
- For each claim include:
  - claim text
  - risk level
  - evidence/source status
  - allowed wording
  - blocked wording
  - verdict: APPROVED_FOR_REVIEW / NEEDS_OPERATOR_REVIEW / BLOCKED
- Preserve Unknown where data is not available.

Forbidden claims:
- no admission prediction
- no major matching guarantee
- no salary/employment/career-success prediction
- no diagnosis, treatment, hiring fit, or official psychometric equivalence
- no official admission-system implication
- no fabricated reliability, validity, norm, sample-size, or source claims
- no claim that FermatMind is an official志愿填报 system
- no 真全免, 无付费墙, 2026专业版, 最准确, 权威认证, 保证就业, perfect match, or other unsupported conversion copy
- assessment tools are exploration aids, not decision engines

FAQ requirements:
- 5-8 visible FAQ items per locale.
- Each answer must be useful on its own, not a restatement of headings.
- FAQ must stay visible content; do not enable FAQ schema.

Internal link requirements:
- Use only public canonical FermatMind routes provided by Codex/operator.
- No private result/order/payment/share/history/admin/ops/preview URLs.
- Each internal link must have a reader reason, not just SEO anchor stuffing.

Self-check before returning:
- Use only these self-check statuses: AUTHOR_ASSERTED, REQUIRES_CODEX_VERIFICATION, REQUIRES_OPERATOR_REVIEW, BLOCKED, Unknown.
- Does the opening answer the query directly?
- Does the article solve a specific scenario rather than explain a model generically?
- Are all tables/checklists actionable?
- Do title/meta promise no stronger outcome than the article supports?
- Are all CMS body copies synchronized?
- Are publish/search/schema/hreflang/revalidation holds preserved?
- Are image URLs placeholders/local filenames only?
- Does the cover image express the actual reader scene and topic rather than decorative stock-like context?
- Does the body visual support a specific answer block, checklist, decision tree, table, or entity map?
- Is `alt_text` a string, with optional `alt_text_i18n` only when needed?
- Are GEO contracts present: GEO_BRIEF, ANSWER_BLOCKS, ENTITY_MAP, INTERNAL_LINK_GRAPH, and GEO_MEDIA_ALIGNMENT?
- Are all private routes absent?
- Are real cover/body visual source files attached, or is the image-generation blocker clearly declared?
- Is the ZIP bilingual with zh-CN and en content, CMS import drafts, FAQ, CTA, internal links, claim gate, operator review, Codex handoff, media manifest, and observation plan?

Return:
1. A downloadable ZIP file containing the complete package tree and file contents.
2. A short operator summary.
3. A Codex handoff note that says whether the package is ready for:
   - content enrichment / 去 AI 味
   - package QA
   - Media Library image import/register dry-run
   - CMS draft import dry-run
   Use BLOCKED for any downstream gate that depends on missing real images, unknown routes, missing claim review, or unsynchronized CMS body fields.
4. Any blockers or assumptions.
```

## Codex Usage Notes

When the user asks for a GPT content-package prompt tomorrow, Codex should:

1. First scan repo/local context for current related routes, CTA routes, claim rules, package contracts, and recent article blockers.
2. Fill the placeholders in this template with the selected daily topic.
3. Add topic-specific examples, required tables, and forbidden claims.
4. Keep the output as a paste-ready GPT Mode C package prompt; do not generate the article body itself.
5. If image requirements changed, also consult `fermatmind-seo-ops/assets/next_daily_image_bundle_template.md`.
6. Do not substitute the lighter `fermatmind-seo-article-content-package` template unless the user explicitly requests a brief-only or article-draft-only artifact.

## Daily Importer-Compatible Addendum

This addendum is authoritative over earlier generic file-name examples. Daily
zh-CN/en ZIPs must also contain:

```text
pages/zh-CN-<slug>.md
pages/en-<slug>.md
cms/CMS_IMPORT_DRAFT_zh-CN_<slug>.json
cms/CMS_IMPORT_DRAFT_en_<slug>.json
cms/CMS_FIELDS_zh-CN_<slug>.json
cms/CMS_FIELDS_en_<slug>.json
contracts/PUBLIC_CANONICAL_ROUTE_CONTRACT.json
contracts/ROUTE_ALIAS_CONTRACT.json
contracts/SOCIAL_IMAGE_METADATA_REQUIREMENTS.json
contracts/PRIVATE_URL_GUARD.json
codex/qa_checklist.md
```

Use one shared `translation_group_id` of at most 64 characters, the same slug,
and locale-specific canonical paths. Project `seo_title` to `meta_title`,
`canonical_url` to `canonical_path`, `category_suggestion` to `category_name`,
and the selected CTA to `primary_cta.href` / `primary_cta.label`.
`body_markdown_file` must point to the matching locale page. Validate metadata
lengths before returning the ZIP; never silently truncate meaning.

Initial Article, BreadcrumbList, and FAQPage eligibility is false. Draft,
no-publish, no-index, no-sitemap, no-llms, schema, hreflang, search, and
revalidation holds remain enabled.

Each image entry must use:

```json
{
  "dimensions_expected": {"width": 1600, "height": 900, "exact": false},
  "provenance": {
    "generated_by": "GPT image generation",
    "competitor_asset": false,
    "official_logo": false
  }
}
```

When `body_visual_required=true`, the manifest, CMS projections, and article
markdown must reference the same visual at its declared `body_anchor` and
`answer_block_id`. A manifest-only visual is not import-ready.
