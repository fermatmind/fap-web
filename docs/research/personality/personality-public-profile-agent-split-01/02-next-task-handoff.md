# Next Task Handoff

## Task

`MBTI64-SEARCH-QUEUE-EXPANSION-DRY-RUN-01`

## Purpose

Read-only production verification for the full 96 URL MBTI64 public personality cohort:

- 64 A/T variant URLs.
- 32 A-vs-T comparison URLs.

## Required Boundary

The dry-run may verify URL Truth, eligibility, duplicate queue state, page entity type, reason codes, and safety flags.

It must not:

- enqueue Search Queue items,
- approve queue items,
- submit to any search provider,
- write URL Truth,
- mutate CMS,
- trigger sitemap or llms release,
- deploy frontend or backend.

## SSH Boundary

If production SSH is required, use a fresh read-only authorization phrase before execution:

`I explicitly allow read-only SSH verification for fap-api production for MBTI64-SEARCH-QUEUE-EXPANSION-DRY-RUN-01.`
