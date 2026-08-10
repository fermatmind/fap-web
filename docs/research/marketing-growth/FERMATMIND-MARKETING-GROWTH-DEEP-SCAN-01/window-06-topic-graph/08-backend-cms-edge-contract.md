# Backend/CMS edge contract

Status: `BACKEND_G03_ALIGNMENT_MERGED_NO_PRODUCTION_IMPORT`. Exact machine contract: `topic_graph_backend_contract.json`.

Backend/CMS is the only authority. Initial authority PR #3594 and G03 alignment PR #3605 are merged; the public query is `source_type + source_id + locale`, the exact relation allowlist is `breadcrumb / learn_more / take_assessment`, source and target canonical truth are read back, cross-locale projection requires an explicit backend approval, storage failure returns a fail-closed `503 AUTHORITY_UNAVAILABLE`, and Career stays closed. G03 supplies 3,268 approved non-Career modeling candidates and explicit HOLD/BLOCKED rows as a test/governance fixture; it does not import or activate them. Crawler/sitemap/llms/schema observations remain non-authoritative.

Career source or target edges must be omitted until a current C06 gate passes.
