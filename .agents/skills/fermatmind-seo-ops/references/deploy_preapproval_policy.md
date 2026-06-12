# Deploy Preapproval Policy

Deploy from an SEO release goal only when all conditions are true:

- deployment was created by the current goal.
- PR merged.
- checks green.
- deploy readiness passed.
- target SHA resolved.
- no migration change.
- no env or secret change.
- no destructive DB change.
- no payment/auth/security-risk file change.
- Authorization Profile explicitly allows scoped backend or frontend deploy.

## Stop Conditions

Stop on:

- migration present.
- env/secret required.
- destructive DB change.
- auth/payment/security files changed.
- deploy checks failed.
- target SHA ambiguous.
- production dirty or divergent.

## Exact Approval

If exact approval is required, include:

- repo.
- SHA.
- release name.
- target environment.
- deploy type.
- explicit statement that no migration/env/secret/auth/payment/security-risk change is included.
