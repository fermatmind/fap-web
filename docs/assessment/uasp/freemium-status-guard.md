# UASP Freemium Status Guard v1

Scope: PR-UASP2B-04

Train: uasp-runtime-metadata-integration-train

Runtime behavior changed: no

## Purpose

This guard makes `freemium_status` enforceable as a contract. It prevents future scales, Big Five, RIASEC, or backend-ready scales from being treated as full-loop commerce-ready without freemium parity proof.

This PR is contract-only. It does not change checkout, payment, SKU resolution, entitlement, report access, offer cards, paywall UI, commerce runtime, or report unlock behavior.

## Guard Rules

- `full_loop` requires freemium parity proof.
- `blocked` remains the default for future scales.
- `backend_ready` is not monetization-ready.
- `frontend_partial` is not full-loop parity.
- SKU existence is not full-loop proof.
- Offer card existence is not full-loop proof.
- Entitlement existence is not full public conversion-loop proof.
- Report access existence is not checkout parity proof.

## First Batch Status

| Scale | UASP `freemium_status` | Parity ledger status | Guard status |
|---|---|---|---|
| `MBTI` | `full_loop` | `full_loop` | `reference_full_loop` |
| `BIG5_OCEAN` | `frontend_partial` | `cross_scale_partial` | `not_full_loop` |
| `RIASEC` | `frontend_partial` | `frontend_partial` | `not_full_loop` |
| `ENNEAGRAM` | `backend_ready` | `not_in_parity_ledger` | `backend_ready_not_full_loop` |
| `FUTURE_SCALE_PLACEHOLDER` | `blocked` | `blocked` | `blocked_until_parity_proof` |

## Full-loop Proof Requirements

A scale cannot be marked `full_loop` unless every required capability is proven:

- free result
- locked report
- offer card
- SKU
- checkout
- order wait
- entitlement unlock
- PDF/report access
- history
- attribution

## Evidence

- UASP registry: `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json`
- Freemium parity ledger: `docs/freemium/generated/freemium-cross-scale-parity-ledger.v1.json`
- UASP eligibility guards: `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json`

## No Runtime Change Statement

This PR adds freemium guard artifacts and tests only. It does not change checkout, payment, SKU logic, entitlement, report access, offer cards, paywall UI, commerce runtime, report unlock behavior, or product catalog behavior.
