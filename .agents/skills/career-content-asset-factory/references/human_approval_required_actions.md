# Human Approval Required Actions

The operator must stop and ask for explicit user approval before:

- schema changes or schema version migrations
- source-policy changes
- changing a frozen baseline
- expanding beyond the authorized batch
- staging preview writes
- CMS writes
- API/runtime/frontend page changes
- SEO runtime changes, including sitemap, `llms.txt`, canonical, noindex, robots, JSON-LD, or schema release
- approved transitions
- production import
- rollback or destructive cleanup
- increasing repair-loop limits after repeated failure

Production import approval must name the exact artifact SHA. Operator mode must never infer production approval from a PASS report.
