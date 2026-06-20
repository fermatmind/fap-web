# Operator Source Availability Policy

Operator source handling must distinguish temporary access problems from trust failures. A live source fetch is not always required for downstream re-audit, but source traceability is always required.

## Source Status Classes

- `transient_source_timeout`: A credible source endpoint timed out or returned a temporary network/server error during an otherwise scoped rerun.
- `cache_available`: The batch has local PASS evidence and synthesis artifacts with source references, captured facts, and stable traceability from a prior successful gate.
- `cache_missing`: Required local evidence, synthesis, source references, or gate reports are missing.
- `source_removed`: A previously captured source no longer resolves, returns permanent missing status, or no longer exposes the captured fact.
- `source_changed`: A source still resolves but the captured fact, boundary, or source identity materially changed.
- `source_required_for_evidence`: The current phase is evidence collection, evidence repair, trust audit, or any action that creates or changes source-backed evidence.
- `source_not_required_for_asset_reaudit_if_evidence_pass`: The current phase only re-audits synthesis or reader-facing assets against already PASS evidence and synthesis.

## Cache-Only Re-Audit

Asset and synthesis gates may run in offline/cache-only mode when all of these are true:

1. Evidence gate already PASSed for the same batch and artifact SHA.
2. Synthesis input already exists and has source traceability back to PASS evidence.
3. Local source references are present and parseable.
4. The rerun does not create or modify evidence.
5. The rerun does not depend on newly discovered facts.

Cache-only mode must fail when:

- local evidence files are missing
- local source references are missing
- evidence row hashes or source handles no longer match the PASS gate
- the gate needs to validate a new captured fact
- the reported source status is `source_removed` or `source_changed`

## Operator Decisions

- `transient_source_timeout` + `cache_available` + asset/synthesis re-audit: continue cache-only and record `source_not_required_for_asset_reaudit_if_evidence_pass`.
- `transient_source_timeout` + `cache_missing`: stop as `source_availability_issue`.
- `source_required_for_evidence` with any live source failure: stop as `source_availability_issue` unless a scoped evidence repair can use another valid source under the block source rules.
- `source_removed` or `source_changed`: stop as `source_availability_issue`; do not silently rely on stale cached evidence.
- login, paywall, CAPTCHA, or private credential requirement: hard stop and ask for human direction.

This policy does not loosen evidence trust. It only prevents a transient source outage from blocking reader asset re-audit when PASS evidence is already locally available and traceable.
