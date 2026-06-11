# CMS SEO Article Publish Runner

Purpose: accompany a complete SEO article content package through QA, preview readiness, operator publish review, post-publish smoke, and canary task planning.

Default mode: report-only.

Stages:

1. Package intake.
2. Content package QA.
3. CMS field mapping QA.
4. Claim Gate and Private URL Guard QA.
5. Chinese overwrite diff runner when overwriting a Chinese legacy page.
6. CMS draft payload preparation for operator review only.
7. Preview QA when preview evidence is provided.
8. Operator publish gate.
9. Stop for human decision.
10. Post-publish smoke only after operator says the page was published.
11. Canary observation task creation.

Required outputs:

- `CONTENT_PACKAGE_INTEGRITY_REPORT.md`.
- `CMS_FIELD_MAPPING_REPORT.md`.
- `READY_FOR_OPERATOR_PUBLISH_REVIEW.md`.
- `POST_PUBLISH_SMOKE_<slug>.md` after operator publish.
- D1/D7/D14 canary templates.

Hard stops:

- Missing package manifest.
- Missing current CMS body for overwrite.
- Claim unsafe.
- Private URL seen.
- Preview is indexable before approval.
- Schema enabled before approval.
- Operator approval missing.

No-go:

- Do not write CMS.
- Do not publish.
- Do not make indexable.
- Do not submit search.
- Do not trigger ISR.
