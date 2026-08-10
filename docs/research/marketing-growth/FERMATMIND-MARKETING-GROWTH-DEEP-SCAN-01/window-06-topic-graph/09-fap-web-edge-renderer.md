# fap-web edge renderer design

Status: `IMPLEMENTED_RUNTIME_CALLSITES_NOT_DEPLOYMENT_PROVEN`. Exact machine contract: `topic_graph_frontend_contract.json`.

The renderer consumes only `GET /api/v0.5/public-topic-edges?source_type={type}&source_id={id}&locale={locale}`, emits SSR-visible deterministic links from the exact backend canonical, and validates the merged G03 authority version. It rejects invalid source canonical readback, private/unqualified targets and locale mismatch unless `cross_locale_approved=true`; it adds no local mapping or editorial fallback and leaves metadata/canonical/hreflang unchanged. Empty or `503 AUTHORITY_UNAVAILABLE` payloads render no module. Career edges remain absent until current C06 PASS.

Runtime callsites are limited to Article, Topic and MBTI personality detail projections that expose a positive backend numeric source id. Content pages and Big Five/Enneagram public assets remain fail closed because their current frontend adapters do not expose the matching backend authority id; no slug-to-id map or fallback was introduced. This implementation record does not prove production deployment or the existence of imported edge rows.
