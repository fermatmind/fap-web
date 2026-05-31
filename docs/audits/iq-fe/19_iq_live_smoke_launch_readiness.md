# IQ Live Smoke Launch Readiness

Scope: IQ-LIVE-SMOKE-01.

## Smoke coverage

The smoke plan is defined in `scripts/iq/iq-launch-readiness-smoke.mjs` and covers:

- lookup
- questions
- take page
- submit
- result
- report
- canonical landing page
- private noindex behavior
- answer-key leakage
- commerce leakage

## Execution model

Default CI usage is plan-only and contract-verified. Live read-only execution is available with:

```bash
IQ_LIVE_BASE_URL=https://fermatmind.com node scripts/iq/iq-launch-readiness-smoke.mjs
```

The live mode only performs unauthenticated GET checks. Submit/result/report authenticated flows remain represented in the smoke plan and require an operator-provided attempt fixture before live execution.

## Launch boundaries

- No answer key, correct answer, solution rule, asset hash, or generator metadata may appear in public payloads.
- No checkout, Stripe, price, payment intent, purchase-required, or unlock SKU terms may appear in IQ public smoke payloads.
- Take/private routes must remain noindex.
- Canonical landing must remain `/en/tests/iq-test-intelligence-quotient-assessment` and equivalent localized route handling.
- Formal IQ estimate and percentile claims remain blocked until backend norm authority exists.
