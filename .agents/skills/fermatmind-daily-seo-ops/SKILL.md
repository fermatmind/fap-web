---
name: fermatmind-daily-seo-ops
description: Use for FermatMind daily SEO article operations when Codex needs to select today's article topic, generate a Mode B brief handoff, produce a GPT 5.5 Pro content-package prompt packet, intake-check a returned package, QA a Mode C CMS package, prepare CMS release-gate checklists, or run D1/D7/D14 observation for SEO articles without executing CMS writes, publish, revalidation, schema/hreflang, GSC, IndexNow, Baidu, sitemap, or llms actions.
---

# FermatMind Daily SEO Ops Skill

## Purpose

Use this thin daily workflow skill to decide what FermatMind should write next and to prepare safe handoffs into the heavier `fermatmind-seo-ops` release playbooks.

This skill is planning, review, and observation first. It must not perform production mutations by itself.

## Hard Boundaries

- Do not write CMS, import packages, promote revisions, publish articles, or revalidate.
- Do not enable schema, hreflang, sitemap eligibility, llms eligibility, or search submission.
- Do not click GSC Request Indexing.
- Do not submit IndexNow, Baidu, 360, Sogou, or Shenma live.
- Do not mutate article content during topic selection or Mode B brief work.
- Do not create frontend editorial content, public image assets, generated reports, or repo rules unless separately requested.
- Treat `fermatmind-seo-ops` as the authority for heavy package QA, release, discoverability, Search Channel, schema, hreflang, and revalidation playbooks.

## Evidence Order

Prefer evidence in this order:

1. Operator-provided current GSC, Baidu, GA4, Ops Portal, Metabase, screenshots, and explicit constraints.
2. Backend CMS and `seo_intel` truth from fap-api.
3. Public runtime pages, sitemap, llms, URL Truth, and public canonical routes.
4. Existing article inventory, previous D1/D7/D14 observations, and content feedback queues.
5. Weekly SEO observation/export outputs from `fermatmind-seo-ops weekly_article_review`, including CTR, average position, CTA, Search Channel, and closeout blockers.
6. Current seasonal/search context from live web research when the user asks for today's topic, hotspots, trends, or current recommendations.
7. Competitor pages only for intent, structure, and SERP framing; never for proprietary claims, data, images, or copy.

## Workflow Router

| User intent | Workflow |
|---|---|
| Pick today's SEO topic or compare topic candidates | `daily_topic_selection` |
| Create a brief-only GPT handoff | `mode_b_brief_generation` |
| Create a paste-ready GPT 5.5 Pro content-package prompt packet | `gpt_content_package_prompt_handoff` |
| Intake-check a returned GPT content package before heavy QA | `package_intake_checklist` |
| Improve a returned zh-CN package that feels too AI-generated or thin | use `fermatmind-wechat-seo-article-editor` before heavy QA |
| QA a GPT/Mode C CMS package | `mode_c_package_qa` |
| Prepare controlled CMS release gate text/checklists | `cms_release_gate` |
| Review D1/D7/D14 performance and feed next briefs | `d1_d7_d14_observation` |
| Consume weekly review output before selecting the next topic | use `fermatmind-seo-ops weekly_article_review` first, then `daily_topic_selection` |

## Shared Rules

- Keep daily content work separate from search-provider live actions.
- Keep schema and hreflang as separate gates unless the user provides exact authorization or a full-chain preapproved goal and the heavy SEO ops playbook passes. For daily full-chain releases, Article schema, Breadcrumb schema, and reciprocal bilingual hreflang should be planned as independent post-publish enhancement gates by default; FAQPage still defaults to held unless visible FAQ and JSON-LD parity passes.
- For Chinese SEO articles, prefer user-problem and career-decision intent when it can safely route to RIASEC/Holland.
- Avoid cannibalization: check existing routes before recommending a new article; prefer updating an existing route when it already owns the intent.
- Treat weekly optimization queues as input to topic selection. If a route already has impressions and an actionable title/meta/internal-link opportunity, recommend `update_existing_article` before creating a near-duplicate new route.
- Preserve public localized routes only; reject private URLs, old aliases, tokenized links, local image paths, and fake Media Library URLs.
- Keep psychometric claims bounded: no diagnosis, treatment, hiring fit, admission prediction, salary prediction, career success prediction, official-instrument equivalence, or fabricated reliability/validity/sample/norm data.

## Workflows

### `daily_topic_selection`

Purpose: choose the next daily SEO article topic.

Do:

- Review recent article inventory, known pillar routes, current GSC/Baidu/GA4/Ops signals when provided, and prior observation learnings.
- Review the latest `WEEKLY_ARTICLE_SEO_REVIEW.md`, `ARTICLE_OPTIMIZATION_QUEUE.csv`, or `articles:weekly-seo-observation-export` output when available.
- Use live web research for current seasonality or hotspots when the user asks for today's topic or current trends.
- Check route/cannibalization risk, target locale, primary silo, CTA fit,
  claim safety, Media Library feasibility, GEO media feasibility, and
  D1/D7/D14 observability.
- Rank candidates by: career decision intent, model-crossing intent, existing GSC seed, concrete personality pain point, method-boundary trust topic, generic explainer.

Output:

- One recommended topic.
- Two to five alternates.
- Recommended operation type: `new_article`, `update_existing_article`, or `hold`.
- Candidate slug, SEO title/meta direction, target queries, primary CTA/test,
  internal link targets, claim risks, media needs, GEO answer/media asset needs,
  and observation metrics.
- Decision: `GO_FOR_MODE_B_BRIEF`, `UPDATE_EXISTING_RECOMMENDED`, `HOLD_FOR_MORE_EVIDENCE`, or `NO_GO_CANNIBALIZATION_RISK`.

### `mode_b_brief_generation`

Purpose: create a brief-only handoff for GPT or another content-package owner.

Do:

- Produce a Mode B brief, not article body copy.
- Include search intent, audience, primary/secondary keywords, title/meta
  candidates, angle, outline, quick-answer shape, answer-block plan, entity
  cluster, silo, CTA logic, internal link plan, media concept, GEO media role,
  claim boundaries, forbidden claims, and observation plan.
- Mark publish/search/discoverability execution as held in the brief. Note that a later full-chain preapproved SEO agent goal may independently enable Article schema, Breadcrumb schema, and reciprocal bilingual hreflang after public verification; FAQPage remains held unless visible FAQ and JSON-LD parity passes.

Output:

- `SEO_BRIEF_<slug>.md` content or a paste-ready brief.
- Decision: `BRIEF_READY_FOR_GPT_PACKAGE_OWNER` or `BRIEF_BLOCKED_NEEDS_OPERATOR_INPUT`.

No-go:

- Do not write a full article body.
- Do not create a CMS import package.
- Do not imply publish/search authorization.

### `gpt_content_package_prompt_handoff`

Purpose: after `daily_topic_selection` and `mode_b_brief_generation`, produce a paste-ready GPT 5.5 Pro prompt packet for Mode C content package generation.

Do:

- Output the daily recommendation and why it should be written today.
- Include not-selected alternates and the reason each is held.
- Include route cannibalization boundaries and existing public routes that GPT must not duplicate.
- Include the GPT 5.5 Pro role instruction and task card.
- Include the content package output tree, required CMS fields, media
  requirements, GEO answer-surface contracts, public route/CTA/internal-link
  contract, claim gate, and forbidden claims.
- Include Codex follow-up QA acceptance criteria for the returned package.
- Mark downstream write lanes as held inside the GPT package: CMS draft/import, publish/promote, revalidation, sitemap, llms, GSC, IndexNow, Baidu, and Search Channel. The package may include schema/hreflang eligibility metadata, but must not self-enable it; the later SEO agent full-chain goal should treat Article/Breadcrumb schema and bilingual hreflang as independent executable gates, with FAQPage held unless visible FAQ parity passes.

Output:

- Recommended topic summary.
- Paste-ready GPT 5.5 Pro prompt packet.
- Decision: `GPT_PROMPT_READY_FOR_MODE_C_PACKAGE_OWNER` or `GPT_PROMPT_BLOCKED_NEEDS_BRIEF_OR_ROUTE_INPUT`.

No-go:

- Do not write the full article body.
- Do not create or zip the content package.
- Do not create CMS drafts, import packages, promote revisions, publish, revalidate, submit search, enable schema/hreflang, mutate sitemap/llms, or create code/PR instructions for GPT.
- Do not include secrets, admin URLs, raw analytics exports with private data, private result/order/share/payment URLs, tokenized URLs, local image paths, or fake Media Library URLs.

### `mode_c_package_qa`

Purpose: review a GPT/Mode C CMS package before preview/import work.

Use:

- `.agents/skills/fermatmind-seo-ops/references/mode_c_content_package_rules.md`
- `.agents/skills/fermatmind-seo-ops/references/cms_content_package_qa.md`

Check:

- Operation identity, article/revision/translation group handoff, slug/canonical locks, route cannibalization, internal links, CTA, schema/hreflang eligibility and downstream gate plans, claim gate, private URL guard, CMS fields, CMS import draft, and active-surface safety.
- Cover/social/body visual readiness separately. Unresolved body visual
  placeholders block preview/import. Daily article packages should also prove
  the cover is topic-scene aligned and the body visual supports a specific
  answer block, checklist, flowchart, comparison table, decision tree, or entity
  map.

Output:

- `CONTENT_PACKAGE_INTEGRITY_REPORT.md`
- `CODEX_QA_<slug>.md`
- `CMS_IMPORT_READY_REPORT.md`
- Decision: `GO_FOR_PREVIEW`, `BLOCKED_NEEDS_MEDIA_LIBRARY_IMPORT`, `NO_GO_FOR_PREVIEW`, or `NEEDS_OPERATOR_INPUT`.

No-go:

- Do not import, write CMS, publish, revalidate, or submit search.

### `package_intake_checklist`

Purpose: when GPT returns a content package zip, decide whether it is ready for the heavier `fermatmind-seo-ops` QA/import lane.

Do:

- Confirm the zip opens, contains a manifest, article markdown/body, CMS field mapping, SEO title/meta, cover/body visual source references, internal-link plan, CTA plan, and claim-boundary notes.
- Check the package follows the requested route, slug, locale, canonical, and no-cannibalization contract from `gpt_content_package_prompt_handoff`.
- Confirm image sources are local source files or planned Media Library inputs
  only; reject private URLs, tokenized URLs, fake public asset URLs, and missing
  body visual placeholders. Confirm `alt_text` is a string, localized variants
  are optional `alt_text_i18n`, and any GEO media fields remain package-level
  context rather than runtime claims.
- Confirm no full CMS write, publish, schema, hreflang, sitemap, llms, GSC, IndexNow, Baidu, or Search Channel action is embedded in the GPT package.
- If the operator says the article feels too AI-generated, too thin, too generic, or not like a strong zh-CN public-account article, route the package through `fermatmind-wechat-seo-article-editor` before heavy `fermatmind-seo-ops` QA/import work.
- Output the exact next heavy workflow to use in `fermatmind-seo-ops`, usually `cms_content_package_qa` or `seo_article_full_release`, and list the operator approvals that will be needed later.

Output:

- Package intake summary.
- Pass/fail checklist.
- Missing files or blocker list.
- Next-step instruction for Codex.
- Decision: `PACKAGE_READY_FOR_HEAVY_QA`, `PACKAGE_BLOCKED_NEEDS_GPT_REVISION`, `PACKAGE_BLOCKED_NEEDS_MEDIA_SOURCE`, or `PACKAGE_BLOCKED_NEEDS_OPERATOR_INPUT`.

No-go:

- Do not fix the content package unless the user separately asks for package repair.
- Do not import, write CMS, promote, publish, revalidate, submit search, enable schema/hreflang, mutate sitemap/llms, or create frontend content.

### `cms_release_gate`

Purpose: prepare controlled release-gate checklists and exact approval text without executing production mutations.

Use:

- `.agents/skills/fermatmind-seo-ops/references/operator_publish_gate.md`
- `.agents/skills/fermatmind-seo-ops/references/daily_pipeline_search_batch_separation.md`

Do:

- Identify whether the path is new draft import, existing-article update package, working revision approval, promote, publish, revalidation, discoverability reconciliation, or search batch handoff.
- Draft dry-run commands, preview checklist, operator approval phrases, and held lanes.
- Delegate actual execution to `fermatmind-seo-ops` after exact authorization.

Output:

- Release readiness summary.
- Required exact approval phrases by action and ID.
- Held lanes: schema, hreflang, sitemap, llms, Search Channel, GSC, IndexNow, Baidu, and revalidation unless explicitly allowed.
- Decision: `READY_FOR_AUTHORIZED_SEO_OPS_RUNNER`, `HOLD_FOR_OPERATOR_REVIEW`, or `NO_GO_RELEASE_GATE_BLOCKED`.

No-go:

- Do not execute CMS writes, promote/publish, content-release revalidation, sitemap/llms writes, schema/hreflang rollout, or search-provider actions.

### `d1_d7_d14_observation`

Purpose: turn post-release performance into next-topic and next-brief decisions.

Use:

- `.agents/skills/fermatmind-seo-ops/references/canary_observation_rules.md`

Record:

- GSC impressions, clicks, CTR, average position, visible queries, indexed/crawl state, page URL, locale, publication or update date, and title/meta changes.
- Product events when available: `article_to_test_click`, `start_test`, `complete_test`, `view_result`, `click_deep_report`, `begin_checkout`, and `purchase_success`.
- Search-provider state separately: GSC manual, IndexNow, Baidu, sitemap, llms, schema, and hreflang.

Output:

- D1/D7/D14 observation summary.
- Classification: `CTR_TITLE_META_OPPORTUNITY`, `POSITION_8_30_INTERNAL_LINK_OPPORTUNITY`, `QUERY_EXPANSION_OPPORTUNITY`, `CTA_CONVERSION_OPPORTUNITY`, `TECHNICAL_DRIFT`, or `INSUFFICIENT_DATA`.
- Next action: topic candidate, update-existing recommendation, internal-link task, title/meta test, or hold.

No-go:

- Do not treat missing analytics exports as zero.
- Do not run collectors, mutate queues, or submit search.

## Daily Package And Runtime Handoff Addendum

- Stage 4 emits one importer-ready `FINAL_DERIVED_IMPORT_READY_PACKAGE`; do
  not defer deterministic filename, field, metadata, or manifest normalization
  to repeated Stage 5 repair packages.
- Full-chain Stage 5 runs Platform Readiness Preflight before its first
  production write.
- An audited Baidu `provider_security_hold` is a safe provider terminal state,
  not a successful submission. Never weaken TLS or send a token over HTTP.
- A required body visual without preview/public projection is not GEO ready.
