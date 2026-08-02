# Staging, Import, And Release Contract

Each block should use an independent asset channel unless an existing channel owns that block.

## Dry Run

Dry run validates shape, row counts, SHA, authority, reader-safe projection, and duplicate/idempotency rules. It must not write staging or production rows.

## Trusted V2 Promotion

After independent QA passes, a registered V2 exact package is dispatched to the trusted backend promotion workflow. That executor runs dry-run validation, draft import, readback, publication, and live QA in order. It reports machine-gate failures as blockers and never requests a human approval artifact or exact-SHA confirmation phrase.

## Legacy And Direct Paths

Producer code must not write staging or production rows. Direct `cms_import`, `production_import`, schema/runtime mutation, and SEO mutation remain blocked. Legacy approval manifests may remain readable for audit history but cannot gate a new V2 package.

For revision-managed records, the import plan must separate:

- new primary draft creation;
- existing identity working-revision creation;
- working-pointer updates;
- published-pointer or public-field mutation.

The last category is performed only by the trusted V2 backend executor after
the registered package's machine gates pass. A draft-only import remains distinct
from separate sitemap/LLMS/indexability and other SEO discoverability controls.
