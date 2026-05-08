# Evidence Container Runtime Baseline

Scope: PR-PRA1B-05, Public Runtime Authority Phase 1B.

Runtime behavior changed: yes, limited to visible `data-evidence-*` markers on
existing public runtime surfaces. This PR does not generate new content, add
hidden schema, change sitemap URLs, widen llms exposure, or claim that every
page is GEO-ready.

## Runtime Baseline

The runtime baseline defines a visible marker contract:

- `data-evidence-container`
- `data-evidence-page-family`
- `data-evidence-source-type`
- `data-evidence-readiness`
- `data-evidence-block`

`AnswerSurfaceSection` is the shared visible marker for `answer_surface_v1`
blocks. Career v1 evidence drawers and career display sections are marked as
visible career backend bundle evidence.

## Initial Page Families

- `test_detail`: partial
- `topic_detail`: partial
- `article_detail`: partial
- `personality_detail`: partial
- `career_job_detail`: partial
- `career_recommendation_detail`: partial
- `career_guide`: partial

Partial means the page family has visible runtime evidence structure, but it is
not declared complete GEO readiness. FAQ-only pages are not Evidence-ready.

## Hard Rules

- Hidden schema is not evidence.
- FAQPage must match visible FAQ.
- Evidence must be visible in HTML.
- Private flows are not public Evidence targets.
- No generated content is added by this baseline.
- No `llms-full` exposure is expanded by this baseline.

## Evidence

- `components/content/AnswerSurfaceSection.tsx`
- `components/career/v1/EvidenceDrawer.tsx`
- `components/career/display/EvidenceContainer.tsx`
- `lib/geo/evidenceContainer.ts`
- `docs/geo/generated/evidence-container-runtime-baseline.v1.json`
- `tests/contracts/evidence-container-runtime-baseline.contract.test.ts`
