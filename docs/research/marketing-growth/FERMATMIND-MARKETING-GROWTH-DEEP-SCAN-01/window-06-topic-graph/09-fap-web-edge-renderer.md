# fap-web edge renderer design

Status: `BACKEND_G03_ALIGNED_IMPLEMENTATION_READY_NOT_STARTED`. Exact machine contract: `topic_graph_frontend_contract.json`.

The renderer consumes only `GET /api/v0.5/public-topic-edges?source_type={type}&source_id={id}&locale={locale}`, emits SSR-visible deterministic links from the exact backend canonical, and validates the merged G03 authority version. It rejects invalid source canonical readback, private/unqualified targets and locale mismatch unless `cross_locale_approved=true`; it adds no local mapping or editorial fallback and leaves metadata/canonical/hreflang unchanged. Empty or `503 AUTHORITY_UNAVAILABLE` payloads render no module. Career edges remain absent until current C06 PASS.
