# Big Five Career Bridge Authority

Use this contract whenever a Career asset, page assembly, CTA, graph candidate,
or recommendation-adjacent surface proposes to consume Big Five content.

## Purpose

Big Five is a continuous trait framework. In Career content it may provide
supplementary work-style reflection, but it is not occupational proof, a
deterministic matcher, or a hiring/placement system.

The backend owns both publication state and public content projection. The
Career factory owns candidate assets only; it must not infer publication or
select editorial working state.

## Authority Separation

Keep these inputs distinct:

| Input | Authority | Career bridge rule |
| --- | --- | --- |
| O*NET interests/work styles/work values | Occupational evidence | Primary evidence for interest/work-context fit |
| Career runtime publish projection | fap-api Career authority | Required before naming a public canonical occupation |
| Big Five public content projection | fap-api personality/CMS authority | Supplementary explanation only; must be published and public-safe |
| Big Five result/report payload | Private assessment runtime | Not a public Career content input |
| Big Five working/draft revision | CMS editorial workspace | Not public; blocked from Career reader assets |
| Generated package/baseline | Build/import evidence | Candidate or recovery artifact only; never runtime authority |

## Publication Readiness

Do not infer readiness from any one of these:

- primary record exists;
- package QA passed;
- production import completed;
- `working_revision_id` is populated;
- route returns HTTP 200;
- page is noindex;
- a URL appears in a local manifest.

A public bridge requires evidence that the backend public API selected the
published projection for the same authority identity and locale. When a
published revision identifier or projection version is available, record it in
the bridge evidence ledger.

Required bridge evidence:

- `framework=big_five`;
- backend public projection authority handle;
- authority asset identity and locale;
- published/public status evidence;
- published revision or projection version when available;
- source/claim permission boundary;
- Career runtime publish eligibility for the occupation;
- `working_or_draft_selected=false`;
- `private_assessment_data_present=false`.

## Allowed Interpretation

- work environment questions to test;
- feedback, structure, pace, autonomy, collaboration, or stress-context signals;
- possible friction and counterexamples;
- prompts to compare interests, values, skills, experience, and constraints;
- `examples_to_explore` and `starting_point_not_decision` language.

## Forbidden Interpretation

- best career prediction;
- objective occupation ranking or job-fit score;
- trait-to-career or trait-to-problem pSEO grid;
- hiring, promotion, admission, salary, placement, performance, health, or
  success prediction;
- treating high/low trait language as ability, virtue, defect, or personal
  worth;
- replacing RIASEC or real work-activity evidence with personality stereotypes;
- using private answers, scores, percentiles, selector traces, attempt/report
  links, user identity, order, or payment state.

## Revision And Import Rule

```text
draft imported
!= working revision created
!= published public projection
!= Career bridge ready
```

For revision-managed records, the public reader must resolve the published
projection. A working revision may coexist with a published revision without
changing public content. Do not use the newest revision by timestamp, highest
revision number, or working pointer as a shortcut.

Promotion/public release, indexability, sitemap, LLMS, schema, media, cache,
and search actions remain separate gates. An exact-SHA draft import approval
does not authorize any of them.

## Fail-Closed Verdicts

Use one of these states in bridge evidence:

- `candidate_only`
- `draft_imported_not_public`
- `published_projection_ready`
- `blocked_authority_or_revision_mismatch`
- `blocked_private_or_unreviewed_source`

Only `published_projection_ready` may enter a public Career reader asset.

## QA

Before PASS:

1. Verify Career occupation publication through the backend runtime publish
   projection.
2. Verify Big Five content through the backend published public projection.
3. Prove the bridge did not select a working/draft revision or generated package.
4. Verify locale, authority identity, source, and claim permissions agree.
5. Scan for private assessment/commerce data and internal lineage leakage.
6. Scan for ranking, guarantee, hiring, income, health, and deterministic fit
   language.
7. Verify absent or unpublished Big Five authority produces no frontend fallback.

The backend technical basis is documented in
`fap-api/docs/big5-v2-platform-summary/big5_authority_v2_career_integration_retrospective_2026-07-15.md`.
