# Top 10 CMS refresh package QA

Evidence closeout revalidated at: 2026-08-10T18:30:00+08:00

Post-generation QA contract:

- Package count = 10 locale-pages: PASS.
- Existing article identity and revision: PASS.
- `content_package_only=true`, draft intended, operator review, no draft/publish/search submit: PASS.
- Slug/canonical preserved: PASS.
- Public canonical CTA only: PASS.
- Visible FAQ count equals expected FAQ schema count (4): PASS.
- Unknown review fields preserved: PASS.
- Ten unique full body SHA-256 values and ten body Markdown files: PASS.
- Article-specific body/FAQ content; old generic placeholder language absent: PASS.
- At least three direct, traceable references per package; aggregate ledger = 38 rows: PASS.
- Claim-boundary checklist and unresolved Unknown list present in every package: PASS.
- Current title/meta/H1/snippet/outline/internal links and controlled Top 10 attached: PASS.
- M01 page evidence attached for current28/prev28/day90; source SHA and capped-export limitation recorded: PASS.
- Historical query signal separated from current page baseline; current query×page kept Unknown: PASS.
- Deterministic Top 10 priority ranks are unique 1–10 and aggregate/individual JSON packages match: PASS.
- Controlled SERP ranks exactly 1–10 for each of ten queries: PASS.
- Live schema is parsed from HTML and kept separate from backend-declared keys: PASS.
- Live CTA path visibility 129/129 with normalized href semantics: PASS.
- EN V2 control marked required and unfrozen: PASS as handoff, promotion blocked.
- CMS import/publication executed: NO (required boundary).

The generated [validation-report.json](validation-report.json) records these gates after package generation. This QA does not authorize CMS import, publication, indexability or search submission.
