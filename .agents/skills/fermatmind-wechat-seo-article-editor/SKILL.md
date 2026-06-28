---
name: fermatmind-wechat-seo-article-editor
description: Use for FermatMind zh-CN SEO article content packages when Codex must turn a technically valid GPT/Mode C draft into a richer WeChat-style, human-sounding, scenario-led article while preserving CMS package identity, SEO intent, route contracts, claim boundaries, CTA/internal links, and all publish/search holds.
---

# FermatMind WeChat SEO Article Editor

## Purpose

Use this skill after GPT or another model has produced a Mode C CMS content package, and before heavy `fermatmind-seo-ops` package QA/import/release work.

The skill improves the article's reader experience and content depth. It does not become a CMS writer, publisher, search submitter, or authority layer.

The target style is not clickbait, shock marketing, or vague emotional writing. It is a polished zh-CN public-account article with:

- a concrete reader scene before abstract explanation;
- a clear conflict or decision tension;
- one defensible core point;
- strong information gain through tables, examples, scripts, and checklists;
- lower AI-pattern prose;
- SEO intent, CTA, internal links, and claim gates preserved.

## When To Use

Use this skill when the user says or implies:

- the article feels too AI-generated;
- the article lacks WeChat/public-account style depth;
- the content logic is thin even though the technical package is valid;
- a Mode C package needs content enrichment before CMS draft/import;
- a daily SEO article should be made more readable, story-led, or reader-native.

Do not use this skill for:

- topic selection or Mode B brief generation; use `fermatmind-daily-seo-ops`;
- CMS import, preview QA, publish, discoverability, URL Truth, Search Channel, schema, hreflang, deploy, or PR; use `fermatmind-seo-ops` or the relevant technical skill;
- frontend editorial fallback content;
- rewriting product/legal/science authority claims without the original evidence.

## Hard Boundaries

- Do not change `operation_type`, `locale`, `slug`, canonical URL, article id, revision id, translation group id, or package identity.
- Do not add, remove, or mutate publish authorization flags.
- Do not set `publish_allowed=true`, `is_indexable=true`, `sitemap_eligible=true`, or `llms_eligible=true`.
- Do not enable schema or hreflang.
- Do not add JSON-LD.
- Do not write CMS, run import commands, publish, revalidate, submit search, enqueue Search Channel, call IndexNow/Baidu/GSC, deploy, or create a PR unless separately asked.
- Do not invent Media Library URLs, admission data, school-specific rules, salary/employment outcomes, reliability/validity data, sample sizes, norms, or expert quotes.
- Do not copy competitor wording, proprietary examples, data, screenshots, or images.
- Do not add private URLs, result URLs, order/payment/share URLs, tokenized URLs, local file paths, or admin/preview URLs to active article body.
- Do not turn the article into fear-based clickbait. Headlines and openings may create tension, but must still be literal, accurate, and claim-safe.
- Do not hide uncertainty. If the official source, admissions rule, Media Library asset, or runtime field is unknown, preserve `Unknown` or the package's existing hold state.

## Evidence Order

Use evidence in this order:

1. The current Mode B brief, content package manifest, article markdown, CMS fields, claim gate, internal-link plan, CTA contract, and media manifest.
2. Existing FermatMind public route ownership and cannibalization decisions.
3. Operator-provided content feedback and screenshots.
4. Public SERP and competitor structures for intent and article shape only.
5. Public writing-skill references for methods such as scene-led opening, emotional curve, and AI-pattern checks. Do not import their claims or copy their prose.

## Inputs

Prefer a complete Mode C content package directory or zip. Minimum useful inputs:

- `manifest.json`;
- article markdown under `pages/` or equivalent;
- `brief/SEO_BRIEF.md` or user-provided brief;
- `cms/CMS_FIELDS_*.json` when available;
- `contracts/INTERNAL_LINK_PLAN.json`;
- `contracts/DYNAMIC_CTA_CONTRACT.json`;
- `review/claim_gate.md`;
- `codex/codex_handoff.md`.

If the package is missing identity or claim-gate files, stop with `BLOCKED_PACKAGE_IDENTITY_OR_CLAIM_GATE_MISSING`.

## Editable Surface

Default editable files are only the article body and body-derived package copies inside a newly generated repaired package copy:

- `pages/*.md` or the package's article markdown;
- `cms/CMS_FIELDS_*.json` only when it stores an exact article body/html/markdown copy that must stay in sync;
- `cms/CMS_IMPORT_DRAFT_*.json` only when it stores an exact article body/html/markdown copy that must stay in sync;
- an editor report and manifest for the repaired copy.

Do not edit source package files in place unless the user explicitly asks for in-place repair. Do not edit media files, route contracts, SEO authority files, publish flags, schema/hreflang plans, URL Truth, Search Channel, or runtime code.

## Workflows

### `wechat_seo_content_enrichment`

Purpose: rewrite or repair the article body inside a new generated/repaired package copy so it reads like a stronger zh-CN WeChat-style SEO article while staying CMS-safe.

Steps:

1. Lock identity
   - Record operation type, locale, slug, canonical, title/H1, primary keyword, secondary keywords, CTA routes, and held lanes.
   - Identify files that may be edited. Usually only article markdown/body and content-package derived field snapshots in a new repaired copy.

2. Diagnose content weaknesses
   - Check opening scene, quick answer, search intent satisfaction, conflict, core point, examples, tables, FAQ, CTA, internal links, and claim boundaries.
   - Mark weak sections as `thin`, `generic`, `definition-first`, `AI-pattern`, `claim-risk`, `missing-example`, `missing-action`, or `cannibalization-risk`.

3. Build the WeChat SEO spine
   - Use this article shape unless the brief requires otherwise:
     1. Reader scene with a real decision moment.
     2. Quick answer within 150-220 Chinese characters.
     3. The common wrong question or false binary.
     4. The article's core point.
     5. Practical framework with tables/checklists.
     6. Two to four concrete examples or mini-scenarios.
     7. Reality check from official/source-of-truth materials.
     8. FermatMind method section, bounded and non-deterministic.
     9. Parent/student/user scripts when the topic involves conflict.
     10. FAQ and CTA.

4. Rewrite for depth
   - Replace generic advice with specific verification actions.
   - Prefer tables, checklists, scripts, and decision states over broad paragraphs.
   - Every major section should include at least three of: scene, judgment rule, concrete example, table/checklist, next action.
   - Keep paragraphs short enough for mobile reading.
   - Preserve SEO keyword intent without keyword stuffing.
   - Use emotion as an entry point, then convert it into evidence, rules, and actions.
   - Keep the title/meta honest: no panic words, guaranteed outcomes, official-system implication, or unsupported numeric claims.

5. Remove AI-pattern prose
   - Remove empty transitions such as `总之`, `综上所述`, `值得注意的是` when they do not add logic.
   - Remove repeated triples that only restate the same idea.
   - Remove over-balanced phrases like `既要...也要...还要...` when no concrete action follows.
   - Replace abstract nouns with visible decisions, documents, examples, or reader questions.
   - Vary sentence length and rhythm. Do not make every paragraph the same shape.

6. Preserve safety and SEO contracts
   - Re-run claim boundary review against the changed body.
   - Verify active internal links and CTA remain public localized routes.
   - If body markdown is mirrored in CMS JSON fields, update those body fields in the same repaired copy so package body surfaces match.
   - Verify title, meta description, excerpt, FAQ, and CTA still match the rewritten article body.
   - Keep schema/hreflang/search/publish/revalidation holds unchanged.
   - Keep visible FAQ visible-only unless a separate schema task later approves structured data.

7. Output repaired copy and report
   - Write a new generated/repaired package copy only when the user authorized file creation.
   - Include a report that lists the quality score, changed files, changed sections, unchanged identity fields, claim gate status, and next exact handoff.

Final decisions:

- `WECHAT_SEO_REWRITE_READY_FOR_OPERATOR_REVIEW`
- `WECHAT_SEO_REWRITE_READY_FOR_MODE_C_QA`
- `BLOCKED_PACKAGE_IDENTITY_OR_CLAIM_GATE_MISSING`
- `BLOCKED_CONTENT_STRATEGY_NEEDS_OPERATOR_INPUT`
- `BLOCKED_CANNIBALIZATION_RISK`

### `wechat_seo_prompt_layer`

Purpose: create a paste-ready instruction for GPT 5.5 Pro or another content-package model so the first draft already has stronger public-account article logic.

Use:

- `assets/GPT55_DAILY_SEO_MODE_C_PACKAGE_PROMPT_TEMPLATE.md` when the task is to generate a complete daily SEO Mode C content package from an approved topic or Mode B brief.
- `assets/WECHAT_SEO_REWRITE_PROMPT_TEMPLATE.md` when the task is to improve an already generated article/package body before Codex package QA.
- `assets/CODEX_STAGE4_TO_SEO_AGENT_GOAL_TEMPLATE.md` when GPT has returned the content package/images and the user wants Codex to do Stage 4 content enrichment/package QA/image manifest normalization, then generate the Stage 5 `/goal` for a separate SEO agent window.

Include:

- target reader scene;
- concrete pain point;
- false binary to avoid;
- core point;
- required examples/tables/scripts;
- FermatMind claim boundaries;
- CTA/internal-link contract;
- package output tree;
- AI-pattern self-check.

Output decision:

- `WECHAT_SEO_PROMPT_READY_FOR_GPT_PACKAGE_OWNER`
- `STAGE4_READY_FOR_SEO_AGENT_FULL_RELEASE_GOAL`
- `BLOCKED_NEEDS_TOPIC_OR_BRIEF_INPUT`

### `wechat_seo_quality_gate`

Purpose: score a returned article without rewriting it.

Use this 100-point scorecard:

| Area | Points | Pass standard |
|---|---:|---|
| Search intent answer | 15 | First 150-220 Chinese characters answer the query directly. |
| Scene and conflict | 15 | Opens from a concrete reader situation, not a definition. |
| Core point | 10 | One memorable, defensible argument runs through the article. |
| Information gain | 20 | Adds tables, checklists, examples, scripts, or verification steps not found in generic explainers. |
| WeChat readability | 10 | Mobile-readable paragraphs, varied rhythm, no mechanical sectioning. |
| SEO and internal links | 10 | Keywords, CTA, and internal links remain natural and route-safe. |
| Claim safety | 15 | No prediction, diagnosis, guarantee, official-system implication, or fabricated data. |
| Package integrity | 5 | Identity, CMS fields, held lanes, and media statuses are preserved. |

Decision rules:

- 85-100: `PASS_READY_FOR_MODE_C_QA`
- 70-84: `REPAIR_RECOMMENDED_BEFORE_MODE_C_QA`
- 0-69: `REWRITE_REQUIRED_BEFORE_CMS`
- Any hard safety violation: `BLOCKED_CLAIM_OR_PRIVATE_URL_RISK`

Hard failures independent of score:

- active private/admin/preview URL introduced;
- publish/search/schema/hreflang hold weakened;
- body markdown and CMS body JSON diverge after repair;
- unsupported admission, employment, salary, success, or official-system claim introduced;
- title/meta promises a stronger outcome than the article can support.

## FermatMind Article Patterns To Preserve

Good FermatMind SEO articles should:

- turn a vague worry into a checklist or decision table;
- separate hard constraints from interest preferences and reality checks;
- use status labels such as `保留 / 待验证 / 暂时排除` when useful;
- turn family or career conflict into evidence questions rather than persuasion;
- connect RIASEC to work activities and environment preferences, not final career answers;
- place CTA after a useful framework, not before the reader gets value.

Known weak patterns to repair:

- definition-first opening;
- generic model explanation replacing the user's scenario;
- technically complete but emotionally flat body;
- repeated disclaimers without practical action;
- tables that summarize but do not help decide;
- FAQ that repeats headings instead of answering search questions;
- CTA that feels detached from the article's decision moment.
- public-account tone that relies on anxiety but never lands in a checklist, source, or next action.

## Claim Boundaries For Career And Gaokao Articles

Never claim or imply:

- admission prediction;
- major matching guarantee;
- salary, employment, or career-success prediction;
- official volunteer-application system status;
- official MBTI/Holland/RIASEC/Big Five/IQ/EQ/Enneagram equivalence;
- diagnosis, therapy, hiring fit, or formal assessment use.

Allowed bounded language:

- `作为探索起点`;
- `帮助观察倾向`;
- `把兴趣转成验证问题`;
- `需要结合位次、选科、招生计划、培养方案、课程表、访谈和官方规则`;
- `不能替代省考试院、高校招生章程或正式志愿填报系统`.

## Output Report Template

When editing or scoring a package, include:

```markdown
# WeChat SEO Article Editor Report

Decision:

## Identity Lock
- operation_type:
- locale:
- slug:
- canonical:
- title/H1:
- primary CTA:

## Content Diagnosis
- Opening:
- Core point:
- Information gain:
- AI-pattern risks:
- Cannibalization:

## Changes Made Or Recommended
-

## Quality Score
- search intent answer:
- scene and conflict:
- core point:
- information gain:
- WeChat readability:
- SEO and routes:
- claim safety:
- package integrity:
- total:

## Package Sync
- article markdown updated:
- CMS body fields updated if present:
- title/meta/excerpt still aligned:

## Claim Gate
- forbidden claims introduced: none/...
- private URLs introduced: none/...
- schema/hreflang/search/publish holds preserved: yes/no

## Next Step
-
```

## Handoff To Other Skills

- After this skill returns `WECHAT_SEO_REWRITE_READY_FOR_MODE_C_QA`, use `fermatmind-daily-seo-ops` package intake or `fermatmind-seo-ops` CMS content package QA.
- After this skill returns `WECHAT_SEO_PROMPT_READY_FOR_GPT_PACKAGE_OWNER`, send the prompt to GPT and wait for the package.
- If this skill returns `REWRITE_REQUIRED_BEFORE_CMS`, do not proceed to CMS import or publish.
