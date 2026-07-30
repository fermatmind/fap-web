# MBTI English Result Content Agent Runbook

## Purpose

This runbook gates the future production of the W1 English MBTI result/report content package. The gate verifies a frozen, sanitized inventory before any producer work begins. Backend `fap-api` remains the content authority; `fap-web` owns only this governance contract and validator.

Passing this gate does not authorize content import or any live action.

## Exact Input

The only accepted inventory is:

- lane: `W1`
- asset: `ENPARITY-W1-MBTI-RESULT-CONTENT`
- package: `EN-PARITY-W1-MBTI-INVENTORY-2026-07-30`
- package SHA-256: `8079465c6ec26820c99ca2be3f08346674e90509dee6d84fd610d5c6bbac2b85`
- source ledger SHA-256: the `source_ledger.json` digest registered in the frozen `sha256_manifest.json`
- result rows: 46
- reconciliation: `46 = 24 + 22`

The validator accepts either the package directory or its `source_ledger.json`. When a ledger file is supplied, its sibling `sha256_manifest.json` is still mandatory.

## Read-only Inputs

Allowed:

- the frozen W1 `source_ledger.json`
- the frozen W1 `sha256_manifest.json`
- public repository source and contract paths named by inventory evidence
- sanitized, synthetic fixtures created by focused tests

Forbidden:

- raw attempt or report payloads
- attempt IDs, report tokens, share tokens, account identifiers, user scores, answer keys, or internal generation rules
- order, payment, entitlement-owner, recovery, or authentication records
- `.env`, cookies, credentials, secrets, production database queries, or private CMS records
- live private PDF/report URLs

The validator never makes network calls and never reads application runtime payloads.

## Producer Contract

A later `fap-api` producer may use the 22 non-control inventory rows as production targets. It must preserve all 24 `complete_control` rows and must not regenerate the existing public 32 A/T personality profiles.

All 22 producer targets remain `fap-api`-owned. Four `complete_control` rows cover fixed frontend history/result/lifecycle/share renderer labels and remain `fap-web` product-code controls; they are not backend content-production targets.

For every target row, the producer must preserve:

- `row_id`
- `stable_asset_identity`
- `surface`
- `entitlement_level`
- backend and API field alignment
- frontend consumer alignment
- mobile/desktop consumption contract
- the declared private-field exclusions

Content must remain within MBTI preference language:

- describe preferences, expression patterns, communication tendencies, possible strengths, friction points, and reflection prompts
- use probabilistic, non-deterministic language
- make room for context, development, and individual variation
- treat results as structured reference and working hypotheses

Content must not:

- diagnose health, mental health, personality disorders, or clinical conditions
- define a fixed identity, destiny, ability, or future
- make hiring, admission, promotion, salary, relationship-success, or career-outcome guarantees
- claim official certification, clinical validation, “most accurate” status, or unsupported reliability/validity/norm/percentile figures
- expose locked/full content through preview or free entitlement fields
- mix public personality-profile content with private result/report content

## Machine Gates

The validator must fail closed if any of the following occurs:

1. The package or source-ledger SHA differs from the frozen manifest.
2. Lane, package, asset, locale, or authority ownership differs.
3. The inventory is not exactly 46 unique result rows.
4. The verdict distribution is not exactly 24/20/1/1.
5. Reconciliation is not `46 = 24 + 22`.
6. A required row field or required private-field exclusion is missing.
7. A row contains a forbidden private, SEO, publication, internal-rule, or secret-bearing property.
8. A row loses the MBTI preference claim boundary, except that the single frozen private PDF row must retain its explicit `UNKNOWN_requires_independent_private-safe_QA` hold.
9. A row claims reader-visible Chinese leakage, except that the same PDF row must retain `unknown_without_lawful_private_fixture` until independent lawful-fixture QA.
10. A row moves authority into `fap-web`, a fixture, a mock, or frontend fallback copy.

## Output Meaning

Validator success means:

- the accepted frozen inventory is intact
- the future producer has a complete 46-row contract
- private and claim boundaries are explicitly present

Validator success does not mean:

- final English assets exist
- the package is frozen
- W9 independent QA passed
- CMS draft import is approved or complete
- editorial approval, publication, activation, live QA, or indexability is approved

## Default-denied Actions

This gate never performs or authorizes:

- CMS or database writes
- baseline import, draft import, production import, publish, or activation
- public API/runtime behavior changes
- renderer or report-access changes
- canonical, metadata, JSON-LD, noindex, sitemap, hreflang, llms, or indexability changes
- search submission or provider calls
- staging or production deployment

Any future exact-package transition must retain the exact package SHA and append the separately controlled approval lineage required by the parity master.

## Validation and Failure Handoff

Run:

```bash
node scripts/result-page-agents/validate-mbti-result-content.mjs \
  --inventory generated/en-content-parity/W1-mbti
```

On failure:

1. Stop the result asset producer.
2. Record the exact failing gate and evidence.
3. Do not repair the frozen inventory in the result-agent PR.
4. Return inventory inconsistencies to the CONTROL/inventory owner.
5. Return content or authority inconsistencies to the future `fap-api` producer scope.

## Repository Rule Impact

This is a docs/contracts governance addition. It documents existing backend authority, privacy, and claim rules. It does not change runtime ownership, content ownership, public exposure, or deployment behavior.
