# MBTI-CROSS-APPROVAL-48 rollback/readback contract

- Status: operator editorial approval recorded
- Approved pending package SHA-256: `1c7e94b856725ee4aa4f5e50a07faf5fbba482099e52d6fb09dd5a1401866fb6`
- Approval statement SHA-256: `dce287b36b20b78a49dee9a257fb4616d3a118acf9db7e504b175162410198ae`
- Exact records: enfp-vs-entp, estj-vs-entj, isfp-vs-infp
- Record count: 3
- Final approved package SHA-256: `3a86b9e73817635def8a2a2030f5cfe6102d80a64cca0703c4fc373e7aa73582`
- Content-release candidate SHA-256: `adc7c06069efc38c9898a993ccfcbec38f29859d3a56b7400fc2bce0026d2886`
- Indexability template SHA-256: `3f3aaf4da6ff6ad4c41ba705ffecc4b8c1ff060d5f76c70142fe4ce575314dfb`
- Source hash drift: all three current committed snapshots differ from the stale source-manifest declarations; the exact snapshot hashes are authoritative for this approval artifact.

## Content revision phase

Editorial approval does not authorize a production write. A future executor must require a separate exact package/authorization hash, capture each pre-write revision and payload hash, write only the exact three records atomically, keep all three noindex and outside sitemap/llms, and roll back all three on any write or readback failure.

## Readback

Readback must prove DB/CMS authority, exact content/section/FAQ hashes, canonical parity, HTTP 200 API/page responses, visible complete body, robots `noindex,follow`, and no sitemap/llms eligibility. A local approval asset or frontend fallback cannot satisfy readback.

## Indexability phase

Indexability is a separate future authorization after successful content promotion/readback. It may change only robots/indexability/sitemap/llms eligibility for the exact three records and must not modify content or request search indexing.
