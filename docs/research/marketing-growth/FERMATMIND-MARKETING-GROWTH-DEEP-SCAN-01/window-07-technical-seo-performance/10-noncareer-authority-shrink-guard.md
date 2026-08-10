# Non-Career backend authority shrink guard

Candidate: **NONCAREER-DISCOVERABILITY-AUTHORITY-GUARD-01**

Repository: **fap-api**
Status: **READY_WAITING_ON_C06**

## Purpose

Prevent a missing, partial, cold-start or permissively swallowed backend projection from silently becoming the active non-Career sitemap/llms authority.

## Inputs

- Current complete authority projection.
- Previous verified release manifest and exact-set SHAs.
- Explicit versioned publication-change identity.
- Last-known-good non-Career cohort.

## Comparisons

- Exact URL and normalized identity set diff.
- Per-surface and per-locale cohorts.
- Publication/index/sitemap/llms eligibility projections.
- Previous release versus intentional authority update.

## Fail-closed conditions

- Non-zero cohort becomes zero.
- A surface disappears without an explicit versioned publication change.
- A locale disappears.
- Authority projection is absent or partial.
- Sitemap/llms inputs load only partially.
- Cold start returns an empty set.
- Permissive/`strict=false` behavior swallows an incomplete result.

## Acceptance and rollback

A legitimate versioned authority change may update the baseline. An aggregate count by itself may not. LKG is a safety source, not a frontend editorial fallback. Rollback disables the new guard version while preserving the previously verified LKG.

Implementation waits for Career C06 so a migration-mixed snapshot cannot define the non-Career authority contract.
