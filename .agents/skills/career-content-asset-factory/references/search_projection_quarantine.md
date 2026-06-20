# Search Projection Quarantine

Search, SEO, GEO, schema, or query-intent candidates are not reader assets.

## Rules

- Keep candidate projection in a separate file such as `search_projection.jsonl`.
- Never place candidate projection inside reader asset JSONL.
- Never return candidate projection from reader APIs.
- Never convert candidate projection into JSON-LD, sitemap, canonical, noindex, robots, or llms output without a separate SEO/runtime release PR.
- Candidate projection must include a status such as `candidate_only` and a release gate note.

## Validation

Run `validate_search_projection_quarantine.py` before staging preview design and before production import readiness.
