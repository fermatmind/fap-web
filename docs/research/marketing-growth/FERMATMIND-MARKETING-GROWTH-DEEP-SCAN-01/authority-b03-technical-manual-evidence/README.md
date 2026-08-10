# B03 technical-manual evidence inventory

Status: `B03_TECHNICAL_EVIDENCE_PARTIALLY_BLOCKED`

Captured on 2026-08-10 against:

- fap-web `5b4d5bb050497ec04652989e0d500b71870de34b`
- fap-api `4ad35bd2b15448569a3bafc6bd27f6ad115dc014`
- FermatMind public APIs and method pages observed on 2026-08-10

## Decision

The six-assessment inventory is complete as an evidence map, but it does not close the technical-manual evidence gap. Enneagram and RIASEC expose substantive public technical notes. MBTI, Big Five, IQ/Raven and EQ do not expose a supported technical-note API at capture time. Across the six assessments, public FermatMind-specific sample, reliability, validity and named-reviewer evidence is incomplete or absent. Those fields remain `UNKNOWN`.

This inventory may support only the narrow claims listed in `technical_manual_inventory.json` and `technical_manual_inventory.csv`. Theory or third-party instrument research is context only. It does not validate FermatMind item banks, scoring, norms, forms, translations or reports.

## Files

- `technical_manual_inventory.json`: authoritative six-record evidence inventory with field-level status and claim boundaries.
- `technical_manual_inventory.csv`: review-friendly flat projection; one row per assessment.
- `source_manifest.json`: SHA-bound repository and public-source traceability.
- `validation_report.json`: machine-validation results for structure, scope, claim boundaries and `UNKNOWN` preservation.

## Status semantics

- `VERIFIED`: directly observed in the SHA-bound repository state or the captured public source.
- `INFERRED`: a bounded conclusion derived from verified facts; never a psychometric claim.
- `UNKNOWN`: the required evidence was not found in the reviewed public/repository sources.

`VERIFIED` describes the cited fact only. A verified implementation, route, item count or scoring rule is not evidence of reliability, validity, representativeness, norm quality, official-instrument equivalence or outcome prediction.

## Authority and privacy boundary

The backend registry, content packs and public APIs own assessment identity and runtime contracts. fap-web is a consumer. This read-only package does not publish content, change CMS state, expose item text or answer keys, or authorize schema, sitemap, llms or indexability changes.

## Blocking evidence needed for full completion

For each assessment, a future evidence closure requires a public, version-bound technical manual or equivalent reviewed record that identifies the exact FermatMind form and item-bank version, sample and recruitment, norm construction where applicable, reliability and validity methods/results, limitations, named reviewer and review date, and a public changelog. IQ additionally requires explicit proof of any claimed Raven relationship; EQ requires explicit proof of any claimed relationship to a named external instrument. Until then, the corresponding fields and claims remain `UNKNOWN` or forbidden.
