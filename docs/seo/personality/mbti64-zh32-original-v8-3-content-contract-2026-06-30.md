# MBTI64 中文 32 页 V8.3 内容资产 Contract + QA Handoff

## Scope

This contract defines how GPT-authored FermatMind V8.3 Chinese MBTI A/T public profile assets must be delivered before Codex can validate and hand them off to the backend approval/CMS pipeline.

Codex does not generate the 32 body pages in this step. The operator/GPT provides the content package. Codex validates schema, completeness, quality boundaries, safety gates, and handoff readiness.

## Accepted Inputs

The production handoff package is `zh32_full`: all 32 Chinese MBTI A/T variant pages under `/zh/personality/{type}-{a|t}`.

A pre-handoff package may use `zh30_remaining`: the 30 pages excluding the INTJ-A and INTJ-T golden samples. This mode can pass structure QA, but it is not ready for fap-api artifact sync until merged with the two approved sample pages into a full 32-page package.

## Required Page Contract

Each page object must include:

- `path`
- `locale`
- `type_code`
- `variant`
- `seo`
- `geo_summary`
- `modules`
- `faq`
- `internal_links`
- `source_ledger`
- `qa_self_check`
- `forbidden_claims_absent`

Each page must contain 10 FermatMind V8.3 modules:

1. `core-reading`
2. `rational-standard`
3. `independence-control`
4. `willpower-ambition`
5. `curiosity-revision`
6. `emotional-blindspot`
7. `social-friction`
8. `career-workflow`
9. `relationships`
10. `faq-boundary`

The production validator enforces 9,000+ Chinese characters per page, 10-12 FAQ entries, required SEO/GEO fields, source ledger evidence, internal links to MBTI/Big Five/RIASEC/career surfaces, and strict safety boundaries.

## Safety Boundary

The package must not imply official MBTI or Myers-Briggs affiliation. It must not make clinical, hiring, IQ, destiny, guaranteed career, or guaranteed relationship claims. Competitor sites can inform gap structure, but wording must be original and must not copy or lightly rewrite 16P, Truity, 123test, Crystal, or PersonalityJunkie.

This PR is artifact/script/test only. It does not write CMS, approval queue, live promotion, sitemap, llms, URL Truth, Search Queue, or IndexNow state.

## Validator

Use:

```bash
node scripts/seo/validate-mbti64-zh32-original-v8-3-package.mjs \
  --input=docs/seo/personality/<gpt-package>.json \
  --output-normalized=docs/seo/personality/mbti64-zh32-original-v8-3-normalized-package-2026-06-30.json \
  --output-qa=docs/seo/personality/mbti64-zh32-original-v8-3-qa-2026-06-30.json \
  --output-md=docs/seo/personality/mbti64-zh32-original-v8-3-qa-2026-06-30.md
```

When the input is complete and safe, the validator emits `PASS_READY_FOR_FAP_API_ARTIFACT_SYNC`. Otherwise it emits `NO_GO_QA_REPAIR_REQUIRED` with page-level blockers.

## Next Gate

After a full pass, the next task is `MBTI64-ZH32-ORIGINAL-V8_3-FAP-API-ARTIFACT-SYNC-01`, followed by approval queue dry-run/write, CMS draft dry-run/write, promotion dry-run/write, runtime smoke, URL Truth refresh, and IndexNow gates.
