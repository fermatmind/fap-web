# Preview QA

Purpose: verify a CMS preview is safe before operator publish review.

Inputs:

- Preview URL or screenshot/export.
- Expected slug, locale, canonical, title, meta, CTA, FAQ, and schema status.

Checks:

1. Preview is noindex.
2. HTTP status is 200.
3. H1 is unique.
4. Canonical matches plan.
5. Meta title and description match plan.
6. FAQ is visible-only unless schema is explicitly approved.
7. CTA is visible and safe.
8. CTA tracking can be observed or planned.
9. No private URL.
10. No token, order, result, attempt, report, or payment ID.
11. Schema is not enabled early.
12. Hreflang is held or explicitly eligible.

Output: `PREVIEW_CHECKLIST_<slug>.md` using `assets/preview_checklist_template.md`.

No-go: preview evidence does not authorize publish, indexability, schema, search submission, or ISR.
