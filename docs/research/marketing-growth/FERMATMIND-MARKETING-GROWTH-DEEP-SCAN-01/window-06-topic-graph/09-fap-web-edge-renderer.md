# fap-web edge renderer design

Status: `PUBLIC_TOPIC_GRAPH_IMPLEMENTATION_READY_NOT_STARTED`. Exact machine proposal: `topic_graph_frontend_contract.json`.

The renderer consumes only the fap-api public projection, emits SSR-visible deterministic links in backend order, rejects private/locale-mismatch/unqualified targets, adds no local mapping or editorial fallback, and leaves metadata/canonical/hreflang unchanged. Empty payload renders no module/minimal shell; API failure is not disguised as success. Career edges remain absent until C06.
