# Runtime Leakage Prevention

## Never Expose

- `audit_fields`
- `evidence_id`
- `source_id`
- row hashes
- internal lineage
- repair notes
- gate labels
- candidate search projection
- backend URI or internal source enum
- unapproved SEO/schema fields

## Required Reader Projection

Every API reader projection must use an allowlist of public fields. Do not rely on blocklist-only filtering.

## Frontend Rule

If the reader API is missing, incomplete, disabled by flag, or has disallowed status, the frontend must fail closed. It must not render local fallback editorial copy.

## QA

Run leakage scans at asset, API, page, and post-import live QA layers.
