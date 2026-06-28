# GPT-5.5 Pro Content Production Contract

Scope: content production ownership and acceptance contract. This document does not contain article copy, draft titles, H1s, meta copy, FAQ copy, or publishable content.

## 1. Content Asset Ownership

- Codex does not write content assets.
- GPT-5.5 Pro writes content assets.
- CMS/backend is the final content authority.
- Frontend must not hardcode editorial copy for CMS-backed surfaces.
- Codex may create operations templates, readiness checklists, request cards, QA checklists, and routing/measurement plans.
- Codex-created request cards are not article briefs.
- GPT-5.5 Pro must treat request cards as input constraints, not final outlines.
- GPT-5.5 Pro may challenge or refine topic direction before generating content.

## 2. GPT-5.5 Pro Output Content Types

GPT-5.5 Pro may output:

- article title
- slug suggestion
- H1
- meta title
- meta description
- opening paragraph
- H2/H3 structure
- body copy
- FAQ
- CTA copy
- internal link copy
- schema copy suggestion
- canary article body

Codex must not output the content types above as publishable or near-publishable article assets.

## 3. Forbidden Positive Claims

GPT-5.5 Pro must not positively use:

- 最准
- 官方 MBTI
- 医学诊断
- 心理诊断
- 保证找到职业
- 预测命运
- 一定适合
- 百万用户
- 治疗
- 抑郁诊断
- 焦虑诊断

Allowed boundary expressions include:

- 不是医学诊断
- 不保证某个职业一定适合你
- 不是决定论

## 4. Content Review Requirements

Generated content must:

- Include non-diagnostic and non-deterministic boundaries.
- Avoid overstating test validity.
- Naturally guide users toward relevant public test pages.
- State that tests are tools for assisted self-understanding and decision support.
- Avoid entertainment-only personality labeling.
- Distinguish MBTI, Big Five, and Holland/RIASEC by use case.
- Avoid raw private identifiers, user data, order data, result IDs, or payment information.
- Link only to public canonical routes.

## 5. Required Input From Codex Or Operator

Before GPT-5.5 Pro generates content, provide:

- request_id
- topic_direction
- business_goal
- target_user_problem
- primary_search_intent
- target_page
- primary_cta_target
- secondary_cta_target where applicable
- required_internal_links
- forbidden_routes
- required_claim_boundaries
- required_measurement_events
- CMS fields that GPT must fill
- publish prerequisites
- review metrics for 7 days and 14 days

For daily zh-CN SEO articles that must return a Codex-ingestible Mode C CMS package, Codex should generate the GPT handoff from:

- `.agents/skills/fermatmind-wechat-seo-article-editor/assets/GPT55_DAILY_SEO_MODE_C_PACKAGE_PROMPT_TEMPLATE.md`

This template is the standard Stage 2 prompt scaffold after topic selection and before GPT package generation. It is not an authorization to import, publish, index, submit search, enable schema/hreflang, revalidate, deploy, or create a PR.

After GPT returns the package and images, the SEO article window should use:

- `.agents/skills/fermatmind-wechat-seo-article-editor/assets/CODEX_STAGE4_TO_SEO_AGENT_GOAL_TEMPLATE.md`

This Stage 4 template covers Codex content enrichment, package QA, image manifest normalization, and generation of the separate SEO agent `/goal`. It is still not an authorization for CMS writes, publish, discoverability mutation, URL Truth writes, search submissions, GSC Request Indexing, revalidation, deploy, or PR.

## 6. CMS Fields GPT-5.5 Pro May Fill

After receiving an approved request card, GPT-5.5 Pro may provide content for:

- title
- slug proposal
- H1
- SEO title
- SEO description
- excerpt
- body markdown
- FAQ entries
- CTA label suggestions
- internal link anchor text suggestions
- category/tag suggestions
- author/reviewer placeholder recommendations where requested by operator

CMS/backend remains the place where the approved values are entered and published.

## 7. Publish-Readiness Checks

Before publishing GPT-generated content, verify:

- CMS draft exists.
- Preview URL is available.
- Draft is noindex.
- Draft is absent from sitemap and search submission surfaces.
- Canonical is correct.
- Title and description are present and reviewed.
- Internal links are public and canonical.
- CTA target is correct.
- FAQ is visible if FAQ schema is used.
- Article, FAQ, and Breadcrumb schema are correct.
- GA4 `article_to_test_click` can be measured where applicable.
- `start_test`, `complete_test`, and `view_result` can be reviewed after publish.
- No forbidden positive claims remain.

## 8. Publication Boundary

GPT-5.5 Pro can produce content packages. It must not publish them.

Publishing requires:

- CMS operator action.
- Editorial approval.
- SEO readiness checks.
- Human publish approval.
- Post-publish 7-day and 14-day review ownership.
