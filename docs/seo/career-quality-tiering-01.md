# CAREER-QUALITY-TIERING-01

## Summary

This is a read-only quality tiering pass for the public 1046 career job inventory. It does not generate career body copy, change CMS/backend data, publish, deploy, change sitemap/runtime behavior, or submit URLs to GSC/Baidu/IndexNow.

Final decision: `NO_GO` for 1046 career pSEO amplification.

Limited decision: `CONDITIONAL_GO_FOR_TIER_A_CANARY_ONLY_AFTER_MANUAL_REVIEW`. The six Tier A rows may be treated as controlled search-entry candidates only after manual content/schema/claim review. This artifact does not authorize search submission.

Primary artifact: `docs/seo/generated/career-quality-tiering-01.v1.json`.

## Evidence Sources

- Live production sitemap: `https://fermatmind.com/sitemap.xml`
- Career index API samples:
  - `/api/v0.5/career/jobs?locale=en&org_id=0`
  - `/api/v0.5/career/jobs?locale=zh-CN&org_id=0`
- Detail API samples:
  - `/api/v0.5/career/jobs/{slug}?locale={en|zh-CN}`
  - `/api/v0.5/career-jobs/{slug}/seo?locale={en|zh-CN}&org_id=0`
- Public HTML samples:
  - `/{locale}/career/jobs`
  - `/{locale}/career/jobs/{slug}`

## Inventory Result

| Check | Result |
| --- | ---: |
| Career index EN rows | 1046 |
| Career index ZH rows | 1046 |
| Unique career slugs | 1046 |
| EN-only slugs | 0 |
| ZH-only slugs | 0 |
| Live sitemap locs | 2272 |
| Career detail sitemap URLs | 2092 |
| Career detail sitemap slugs | 1046 |
| `/en/career/jobs` in sitemap | No |
| `/zh/career/jobs` in sitemap | No |
| Excluded slugs in sitemap | No |

Excluded slugs remain absent from index and sitemap:

- `software-developers`
- `digital-forensics-analysts`
- `computer-occupations-all-other`

## Tier Schema

| Tier | Meaning | Promotion posture |
| --- | --- | --- |
| `tier_a_controlled_search_entry_candidate` | Backend indexable and sitemap-visible in both locales, reviewer approved, suitable only for controlled canary review. | Conditional canary only |
| `tier_b_content_watchlist_schema_sample_required` | Backend indexable and sitemap-visible, but reviewer status is pilot/display-asset rather than final approved. | No bulk amplification |
| `tier_c_internal_auxiliary_claim_review_required` | Backend indexable, but docx baseline/import status plus strong or salary claim gates require editorial and claim review. | Internal auxiliary only |
| `tier_c_internal_auxiliary_thin_shell_risk` | Backend indexable runtime projection shell where visible content thickness and claim context are not sufficient for search amplification. | Internal auxiliary only |
| `tier_d_hold_not_search_entry` | Not bilingual sitemap/indexable or explicitly excluded. | No |

## Tier Counts

| Tier | Count |
| --- | ---: |
| `tier_a_controlled_search_entry_candidate` | 6 |
| `tier_b_content_watchlist_schema_sample_required` | 238 |
| `tier_c_internal_auxiliary_claim_review_required` | 335 |
| `tier_c_internal_auxiliary_thin_shell_risk` | 467 |
| `tier_d_hold_not_search_entry` | 0 |

## Risk Categories

| Risk category | Count / status |
| --- | ---: |
| ZH index title missing | 6 |
| ZH index title equals EN | 0 |
| Reviewer `approved` | 6 |
| Reviewer `docx_baseline_imported` | 335 |
| Reviewer `pilot_display_asset` | 238 |
| Reviewer `runtime_publish_projection` | 467 |
| Strong career-fit claim without final review | 802 |
| Salary claim without final review | 335 |
| Sampled strong claim without final review | 12 |
| Sampled adequate visible content | 12 |
| Sampled partial visible content | 4 |
| Sampled thin/shell visible content | 8 |
| Sampled FAQ schema missing in HTML | 0 |
| Sampled Breadcrumb missing | 0 |
| Sampled RIASEC CTA missing | 0 |

Interpretation:

- The sitemap and career index prove discoverability mechanics exist for the 1046 detail cohort.
- The reviewer and claim gates do not support broad search amplification.
- Thin/shell sample evidence remains material, especially for runtime projection and some ZH detail samples.
- The ZH index-title gap affects the six strongest Tier A candidates and should be fixed or explained before canary amplification.

## Sample Results

| Slug | Locale | Tier | Index version | Detail version | Reviewer | Thickness | HTML schema | FAQ | Sample risks |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `accountants-and-auditors` | en | Tier A | `career_first_wave.publish_seed.v1` | `career_first_wave.publish_seed.v1` | `approved` | adequate | BreadcrumbList, FAQPage | 4 | none |
| `accountants-and-auditors` | zh | Tier A | `career_first_wave.publish_seed.v1` | `career_first_wave.publish_seed.v1` | `approved` | adequate | BreadcrumbList, FAQPage | 4 | none |
| `actors` | en | Tier C claim review | `docx_342_career_batch` | `display_asset_backed_v4_2` | `pilot_display_asset` | partial | BreadcrumbList, FAQPage | 0 | strong claim without final review |
| `actors` | zh | Tier C claim review | `docx_342_career_batch` | `display_asset_backed_v4_2` | `pilot_display_asset` | partial | BreadcrumbList, FAQPage | 0 | strong claim without final review |
| `actuaries` | en | Tier C claim review | `docx_342_career_batch` | `display_asset_backed_v4_2` | `pilot_display_asset` | adequate | BreadcrumbList, FAQPage | 3 | strong claim without final review |
| `actuaries` | zh | Tier C claim review | `docx_342_career_batch` | `display_asset_backed_v4_2` | `pilot_display_asset` | thin/shell | BreadcrumbList, FAQPage | 1 | thin content, strong claim without final review |

The complete sample set and all 1046 row classifications are in the generated artifact.

## `/zh/career/jobs` Sitemap Hub Decision

Decision: `no_go_as_sitemap_hub_now`.

Observed:

- `/zh/career/jobs` returns `index, follow`.
- Canonical points to `https://fermatmind.com/zh/career/jobs`.
- The page has visible career directory content and RIASEC test CTA signals.
- It is absent from the live sitemap.
- HTML JSON-LD was not detected on the hub sample.

Conclusion: `/zh/career/jobs` is a public indexable directory shell, but it should not be promoted to sitemap hub until a dedicated sitemap policy/schema/internal-link PR decides the hub role.

## Next PRs

The following PRs are proposed only. They are not authorized by this PR unless the user explicitly authorizes manifest/state entries.

| Proposed id | Proposed title | Scope | Checks |
| --- | --- | --- | --- |
| `CAREER-THIN-CONTENT-REPAIR-01` | `docs(career): define thin career detail repair queue` | Route thin/shell rows to backend/CMS/import repair without frontend copy. | JSON parse, artifact parse, `git diff --check` |
| `CAREER-JOB-SCHEMA-FAQ-BREADCRUMB-01` | `test(seo): gate career job schema against visible content` | Contract coverage for Occupation, FAQPage, BreadcrumbList, canonical, and visible FAQ alignment. | Focused contract tests, `git diff --check` |
| `CAREER-INTERNAL-LINKS-CTA-GATE-01` | `docs(seo): gate career internal links before amplification` | Inventory career hub/detail internal links and test CTAs before amplification. | Generator, artifact parse, `git diff --check` |
| `CAREER-JOBS-HUB-SITEMAP-POLICY-01` | `docs(seo): decide career jobs hub sitemap eligibility` | Decide whether `/en/career/jobs` and `/zh/career/jobs` stay out of sitemap or become sitemap hubs. | Sitemap policy contracts, canonical contracts, `git diff --check` |

## Repository Rule Impact

This PR is docs/generator/contract only. It does not alter content authority, public route behavior, sitemap URL sets, llms URL sets, CMS data, backend data, payment/order/result flows, or deployment state.

Career jobs, job details, reviewer status, claim permissions, salary facts, career-fit claims, schema, FAQ, and publication state remain backend/CMS authoritative. This PR adds no frontend editorial fallback content.
