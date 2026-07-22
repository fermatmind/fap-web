# CAREER-SEARCH-ENTRY-QUALITY-REAUDIT-01

## Summary

This is a read-only re-audit of the public 1046-career search-entry cohort. The generated artifact keeps the frozen `CAREER-QUALITY-TIERING-01` v1 baseline at its top level and adds the current `CAREER-SEARCH-ENTRY-QUALITY-REAUDIT-01` evidence under `reaudit` schema v2.

Final decision: `NO_GO` for broad career pSEO/search amplification. Current public inventory and discoverability remain large, but current per-entry reviewer/content-version enrichment is incomplete and the runtime/hold cohorts are not promotion-ready.

- No runtime behavior change.
- No sitemap membership change.
- No CMS/backend mutation, publication, deployment, Search Console action, URL submission, or production-state change.

Primary artifact: `docs/seo/generated/career-quality-tiering-01.v1.json`.

## Authority and Evidence

The current re-audit no longer treats the legacy career jobs index as the 1046 inventory authority.

| Evidence | Current role | Observation |
| --- | --- | --- |
| `/api/v0.5/career/datasets/occupations` | 1046-member backend dataset authority | 200; 1046 members |
| `/api/v0.5/career/directory?locale=en&per_page=1` | EN directory count authority | 200; total 1046 |
| `/api/v0.5/career/directory?locale=zh-CN&per_page=1` | ZH directory count authority | 200; total 1046 |
| `https://fermatmind.com/sitemap.xml` | Public URL truth | Successful artifact run observed 200 and 2612 URLs |
| `/api/v0.5/seo/sitemap-source` | Backend sitemap authority fallback when public XML is unavailable | Generator fallback only; not needed by the successful artifact run |
| `/api/v0.5/career/jobs?locale={en\|zh-CN}&org_id=0` | Optional reviewer/content enrichment only | Both locales returned 504; zero rows used |
| `/api/v0.5/career/jobs/{slug}?locale={en\|zh-CN}` | Bounded detail enrichment/sample evidence | Stable-detail batch returned no usable rows in the final run; eight later detail+HTML samples were fed back into final rows |

The separation matters: an unavailable optional enrichment endpoint does not erase the backend-authoritative 1046-member inventory, but it also cannot supply the reviewer evidence required to promote entries.

## Current Inventory

| Check | Result |
| --- | ---: |
| Dataset members | 1046 |
| Directory EN total | 1046 |
| Directory ZH total | 1046 |
| Unique career slugs | 1046 |
| Live sitemap locs | 2612 |
| Career detail sitemap URLs | 2092 |
| Career detail sitemap slugs | 1046 |
| Optional jobs-index EN rows | 0 (504) |
| Optional jobs-index ZH rows | 0 (504) |
| Original optional-index EN gap | 1046 |
| Original optional-index ZH gap | 1046 |
| EN rows with bounded detail+HTML enrichment | 4 |
| ZH rows with bounded detail+HTML enrichment | 4 |
| `/en/career/jobs` or `/zh/career/jobs` in sitemap | No |
| Excluded slugs in dataset/sitemap | No |

The excluded slugs remain absent: `software-developers`, `digital-forensics-analysts`, and `computer-occupations-all-other`.

## Versioned Tier Result

The v1 top-level values remain a historical baseline so the existing frozen contract and prior evidence retain their meaning. They are not the current promotion decision.

| Tier | Frozen v1 (2026-06-04) | Current v2 re-audit |
| --- | ---: | ---: |
| Tier A — controlled search-entry candidate | 6 | 0 |
| Tier B — content watchlist | 238 | 1 |
| Tier C — claim-review cohort | 335 | 0 |
| Tier C — runtime/thin-shell risk | 467 | 0 |
| Tier D — hold/not a search entry | 0 | 1045 |
| Total | 1046 | 1046 |

Current dataset publish-track distribution:

| Publish track | Count |
| --- | ---: |
| `stable` | 5 |
| `candidate` | 110 |
| `hold` | 222 |
| `runtime_publish_projection` | 706 |
| Missing/unknown | 3 |

Only `acupuncturists` recovered bilingual per-locale SEO evidence in the final run, and its reviewer status is `pilot_display_asset`, so it remains a Tier B watchlist entry rather than a promotion candidate. The other 1045 rows fail closed to Tier D when either locale lacks usable SEO evidence, rendered HTML says `noindex`, reviewer evidence is insufficient, or the dataset explicitly holds the member. Dataset-wide public index state is recorded as inventory context but is not used as proof that both localized pages are indexable.

## Focused Sample Evidence

The v2 run sampled one row per provisional content-version group in both locales (10 observations):

- Five samples had adequate visible content, one was partial, and four were thin/shell.
- Two samples lacked FAQ evidence in rendered HTML; none lacked Breadcrumb evidence.
- The bounded stable-detail batch returned no usable entries, while eight successful later detail+HTML samples were fed back into the final row inputs before tiering.
- Locale HTML `noindex` overrides dataset-wide index context; missing per-locale SEO evidence also fails closed.

The 1046/1046 optional-index gaps remain computed from the original legacy jobs-index responses. Bounded detail+HTML sample coverage is reported separately and never reduces those outage counts.
- No strong-claim, salary-comparison, or AI-strategy permission was inferred from missing evidence.

## Decision

`NO_GO` remains the only supported cohort-level decision.

The current artifact does not authorize:

- bulk search amplification or pSEO expansion;
- Search Console, Baidu, IndexNow, or other URL submission;
- career body generation or frontend editorial fallback;
- sitemap or llms membership changes;
- CMS/backend edits, publication, deploy, or production mutation.

A future controlled search-entry canary requires restored reviewer/content-version authority, per-entry visible-content/schema checks, and explicit manual approval. This re-audit grants none of those permissions.

## Repository Rule Impact

None. This PR refreshes only a generator, versioned evidence artifact, report, focused contract, and PR-train metadata. Career content, reviewer status, indexability, schema, FAQ, claims, and publication state remain backend/CMS authoritative. No runtime authority or frontend content fallback is introduced.
