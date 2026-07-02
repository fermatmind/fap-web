# FermatMind SEO Ops Skill

## Purpose

Use this repo-scoped skill to assist FermatMind SEO operations without replacing the authority layers. The skill turns operator-provided SEO evidence, CMS content packages, preview evidence, Metabase exports, Search Channel Queue exports, and public runtime observations into structured review reports, QA checklists, and no-go decisions.

V2 adds an authorized full-release runner mode. By default this skill remains report-only. When a user-provided `/goal` includes an explicit Authorization Profile, the skill may execute only the scoped production-safe actions allowed by that profile and the linked playbooks. The skill is still not a migration runner, Metabase admin, auth/payment/security actor, environment/secret mutator, or unbounded submitter.

SEO Agent run-control and opportunity-review handoffs are Codex-reviewed by default. A `seo-agent-codex-review-handoff.v1` artifact may be reviewed only for verdicts, recommended dry-run actions, risk flags, and human approval requirements; it must not grant execution permission.

External-model and Mode C references in this skill describe content-package source material only, not the canonical review layer.

SEO Agent technical fap-web fixes must route through the fap-web Code PR Writer lane. The canonical contract is `seo-agent-fapweb-code-pr-writer.v1`; it may produce a PR plan for Codex to review and then use for a scoped fap-web PR, but it must not direct-push `main`, auto-merge, auto-deploy, write CMS data, submit Search Channel requests, request indexing, or create frontend editorial fallback content.

## When to use this skill

Use this skill for:

- Heavy SEO release, discoverability, search, schema, hreflang, and revalidation work after daily planning. For daily topic selection or Mode B brief planning, prefer the thin `fermatmind-daily-seo-ops` skill first, then return here for controlled execution playbooks.
- Single-article release closeout after publish/discoverability/search work, using backend `articles:release-closeout` and frontend public smoke verification evidence.
- Daily SEO signal review.
- Weekly SEO article review and optimization queue generation, using read-only fap-api export data, GSC/GA4 evidence, and competitor SERP structure review.
- CMS content package QA before preview/import work.
- New bilingual SEO article pair planning and readiness review.
- SEO article publish accompaniment from package QA to operator publish gate.
- Chinese legacy page overwrite/diff preview.
- CMS field mapping QA.
- CMS preview QA.
- Operator publish review preparation.
- Indexability readiness/release planning with schema, hreflang, sitemap, llms, Search Channel, and ISR held independently.
- Post-publish smoke reports.
- Search Channel Queue read-only audit.
- Search Channel live-readiness approval drafting without execution.
- Baidu platform/readiness retry guard review.
- GSC manual inspection readiness review.
- D1, D7, and D14 canary observation.
- URL Truth and runtime drift review.
- Authorized full release for a new SEO article package.
- Authorized goal contract validation.
- Full release state machine execution/resume.
- Scoped PR-train blocker fix coordination.
- Production draft import through the controlled writer.
- Controlled publish through the controlled publish command.
- Discoverability release for sitemap, llms, and llms-full.
- Search discovery pipeline through bounded queue/channel workflows.
- Multi-article release retrospective and skill gap scans.
- Daily content-release pipeline guidance with search-submission batch separation.
- Daily article release goal generation.
- Claim Gate and Private URL Guard audit.
- Social image / Media Library metadata readiness review.
- SEO image asset bundle preflight and Media Library resolution.
- Content feedback queue and ready-to-publish queue preparation.
- Metabase/Ops Portal evidence interpretation.

Do not use this skill to perform live SEO operations unless the current `/goal` includes an Authorization Profile that explicitly allows the exact action family and the relevant playbook preflight passes.

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

Never do these actions from this skill, even in authorized runner mode:

- Invent unknown routes.
- Use placeholder, private, tokenized, or unverified Media Library assets.
- Override the Claim Gate or publish unsafe claims.
- Enable schema or hreflang implicitly.
- Click GSC Request Indexing without a full-chain Authorization Profile or separate exact approval that lists the target canonical URLs.
- Push Baidu live submission without a full-chain Authorization Profile or separate exact approval that lists the bounded queue item IDs.
- Change production env vars or secrets.
- Run migrations or destructive DB changes.
- Upgrade dependencies outside the current scope.
- Change auth, payment, or security-risk code as part of SEO release automation.
- Work around external platform blockers, CAPTCHA, or login failures.
- Use Node2 local Laravel, local DB, or frontend static fallback as CMS authority.
- Continue after a production command failure without rollback proof.
- Read PII, raw orders, raw payments, raw users, raw emails, raw tokens, raw attempt IDs, or raw result IDs.
- Auto-generate unsupported schema.
- Auto-enable FAQ schema.
- Treat readiness-only data as live collector data.
- Treat competitor data as FermatMind evidence.
- Generate unsupported psychometric, diagnosis, treatment, hiring, salary, or career success claims.
- Commit content package zip files.
- Mix unrelated `generated/` report directories into PRs or handoffs.
- Retry provider-blocked Baidu push attempts without a fresh platform-side resolution and explicit operator approval.

Default-denied actions that require Authorization Profile approval and a passing playbook:

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
- Write production databases.
- Modify Metabase.
- Expose Metabase.
- Modify Ops Portal permissions.

If a workflow requires a default-denied action and the Authorization Profile does not allow it, stop at a report and mark `Human authorization required`. If a workflow hits a hard no-go rule, stop even if the Authorization Profile appears to allow the broader action.

## Human authorization gates

The following always require explicit human authorization. In V1.1/readiness workflows the skill must not execute them. In V2 authorized runner workflows they may execute only when the Authorization Profile explicitly allows the exact action family and the referenced playbook preflight passes:

- CMS mutation.
- CMS package import.
- Article publish.
- `make_indexable` or equivalent CMS field changes.
- `sitemap_eligible` changes.
- `llms_eligible` changes.
- Schema enablement. This remains exact-approval-only and must not be inferred from publish/indexability approval.
- Hreflang enablement. This remains exact-approval-only and must not be inferred from publish/indexability approval.
- Search Channel enqueue or submit.
- GSC/Baidu/IndexNow/360/Sogou/Shenma calls. GSC Request Indexing, IndexNow live submission, and Baidu live push may be pre-authorized by a full-chain Authorization Profile when the target canonical URLs, queue item IDs, channels, and hold boundaries are explicit; otherwise they remain exact-approval-only. 360/Sogou/Shenma hold by default.
- ISR revalidation.
- Collector or scheduler enablement.
- Metabase sharing, embedding, datasource, permission, or network changes.
- Production DB writes.

The skill may draft an approval checklist or phrase for the operator. Exact approval phrases must name the target action, IDs or URLs, channel if applicable, target SHA if deploy-related, and release name if deploy-related.

## Workflow router

Choose the workflow by user intent:

| User intent | Workflow |
|---|---|
| Run a complete authorized SEO article release | `seo_article_full_release` |
| Validate or interpret an Authorization Profile | `authorized_goal_contract` |
| Execute or resume the full release state machine | `full_release_state_machine` |
| Handle scoped PR-train blocker fix within a release | `scoped_pr_train` |
| Run production draft import dry-run/import | `production_draft_import` |
| Run publish metadata gate and controlled publish | `controlled_publish` |
| Release sitemap, llms, and llms-full discoverability | `discoverability_release` |
| Run URL Truth and search discovery pipeline | `search_discovery_pipeline` |
| Run a multi-article release retrospective / skill gap scan | `multi_article_release_retro` |
| Patch or review daily content-release vs search-batch guidance | `daily_pipeline_search_batch_separation` |
| Run schema readiness, no-write rehearsal, or rollout | `schema_rollout` |
| Run hreflang readiness, no-write rehearsal, or rollout | `hreflang_rollout` |
| Reconcile final release truth after follow-up work | `final_reconciliation` |
| Close out one article after daily release work | `single_article_release_closeout` |
| Select a daily article topic or generate a Mode B brief | use `fermatmind-daily-seo-ops` first |
| Generate tomorrow's daily article release goal | `daily_article_release_goal` |
| Daily SEO review | `daily_seo_review` |
| Weekly article review | `weekly_article_review` |
| Check a CMS content package | `cms_content_package_qa` |
| Preflight/import SEO image asset bundle | `image_asset_bundle_preflight_and_media_library_resolution` |
| Plan or QA a new bilingual article pair | `new_bilingual_article_pair_runner` |
| Accompany an article package through preview and publish gate | `cms_seo_article_publish_runner` |
| Replace a Chinese legacy page safely | `chinese_overwrite_diff_runner` |
| Check CMS fields | `cms_field_mapping_qa` |
| Check article social image metadata | `social_image_metadata_gate` |
| Check preview URL | `preview_qa` |
| Prepare human publish gate | `operator_publish_gate` |
| Decide if a page can move from noindex to indexability release | `indexability_readiness_gate` |
| Prepare bounded indexability-only release instructions | `indexability_release` |
| Recheck sitemap and llms parity | `sitemap_llms_parity_check` |
| Check public page after operator publish | `post_publish_smoke` |
| Audit search channel queue | `search_channel_queue_audit` |
| Prepare Search Channel live-readiness approval text | `search_channel_live_submission_readiness` |
| Review Baidu platform/API retry safety | `baidu_retry_guard` |
| Review GSC manual inspection readiness | `gsc_manual_inspection_readiness` |
| D1/D7/D14 canary review | `canary_observation` |
| Feed observation learnings into next briefs | `content_feedback_queue` |
| Stage reviewed articles for later operator publish | `ready_to_publish_queue` |
| URL truth or runtime drift review | `url_truth_drift_review` |
| Claim safety audit | `claim_gate_audit` |
| Private URL guard audit | `private_url_guard_audit` |
| Metabase/Ops Portal evidence review | `seo_middle_office_audit` |

## Workflow definitions

### `seo_article_full_release`

Purpose: run one new SEO article package through the authorized V2 release chain from package QA to final search-discovery summary.

Use:

- `references/authorized_goal_contract.md`.
- `references/article_identity_lock.md`.
- `references/mode_c_content_package_rules.md`.
- `references/image_asset_bundle_workflow.md`.
- `references/full_article_release_state_machine.md`.
- `references/package_autofix_playbook.md`.
- `references/production_draft_writer_playbook.md`.
- `references/publish_metadata_gate.md`.
- `references/controlled_publish_playbook.md`.
- `references/discoverability_release_playbook.md`.
- `references/search_discovery_pipeline.md`.
- `references/daily_pipeline_search_batch_separation.md`.
- `references/schema_hreflang_rollout_rules.md`.
- `references/final_reconciliation.md`.
- `references/scoped_pr_train_automerge_deploy.md`.
- `references/deploy_preapproval_policy.md`.

Required stages:

1. package QA.
2. deterministic package autofix.
3. image asset bundle preflight.
4. Media Library image import/register dry-run.
5. authorized Media Library image import/register if needed.
6. resolved CMS image metadata backfill.
7. production draft import dry-run.
8. production draft-only import.
9. authenticated preview QA.
10. publish metadata autofill.
11. publish rehearsal.
12. controlled publish.
13. post-publish smoke.
14. sitemap, llms, and llms-full release.
15. URL Truth refresh.
16. Search Channel Queue readiness.
17. Search Channel Queue enqueue or explicit `DISCOVERABILITY_RECONCILED_SEARCH_BATCH_HELD`.
18. IndexNow bounded submission only when the search batch is pre-authorized or separately authorized.
19. GSC manual readiness and Request Indexing only when the target canonical URLs are pre-authorized or separately authorized.
20. Baidu readiness/live path only when bounded queue item IDs are pre-authorized or separately authorized.
21. article schema, breadcrumb schema, FAQ schema, and hreflang independent enhancement gates when the Authorization Profile allows them.
22. final report.
23. D1/D7/D14 observation queue.
24. final reconciliation after schema, hreflang, GSC, Search Channel, IndexNow, or Baidu work.

Hard gates: follow the Authorization Profile. Run image asset bundle preflight before production draft dry-run. Run Article Identity Lock before preview QA, publish, discoverability release, schema, hreflang, Search Channel, GSC, or Baidu stages. Run schema and hreflang only as explicit independent SEO enhancement gates; if their verification fails, record `SEO_ENHANCEMENT_HELD_REASON` instead of mutating publish state. Search submissions are batch tasks and must not block the next daily content release once public/discoverability state is safe. Stop on any hard no-go.

### `multi_article_release_retro`

Purpose: reconcile several article releases after follow-up work and produce skill, Mode C, memo, runtime-tooling, and observation patch recommendations without mutating production state.

Use:

- `references/multi_article_release_retro.md`.
- `references/final_reconciliation.md`.
- `references/search_discovery_pipeline.md`.
- `references/daily_pipeline_search_batch_separation.md`.

Hard gates: read-only unless a separate Authorization Profile allows a bounded action. Old generated final summaries are inputs, not final truth.

### `single_article_release_closeout`

Purpose: decide whether one released SEO article can be closed as complete with search observation pending, or whether a specific lane remains blocked.

Use:

- fap-api read-only command:
  `php artisan articles:release-closeout --article-id=<id> --expected-slug=<slug> --json --no-ansi`
- fap-web public smoke verifier:
  `pnpm seo:verify-public-article-release --url=https://fermatmind.com/<locale>/articles/<slug> --expect-title --expect-meta --expect-canonical --expect-robots=index,follow --expect-sitemap --expect-llms --expect-llms-full --expect-jsonld=Article,BreadcrumbList --forbid-jsonld=FAQPage --forbid-hreflang --retry=3 --retry-delay-ms=60000 --json`
- Ops/CMS Article `SEO Release Status` panel when browser/CMS evidence is requested.

Do:

- Run or request read-only evidence for content state, title/meta/canonical/robots, public media URLs, reader-facing taxonomy, sitemap, llms, llms-full, URL Truth, Search Channel queue states, schema/hreflang gates, public HTML JSON-LD, GSC manual request status, and D1/D7/D14 observation queue.
- Treat PR1 backend closeout and PR2 frontend smoke outputs as complementary: backend tells authority/state gaps; frontend confirms public runtime HTML and cache state.
- Apply retry/cache-window judgment for public HTML smoke. Do not call one transient cache miss a release failure until the configured retry window completes.
- Separate hard blockers from intentional holds. FAQ schema hold and no-hreflang policy are acceptable when recorded; missing Article/Breadcrumb schema or missing no-hreflang policy is a closeout gap unless explicitly held.

Output:

- Closeout matrix by lane: content, media, taxonomy, schema, hreflang, sitemap, llms, llms-full, URL Truth, Search Channel, GSC, public HTML smoke, and observation.
- Remaining exact actions, if any, with dry-run command and approval phrase requirements.
- Final decision: `ARTICLE_RELEASE_COMPLETE_SEARCH_OBSERVATION_PENDING`, `BLOCKED_DISCOVERABILITY_GAP`, `BLOCKED_SEARCH_QUEUE_GAP`, `BLOCKED_PUBLIC_HTML_DRIFT`, or `BLOCKED_OPERATOR_INPUT`.

No-go:

- Do not mutate CMS, publish/promote, revalidate, submit search, enable schema/hreflang, update sitemap/llms, or click GSC from this workflow without a full-chain Authorization Profile or separate exact authorization and the relevant playbook preflight.

### `daily_pipeline_search_batch_separation`

Purpose: guide daily SEO operations so content release, discoverability reconciliation, search submissions, GSC, schema, hreflang, and D1/D7/D14 observation remain distinct lanes.

Use:

- `references/daily_pipeline_search_batch_separation.md`.
- `assets/daily_seo_memo_template.md`.

Hard gates: search live actions, GSC Request Indexing, CMS writes, Media Library writes, URL Truth writes, revalidation, and deploy require either a full-chain Authorization Profile or separate exact authorization. Schema and hreflang remain independent rollout gates and require either a full-chain profile that names them or separate exact authorization.

### `authorized_goal_contract`

Purpose: validate the current `/goal` Authorization Profile before the skill executes any default-denied action.

Use `references/authorized_goal_contract.md`.

Output: authorization boundary matrix and explicit allowed/held/stopped action list.

### `image_asset_bundle_preflight_and_media_library_resolution`

Purpose: validate Mode C `media/IMAGE_ASSET_MANIFEST.json`, run the production-safe Media Library image importer dry-run, optionally import/register images when authorized, and backfill resolved CMS image metadata before article draft dry-run.

Use:

- `references/image_asset_bundle_workflow.md`.
- `references/mode_c_content_package_rules.md`.
- `assets/image_asset_bundle_reports_template.md`.
- `assets/next_daily_image_bundle_template.md`.

Standard command:

`php artisan media-assets:import-seo-image-bundle`.

Hard gates: dry-run first; do not upload/register images unless `allow_media_library_image_import=true`; do not overwrite the original source package; stop on missing manifest when image bundle required, missing source file, invalid MIME/SVG, animated image, oversize image, missing alt text, `competitor_asset=true`, CDN verification failure, unresolved placeholders in active surfaces, fake/private image URLs, or duplicate recent cover blocked by package policy.

### `full_release_state_machine`

Purpose: execute or resume the article release state machine with durable stage decisions.

Use `references/full_article_release_state_machine.md`.

Output: full release state ledger and next resume point.

### `scoped_pr_train`

Purpose: handle a scoped runtime blocker discovered during a release, then resume the failed stage after merge and deploy readiness.

Use:

- `references/scoped_pr_train_automerge_deploy.md`.
- `references/deploy_preapproval_policy.md`.

Hard gates: no unrelated refactor, no generated commit, no dependency upgrade, no migration/env/secret/auth/payment/security change without exact approval.

### `production_draft_import`

Purpose: use the standard production writer to dry-run and, when authorized, create draft-only CMS articles.

Use `references/production_draft_writer_playbook.md`.

Standard command: `php artisan articles:import-seo-content-package-draft`.

Hard gates: always dry-run first, no local DB, no Ops UI fallback unless explicitly requested, no publish in this stage, rollback proof required after failure.

### `controlled_publish`

Purpose: complete publish metadata, run publish rehearsals, and publish only through the controlled command when authorized.

Use:

- `references/publish_metadata_gate.md`.
- `references/controlled_publish_playbook.md`.

Hard gates: preview QA and publish rehearsal must pass; schema/hreflang remain independent.

### `discoverability_release`

Purpose: release sitemap, llms, and llms-full discoverability after public smoke passes and the Authorization Profile allows the release.

Use:

- `references/article_identity_lock.md`.
- `references/discoverability_release_playbook.md`.

Hard gates: no private URL exposure, no schema/hreflang side effects, no search-channel submission.

### `search_discovery_pipeline`

Purpose: run URL Truth, Search Channel Queue, IndexNow bounded submission, GSC manual readiness, Baidu readiness, and final channel matrix.

Use:

- `references/search_discovery_pipeline.md`.
- `references/article_identity_lock.md`.
- `references/indexnow_bounded_submission.md`.
- `references/gsc_manual_readiness.md`.
- `references/baidu_readiness_guard.md`.

Hard gates: lock article identity before queue or provider work. GSC Request Indexing requires full-chain preauthorization with exact canonical URLs or separate exact approval. Baidu live push requires full-chain preauthorization with bounded queue item/channel match or separate exact approval. 360/Sogou/Shenma hold by default.

### `schema_rollout`

Purpose: run schema readiness, no-write JSON-LD rehearsal, and exact-approval rollout for a locked article pair.

Use:

- `references/article_identity_lock.md`.
- `references/schema_hreflang_rollout_rules.md`.

Hard gates: schema is granular. Article schema, Breadcrumb schema, and FAQ schema must have independent gates. FAQ schema defaults to hold. Missing publisher is `NO_GO_FOR_SCHEMA_ROLLOUT`.

### `hreflang_rollout`

Purpose: run hreflang readiness, no-write alternate rehearsal, and exact-approval rollout for a locked article pair.

Use:

- `references/article_identity_lock.md`.
- `references/schema_hreflang_rollout_rules.md`.

Hard gates: hreflang is independent from schema. Confirm reciprocal zh/en targets, canonical self-reference, x-default policy, sitemap/alternate consistency, no orphan locale, no wrong language route, and unchanged schema side effects.

### `final_reconciliation`

Purpose: update the final truth after any follow-up schema, hreflang, GSC, Search Channel, IndexNow, Baidu, sitemap/llms, or llms-full work.

Use:

- `references/article_identity_lock.md`.
- `references/final_reconciliation.md`.

Hard gates: do not treat an old final summary as final truth when follow-up state changed. Mark `FINAL_SUMMARY_STALE_NEEDS_UPDATE` until reconciliation is complete.

### `daily_article_release_goal`

Purpose: generate tomorrow's short `/goal` prompt for an authorized article release.

Use:

- `references/mode_c_content_package_rules.md`.
- `assets/full_release_goal_template.md`.

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

Purpose: weekly SEO article review and optimization planning without mutating content or search state.

Use:

- fap-api read-only weekly export:
  `php artisan articles:weekly-seo-observation-export --from=<YYYY-MM-DD> --to=<YYYY-MM-DD> --locale=<locale-or-empty> --json --no-ansi`
- Optional locked cohort export:
  `php artisan articles:weekly-seo-observation-export --article-ids=<ids> --expected-slugs=<slugs> --from=<YYYY-MM-DD> --to=<YYYY-MM-DD> --json --no-ansi`
- fap-api single article closeout for rows with blockers:
  `php artisan articles:release-closeout --article-id=<id> --expected-slug=<slug> --json --no-ansi`
- fap-web public smoke verifier for rows with public HTML drift:
  `pnpm seo:verify-public-article-release --url=https://fermatmind.com/<locale>/articles/<slug> --expect-title --expect-meta --expect-canonical --expect-robots=index,follow --retry=3 --retry-delay-ms=60000 --json`
- Operator-provided GSC export, GA4/Metabase/Ops screenshots, Baidu status, Search Channel status, and CMS status when available.
- Competitor pages only for SERP framing, title/meta patterns, content structure, FAQ/internal-link ideas, and search-intent coverage. Do not copy claims, text, images, data, or schema.

Do:

- Define the weekly cohort explicitly: dates, locales, article ids/slugs, new articles, updated articles, and high-impression existing articles.
- Run or request the read-only weekly export before analysis. Missing GSC/GA4 tables are `data_unavailable`, not zero.
- Merge backend closeout decisions with GSC clicks/impressions/CTR/average position, site conversion metrics, Search Channel status, GSC manual indexing status, and public smoke evidence.
- Compare competitor pages by visible SERP/title/meta/H1/section/FAQ/internal-link structure only, and mark any competitor-derived idea as `competitive_structure_signal`.
- Identify whether each article needs title/meta update, internal-link addition, CTA adjustment, FAQ visible-content review, schema/hreflang gate review, media/taxonomy cleanup, or a new supporting article.
- Route changes to the right next workflow:
  `existing_article_update_package`, `internal_link_update`, `schema_rollout`, `hreflang_rollout`, `single_article_release_closeout`, `daily_topic_selection`, or `hold_for_more_data`.

Classify:

- impressions without clicks.
- clicks without CTA.
- CTA without start_test.
- low start_test to complete_test conversion.
- position 8-30 opportunity pages.
- high-impression low-CTR pages.
- pages needing title/meta updates.
- pages needing FAQ, internal links, or CTA updates.
- pages with discoverability/search closeout blockers.
- pages with public HTML/cache drift.
- pages where competitor structure suggests a gap but claims require source review.

Outputs:

- `WEEKLY_ARTICLE_SEO_REVIEW.md`.
- `ARTICLE_OPTIMIZATION_QUEUE.csv`.
- `WEEKLY_COMPETITOR_STRUCTURE_NOTES.md` when competitor review is requested.
- Decision: `WEEKLY_SEO_REVIEW_COMPLETE_OPTIMIZATION_QUEUE_READY`, `BLOCKED_NEEDS_EXPORT_INPUT`, `BLOCKED_NEEDS_OPERATOR_INPUT`, or `HOLD_INSUFFICIENT_DATA`.

Hard gates:

- No CMS mutation.
- No publish/promote.
- No generated content injection.
- No revalidation.
- No search submission or Search Channel mutation.
- No GSC Request Indexing click.
- No schema/hreflang writes.
- No sitemap/llms mutation.
- No deploy.
- No competitor-content copying.
- If an optimization is recommended, output the exact next workflow and approval requirements; do not execute it inside weekly review.

### `cms_content_package_qa`

Purpose: check whether a GPT-5.5 Pro CMS content package can enter Codex preview flow.

Use `references/mode_c_content_package_rules.md`.

Also use `references/image_asset_bundle_workflow.md` when generating daily image package instructions.

Required package checks:

- `manifest.json`.
- `media/IMAGE_ASSET_MANIFEST.json` when image bundle or unique article image is required.
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
- image asset bundle preflight and resolved CMS image metadata when `media/` exists or body visual/unique cover is required.

Outputs:

- `CONTENT_PACKAGE_INTEGRITY_REPORT.md`.
- `CODEX_QA_<slug>.md`.
- `CMS_IMPORT_READY_REPORT.md`.

Decision: `GO_FOR_PREVIEW` or `NO_GO_FOR_PREVIEW`.

Hard gates: no import, no CMS write, no schema enablement, no publish. Social/cover image readiness and body visual readiness are separate gates; unresolved body visual placeholders block preview/import.
Image bundle dry-run is allowed only when the Authorization Profile or task explicitly allows image bundle validation. Media Library import/register is a separate production mutation.

### `new_bilingual_article_pair_runner`

Purpose: evaluate a pair of new zh/en SEO article URLs as one content operation without treating either page as a legacy overwrite.

Use:

- `references/new_bilingual_article_pair_runner.md`.
- `references/mode_c_content_package_rules.md`.
- `references/image_asset_bundle_workflow.md`.

Must check:

- shared article-pair manifest.
- `media/IMAGE_ASSET_MANIFEST.json` and source image files when a unique cover/body visual is required.
- one CMS draft payload per locale.
- `translation_group_id` consistency.
- locale-specific slug, canonical, title, meta, body, FAQ, CTA, internal links, cover/social image, claim gate, private URL guard, schema hold, hreflang hold, sitemap hold, llms hold, Search Channel hold.
- separate preview QA and operator review per locale.
- resolved image metadata backfill before draft import.
- pair-level readiness decision.

Hard gates: no CMS mutation, no publish, no indexability release, no sitemap/llms release, no search submission, no revalidation. Stop on unresolved body visual placeholders, unverified Media Library asset keys, or active-surface private URL/alias leakage.

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

### `social_image_metadata_gate`

Purpose: block article publish, indexability, and search readiness when CMS cover/social image metadata is missing or unsafe.

Use `references/social_image_metadata_gate.md`.

Check:

- `cover_image_url`.
- `cover_image_alt`.
- `cover_image_width`.
- `cover_image_height`.
- `cover_image_variants.hero`.
- `cover_image_variants.og`.
- public Media Library asset provenance.
- public-safe URL.
- no `__CMS_MEDIA_LIBRARY_PLACEHOLDER__`.
- no private bucket, token, order, result, payment, or local file URL.

Output: `SOCIAL_IMAGE_METADATA_GATE_REPORT.md`.

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
- CTA anchors use public canonical routes.
- social metadata is absent in preview or safe if rendered.
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

### `indexability_readiness_gate`

Purpose: decide whether a published noindex article can move to indexability release.

Use `references/indexability_readiness_gate.md`.

Must keep these decisions independent:

- claim gate acceptance.
- science/legal/operator review.
- make indexable.
- sitemap eligible.
- llms eligible.
- schema.
- hreflang.
- Search Channel.
- GSC/Baidu/IndexNow/360/Sogou/Shenma.
- ISR revalidation.

Output: `INDEXABILITY_READINESS_GATE_REPORT.md`.

### `indexability_release`

Purpose: prepare bounded operator-approved indexability-only release instructions and post-release verification.

Use `references/indexability_release_playbook.md`.

Default holds:

- schema hold.
- hreflang hold.
- sitemap hold.
- llms hold.
- Search Channel hold.
- ISR hold unless operator explicitly approves coupled release signal.

Output: `INDEXABILITY_RELEASE_REPORT.md`.

### `sitemap_llms_parity_check`

Purpose: verify backend source and frontend public `sitemap.xml`, `llms.txt`, and `llms-full.txt` parity.

Use `references/sitemap_llms_parity_check.md`.

Output: `SITEMAP_LLMS_PARITY_CHECK_REPORT.md`.

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

### `search_channel_live_submission_readiness`

Purpose: prepare Search Channel dry-run/live-readiness review and exact operator approval text without executing enqueue, approval, or submission.

Use `references/search_channel_live_submission_playbook.md`.

Output: `SEARCH_CHANNEL_LIVE_SUBMISSION_READINESS.md`.

### `baidu_retry_guard`

Purpose: review Baidu platform/API readiness and decide whether a previous Baidu push failure is safe to retry.

Use `references/baidu_retry_guard.md`.

Default decision after provider-side `site init fail`: `NO_GO_RETRY_UNTIL_PLATFORM_RESOLUTION`.

Output: `BAIDU_RETRY_GUARD_REPORT.md`.

### `gsc_manual_inspection_readiness`

Purpose: review Google Search Console manual inspection readiness and warnings without submitting or requesting indexing.

Use `references/gsc_manual_inspection_readiness.md`.

Output: `GSC_MANUAL_INSPECTION_READINESS_REPORT.md`.

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

### `content_feedback_queue`

Purpose: convert weekly review and D1/D7/D14 observation learnings into next-brief feedback.

Use `references/content_feedback_queue.md`.

Output: `CONTENT_FEEDBACK_QUEUE.md`.

### `ready_to_publish_queue`

Purpose: stage articles that passed package QA, preview QA, and operator review for later human-controlled publish windows.

Use `references/ready_to_publish_queue.md`.

Output: `READY_TO_PUBLISH_QUEUE.md`.

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
- layoff-risk prediction, recession-proof guarantee, AI-proof guarantee, career-security guarantee, employability score, or resilience score unless backed by approved references and explicit operator/legal review.
- claims without references or claim boundary notes.

## Search Channel rules

The skill may audit queue evidence and draft exact approval text only. It must not enqueue, approve, submit, retry, call live APIs, or mark execution success.

Any Search Channel action must stay human-authorized. For unsafe URLs, output `NO_GO_FOR_SEARCH_CHANNEL`.

For Baidu provider errors such as `site init fail`, do not recommend repeated live retries until platform-side site state, token ownership, endpoint, and operator resolution evidence are recorded.

## CMS publish rules

The skill may prepare package QA, field mapping QA, preview QA, and operator publish review. It must not import, mutate, publish, make indexable, update SEO metadata, enable schema, enable hreflang, or change sitemap/llms eligibility.

## Artifact and PR handoff rules

Content package zip files are input artifacts, not repo artifacts. Do not commit them.

Generated reports must be path-limited to the task output directory and must not be mixed into unrelated PRs. If a PR is needed, include only the skill files and explicitly authorized report files.

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
Use fermatmind-seo-ops weekly_article_review for articles published or updated this week. Use fap-api `articles:weekly-seo-observation-export` output, GSC/GA4 evidence if provided, and competitor structure notes if current web research is requested. Produce WEEKLY_ARTICLE_SEO_REVIEW.md, ARTICLE_OPTIMIZATION_QUEUE.csv, and next workflow recommendations. Do not mutate CMS, publish, revalidate, submit search, enable schema/hreflang, or change sitemap/llms.
```
