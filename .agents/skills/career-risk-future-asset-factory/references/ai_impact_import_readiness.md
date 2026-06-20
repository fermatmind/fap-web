# AI Impact Import Readiness

AI Impact content production is separate from runtime import.

## Reader-Safe Projection

The API reader payload may include only reader-facing fields:

- slug
- locale
- occupation label
- AI exposure score and confidence
- summary
- most exposed workflows
- human accountability anchors
- how to prepare / skill evidence
- reader-safe source display
- boundary wording

It must exclude:

- `audit_fields`
- source IDs
- evidence IDs
- row hashes
- internal lineage
- score reopen internals
- `search_projection`
- JSON-LD, sitemap, canonical, noindex, or `llms.txt` directives

## State Machine

Use the shared state machine:

1. `dry_run`
2. `staging_preview`
3. `editorial_review`
4. `approved`
5. `production_imported`

Only `approved` rows can be production imported. The production import request must name the exact approved artifact SHA.

## Preview And Editorial QA

Before approval:

- dry-run importer validates all rows and authority gates
- staging preview writes only preview rows
- preview API smoke reads all target rows
- page QA verifies reader-safe rendering, fail-closed behavior, and no internal leakage
- editorial review checks high-risk samples, score explanation quality, locale independence, and no AI outcome overclaim

## Production And Post-Import QA

After exact-SHA production import authorization:

- production API smoke must pass
- live page rendering must show the AI Impact block where expected
- old block fallback must not appear for imported rows
- sitemap, `llms.txt`, canonical, noindex, and JSON-LD must remain unchanged unless a separate SEO PR authorized changes
- post-import QA conclusion should be `POST_IMPORT_SEO_SAFE`

The completed v5 run used final repaired artifact SHA `f22e0266f9b8aa904b00466c9cf751efa72835aebcee41c959d454ffacf96a92` and approval manifest SHA `f07686a30aba34452b9c6faecd1367b003ad19dd17d6896020d3e9e091753646` as one historical release instance. Future releases must use their own current SHAs.
