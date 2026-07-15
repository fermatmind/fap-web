# Staging, Import, And Release Contract

Each block should use an independent asset channel unless an existing channel owns that block.

## Dry Run

Dry run validates shape, row counts, SHA, authority, reader-safe projection, and duplicate/idempotency rules. It must not write staging or production rows.

## Staging Preview

Staging preview writes selected rows only after dry run PASS. Preview rows must be hidden behind status, flag, allowlist, or equivalent backend gate. Frontend must fail closed.

## Editorial Review

Editorial review checks content quality, locale, high-risk boundaries, leakage, and page display. It may produce approve/reject manifests but does not import production.

## Approved

Approved rows must match artifact SHA, QA SHA, approval manifest SHA, row count, slug count, and rollback plan.

## Production Import

Production import requires explicit human approval naming the exact SHA. Import must be followed by live API/page smoke and post-import SEO safety audit.

For revision-managed records, the import plan must separate:

- new primary draft creation;
- existing identity working-revision creation;
- working-pointer updates;
- published-pointer or public-field mutation.

The last category must remain zero unless a separate promotion/public-release
authorization names the exact revision and effects. A draft-only import is not
a release transition.
