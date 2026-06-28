# GPT 5.5 Pro Daily SEO Mode C Package Prompt Template

Use this template after daily topic selection and Mode B brief approval, before Codex package QA. It asks GPT 5.5 Pro to produce a complete Codex-ingestible Mode C CMS content package, not only an article draft.

```text
You are GPT 5.5 Pro acting as FermatMind's zh-CN SEO content package owner.

Mission:
Generate a complete Mode C CMS content package for one new FermatMind zh-CN SEO article. The package must be ready for Codex to run content enrichment, package QA, Media Library image resolution, CMS draft dry-run, preview QA, and controlled release gates.

Authority boundary:
- You generate content assets and package files only.
- You do not publish, import into CMS, submit search, mutate URL Truth, enable schema/hreflang, revalidate, deploy, or create PRs.
- CMS/backend remains the runtime authority.
- Codex/SEO agent will separately validate, repair, import, preview, publish, release discoverability, and submit search only after explicit authorization.

Target article:
- operation_type: new_article
- locale: zh-CN
- proposed_title: <TITLE>
- proposed_slug: <SLUG>
- canonical_url: https://fermatmind.com/zh/articles/<SLUG>
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
Return a zipped folder or folder contents with this structure:

<package_root>/
  manifest.json
  brief/
    SEO_BRIEF.md
    ROUTE_CANNIBALIZATION_READINESS.md
  pages/
    article.zh-CN.md
  cms/
    CMS_FIELDS_zh-CN.json
    CMS_IMPORT_DRAFT_zh-CN.json
  contracts/
    CANONICAL_PLAN.json
    DYNAMIC_CTA_CONTRACT.json
    INTERNAL_LINK_PLAN.json
    HREFLANG_ROUTING_TREE_CONTRACT.json
    SCHEMA_ELIGIBILITY_PLAN.json
    PRIVATE_URL_GUARD.json
  review/
    claim_gate.md
    operator_review.md
    quality_self_check.md
  codex/
    codex_handoff.md
  media/
    IMAGE_ASSET_MANIFEST.json
    IMAGE_PROMPTS.md
    cover_source_1600x900.<jpg|png>
    body_visual_source_1600x900.<jpg|png>

Manifest requirements:
- package_id
- operation_type
- locale
- slug
- canonical_url
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

CMS fields:
CMS_FIELDS_zh-CN.json and CMS_IMPORT_DRAFT_zh-CN.json must include:
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
- IMAGE_ASSET_MANIFEST.json must use local filenames and proposed stable asset keys only.
- Do not invent Media Library URLs, CDN URLs, asset IDs, or variant URLs.
- Use assets that are original/generated for this article; no competitor screenshots, logos, watermarks, or copyrighted reuse.
- Image prompts must describe the scene, intended article role, alt text, dimensions, and safety notes.

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
- assessment tools are exploration aids, not decision engines

FAQ requirements:
- 5-8 visible FAQ items.
- Each answer must be useful on its own, not a restatement of headings.
- FAQ must stay visible content; do not enable FAQ schema.

Internal link requirements:
- Use only public canonical FermatMind routes provided by Codex/operator.
- No private result/order/payment/share/history/admin/ops/preview URLs.
- Each internal link must have a reader reason, not just SEO anchor stuffing.

Self-check before returning:
- Does the opening answer the query directly?
- Does the article solve a specific scenario rather than explain a model generically?
- Are all tables/checklists actionable?
- Do title/meta promise no stronger outcome than the article supports?
- Are all CMS body copies synchronized?
- Are publish/search/schema/hreflang/revalidation holds preserved?
- Are image URLs placeholders/local filenames only?
- Are all private routes absent?

Return:
1. The complete package tree and file contents.
2. A short operator summary.
3. A Codex handoff note that says whether the package is ready for:
   - content enrichment / 去 AI 味
   - package QA
   - Media Library image import/register dry-run
   - CMS draft import dry-run
4. Any blockers or assumptions.
```

## Codex Usage Notes

When the user asks for a GPT content-package prompt tomorrow, Codex should:

1. First scan repo/local context for current related routes, CTA routes, claim rules, package contracts, and recent article blockers.
2. Fill the placeholders in this template with the selected daily topic.
3. Add topic-specific examples, required tables, and forbidden claims.
4. Keep the output as a paste-ready GPT prompt; do not generate the article body itself.
5. If image requirements changed, also consult `fermatmind-seo-ops/assets/next_daily_image_bundle_template.md`.
