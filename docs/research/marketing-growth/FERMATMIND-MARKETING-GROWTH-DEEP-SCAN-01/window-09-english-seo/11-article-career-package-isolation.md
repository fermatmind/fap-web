# Article / Career Package Isolation

| Control | W3 Articles | Career Guides pilot | Result |
|---|---|---|---|
| Report root | `packages/w3-articles/` | `packages/career-guides/` | `STRUCTURAL_ISOLATION_PASS` |
| Authority package root | existing authority root at `generated/en-content-parity/v2/W3/articles/d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a` | no current package generated | `FORMAL_PACKAGE_ISOLATION_PENDING` |
| Package SHA | existing Article SHA `d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a` | `NOT_GENERATED` | `FORMAL_PACKAGE_ISOLATION_PENDING` |
| Manifest | exact existing W3 Article lane manifest | none until exact slugs | `FORMAL_PACKAGE_ISOLATION_PENDING` |
| Source ledger | 17 existing Article identities | none for a current package | `FORMAL_PACKAGE_ISOLATION_PENDING` |
| Content type | CMS Article | future Career Guide/block assembly | `STRUCTURAL_ISOLATION_PASS` |
| Import mapping | existing Article mapping | future Career Guide importer | `FORMAL_PACKAGE_ISOLATION_PENDING` |
| QA | exact existing W9 Article QA | future per-occupation factory QA | `FORMAL_PACKAGE_ISOLATION_PENDING` |
| Receipt chain | empty in V2 master | none | `FORMAL_PACKAGE_ISOLATION_PENDING` |
| Rollback identity | existing Article package SHA | future per-occupation SHA | `FORMAL_PACKAGE_ISOLATION_PENDING` |
| Search gates | separate, currently false for W3 API rows | separately prohibited | `STRUCTURAL_ISOLATION_PASS` |

Overall: `STRUCTURAL_ISOLATION_PASS / FORMAL_PACKAGE_ISOLATION_PENDING`. The historical Career Guide SHA is different from the W3 Article SHA, but it is not reused as the current pilot package. A full package-level PASS cannot be claimed while the current Career package is absent. Any future shared SHA, manifest, or mixed payload is BLOCKED.
