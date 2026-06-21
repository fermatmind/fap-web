# Enneagram Phase8C A9FD Rendered QA Evidence

## Summary

- Scope: evidence-only Web Phase8C rendered QA against the approved Enneagram `a9fd` candidate package.
- Candidate directory used locally: `/private/tmp/fm_enneagram_a9fd_renderable_20260619`
- Candidate manifest SHA expected: `a9fd3eb474ea2ca0130d06ad2b1640305d9160ee1a74e559ad4f60bfc4db56c0`
- Candidate manifest SHA actual: `a9fd3eb474ea2ca0130d06ad2b1640305d9160ee1a74e559ad4f60bfc4db56c0`
- Runtime registry manifest SHA expected: `ac5bdaab3c761b0d01a56f92679aa58341110d64de0f47a1fa0062b64f76f97f`
- Runtime registry manifest SHA recorded: `ac5bdaab3c761b0d01a56f92679aa58341110d64de0f47a1fa0062b64f76f97f`
- Verdict: `PASS_FOR_PHASE_8D_IMPORT_PR_PLANNING`

This PR records the rendered QA evidence only. It does not commit generated candidate payload artifacts, does not import content, does not activate runtime, does not switch runtime, does not write production, and does not change frontend behavior.

## Validation Command

The passing run used same-origin API proxy mode so Playwright route mocks could intercept the result/report endpoints under the app CSP:

```bash
NEXT_PUBLIC_USE_SAME_ORIGIN_API_PROXY=true \
PHASE8B_CANDIDATE_DIR=/private/tmp/fm_enneagram_a9fd_renderable_20260619 \
PHASE8C_OUTPUT_DIR=/private/tmp/fm_enneagram_phase8c_a9fd_rendered_qa_20260621 \
pnpm exec playwright test tests/e2e/enneagram-phase8c-production-equivalent-candidate-e2e.spec.ts
```

Result:

```text
15 passed (13.9m)
```

An earlier local attempt without `NEXT_PUBLIC_USE_SAME_ORIGIN_API_PROXY=true` was blocked before route mocks could answer because the default Playwright API URL points to `http://127.0.0.1:8000`, while the app CSP only allows `self` and `https:` for `connect-src`. That was a test-environment setup issue, not a candidate-content failure.

## Coverage

| Payload group | Desktop | Mobile |
| --- | ---: | ---: |
| baseline | 36/36 | 36/36 |
| low_resonance | 108/108 | 108/108 |
| partial_resonance | 90/90 | 90/90 |
| diffuse_convergence | 108/108 | 108/108 |
| close_call_pair | 36/36 | 36/36 |
| scene_localization | 162/162 | 162/162 |
| fc144_recommendation | 90/90 | 90/90 |

## Gate Results

- Candidate payload count: `630`
- Desktop rendered count: `630`
- Mobile rendered count: `630`
- Metadata leak visible count: `0`
- Copy pollution hit count: `0`
- Joining error hit count: `0`
- Fallback hit count: `0`
- FC144 boundary violation count: `0`
- Layout issue count: `0`
- Duplicate low resonance visible count: `0`
- Duplicate partial resonance visible count: `0`
- Duplicate diffuse convergence visible count: `0`
- Duplicate close call pair visible count: `0`
- Duplicate scene localization visible count: `0`
- Duplicate FC144 recommendation visible count: `0`
- Missing pair fallback visible count: `0`
- Production import happened: `false`
- Full replacement happened: `false`

## Deferred

- No backend inactive import.
- No production activation.
- No runtime switch.
- No production writes.
- No generated candidate payload artifacts committed.
