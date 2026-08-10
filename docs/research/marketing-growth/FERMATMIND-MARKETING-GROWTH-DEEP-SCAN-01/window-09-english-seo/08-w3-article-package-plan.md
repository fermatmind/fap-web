# W3 Article Package Plan

## Exact lane identity

- Lane/subscope: `W3 / W3-ARTICLES`
- Materialized V2 control state: `live_qa_pass`
- Lane-local gate manifest state: `dry_run_ready` (immutable pre-promotion prefix)
- Exact package SHA: `d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a`
- Exact cohort: 17 article identities
- Source repository/commit: `fermatmind/fap-api` / `924523c24bc5a0e999c8d4e29ffdb5b5f34ffc41`
- Trusted workflow: fap-api run `30797235410`, attempt `1`, successful `main` head `2948ddb1e5dd50d981a3a50e77366563d84edfaa`
- Promotion receipts registered in V2 master: 3 (`cms_draft_import_receipt` → `cms_publication_receipt` → `cms_live_qa_receipt`)

This scope recovered the exact immutable receipt bytes from the successful trusted workflow artifact and fixed deterministic materialization of the already-registered 17-record chain. It did not create or regenerate the package, rewrite payloads, mint a new SHA, dispatch a second publication, or touch W3 Career Guides. The local `packages/w3-articles/` folder remains a report handoff only.

## State

**W3_ARTICLES_LIVE_QA_PASS_DISCOVERABILITY_NOT_AUTHORIZED**. The trusted receipts prove exact draft readback, publication, and live QA for all 17 records. Current public readback also returns all 17 as public/published with a published revision. All 17 remain `is_indexable=false`, `sitemap_eligible=false`, and `llms_eligible=false`; this scope does not authorize or perform discoverability, Search Channel, deployment, database, secret, or permission changes.
