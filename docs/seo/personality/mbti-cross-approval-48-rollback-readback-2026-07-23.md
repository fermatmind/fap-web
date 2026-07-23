# MBTI-CROSS-APPROVAL-48 rollback/readback contract

- Status: pending operator editorial reapproval after runtime-shape repair
- Previously approved pending package SHA-256: `1c7e94b856725ee4aa4f5e50a07faf5fbba482099e52d6fb09dd5a1401866fb6`
- Previous approval statement SHA-256: `dce287b36b20b78a49dee9a257fb4616d3a118acf9db7e504b175162410198ae`
- Repaired package SHA-256: `ac0c036f82d19aadd38cf1673338a2e40f7ca25eb1883959cabaa0acd935043c`
- Exact records: enfp-vs-entp, estj-vs-entj, isfp-vs-infp
- Record count: 3
- Content-release candidate SHA-256: `a209644d1d5c00541e1b062cd5207a30e3a46d255097f9d3afd3ee089a43fe4d`
- Indexability template SHA-256: `3f3aaf4da6ff6ad4c41ba705ffecc4b8c1ff060d5f76c70142fe4ce575314dfb`
- Runtime-shape repair: every section now has a non-empty body array; internal links use label/href/reason; four-letter profile hrefs are normalized to explicit canonical A-variant targets.
- Source hash drift: all three current committed snapshots differ from the stale source-manifest declarations; the exact snapshot hashes remain the provenance inputs, while the candidate payload is a deterministic runtime-compatible projection.

## Content revision phase

The repaired package requires a new exact editorial approval, which still does not authorize a production write. A future executor must also require a separate exact production package/authorization hash, capture each pre-write revision and payload hash, write only the exact three records atomically, keep all three noindex and outside sitemap/llms, and roll back all three on any write or readback failure.

## Readback

Readback must prove DB/CMS authority, exact content/section/FAQ/internal-link hashes, canonical parity, HTTP 200 API/page responses, visible complete body, robots `noindex,follow`, and no sitemap/llms eligibility. A local approval asset or frontend fallback cannot satisfy readback.

## Indexability phase

Indexability is a separate future authorization after successful content promotion/readback. It may change only robots/indexability/sitemap/llms eligibility for the exact three records and must not modify content or request search indexing.
