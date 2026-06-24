# Next Goal Recommendation

Run a 50-slug query intent candidate editorial rewrite/release-review pass.

Inputs:
- `generated/career-seo-geo-query-intent-release-review/preview_50_slug_cohort.csv`
- `generated/career-query-intent-projection-candidates/search_projection_candidate.jsonl`

Hard boundaries:
- do not write CMS
- do not modify runtime APIs
- do not modify title/meta/schema/sitemap/llms/canonical/noindex/JSON-LD
- keep `runtime_approved=false` until a separate release PR

Goal:
- fix generic template phrasing
- fix English article/plural grammar
- remove zh diagnostic title suffixes from candidates
- produce a clean 50-slug `search_projection_candidate_preview_v1.jsonl`
