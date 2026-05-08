# Core Decision Domain Report and Freemium Ledger v1

Scope: PR-CDD-05. This artifact records report value and freemium readiness for the first three Core Decision Domains: `self_understanding`, `career_decision`, and `workstyle_decision`.

Execution mode: artifact / generated JSON / contract tests only. This ledger does not change checkout, payment, paywall UI, report access, entitlement, offer cards, PDF, history, SKU logic, or report entitlement behavior.

## Global Rules

- SKU exists is not `full_loop`.
- Offer card exists is not `full_loop`.
- `backend_ready` is not monetization-ready.
- Domain bundle remains blocked unless parity proof exists.
- Scale freemium status does not automatically create domain bundle readiness.
- Domain report value does not change report entitlement.
- Domain report value does not create new paid modules.

## Domain Ledger

### self_understanding

Report value:

- Strongest current source is MBTI.
- Big Five contributes partial trait/report value.
- Enneagram contributes partial or backend-ready motivation/report value.

Commercial status:

- domain freemium status: `partial`
- full-loop status: `partial`
- bundle candidate status: `blocked`

Required future proof:

- cross-scale report parity proof
- domain bundle entitlement policy
- report value copy approval

### career_decision

Report value:

- MBTI can support snapshot-based career direction only.
- RIASEC can support career interest direction.
- Big Five can support trait/workstyle explanation only.
- Career Graph is not a full commerce bundle by itself.

Commercial status:

- domain freemium status: `partial`
- full-loop status: `blocked`
- bundle candidate status: `blocked`

Blocked commerce claims:

- no full recommendation package claim
- no precise best-career package claim
- no success/placement guarantee claim

### workstyle_decision

Report value:

- Big Five and MBTI report surfaces can support workstyle explanation.
- Enneagram can support motivation/team-pattern explanation.
- No domain bundle policy exists yet.

Commercial status:

- domain freemium status: `partial`
- full-loop status: `blocked`
- bundle candidate status: `blocked`

Required future proof:

- workstyle report module policy
- domain bundle entitlement proof
- claim and evidence alignment

## Non-Goals

- No checkout changes.
- No payment changes.
- No paywall UI changes.
- No report access changes.
- No entitlement changes.
- No bundle runtime.
- No offer copy changes.
