# CMS Draft Package Contract

Status: MVP0 contract.

This contract defines a dry-run package shape for future CMS draft preparation. It does not write CMS, create drafts, import content, publish content, enqueue Search Channel work, submit to search providers, or change runtime SEO behavior.

## Package Boundary

A CMS draft package is review material only until a separate exact approval is provided. Each package must include:

- `package_id`, `target_url`, `locale`, and `content_type`.
- source opportunity ids and evidence references.
- proposed SEO fields and draft body blocks.
- claim gate results for every factual, scientific, career, or conversion-impacting claim.
- media policy declaring no local public asset writes.
- approvals required before any CMS mutation.

## Claim Gate

Every claim must have:

- `claim_id`
- `text`
- `risk_level`
- `evidence_ids`
- `verdict`

Only `APPROVED_FOR_DRY_RUN` and `NEEDS_HUMAN_REVIEW` are valid non-blocking dry-run states. `BLOCKED_CLAIM` keeps the package blocked.

## Forbidden Actions

This contract cannot approve:

- CMS save, draft creation, import, publish, unpublish, or media upload.
- Search Channel enqueue, approve, or submit.
- Google, Baidu, IndexNow, or provider submission.
- sitemap, robots, llms, schema, hreflang, canonical, noindex, redirect, or runtime SEO changes.

The first CMS-write-capable consumer must be a later explicitly approved PR.

