# Search Projection Quarantine

Search, SEO, GEO, schema, or query-intent candidates are not reader assets.

## Rules

- Keep candidate projection in a separate file such as `search_projection.jsonl`.
- For career KG occupation packages, keep candidate projection in a separate
  `career_kg_search_projection_candidate` artifact.
- Never place candidate projection inside reader asset JSONL.
- Never return candidate projection from reader APIs.
- Never convert candidate projection into JSON-LD, sitemap, canonical, noindex, robots, or llms output without a separate SEO/runtime release PR.
- Candidate projection must include a status such as `candidate_only` and a release gate note.
- Candidate projection may suggest title, meta description, FAQ, and internal
  links for editorial review, but it must keep `production_import_approved`,
  `staging_write_approved`, `seo_runtime_release_approved`, and
  `cms_write_approved` false.
- Reader assets must not contain runtime SEO controls such as canonical,
  noindex, sitemap, `llms.txt`, JSON-LD runtime fields, or search-provider
  submission fields.

## Validation

Run `validate_search_projection_quarantine.py` before staging preview design and before production import readiness.

For career KG packages, validate both sides:

```bash
python3 .agents/skills/career-content-asset-factory/scripts/validate_search_projection_quarantine.py \
  --reader-asset generated/career-kg-pr-XX-<slug>/<slug>.zh-CN.asset.json \
  --candidate generated/career-kg-pr-XX-<slug>/search_projection.candidate.json
```

If the candidate is ready for runtime, stop. Runtime SEO release requires a
separate explicitly authorized PR owned by the SEO/GEO authority lane.
