# Article / Career Package Isolation

| Control | W3 Articles | Career Guides pilot | Result |
|---|---|---|---|
| Report root | `packages/w3-articles/` | `packages/career-guides/` | PASS |
| Authority package root | `generated/en-content-parity/v2/W3/articles/d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a` | not generated | PASS |
| Package SHA | `d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a` | `NOT_GENERATED` | PASS; no shared SHA |
| Manifest | exact W3 Article lane manifest | none until exact slugs | PASS |
| Source ledger | 17 Article identities | one per future occupation | PASS |
| Content type | CMS Article | Career Guide/block assembly | PASS |
| Import mapping | Article importer | future Career Guide importer | PASS |
| QA | exact W9 Article QA | future per-occupation factory QA | PASS |
| Receipt chain | empty in V2 master | none | PASS |
| Rollback identity | Article package SHA | future per-occupation SHA | PASS |
| Search gates | separate, currently false for W3 API rows | separately prohibited | PASS |

The historical Career Guide SHA is different from the W3 Article SHA, but it is not reused as the current pilot package. Any future shared SHA, manifest, or mixed payload is BLOCKED.
