# llms-full public artifact-read boundary

## Problem

Production observation after the Alibaba Cloud cutover showed that even a single guarded
`/llms-full.txt` runtime rebuild could fan out into hundreds of backend public API reads and contend
with L1/L2 application traffic. Cross-worker single-flight and cooldown controls reduced duplicate
work but did not remove the request-time full-enrichment load.

## Change

- Public `GET /llms-full.txt` reads only a fresh complete artifact, a valid stale complete artifact,
  or the bounded degraded projection. It never starts the full builder or detail enrichment.
- The explicit operator generator is the only complete artifact builder and always uses the
  `artifact` profile.
- The protected LLMS Feed Cache Ops workflow binds generation and installation to the exact deployed
  frontend SHA, 2092 Career URLs, the expected Enneagram cohort, and complete mode.
- The workflow installs exact bytes atomically, reloads PM2, compares the public body SHA with the
  offline artifact, and restores the previous artifact when installation or readback fails.
- Trusted content-release revalidation still removes both fresh and stale artifacts. Until a new
  protected offline artifact is installed, the public route serves degraded mode and cannot rebuild.

## Authority and safety

- Backend CMS/public APIs remain the only content and enumeration authority.
- An incomplete artifact is never installed, stored, or labeled as complete.
- The degraded response remains an availability mode, not a content authority source.
- No URL, canonical, hreflang, indexability, publication state, CMS data, or backend data changes.
- The PR performs no production cache write, deploy, DNS, Search Channel, or URL submission. The
  protected workflow remains a separately authorized production cache operation.

## Operational outcome

A missing complete artifact causes zero full rebuild attempts from public traffic. The route returns
the bounded degraded projection until an operator-approved offline artifact installation succeeds.

## Repository rule impact

This changes the generation SOP and public cache-read behavior of an existing SEO/GEO artifact. It
preserves backend/CMS/public API authority, adds no frontend editorial fallback, and does not widen
publication or discoverability eligibility.
