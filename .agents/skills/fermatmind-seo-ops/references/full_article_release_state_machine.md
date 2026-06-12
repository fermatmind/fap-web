# Full Article Release State Machine

Use this state machine for `seo_article_full_release` and resumable `full_release_state_machine` runs.

Every state must record:

- inputs.
- allowed actions.
- hard stops.
- success decision.
- failure decision.
- resume instructions.

## States

### PACKAGE_PREFLIGHT

- Inputs: content package ZIP or source-package directory, expected locales, slugs, canonicals, translation group ID.
- Allowed actions: unpack/read package, validate manifest/frontmatter/contracts/CMS payloads.
- Hard stops: missing files, invalid manifest, translation group mismatch, overwrite when new article expected.
- Success decision: `PACKAGE_PREFLIGHT_PASSED`.
- Failure decision: `BLOCKED_NEEDS_OPERATOR_INPUT`.
- Resume: rerun after package files are fixed.

### PACKAGE_AUTOFIX

- Inputs: preflight findings and Authorization Profile.
- Allowed actions: deterministic route alias fix, contract auto-add, active-surface cleanup, social image default resolution, field length deterministic rewrite.
- Hard stops: unknown route, missing media asset, unsafe claim, active private URL not safely removable.
- Success decision: `PACKAGE_AUTOFIX_COMPLETED`.
- Failure decision: `BLOCKED_NEEDS_OPERATOR_INPUT`.
- Resume: rerun package preflight after fix.

### DRAFT_IMPORT_DRY_RUN

- Inputs: fixed package, production writer command, expected slugs.
- Allowed actions: dry-run only.
- Hard stops: command unavailable, preflight errors, malformed JSON, field length errors.
- Success decision: `GO_FOR_DRAFT_IMPORT`.
- Failure decision: `NO_GO_FOR_DRAFT_IMPORT`.
- Resume: fix package or runtime, then rerun dry-run.

### DRAFT_IMPORT

- Inputs: dry-run pass, `allow_production_draft_import=true`.
- Allowed actions: draft-only import through standard writer.
- Hard stops: publish/index/sitemap/llms side effect, rollback proof missing after failure.
- Success decision: `GO_FOR_PREVIEW_QA`.
- Failure decision: `FAILED_ROLLBACK_REQUIRED`.
- Resume: confirm rollback counts, fix cause, rerun dry-run.

### PREVIEW_QA

- Inputs: article IDs, working revision IDs, preview URLs.
- Allowed actions: authenticated preview read-only QA.
- Hard stops: unauthorized preview, missing noindex/no-store/private, private URL leak, unsafe claim.
- Success decision: `GO_FOR_PUBLISH_METADATA_FIX`.
- Failure decision: `NO_GO_FOR_OPERATOR_PUBLISH_REVIEW`.
- Resume: fix draft/runtime and rerun preview QA.

### PUBLISH_METADATA_FIX

- Inputs: preview pass, CMS draft IDs, profile.
- Allowed actions: structured references, graph metadata, article tags, CTA slots, FAQ items, working revision approval.
- Hard stops: schema/hreflang implicit enablement, CMS authority unavailable.
- Success decision: `GO_FOR_PUBLISH_REHEARSAL`.
- Failure decision: `BLOCKED_NEEDS_OPERATOR_INPUT`.
- Resume: rerun metadata gate.

### PUBLISH_REHEARSAL

- Inputs: publish metadata pass.
- Allowed actions: `content-publish-rehearsal --dry-run --no-write`, `articles:publish-controlled --dry-run`.
- Hard stops: dry-run errors, article ID mismatch, unsafe fields.
- Success decision: `GO_FOR_CONTROLLED_PUBLISH`.
- Failure decision: `NO_GO_FOR_CONTROLLED_PUBLISH`.
- Resume: fix metadata/runtime and rerun rehearsal.

### CONTROLLED_PUBLISH

- Inputs: rehearsal pass, `allow_publish_after_rehearsal=true`.
- Allowed actions: controlled publish; make indexable only if `allow_make_indexable_after_smoke=true` or explicitly permitted by goal.
- Hard stops: schema/hreflang implicit enablement, publish command mismatch, article ID mismatch.
- Success decision: `GO_FOR_POST_PUBLISH_SMOKE`.
- Failure decision: `PUBLISH_FAILED_ROLLBACK_REQUIRED`.
- Resume: confirm state/rollback, rerun rehearsal.

### POST_PUBLISH_SMOKE

- Inputs: public URLs.
- Allowed actions: public read-only smoke.
- Hard stops: public URL non-200, wrong canonical, robots mismatch, private URL leak.
- Success decision: `GO_FOR_SITEMAP_LLMS_RELEASE`.
- Failure decision: `NO_GO_FOR_DISCOVERABILITY_RELEASE`.
- Resume: fix runtime/CMS and rerun smoke.

### SITEMAP_LLMS_RELEASE

- Inputs: public smoke pass, `allow_sitemap_llms_release=true`.
- Allowed actions: sitemap/llms eligibility release, backend sitemap-source warm, fap-web sitemap convergence.
- Hard stops: private URL, schema/hreflang side effect, search submission coupling.
- Success decision: `GO_FOR_LLMS_FULL_PARITY`.
- Failure decision: `NO_GO_FOR_SEARCH_DISCOVERY`.
- Resume: rerun parity after cache/deploy fix.

### LLMS_FULL_PARITY

- Inputs: sitemap/llms release evidence.
- Allowed actions: generate/warm/check `llms-full.txt` complete artifact.
- Hard stops: degraded mode after repair path, target URLs missing, private URL leak.
- Success decision: `GO_FOR_URL_TRUTH_REFRESH`.
- Failure decision: `BLOCKED_NEEDS_RUNTIME_FIX`.
- Resume: scoped PR/deploy, then rerun parity.

### URL_TRUTH_REFRESH

- Inputs: public URLs and discoverability evidence.
- Allowed actions: URL Truth refresh when profile allows.
- Hard stops: authority mismatch, private URL leak.
- Success decision: `GO_FOR_SEARCH_CHANNEL_READINESS`.
- Failure decision: `NO_GO_FOR_SEARCH_CHANNEL`.
- Resume: fix authority mismatch and rerun.

### SEARCH_CHANNEL_READINESS

- Inputs: URL Truth rows, CMS flags, public runtime evidence.
- Allowed actions: readiness checks only.
- Hard stops: draft/noindex/private/claim unsafe.
- Success decision: `GO_FOR_SEARCH_CHANNEL_ENQUEUE`.
- Failure decision: `NO_GO_FOR_SEARCH_CHANNEL`.
- Resume: fix gating issue and rerun.

### SEARCH_CHANNEL_ENQUEUE

- Inputs: readiness pass, `allow_search_channel_enqueue=true`.
- Allowed actions: enqueue approved queue items, no external call.
- Hard stops: duplicate unsafe enqueue, channel ambiguity.
- Success decision: `GO_FOR_SEARCH_CHANNEL_OPERATOR_REVIEW`.
- Failure decision: `NO_GO_FOR_SEARCH_CHANNEL`.
- Resume: reconcile queue and rerun readiness.

### SEARCH_CHANNEL_OPERATOR_REVIEW

- Inputs: queue item IDs and channel matrix.
- Allowed actions: approve/hold channel plan according to profile.
- Hard stops: missing exact approval for live-required channel.
- Success decision: `GO_FOR_INDEXNOW_BOUNDED_SUBMISSION`.
- Failure decision: `BLOCKED_NEEDS_EXACT_APPROVAL`.
- Resume: provide exact approval or record hold.

### INDEXNOW_BOUNDED_SUBMISSION

- Inputs: selected IndexNow queue items and bounded approval.
- Allowed actions: IndexNow-only bounded submit.
- Hard stops: dry-run issues, mixed channel submit, exact phrase required but absent.
- Success decision: `INDEXNOW_SUBMISSION_COMPLETED_OR_HELD`.
- Failure decision: `BLOCKED_NEEDS_EXACT_INDEXNOW_APPROVAL`.
- Resume: rerun only remaining unsubmitted items.

### GSC_MANUAL_READINESS

- Inputs: public URLs and GSC access.
- Allowed actions: inspect and record evidence only.
- Hard stops: CAPTCHA/login failure, Request Indexing click requested implicitly.
- Success decision: `GSC_MANUAL_READINESS_COMPLETED`.
- Failure decision: `BLOCKED_NEEDS_OPERATOR_INPUT`.
- Resume: rerun after access restored.

### BAIDU_READINESS

- Inputs: Baidu queue items and readiness evidence.
- Allowed actions: readiness/dry-run only unless separate exact approval.
- Hard stops: site init fail, token exposure, live gate disabled.
- Success decision: `BAIDU_READINESS_COMPLETED_OR_HELD`.
- Failure decision: `BAIDU_PLATFORM_BLOCKED`.
- Resume: rerun after platform-side resolution.

### FINAL_SUMMARY

- Inputs: all stage reports.
- Allowed actions: generate final report and remaining holds.
- Hard stops: missing required stage evidence.
- Success decision: `FULL_RELEASE_COMPLETED_WITH_SEARCH_LIVE_HOLDS` or `FULL_RELEASE_COMPLETED_AND_SEARCH_SUBMITTED`.
- Failure decision: `BLOCKED_NEEDS_OPERATOR_INPUT`.
- Resume: complete missing stage.

### D1_D7_D14_OBSERVATION_QUEUE

- Inputs: final summary and URLs.
- Allowed actions: create D1/D7/D14 observation task templates.
- Hard stops: missing public URLs or article IDs.
- Success decision: `OBSERVATION_QUEUE_READY`.
- Failure decision: `BLOCKED_NEEDS_OPERATOR_INPUT`.
- Resume: regenerate after final summary.
