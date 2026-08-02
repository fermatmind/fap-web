# V2 Promotion And Independent-Control Boundaries

For a registered V2 exact package named by an end-to-end `/goal`, independent QA followed by the trusted backend promotion workflow is the only allowed import/readback/publish/live-QA path. It does not need a human approval artifact, a named reviewer, or an exact-SHA confirmation phrase.

## Direct Actions That Stay Blocked

- Direct CMS import or production import from Producer code.
- Schema or runtime mutation outside the trusted backend executor.
- Changing sitemap, `llms.txt`, canonical, noindex, robots, JSON-LD, or Search Channel discoverability.
- Production infrastructure deploy, database migration, secrets/permissions, and irreversible deletion.
- Changing source URLs or source IDs in a frozen baseline.
- Expanding batch size beyond the approved policy.

## What The V2 Promotion Does Not Imply

- An independent QA PASS alone does not authorize a direct import.
- A package SHA does not authorize a separate discoverability or SEO release.
- A draft import does not imply sitemap, LLMS, media, cache, or search actions.

Legacy artifacts may retain `human_approval_required` fields and old approval records for audit compatibility. New V2 promotion records must set that field to `false`; it cannot be used as a V2 gate.
