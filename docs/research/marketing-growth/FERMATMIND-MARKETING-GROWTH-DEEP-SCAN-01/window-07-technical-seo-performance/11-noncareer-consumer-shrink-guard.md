# Non-Career frontend consumer shrink guard

Candidate: **NONCAREER-DISCOVERABILITY-CONSUMER-GUARD-01**

Repository: **fap-web**
Status: **READY_WAITING_ON_C06**

## Dependencies

1. NONCAREER-DISCOVERABILITY-AUTHORITY-GUARD-01 merged.
2. Career C06 complete.

## Requirements

- Consume backend authority and separate Career from non-Career.
- Never add a local SEO enumeration or CMS-content fallback.
- Never hand-edit generated sitemap/llms artifacts.
- Treat empty/partial authority responses as failure, not successful empty state.
- Use architecture-approved stale LKG or an explicit failure state.
- Emit exact set, locale and surface diffs.
- Allow a legitimate versioned publication change to update the cohort.

## Required fixtures

- One whole locale disappears.
- One surface disappears.
- Cold-start empty response.
- Partial authority load.
- Unchanged set remains stable.
- Intentional versioned publication change succeeds.
- Career growth while non-Career shrinks still fails.

The consumer guard cannot compensate for a missing backend authority contract and cannot introduce frontend editorial truth.
