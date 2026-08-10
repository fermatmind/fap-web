# Orphan, depth, and internal authority baseline

Orphan eligibility requires successful render, indexable observation, self-canonical identity, and zero crawlable visible inbound links; sitemap membership is not inbound.

- True orphan: 49.
- Sitemap-only nodes: 49.
- Zero contextual inbound: 51.
- Failed 0 and pending 0 pages are excluded from orphan claims.
- Full median/p90/max depth: 1/4/5.
- Contextual median/p90/max depth: 1/4/5.

The score formula is frozen in config and JSON. It is explicitly **not Google PageRank** and does not predict ranking.
