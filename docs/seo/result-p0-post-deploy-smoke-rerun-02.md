# RESULT-P0-POST-DEPLOY-SMOKE-RERUN-02

Date: 2026-06-13
Mode: production read-only smoke, docs only
Final decision: `blocked_missing_live_result_samples`

## Scope

This smoke follows the RESULT-P0-PDF-LEAK-HARDENING-TRAIN-02 implementation train after PR1 through PR5 merged to `main`.

It did not mutate CMS data, backend data, database rows, deployment config, sitemap, robots, llms, schema, canonical metadata, public SEO routes, payment flow, quiz scoring, result algorithms, uploaded PDFs, generated PDFs, screenshots, or private result records.

## Deployment And Runtime Evidence

GitHub has no Deployment API records for `fermatmind/fap-web`, so deployment was verified through production runtime fingerprints instead of GitHub deployment metadata.

Production `https://fermatmind.com/zh/tests/big-five-personality-test-ocean-model` returned HTTP 200 and loaded a global CSS chunk that contains the private-result print selectors:

- `data-private-result-print-root`
- `data-private-result-print-hidden`

This proves the print chrome hardening CSS from the implementation train is present in the served production frontend bundle. It does not, by itself, prove any uploaded/generated private PDF sample is clean.

## Live Result Privacy Envelope

Read-only checks used safe placeholder result paths only. No raw private result ID or raw private result URL is recorded in this report.

| Sample path pattern | HTTP status | X-Robots-Tag | robots meta | cache-control | canonical | hreflang | JSON-LD |
|---|---:|---|---|---|---|---|---|
| `/zh/result/[SAFE-PLACEHOLDER]` | 200 | `noindex, nofollow, noarchive, nocache` | present | `private, no-store, max-age=0, must-revalidate` | none found | none found | none found |
| `/en/result/[SAFE-PLACEHOLDER]` | 200 | `noindex, nofollow, noarchive, nocache` | present | `private, no-store, max-age=0, must-revalidate` | none found | none found | none found |

Privacy envelope result: PASS for the sampled safe placeholder routes.

## PDF Evidence Availability

Fresh uploaded/generated PDF samples were not available in this run.

Because the actionable original regression was observed in PDF text, this smoke cannot prove the final PDF-facing outcome for:

- private result URL browser footer leakage
- global header/footer leakage in PDF output
- Big Five internal/debug text in PDF output
- RIASEC debug labels or raw keys in PDF output
- Enneagram object tokens in PDF output

No uploaded PDFs, generated PDFs, screenshots, raw result IDs, or raw private result URLs were committed or embedded in this report.

## Leak Checks

| Check | Evidence | Result |
|---|---|---|
| no private URL footer in newly generated/exported PDF | No fresh PDF sample available | BLOCKED |
| no global header/footer in newly generated/exported PDF | No fresh PDF sample available | BLOCKED |
| no Big Five debug tokens in newly generated/exported PDF | No fresh PDF sample available | BLOCKED |
| no RIASEC debug labels/raw keys in newly generated/exported PDF | No fresh PDF sample available | BLOCKED |
| no Enneagram `[object Object]` or `analyzer_close_call` in newly generated/exported PDF | No fresh PDF sample available | BLOCKED |
| result privacy SEO envelope remains noindex/nofollow/noarchive/nocache | Safe placeholder zh/en result paths returned the expected header/meta envelope and no canonical, hreflang, or JSON-LD | PASS |
| implementation train bundle is present in production frontend | Production CSS contains private-result print selectors | PASS |

## Conclusion

The implementation train is merged and production appears to be serving at least the print chrome hardening bundle. The live result privacy envelope remains correct on safe placeholder zh/en result paths.

The final PDF leak hardening decision remains blocked because no fresh uploaded/generated private PDF samples or live private result samples were available for text extraction and inspection. The next rerun needs new redacted PDF text evidence for Big Five, RIASEC, and Enneagram after the deployed implementation train is active for the sampled result records.
