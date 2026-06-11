# FermatMind SEO Ops Skill

## Purpose

Use this repo-scoped skill to assist FermatMind SEO operations without taking over the authority layers. The skill turns operator-provided SEO evidence, CMS content packages, preview evidence, Metabase exports, Search Channel Queue exports, and public runtime observations into structured review reports, QA checklists, and no-go decisions.

This skill is an operating assistant. It is not a publisher, collector, scheduler, submitter, migration runner, CMS writer, Metabase admin, or revalidation actor.

## When to use this skill

Use this skill for:

- Daily SEO signal review.
- Weekly SEO article review.
- CMS content package QA before preview/import work.
- SEO article publish accompaniment from package QA to operator publish gate.
- Chinese legacy page overwrite/diff preview.
- CMS field mapping QA.
- CMS preview QA.
- Operator publish review preparation.
- Post-publish smoke reports.
- Search Channel Queue read-only audit.
- D1, D7, and D14 canary observation.
- URL Truth and runtime drift review.
- Claim Gate and Private URL Guard audit.
- Metabase/Ops Portal evidence interpretation.

Do not use this skill to perform live SEO operations.

## Source hierarchy

Prefer evidence in this order:

1. Operator-provided production exports, screenshots, and explicit written approvals.
2. Backend CMS and `seo_intel` authority evidence from fap-api.
3. Ops Portal `/ops/seo` and private Metabase evidence provided by the operator.
4. fap-web public runtime source and public page observations.
5. Search Channel Queue read-only exports.
6. GSC, Baidu, GA4, and analytics exports provided by the operator.
7. Repository docs and runbooks.

Never use Node2 local Laravel, Node2 local DB, frontend static fallbacks, competitor data, or unverified readiness records as FermatMind authority.

## Hard no-go rules

Never do these actions from this skill:

- Write CMS.
- Import content packages.
- Publish articles.
- Make pages indexable.
- Mark pages sitemap eligible.
- Mark pages llms eligible.
- Submit sitemap.
- Trigger GSC, Baidu, IndexNow, 360, Sogou, or Shenma.
- Trigger ISR or content release revalidation.
- Enable collectors.
- Enable schedulers.
- Run production migrations.
- Write production databases.
- Modify Metabase.
- Expose Metabase.
- Modify Ops Portal permissions.
- Read PII, raw orders, raw payments, raw users, raw emails, raw tokens, raw attempt IDs, or raw result IDs.
- Auto-generate unsupported schema.
- Auto-enable FAQ schema.
- Treat readiness-only data as live collector data.
- Treat competitor data as FermatMind evidence.
- Generate unsupported psychometric, diagnosis, treatment, hiring, salary, or career success claims.

If a workflow requires one of these actions, stop at a report and mark `Human authorization required`.

## Human authorization gates

The following always require explicit human authorization and must not be executed by the skill:

- CMS mutation.
- CMS package import.
- Article publish.
- `make_indexable` or equivalent CMS field changes.
- `sitemap_eligible` changes.
- `llms_eligible` changes.
- Schema enablement.
- Hreflang enablement.
- Search Channel enqueue or submit.
- GSC/Baidu/IndexNow/360/Sogou/Shenma calls.
- ISR revalidation.
- Collector or scheduler enablement.
- Metabase sharing, embedding, datasource, permission, or network changes.
- Production DB writes.

The skill may draft an approval checklist or phrase for the operator, but must not execute the gated action.

## Workflow router

Choose the workflow by user intent:

| User intent | Workflow |
|---|---|
| Daily SEO review | `daily_seo_review` |
| Weekly article review | `weekly_article_review` |
| Check a CMS content package | `cms_content_package_qa` |
| Accompany an article package through preview and publish gate | `cms_seo_article_publish_runner` |
| Replace a Chinese legacy page safely | `chinese_overwrite_diff_runner` |
| Check CMS fields | `cms_field_mapping_qa` |
| Check preview URL | `preview_qa` |
| Prepare human publish gate | `operator_publish_gate` |
| Check public page after operator publish | `post_publish_smoke` |
| Audit search channel queue | `search_channel_queue_audit` |
| D1/D7/D14 canary review | `canary_observation` |
| URL truth or runtime drift review | `url_truth_drift_review` |
| Claim safety audit | `claim_gate_audit` |
| Private URL guard audit | `private_url_guard_audit` |
| Metabase/Ops Portal evidence review | `seo_middle_office_audit` |

## Workflow definitions

### `daily_seo_review`

Purpose: daily SEO signal review.

Inputs:

- GSC export or screenshot.
- Baidu analytics/export if available.
- GA4 or site event export if available.
- `/ops/seo` screenshot/export.
- Metabase export if available.

Check:

- clicks.
- impressions.
- CTR.
- average position.
- top pages.
- top queries.
- new pages with impressions.
- high-impression low-CTR pages.
- position 8-30 opportunity pages.
- private_url_seen.
- technical anomalies.

Output: `DAILY_SEO_SIGNAL_REPORT.md` using `assets/daily_seo_signal_report_template.md`.

Hard gates: no collector run, no search submit, no DB write, no Metabase changes.

### `weekly_article_review`

Purpose: weekly SEO article review.

Classify:

- impressions without clicks.
- clicks without CTA.
- CTA without start_test.
- low start_test to complete_test conversion.
- position 8-30 opportunity pages.
- high-impression low-CTR pages.
- pages needing title/meta updates.
- pages needing FAQ, internal links, or CTA updates.

Outputs:

- `WEEKLY_ARTICLE_SEO_REVIEW.md`.
- `ARTICLE_OPTIMIZATION_QUEUE.csv`.

Hard gates: no CMS mutation, no publish, no generated content injection.

### `cms_content_package_qa`

Purpose: check whether a GPT-5.5 Pro CMS content package can enter Codex preview flow.

Required package checks:

- `manifest.json`.
- `SEO_BRIEF`.
- frontmatter.
- `claim_gate.md`.
- `operator_review.md`.
- `codex_handoff.md`.
- `CMS_FIELDS`.
- `CMS_IMPORT_DRAFT`.
- `DYNAMIC_CTA_CONTRACT`.
- `INTERNAL_LINK_PLAN`.
- `HREFLANG_ROUTING_TREE_CONTRACT`.
- `CANONICAL_PLAN`.
- `SCHEMA_ELIGIBILITY_PLAN`.
- `PRIVATE_URL_GUARD`.

Outputs:

- `CONTENT_PACKAGE_INTEGRITY_REPORT.md`.
- `CODEX_QA_<slug>.md`.
- `CMS_IMPORT_READY_REPORT.md`.

Decision: `GO_FOR_PREVIEW` or `NO_GO_FOR_PREVIEW`.

Hard gates: no import, no CMS write, no schema enablement, no publish.

### `cms_seo_article_publish_runner`

Purpose: accompany a complete CMS content package from package QA to CMS draft readiness, preview QA, operator publish gate, post-publish smoke, and canary task planning.

Steps:

1. Unpack or inspect the content package.
2. Validate file tree.
3. Validate `manifest.json`.
4. Validate frontmatter.
5. Validate claim gate.
6. Validate operator review.
7. Validate Codex handoff.
8. Validate private URL guard.
9. Validate dynamic CTA.
10. Validate internal links.
11. Validate schema eligibility.
12. Validate CMS fields.
13. Generate CMS draft payload for operator review only.
14. If Chinese legacy overwrite, run `chinese_overwrite_diff_runner`.
15. Prepare CMS draft readiness report.
16. Prepare preview checklist.
17. Run `preview_qa` when preview evidence is provided.
18. Generate `READY_FOR_OPERATOR_PUBLISH_REVIEW.md`.
19. Stop at human review gate.
20. Only after explicit operator approval, assist with non-executing publish accompaniment notes.
21. After operator-published page exists, run `post_publish_smoke`.
22. Generate D1/D7/D14 observation task templates.

Defaults:

- Do not write CMS.
- Do not publish.
- Do not make indexable.
- Do not mark sitemap eligible.
- Do not mark llms eligible.
- Do not revalidate.
- Do not submit search.

### `chinese_overwrite_diff_runner`

Purpose: Chinese legacy page overwrite/diff handling.

Must handle:

- Pull or require operator-provided current old CMS body.
- Generate current body snapshot.
- Generate heading tree.
- Generate character count baseline.
- Detect slot markers.
- Generate `CHINESE_ACTUAL_DIFF_PREVIEW.md`.
- Generate `CHINESE_SLOT_MARKER_INSERTION_PATCH.md`.
- Generate `CHINESE_PRE_REVALIDATION_SNAPSHOT.md`.
- Check wipeout risk.
- Preserve slug.
- Preserve canonical.
- Do not create a new URL.

Hard gates:

- Without current CMS body, do not change old page.
- Without operator approval, do not write CMS.
- Without revalidation approval, do not trigger ISR.

### `cms_field_mapping_qa`

Purpose: check whether package fields map to actual CMS fields.

Required fields:

- title.
- slug.
- locale.
- translation_group_id.
- meta_title.
- meta_description.
- canonical_url.
- body.
- faq.
- cta.
- status.
- publish_allowed.
- is_indexable.
- sitemap_eligible.
- llms_eligible.
- claim_gate_status.
- science_review_required.
- legal_review_required.
- operator_review_required.

Output: `CMS_FIELD_MAPPING_REPORT.md`.

### `preview_qa`

Purpose: check whether CMS preview is safe.

Check:

- preview noindex.
- HTTP 200.
- unique H1.
- canonical correctness.
- meta correctness.
- FAQ visible-only.
- CTA visible.
- CTA tracking can trigger.
- no private URL.
- no token, order, result, attempt, or payment ID.
- schema not enabled early.
- hreflang hold or eligible.

Output: `PREVIEW_CHECKLIST_<slug>.md`.

### `operator_publish_gate`

Purpose: prepare human publish review.

Output: `READY_FOR_OPERATOR_PUBLISH_REVIEW.md`.

Must include:

- publishable items.
- blockers.
- risks.
- required operator confirmations.
- publish allowed.
- indexable allowed.
- sitemap eligible allowed.
- llms eligible allowed.
- schema allowed.
- hreflang allowed.
- ISR revalidation allowed.
- Search Channel enqueue/submit allowed.

### `post_publish_smoke`

Purpose: post-operator-publish smoke test.

Check:

- URL 200.
- canonical.
- index/noindex.
- sitemap status.
- llms status.
- hreflang.
- schema.
- FAQ visible.
- CTA click.
- `article_to_test_click`.
- private URL.
- token/order/result ID.
- ISR revalidation status if operator provides evidence.

Output: `POST_PUBLISH_SMOKE_<slug>.md`.

### `search_channel_queue_audit`

Purpose: read-only Search Channel Queue audit.

Check:

- URL public.
- URL indexable.
- URL sitemap eligible.
- URL llms eligible.
- URL claim safe.
- URL private safe.
- canonical correct.
- `noindex=false`.
- `draft=false`.
- approval exists.
- channel allowed.

Output: `SEARCH_CHANNEL_QUEUE_AUDIT.md`.

Hard gate: do not submit GSC, Baidu, IndexNow, 360, Sogou, or Shenma.

### `canary_observation`

Purpose: D1, D7, and D14 observation.

Record:

- GSC impressions.
- GSC clicks.
- CTR.
- average position.
- visible queries.
- `article_to_test_click`.
- `start_test`.
- `complete_test`.
- `view_result`.
- `click_deep_report`.
- `begin_checkout`.
- `purchase_success`.
- `private_url_seen`.
- index status.
- cache status.
- notes.

Outputs:

- `SEO_CANARY_OBSERVATION_D1_<slug>.md`.
- `SEO_CANARY_OBSERVATION_D7_<slug>.md`.
- `SEO_CANARY_OBSERVATION_D14_<slug>.md`.

### `url_truth_drift_review`

Purpose: URL Truth/runtime drift review.

Compare:

- CMS URL.
- frontend runtime URL.
- sitemap URL.
- llms URL.
- canonical.
- hreflang.
- noindex.
- Search Channel Queue.
- private URL policy.

Output: `URL_TRUTH_DRIFT_REPORT.md`.

### `claim_gate_audit`

Purpose: claim safety audit for SEO content and public runtime surfaces.

Check blocked claims:

- diagnosis, treatment, cure, clinical claims.
- guaranteed career success, salary, promotion, or hiring fit.
- precise best-career prediction.
- unsupported RIASEC, Big Five, MBTI, IQ, or psychometric claims.
- claims not supported by references or operator review.

Output: claim findings using `assets/claim_gate_report_template.md`.

### `private_url_guard_audit`

Purpose: verify private URLs do not leak into public SEO surfaces.

Check:

- no result/order/payment/share/history/take URLs in public article body.
- no private URLs in sitemap or llms evidence.
- no tokens or IDs in canonical, CTA, schema, or tracking URLs.
- analytics suppression evidence if provided.

Output: private URL findings in the relevant workflow report.

## Output rules

- Always produce evidence-first reports.
- Use `Verified`, `Not verified`, `Access required`, `Needs operator confirmation`, or `Unknown` instead of guessing.
- Keep no-go decisions explicit.
- For CSV outputs, include deterministic columns and no PII.
- When producing approval text, label it as `operator approval text draft` and do not execute it.

## Evidence rules

Every material finding needs at least one of:

- file path.
- route.
- command.
- model.
- migration.
- config key.
- dashboard/export name.
- screenshot/export identifier.
- operator-provided source note.

If evidence requires login, private network, production DB, CMS, Metabase, GSC, Baidu, or Search Channel access, mark:

`Access required / Not verified / Needs operator confirmation`.

## Private URL rules

Private or sensitive paths include result, results, order, orders, payment, pay, checkout, share, history, take, report-private, and equivalent localized variants.

Private identifiers include email, order ID, payment ID, result ID, attempt ID, report ID, token, secret, transaction ID, and raw user identifiers.

Private URLs must not appear in:

- public article body.
- canonical.
- hreflang.
- sitemap.
- llms.
- schema.
- Search Channel Queue approvals.
- analytics events or query strings.

## Claim safety rules

Block or escalate claims involving:

- diagnosis, treatment, cure, clinical advice, or mental health certainty.
- hiring fit, job performance certainty, salary guarantee, promotion guarantee, or career success guarantee.
- precise best-career prediction.
- unsupported psychometric claims for MBTI, Big Five, RIASEC, Enneagram, or IQ.
- claims without references or claim boundary notes.

## Search Channel rules

The skill may audit queue evidence only. It must not enqueue, approve, submit, retry, call live APIs, or mark execution success.

Any Search Channel action must stay human-authorized. For unsafe URLs, output `NO_GO_FOR_SEARCH_CHANNEL`.

## CMS publish rules

The skill may prepare package QA, field mapping QA, preview QA, and operator publish review. It must not import, mutate, publish, make indexable, update SEO metadata, enable schema, enable hreflang, or change sitemap/llms eligibility.

## Revalidation rules

The skill may inspect revalidation readiness and prepare smoke checklists. It must not call a revalidation endpoint or expose a revalidation secret.

## Metabase / Ops Portal rules

Metabase is private. Do not expose, iframe, reverse proxy, publish links, enable anonymous links, change datasource, or change permissions.

Ops Portal access is operator-controlled. If access is required, mark `Access required`.

## Daily / weekly recurring usage examples

Daily example:

```text
Use fermatmind-seo-ops daily_seo_review with these inputs: GSC export, Baidu export, Metabase screenshot, and /ops/seo notes. Produce DAILY_SEO_SIGNAL_REPORT.md. Do not run collectors or submit search.
```

Weekly example:

```text
Use fermatmind-seo-ops weekly_article_review with this article metrics export and CMS status export. Produce WEEKLY_ARTICLE_SEO_REVIEW.md and ARTICLE_OPTIMIZATION_QUEUE.csv. Do not mutate CMS.
```
