# Big Five Release Freeze Rule

## 1. Background And Positioning

This document is the Big Five Web-side release and freeze rule. It connects the Big Five frontend contract gate, heavy canonical projection fixtures, and manual release checks to the API-side QA baseline.

This is not a Big Five content writing rule, not an MBTI release document, and not a scoring model document. The frontend consumes Big Five truth; it does not define scoring truth.

## 2. Scope

This rule applies to Web surfaces that consume Big Five report data:

- Big Five result shell
- result assembler
- secondary surfaces: history and compare
- PDF access surface
- canonical heavy projection fixtures
- frontend contract tests that protect readable/full report behavior

This rule does not govern Big Five scoring, backend report composition, editorial body copy, MBTI surfaces, or payment runtime logic.

## 3. P0 Automatic Blocking Items

P0 means stop-ship for frontend release. These checks must remain default CI blockers.

| P0 area | Test / gate | Why P0 | API truth relationship |
|---|---|---|---|
| Dedicated Big Five freeze gate | `.github/workflows/ci.yml` job `verify-big5-contract-freeze` | Gives Big Five a visible required-style web gate instead of relying only on all-contract sweep visibility. | Consumes fixtures derived from API canonical truth scenarios. |
| Report payload contract | `tests/contracts/big5.contract.test.ts` | Validates canonical 120Q, 90Q, and degraded report payloads against the Big Five schema and current readable/full semantics. | Maps to API canonical truth fixtures. |
| Result assembler contract | `tests/contracts/big5-result-assembler.contract.test.ts` | Protects 8-section shell planning, visible/locked split behavior, norms, quality, and form summary handling. | Consumes backend-produced projection shape; does not score. |
| Secondary surfaces contract | `tests/contracts/big5-secondary-surfaces.contract.test.tsx` | Protects history, compare, PDF access, no-offer/no-unlock, and degraded readable behavior. | Mirrors API history/report-access/PDF truth. |

The P0 job currently runs:

```bash
pnpm exec vitest run tests/contracts/big5.contract.test.ts tests/contracts/big5-result-assembler.contract.test.ts tests/contracts/big5-secondary-surfaces.contract.test.tsx
```

## 4. P1 Automatic Warning Items

P1 means release warning. These tests are valuable contract coverage, but they are secondary to the canonical freeze gate because they protect deeper presentation modules rather than the primary readable/report/access state.

| P1 area | Test | Reason |
|---|---|---|
| Norms explanation surface | `tests/contracts/big5-norms-comparison.contract.test.ts` | Protects norms comparison rendering density and copy structure. |
| Facet detail surface | `tests/contracts/big5-facet-details.contract.test.ts` | Protects facet table/deep detail presentation and 30-facet consumption behavior. |
| Action plan surface | `tests/contracts/big5-action-plan.contract.test.ts` | Protects action-plan section rendering and summary consumption. |

These tests can be included in broader contract sweeps and release evidence runs. They should be promoted to P0 if a future release makes one of these surfaces a primary entry blocker.

## 5. P2 Manual Review Items

P2 means manual release review. These checks do not define scoring truth and do not replace P0 tests.

- Open a production-like Big Five result page and confirm the result is readable/full.
- Confirm PDF download is available from the result page.
- Confirm `/history/big5` has no unlock card for current Big Five history rows.
- Confirm compare opens from latest two history rows and uses full-readable access copy.
- Review one 120Q representative sample.
- Review one 90Q representative sample.
- Review one degraded sample and confirm it remains readable without preview/locked semantics.
- Confirm all 8 frontend result sections are present: summary, dimensions overview, why-this-profile, facet details, core portrait, norms comparison, action plan, methodology/access.

## 6. Heavy Canonical Fixtures

| Fixture | Scenario | Coverage | API truth counterpart |
|---|---|---|---|
| `tests/fixtures/big5/report_canonical_120_readable.projection.json` | 120Q readable/full report | 8-section frontend consumption, 30 facets, trait vector, norms, quality, comparative, PDF/access-ready payload | `backend/tests/Fixtures/big5/canonical_120_readable.truth.json` |
| `tests/fixtures/big5/report_canonical_90_readable.projection.json` | 90Q readable/full report | same frontend semantics as 120Q while preserving 90Q form metadata | `backend/tests/Fixtures/big5/canonical_90_readable.truth.json` |
| `tests/fixtures/big5/report_canonical_degraded.projection.json` | degraded quality readable/full report | degraded quality and validity flags without no-offer/no-PDF regression | `backend/tests/Fixtures/big5/canonical_degraded.truth.json` |

These frontend fixtures are consumption fixtures. They are not scoring fixtures. If their scoring values change, the API canonical truth must explain why first.

## 7. Release Freeze Checklist

Before a Big Five release freeze, record the outcome of each item:

- [ ] `verify-big5-contract-freeze` passes.
- [ ] `big5.contract.test.ts` passes against all three canonical heavy fixtures.
- [ ] `big5-result-assembler.contract.test.ts` passes and keeps 8-section readable planning.
- [ ] `big5-secondary-surfaces.contract.test.tsx` passes and keeps history/compare/PDF access readable.
- [ ] Result page manually shows no locked sections for canonical readable state.
- [ ] Result page manually shows no offer/CTA for canonical readable state.
- [ ] PDF download is available from a representative result.
- [ ] History page shows no unlock card for representative Big Five rows.
- [ ] 120Q and 90Q representative samples both show current form labels and full-readable behavior.
- [ ] Degraded sample shows degraded quality while remaining readable/full.

## 8. API / Web Alignment

The Web release rule depends on the API QA baseline:

- API owns scoring truth, norms/validity truth, canonical truth fixtures, report-access, history, and PDF contracts.
- Web owns consumption, assembler, shell, history/compare UI contracts, and release surface checks.
- Web must not define a second scoring truth.
- Web canonical fixtures must stay mapped to API canonical truth scenarios: 120 readable, 90 readable, degraded readable.

API baseline: `../fap-api/docs/verify/big5-qa-baseline.md`.

## 9. Non-Goals

- Do not change Big Five runtime behavior.
- Do not change Big Five scoring.
- Do not change Big Five editorial/body content.
- Do not change MBTI.
- Do not create a second verify system.
