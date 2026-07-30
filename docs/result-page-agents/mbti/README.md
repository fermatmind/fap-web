# MBTI Result Content Agent Gate

Status: read-only producer gate for `EN-PARITY-W1-MBTI-RESULT-AGENT-01`.

This directory defines the contract that a later backend producer must satisfy before it can create an English MBTI result/report content package. It does not contain final English content and does not grant CMS, import, publish, activation, SEO runtime, sitemap, llms, indexability, search-submission, database, or deployment authority.

Backend `fap-api` remains the content authority. The four accepted `fap-web` renderer-label rows are existing product-code controls, not editorial authority or producer targets.

The accepted input is the frozen W1 inventory package:

- package: `generated/en-content-parity/W1-mbti/`
- package SHA-256: `8079465c6ec26820c99ca2be3f08346674e90509dee6d84fd610d5c6bbac2b85`
- result inventory: exactly 46 rows
- accepted controls: 24 `complete_control` rows
- producer targets: 20 `structurally_incomplete`, 1 `missing`, and 1 `unable_to_confirm` row

Files:

- `mbti-result-content-agent.runbook.md`: producer and reviewer operating contract.
- `mbti-result-content-inventory.schema.json`: accepted inventory envelope and row schema.
- `mbti-result-content-gates.v1.json`: exact package, count, privacy, claim, and authority gates.
- `scripts/result-page-agents/validate-mbti-result-content.mjs`: read-only validator.

Run:

```bash
node scripts/result-page-agents/validate-mbti-result-content.mjs \
  --inventory generated/en-content-parity/W1-mbti
```

An `ok: true` result means only that the frozen inventory is a valid input for later package production. It is not W9 QA, import approval, publication approval, activation approval, or evidence of live delivery.
