# MBTI-CROSS-APPROVAL-48 rollback/readback contract

- Status: operator editorial approval recorded in a separate immutable authorization envelope
- Approved repaired package SHA-256: `f5a0d286168e0d6b14e376c7230915eb97e2506214a78b50190184764d6ba59f`
- Operator authorization SHA-256: `9856cd386fcd22391f216f8f77a08ff4f8ccc25c164938928b72ec6c43ea891b`
- Operator approval statement SHA-256: `d5a4bab4141839a5d617c91c162ff03782667bbabf985ce0b5c07e190013bfca`
- Authorization asset: `docs/seo/personality/mbti-cross-approval-48-operator-authorization-2026-07-23.json`
- Previously approved pending package SHA-256: `1c7e94b856725ee4aa4f5e50a07faf5fbba482099e52d6fb09dd5a1401866fb6`
- Previous approval statement SHA-256: `dce287b36b20b78a49dee9a257fb4616d3a118acf9db7e504b175162410198ae`
- Exact records: enfp-vs-entp, estj-vs-entj, isfp-vs-infp
- Record count: 3
- Content-release candidate SHA-256: `509dbf09cfdd22373e53b20285a77864bfefebce54579dbda25813e7fcc40ea1`
- Indexability template SHA-256: `3f3aaf4da6ff6ad4c41ba705ffecc4b8c1ff060d5f76c70142fe4ce575314dfb`
- Immutable-package rule: the approved package bytes and package SHA remain unchanged; the package's historical pending state is superseded only by the separate authorization envelope bound to that exact SHA.
- Runtime-shape repair: candidate payloads use the exact public projection keys required by the frontend adapter, including comparison_slug, public_route_type, type identity, and canonical_url; every section has a non-empty body array; internal links use label/href/reason; four-letter profile hrefs normalize to explicit canonical A-variant targets.
- Source hash drift: all three current committed snapshots differ from the stale source-manifest declarations; the exact snapshot hashes remain the provenance inputs, while the candidate payload is a deterministic runtime-compatible projection.

## Content revision phase

Editorial approval permits PR 48 finalization and PR 49 implementation only. It does not authorize a production write. A future executor must also require a separate exact production package/authorization hash, capture each pre-write revision and payload hash, write only the exact three records atomically, keep all three noindex and outside sitemap/llms, and roll back all three on any write or readback failure.

## Readback

Readback must prove DB/CMS authority, exact content/section/FAQ/internal-link hashes, canonical parity, HTTP 200 API/page responses, visible complete body, robots `noindex,follow`, and no sitemap/llms eligibility. A local approval asset or frontend fallback cannot satisfy readback.

## Indexability phase

Indexability is a separate future authorization after successful content promotion/readback. It may change only robots/indexability/sitemap/llms eligibility for the exact three records and must not modify content or request search indexing.
