# llms-full runtime rebuild amplification guard

## Problem

Production observation after the Alibaba Cloud cutover showed that an uncached or incomplete
`/llms-full.txt` rebuild could fan out into hundreds of backend public API reads. Two PM2 workers
could start the same rebuild independently, and a failed quality gate left no complete cache, so
later public reads repeated the same expensive work.

## Change

- Use an atomic shared-directory lease so only one PM2 worker may build the same site artifact.
- Record a 15-minute shared failure cooldown when a build fails or produces a non-cacheable artifact.
- During an active lease or cooldown, preserve the existing bounded degraded response instead of
  starting another backend fanout.
- Clear the cooldown and lease together with the response cache when the trusted content-release
  revalidation path explicitly invalidates `llms-full`.
- Keep stale and complete cache quality gates unchanged.

## Authority and safety

- Backend CMS/public APIs remain the only content and enumeration authority.
- An incomplete artifact is never stored or labeled as complete.
- The degraded response remains an availability mode, not a content authority source.
- No URL, canonical, hreflang, indexability, publication state, CMS data, or backend data changes.
- No production cache warm, deploy, DNS, Search Channel, or URL submission is part of this PR.

## Operational outcome

A missing complete artifact can cause at most one shared rebuild attempt per cooldown window instead
of one attempt per public request and PM2 worker. A trusted content release can still clear the
cooldown immediately and start a fresh authority-backed rebuild.

## Repository rule impact

This changes only the failure-control behavior of an existing SEO/GEO cache. It preserves the
backend authority boundary and does not add frontend editorial fallback content or widen exposure.
