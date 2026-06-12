# RESULT-PAGES-PRIVATE-DEBUG-AND-PDF-LEAK-SCAN-01

Date: 2026-06-12
Mode: read-only specialized scan
Scope: Big Five, RIASEC / Holland, and Enneagram private result pages plus PDF / print output
Decision: `result_pages_private_debug_pdf_leak_scan_opened_ready_for_review`

## Executive Summary

The three supplied PDF samples were available locally and were inspected without committing them. All three samples expose private result URLs in browser-generated PDF chrome. The samples also show user-visible internal/debug material:

- Big Five exposes report-engine registry / PR / controller implementation text.
- RIASEC exposes raw score-space IDs, quality rule IDs, content strategy IDs, module visibility labels, and activity-family tokens.
- Enneagram exposes `analyzer_close_call` and `[object Object]`.
- All PDFs include global footer content with Articles / Research & Methods links.

The live result route privacy baseline is mostly correct for indexability: `/zh/result/[REDACTED]` and `/en/result/[REDACTED]` return `X-Robots-Tag: noindex, nofollow, noarchive, nocache`, emit a matching robots meta tag, and did not emit canonical, hreflang, or JSON-LD in the sampled HTML. The main remaining risks are private URL / browser print chrome leakage, frontend rendering of backend/internal fields as public copy, global footer exposure on private printable pages, and missing contract tests for these leaks.

## PDF Sample Inspection

| PDF sample | Page count | Result type | Result URL visible | Browser print header visible | Browser print footer visible | Private result id visible | Debug/internal field visible | Footer exposed | Premature science/research/blog links visible | `[object Object]` visible | Raw internal keys visible |
|---|---:|---|---|---|---|---|---|---|---|---|---|
| `FermatMind-大五结果页.pdf` | 6 | Big Five | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | No |
| `FermatMind-霍兰德结果页.pdf` | 6 | RIASEC / Holland | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | Yes |
| `FermatMind-九型结果页.pdf` | 5 | Enneagram | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |

Redacted examples:

- `https://fermatmind.com/zh/result/[REDACTED]`
- `v2 报告引擎方法说明`
- `Big Five Report Engine v2 registry`
- `PR3B`, `PR3A`, `AttemptReadController`
- `riasec_60_likert5_activity_sum_space.v1`
- `minimal_answer_completion_only`
- `content_example_not_registry_match_without_reviewed_registry_source`
- `visible`, `collapsed`
- `analyzer_close_call`
- `[object Object]`
- `研究报告`, `研究与方法`, `测评科学`

The repeated date / title / URL / page-number lines in all samples match browser print headers and footers rather than a product-grade PDF template.

## Leak Pattern Catalog

| Leak category | PDF sample | Visible example redacted | Likely frontend file(s) | Likely backend/API source | Severity | Fix direction |
|---|---|---|---|---|---|---|
| `private_url_leak` | All three | `https://fermatmind.com/zh/result/[REDACTED]` | Browser print path; `components/big5/pdf/PdfDownloadButton.tsx`; `lib/api/v0_3.ts` | `backend/app/Http/Controllers/API/V0_3/AttemptReadController.php`; `backend/app/Services/Report/Pdf/ReportPdfDocumentService.php` | P0 | Stop using browser print output for downloadable PDFs or force product-safe PDF generation with no URL/footer chrome. |
| `browser_print_chrome_leak` | All three | `2026/6/12 16:03 FermatMind ... 1/6` | `app/globals.css`; result route print CSS currently does not suppress browser chrome | Browser settings, not backend-generated PDF content | P0 | Add print guidance / print CSS and move official download path to backend/product PDF only. |
| `internal_debug_copy_leak` | Big Five | `Big Five Report Engine v2 registry`, `PR3B`, `AttemptReadController` | `lib/big5/resultAssembler.ts`; `components/big5/report/BlockRenderer.tsx`; `components/result/RichResultReport.tsx` | `backend/app/Services/BigFive/ReportEngine/Bridge/BigFiveLiveRuntimeBridge.php`; `backend/app/Services/BigFive/ReportEngine/SectionInstructionAssembler.php`; Big Five report-engine fixtures | P0 | Suppress internal methodology/debug blocks or map them to approved public method-boundary copy before frontend rendering. |
| `raw_payload_key_leak` | RIASEC | `riasec_60_likert5_activity_sum_space.v1`, `content_example_not_registry_match_without_reviewed_registry_source` | `lib/riasec/resultAssembler.ts`; `components/result/riasec/RiasecResultShell.tsx` | `backend/app/Services/Riasec/RiasecTechnicalNoteService.php`; `backend/app/Services/Riasec/RiasecActivityExplorerService.php` | P1 | Keep raw contract IDs in telemetry/API only; expose reviewed labels or explanatory user copy. |
| `object_rendering_bug` | Enneagram | `[object Object]` | `components/result/enneagram/EnneagramResultShell.tsx`; `lib/enneagram/resultAssembler.ts`; shared section rendering | `backend/app/Services/Enneagram/EnneagramPublicProjectionService.php`; Enneagram report V2 close-call payload | P0 | Add render guard and contract test that rejects object-to-string output. |
| `state_label_leak` | RIASEC | `visible`, `collapsed` | `lib/riasec/resultAssembler.ts`; `components/result/riasec/RiasecResultShell.tsx` | `backend/app/Services/Riasec/RiasecReportModuleSelector.php` | P1 | Treat visibility states as rendering controls only; do not render state labels as copy. |
| `premature_footer_exposure` | All three | `研究报告`, `研究与方法`, `测评科学` | `components/layout/SiteChrome.tsx`; `components/layout/SiteFooter.tsx`; `app/globals.css` | CMS/content-page route readiness, not result API | P1 | Gate or simplify footer on private result routes and hide global chrome in print. |
| `schema_indexability_risk` | Live route audit | No JSON-LD found; no canonical found; route noindexed | `app/(localized)/[locale]/(app)/result/[id]/page.tsx`; `next.config.mjs`; `app/llms-full.txt/route.ts` | n/a | P0 if regressed; current sampled state PASS | Add leak contract tests to keep result routes out of sitemap/llms/schema/canonical. |

## Source Mapping Notes

Frontend:

- `app/(localized)/[locale]/(app)/result/[id]/page.tsx` sets `robots: NOINDEX_ROBOTS`, but the page is rendered inside global site chrome.
- `components/layout/SiteChrome.tsx` always renders `SiteHeader` and `SiteFooter`.
- `components/layout/SiteFooter.tsx` contains localized Articles and Research & Methods groups, including `/articles`, `/science`, `/method-boundaries`, `/item-design-notes`, `/reliability-validity`, `/data-privacy`, and `/common-misconceptions`.
- `components/big5/pdf/PdfDownloadButton.tsx` downloads backend `/report.pdf`; the supplied samples look like browser print output instead, so user-facing "save/download" paths may be mixed.
- `lib/api/v0_3.ts` builds `/v0.3/attempts/{id}/report.pdf`.
- `components/big5/report/BlockRenderer.tsx` renders `block.title`, `block.body`, and unsupported block fallback text without a result-leak denylist.
- `components/result/riasec/RiasecResultShell.tsx` renders trusted-card score space / quality rule / occupation example policy fields and activity explorer source-status fields directly.
- `components/result/enneagram/EnneagramResultShell.tsx` has a `safePublicText` helper, but the sample proves at least one close-call path still reaches visible output as raw reason/object text.

Backend/API:

- `backend/app/Http/Controllers/API/V0_3/AttemptReadController.php` appends Big Five, RIASEC, and Enneagram public projections into the report payload and serves `/api/v0.3/attempts/{id}/report.pdf`.
- `backend/app/Services/Report/Pdf/ReportPdfDocumentService.php` serves cached/generated report PDF artifacts with private cache headers.
- `backend/app/Services/BigFive/ReportEngine/Bridge/BigFiveLiveRuntimeBridge.php` can expose `big5_report_engine_v2` when enabled.
- `backend/app/Services/BigFive/ReportEngine/SectionInstructionAssembler.php` adds `methodology_and_access.shared.methodology` from registry copy; the expected fixture includes the observed PR/controller/debug text.
- `backend/app/Services/Riasec/RiasecReportModuleSelector.php` produces `visible` / `collapsed` module states.
- `backend/app/Services/Riasec/RiasecTechnicalNoteService.php` and `backend/app/Services/Riasec/RiasecActivityExplorerService.php` contain the observed score-space, quality, and content-example policy identifiers.
- `backend/app/Services/Enneagram/EnneagramPublicProjectionService.php` and Enneagram report V2 assembly expose close-call reasoning such as `analyzer_close_call`.

## Result Page Route Privacy Audit

Live read-only checks used sample IDs extracted from the PDFs and redacted all IDs in output/report.

| Route family | HTTP status | X-Robots-Tag | robots meta | canonical | hreflang | JSON-LD types | Header/footer included | Notes |
|---|---:|---|---|---|---|---|---|---|
| `/zh/result/[REDACTED]` | 200 | `noindex, nofollow, noarchive, nocache` | present | none found | none found | none found | yes | HTML contains route/result ID in client data; expected private route behavior, but it increases print/share leak risk. |
| `/en/result/[REDACTED]` | 200 | `noindex, nofollow, noarchive, nocache` | present | none found | none found | none found | yes | Same as zh. |

Current sampled indexability state: PASS for noindex/noarchive/no canonical/no hreflang/no JSON-LD. Keep this as a contract test because regression would be P0.

## PDF / Print Path Audit

Current product PDF path:

- Frontend button: `components/big5/pdf/PdfDownloadButton.tsx`
- Frontend API helper: `lib/api/v0_3.ts`
- Backend route: `backend/routes/api.php` -> `/api/v0.3/attempts/{id}/report.pdf`
- Backend controller/service: `AttemptReadController::reportPdf()` -> `ReportPdfDocumentService::getOrGenerate()`

Observed sample path:

- The samples contain browser print date/title/URL/page counters on every page.
- That is not characteristic of the product backend PDF response by itself.
- The samples therefore appear to be produced through browser print/save-to-PDF from the private result route, or an equivalent browser-rendered path.

Risks:

- Browser footer leaks private route and result ID.
- Global header/footer and footer links enter PDFs.
- Internal report/debug copy enters PDFs because browser print captures rendered page content.

Minimal fix options:

1. Official download action should fetch only backend/product PDF artifacts and should never call or suggest browser print.
2. Add private result print CSS that hides `header`, `footer`, global nav, action buttons, and any debug/technical contract fields.
3. Add runtime denylist around browser-visible result copy: `[object Object]`, PR identifiers, controller names, registry debug notes, raw policy IDs, and state labels.

Product-grade recommendation:

- Treat `/report.pdf` as the only official PDF download surface.
- Build a dedicated PDF template or artifact renderer whose input is a sanitized report view model, not live DOM.
- Add PDF text extraction checks in CI for private URL, UUID, raw IDs, `[object Object]`, and footer labels.

## Footer Exposure Audit

Current footer status:

- `SiteChrome` renders global footer for private result routes.
- The footer contains live localized anchors for Articles, Research reports, Science, Method boundaries, Item design notes, Reliability/validity, Data notes, and Common misconceptions.
- The PDF samples show footer labels in print output.

Risk:

- P1 on private result pages and P1/P0 in PDFs depending on whether those links imply reviewed/public method authority before routes/content are ready.

Recommendation:

- Suppress or simplify global footer on private result routes.
- Print-hide footer/header/site chrome for private user-flow pages.
- Keep public science/research/footer exposure tied to route/content/indexability readiness, not global footer defaults.

## Internal Payload Field Audit

Big Five:

- Backend bridge can expose `big5_report_engine_v2`.
- The bridge/fixture includes user-visible `resolved_copy.title` and `resolved_copy.body` with registry/PR/controller text.
- Frontend result assembly and block rendering treat that as normal report copy.

RIASEC:

- Backend projection and technical note services intentionally hold contract IDs and module states.
- Frontend renders `scoreSpaceVersion`, `qualityRuleStatus`, `occupationExamplesPolicy`, `sourceStatus`, activity families, and module visibility outcomes too literally.
- These should be public-label mapped or hidden.

Enneagram:

- Backend projection/report V2 has close-call reason fields such as `analyzer_close_call`.
- Frontend has some public-text suppression, but the PDF sample proves the close-call rendering path is not fully guarded against raw strings or object values.

## Safety And Claim Audit

Sampled result PDFs did not show Product, Review, or AggregateRating schema. Live result HTML did not emit JSON-LD in sampled zh/en routes.

RIASEC and Enneagram samples include useful non-diagnostic / non-hiring boundaries, for example not using the result for clinical diagnosis, psychotherapy advice, hiring screening, career success prediction, job fit, or qualification judgment. The issue is not claim expansion; the issue is raw internal implementation language and private-route/PDF leakage.

No IQ authority expansion was found in the scoped result samples. IQ result pages were not otherwise audited because they are out of scope.

## Remediation Plan

### P0 - RESULT-PDF-PRINT-PRIVATE-URL-GUARD-01

Scope: remove private URL exposure from downloadable/shareable PDF output.

Likely files:

- `components/big5/pdf/PdfDownloadButton.tsx`
- `lib/api/v0_3.ts`
- `app/globals.css`
- `backend/app/Http/Controllers/API/V0_3/AttemptReadController.php`
- `backend/app/Services/Report/Pdf/ReportPdfDocumentService.php`

Non-goals: no scoring, no result algorithm, no checkout/paywall, no sitemap/schema work.

Validation:

- Generate/download Big Five, RIASEC, and Enneagram PDFs.
- Extract text and assert no `/result/[id]`, UUID, browser date/title URL footer, or page URL.

Acceptance criteria:

- Official PDF artifacts have no private result URL or result ID.
- Browser print is no longer treated as official PDF output.

Rollback:

- Revert PDF entry behavior to previous backend artifact download while keeping noindex headers intact.

### P0 - RESULT-DEBUG-FIELD-SUPPRESSION-01

Scope: hide internal debug fields and map safe public labels.

Likely files:

- `lib/big5/resultAssembler.ts`
- `components/big5/report/BlockRenderer.tsx`
- `components/result/riasec/RiasecResultShell.tsx`
- `lib/riasec/resultAssembler.ts`
- `backend/app/Services/BigFive/ReportEngine/SectionInstructionAssembler.php`
- `backend/app/Services/Riasec/*`

Validation:

- Render result pages and scan text for `PR3`, `AttemptReadController`, `registry`, `content_example_not_registry_match`, `minimal_answer_completion_only`, and score-space IDs.

Acceptance criteria:

- Internal identifiers remain available only in API/debug/telemetry contexts, not visible result copy or PDFs.

Rollback:

- Re-enable raw fields behind a non-production debug flag only.

### P0 - RESULT-OBJECT-RENDER-GUARD-01

Scope: prevent `[object Object]` in Enneagram and shared result shells.

Likely files:

- `components/result/enneagram/EnneagramResultShell.tsx`
- `lib/enneagram/resultAssembler.ts`
- `components/big5/report/BlockRenderer.tsx`

Validation:

- Render Enneagram close-call samples and assert no `[object Object]`.
- Add a generic result-shell test that object values are omitted or label-mapped.

Acceptance criteria:

- No raw object coercion in result page HTML or PDF text.

Rollback:

- Revert to prior renderer only if backend payload is simultaneously sanitized.

### P1 - RESULT-PRIVATE-PRINT-STYLES-01

Scope: print-hide global header/footer/site chrome and action controls on private result pages.

Likely files:

- `app/globals.css`
- `components/layout/SiteChrome.tsx`
- `components/layout/SiteFooter.tsx`
- result page wrappers

Validation:

- Browser print preview/PDF extraction for zh/en result pages.

Acceptance criteria:

- Printed private result pages exclude global nav/footer and action controls.

Rollback:

- Remove only private-route print selectors.

### P1 - RESULT-FOOTER-PRIVATE-ROUTE-GATE-01

Scope: decide whether private result routes suppress, simplify, or keep global footer.

Likely files:

- `components/layout/SiteChrome.tsx`
- `components/layout/SiteFooter.tsx`
- app route layout for localized app routes

Validation:

- Private result route HTML and print output show no premature science/research/blog footer exposure unless explicitly approved.

Acceptance criteria:

- Footer policy is route-aware and documented.

Rollback:

- Restore global footer on private routes while keeping print-hide.

### P1 - RESULT-METHOD-BOUNDARY-COPY-PUBLIC-01

Scope: replace internal method/registry text with public method-boundary copy.

Likely files:

- `backend/app/Services/BigFive/ReportEngine/SectionInstructionAssembler.php`
- Big Five method registry/content assets
- `backend/app/Services/Riasec/RiasecTechnicalNoteService.php`
- Enneagram method-boundary projection assets

Validation:

- Scan result HTML/PDF text for internal implementation tokens and approved public boundary copy.

Acceptance criteria:

- Method copy states score-space and claim boundaries without controller/PR/registry implementation references.

Rollback:

- Fall back to minimal public method boundary copy.

### P1 - RESULT-LEAK-CONTRACT-TESTS-01

Scope: add contracts scanning rendered HTML/PDF text for private URLs, UUIDs, debug tokens, internal keys, state labels, and `[object Object]`.

Likely files:

- `tests/contracts/**`
- backend feature tests around `/api/v0.3/attempts/{id}/report`
- PDF text extraction helper test fixtures

Validation:

- Contract test suite fails on the exact leaks observed in these samples.

Acceptance criteria:

- Guard covers Big Five, RIASEC, Enneagram, zh/en, and PDF text.

Rollback:

- Narrow the denylist to P0 tokens while preserving `[object Object]` and private URL tests.

### P2 - RESULT-PDF-TEMPLATE-PRODUCTIZATION-01

Scope: product-grade PDF template and visual QA.

Likely files:

- backend PDF artifact renderer/service
- result view-model sanitizers
- PDF visual/text regression tests

Validation:

- Pixel/text checks across sample reports.

Acceptance criteria:

- PDFs have controlled title, pagination, no browser chrome, no global footer, and sanitized result copy.

Rollback:

- Keep backend artifact endpoint and disable new template through a feature flag.

## Validation

Performed:

- Confirmed PDFs exist at supplied local paths.
- Extracted PDF text into `.tmp/result-page-pdf-leak-scan/` for local analysis only.
- Live read-only route audit for zh/en result URLs using redacted sample IDs.
- Source inspection in `fap-web` and `fap-api`.

Required for this docs-only scan:

- `git diff --check -- docs/seo/result-pages-private-debug-and-pdf-leak-scan-01.md`
- Scope validation expected changed file: `docs/seo/result-pages-private-debug-and-pdf-leak-scan-01.md`

Not performed:

- No application code changes.
- No backend code changes.
- No CMS mutation.
- No database mutation.
- No PDF mutation.
- No sitemap, robots, llms, schema, canonical, footer, header, payment, checkout, order, quiz, scoring, result algorithm, or deploy changes.
