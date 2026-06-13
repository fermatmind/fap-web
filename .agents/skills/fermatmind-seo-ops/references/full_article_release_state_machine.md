# Full Article Release State Machine

Use this state machine for `seo_article_full_release` and resumable `full_release_state_machine` runs.

Every state must record:

- inputs.
- allowed actions.
- hard stops.
- success decision.
- failure decision.
- resume instructions.

Before entering `PREVIEW_QA`, `PUBLISH_REHEARSAL`, `CONTROLLED_PUBLISH`, `SITEMAP_LLMS_RELEASE`, `URL_TRUTH_REFRESH`, `SEARCH_CHANNEL_READINESS`, `INDEXNOW_BOUNDED_SUBMISSION`, `GSC_MANUAL_READINESS`, `BAIDU_READINESS`, schema rollout, hreflang rollout, or post-release follow-up work, run `references/article_identity_lock.md`. Stop when article IDs, revision IDs, translation group ID, locale, slug, or public canonical URLs do not match the current target pair.

## States

### PACKAGE_PREFLIGHT

- Inputs: content package ZIP or source-package directory, expected locales, slugs, canonicals, translation group ID.
- Allowed actions: unpack/read package, validate manifest/frontmatter/contracts/CMS payloads.
- Hard stops: missing files, invalid manifest, translation group mismatch, overwrite when new article expected, unresolved body visual placeholder in active import surfaces, unverified selected Media Library body visual asset.
- Success decision: `PACKAGE_PREFLIGHT_PASSED`.
- Failure decision: `BLOCKED_NEEDS_OPERATOR_INPUT`.
- Resume: rerun after package files are fixed.

### PACKAGE_AUTOFIX

- Inputs: preflight findings and Authorization Profile.
- Allowed actions: deterministic route alias fix, contract auto-add, active-surface cleanup, social image default resolution, field length deterministic rewrite.
- Hard stops: unknown route, missing media asset, unsafe claim, active private URL not safely removable, body visual required but no verified asset or operator-authorized fallback.
- Success decision: `PACKAGE_AUTOFIX_COMPLETED`.
- Failure decision: `BLOCKED_NEEDS_OPERATOR_INPUT`.
- Resume: rerun package preflight after fix.

### IMAGE_ASSET_BUNDLE_PREFLIGHT

- Inputs: package preflight pass, `media/IMAGE_ASSET_MANIFEST.json`, source files, Authorization Profile.
- Allowed actions: validate manifest, local file existence, dimensions, MIME/extension, file size, alt text, provenance, no placeholders, no competitor/private/fake assets.
- Hard stops: missing manifest when image bundle required, missing source file, invalid MIME/SVG, animated image, image >10 MB, missing alt text, `competitor_asset=true`, unresolved placeholder in active surfaces.
- Success decision: `IMAGE_ASSET_BUNDLE_PREFLIGHT_PASSED`.
- Failure decision: `BLOCKED_NEEDS_OPERATOR_INPUT`.
- Resume: fix package media files/manifest and rerun package preflight plus image preflight.

### MEDIA_LIBRARY_IMAGE_IMPORT_DRY_RUN

- Inputs: image preflight pass, production command `media-assets:import-seo-image-bundle`, translation group ID.
- Allowed actions: dry-run only with `--dry-run --json`.
- Hard stops: command unavailable, dry-run errors, duplicate recent cover blocked by policy, CDN readiness would fail, missing resolved output contract.
- Success decision: `GO_FOR_MEDIA_LIBRARY_IMAGE_IMPORT_OR_BACKFILL`.
- Failure decision: `NO_GO_FOR_MEDIA_LIBRARY_IMAGE_IMPORT`.
- Resume: fix package or runtime, then rerun image importer dry-run.

### MEDIA_LIBRARY_IMAGE_IMPORT_AND_BACKFILL

- Inputs: dry-run pass, `allow_media_library_image_import=true`, `allow_resolved_package_write=true`, `allow_image_metadata_backfill=true`.
- Allowed actions: import/register Media Library assets through the image importer, generate variants, verify CDN, write a resolved package copy, backfill CMS image metadata.
- Hard stops: import writes outside Media Library/variants/resolved package, CMS article mutation, publish/index/sitemap/llms/search/revalidation/schema/hreflang side effect, CDN verification failure, unresolved body visual required by package.
- Success decision: `GO_FOR_DRAFT_IMPORT_DRY_RUN`.
- Failure decision: `FAILED_IMAGE_IMPORT_ROLLBACK_REVIEW_REQUIRED`.
- Resume: verify no CMS mutation, fix image/import issue, rerun dry-run.

### DRAFT_IMPORT_DRY_RUN

- Inputs: fixed package, resolved image package when required, production writer command, expected slugs.
- Allowed actions: dry-run only.
- Hard stops: command unavailable, image bundle required but unresolved, missing cover/social/body visual metadata required by the package, preflight errors, malformed JSON, field length errors.
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
- Allowed actions: authenticated preview read-only QA after Article Identity Lock.
- Hard stops: identity lock failure, unauthorized preview, missing noindex/no-store/private, private URL leak, unsafe claim.
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
- Allowed actions: Article Identity Lock, `content-publish-rehearsal --dry-run --no-write`, `articles:publish-controlled --dry-run`.
- Hard stops: dry-run errors, article ID mismatch, identity lock failure, unsafe fields.
- Success decision: `GO_FOR_CONTROLLED_PUBLISH`.
- Failure decision: `NO_GO_FOR_CONTROLLED_PUBLISH`.
- Resume: fix metadata/runtime and rerun rehearsal.

### CONTROLLED_PUBLISH

- Inputs: rehearsal pass, `allow_publish_after_rehearsal=true`.
- Allowed actions: Article Identity Lock, controlled publish; make indexable only if `allow_make_indexable_after_smoke=true` or explicitly permitted by goal.
- Hard stops: schema/hreflang implicit enablement, publish command mismatch, article ID mismatch, identity lock failure.
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
- Allowed actions: Article Identity Lock, sitemap/llms eligibility release, backend sitemap-source warm, fap-web sitemap convergence.
- Hard stops: identity lock failure, private URL, schema/hreflang side effect, search submission coupling.
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
- Allowed actions: Article Identity Lock and readiness checks only.
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
- Allowed actions: approve/hold channel plan according to profile using the official `search-channel-approve` flow.
- Hard stops: missing exact approval for live-required channel.
- Success decision: `GO_FOR_INDEXNOW_BOUNDED_SUBMISSION`.
- Failure decision: `BLOCKED_NEEDS_EXACT_APPROVAL`.
- Resume: provide exact approval or record hold.

### INDEXNOW_BOUNDED_SUBMISSION

- Inputs: selected IndexNow queue items and bounded approval.
- Allowed actions: IndexNow-only bounded submit through `search-channel-submit-approved`.
- Hard stops: identity lock failure, dry-run issues, mixed channel submit, unapproved queue item, exact phrase required but absent.
- Success decision: `INDEXNOW_SUBMISSION_COMPLETED_OR_HELD`.
- Failure decision: `BLOCKED_NEEDS_EXACT_INDEXNOW_APPROVAL`.
- Resume: rerun only remaining unsubmitted items.

### GSC_MANUAL_READINESS

- Inputs: public URLs and GSC access.
- Allowed actions: Article Identity Lock, inspect and record evidence only.
- Hard stops: identity lock failure, CAPTCHA/login failure, Request Indexing click requested implicitly.
- Success decision: `GSC_MANUAL_READINESS_COMPLETED`.
- Failure decision: `BLOCKED_NEEDS_OPERATOR_INPUT`.
- Resume: rerun after access restored.

### BAIDU_READINESS

- Inputs: Baidu queue items and readiness evidence.
- Allowed actions: Article Identity Lock, readiness/dry-run only unless separate exact approval.
- Hard stops: identity lock failure, site init fail, token exposure, live gate disabled without bounded approved executor path.
- Success decision: `BAIDU_READINESS_COMPLETED_OR_HELD`.
- Failure decision: `BAIDU_PLATFORM_BLOCKED`.
- Resume: rerun after platform-side resolution.

### SCHEMA_ROLLOUT

- Inputs: Article Identity Lock, public URLs, schema metadata readiness, exact schema authorization.
- Allowed actions: no-write schema rehearsal; after exact approval, enable only the authorized granular gates.
- Hard stops: publisher missing, Article/Breadcrumb/FAQ gate cannot be separated, FAQ would be enabled without separate authorization, private URL or placeholder in generated JSON-LD.
- Success decision: `SCHEMA_ROLLOUT_COMPLETED`.
- Failure decision: `NO_GO_FOR_SCHEMA_ROLLOUT`.
- Resume: fix granular gate/runtime metadata, deploy if needed, rerun no-write rehearsal.

### HREFLANG_ROLLOUT

- Inputs: Article Identity Lock, translation group evidence, public canonical URLs, exact hreflang authorization.
- Allowed actions: no-write hreflang rehearsal; after exact approval, enable only the target pair hreflang gate.
- Hard stops: reciprocal mismatch, wrong locale URL, orphan locale, x-default policy ambiguity, schema side effect.
- Success decision: `HREFLANG_ROLLOUT_COMPLETED`.
- Failure decision: `NO_GO_FOR_HREFLANG_ROLLOUT`.
- Resume: fix metadata/runtime, rerun no-write rehearsal.

### FINAL_SUMMARY

- Inputs: all stage reports.
- Allowed actions: generate final report and remaining holds.
- Hard stops: missing required stage evidence.
- Success decision: `FULL_RELEASE_COMPLETED_WITH_SEARCH_LIVE_HOLDS` or `FULL_RELEASE_COMPLETED_AND_SEARCH_SUBMITTED`.
- Failure decision: `BLOCKED_NEEDS_OPERATOR_INPUT`.
- Resume: complete missing stage.

### FINAL_RECONCILIATION

- Inputs: original final summary, Article Identity Lock, any follow-up schema/hreflang/GSC/Search Channel/IndexNow/Baidu reports.
- Allowed actions: reconcile current truth and append/update final release state.
- Hard stops: contradictory article identity, stale summary treated as final truth, missing follow-up evidence.
- Success decision: `FINAL_RECONCILED`.
- Failure decision: `FINAL_SUMMARY_STALE_NEEDS_UPDATE`.
- Resume: gather missing evidence and rerun reconciliation.

### D1_D7_D14_OBSERVATION_QUEUE

- Inputs: final summary and URLs.
- Allowed actions: create D1/D7/D14 observation task templates.
- Hard stops: missing public URLs or article IDs.
- Success decision: `OBSERVATION_QUEUE_READY`.
- Failure decision: `BLOCKED_NEEDS_OPERATOR_INPUT`.
- Resume: regenerate after final summary.
