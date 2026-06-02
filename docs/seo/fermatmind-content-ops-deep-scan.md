# FermatMind Content Ops Deep Scan

Task: FERMATMIND-SEO-CONTENT-OPS-STRATEGY-DEEP-SCAN-202606-FINAL

Mode: read-only strategic scan and docs-only planning. No application code, CMS data, database, route, sitemap, robots, llms, schema, metadata, canonical, footer, header, article body, deploy, or production state was changed.

## Executive Decision

FermatMind should not launch standalone `/blog` or `/research` systems now.

Use `/articles` as the first operating layer for evergreen SEO articles, journal-style posts, and evidence-bounded longform. Differentiate these records through CMS fields, editorial workflow, review gates, topic relations, and discoverability rules before adding new public route families.

Footer Articles expansion is partially ready:

- Ready now: `/articles`, `/topics`.
- Conditional: `/career/guides` is strong for Chinese and stable in sitemap, but current production evidence shows the English guide index has no CMS guide items and is absent from sampled llms surfaces. For a bilingual global footer, treat `/career/guides` as conditional until EN guide inventory or locale-aware footer gating is resolved.
- Not ready: `/blog`, `/research`, article category links, method/data notes as a Research column.

Footer Research is not implementation-ready. Keep Research as a backlog until a bilingual index, CMS authority, review discipline, and sitemap/llms alignment exist.

## Evidence Used

Repository evidence:

- `docs/ux/footer-v2-articles-research-specialized-scan.md`
- `app/(localized)/[locale]/articles/*`
- `app/(localized)/[locale]/blog/*`
- `app/(localized)/[locale]/topics/*`
- `app/(localized)/[locale]/research/[slug]/page.tsx`
- `app/(localized)/[locale]/career/guides/*`
- `app/(localized)/[locale]/datasets/occupations/method/page.tsx`
- `components/layout/SiteFooter.tsx`
- `lib/cms/articles.ts`
- `lib/cms/topics.ts`
- `lib/cms/career-guides.ts`
- `lib/research/reports.ts`
- `app/llms.txt/route.ts`
- `app/llms-full.txt/route.ts`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Http/Controllers/API/V0_5/Cms/ArticleController.php`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Http/Controllers/API/V0_5/Cms/TopicController.php`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Http/Controllers/API/V0_5/Cms/CareerGuideController.php`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Http/Controllers/API/V0_5/SEO/SitemapSourceController.php`
- CMS migrations for `articles`, `article_seo_meta`, `article_test_edges`, `topic_profiles`, `career_guides`, `content_pages`, `landing_surfaces`, and `page_blocks`.

Public runtime evidence sampled from `https://fermatmind.com` on 2026-06-02:

- `/zh/articles`, `/en/articles`, `/zh/topics`, `/en/topics`, `/zh/career/guides`, `/en/career/guides`, `/zh/datasets/occupations/method`, `/en/datasets/occupations/method`, `/zh/personality`, `/en/personality`, `/zh/career`, `/en/career`, `/zh/method-boundaries`, `/en/method-boundaries`, `/zh/tests`, `/en/tests`, `/zh/research`, `/en/research`, `/zh/science`, `/en/science`.
- `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`.
- Public CMS list APIs for articles, topics, and career guides.

Benchmark references used only for IA patterns:

- [Truity](https://www.truity.com/)
- [123test all tests](https://www.123test.com/all-tests/)
- [16Personalities articles](https://www.16personalities.com/articles)
- [16Personalities personality types](https://www.16personalities.com/personality-types)
- [OpenAI News](https://openai.com/news/)
- [OpenAI Safety](https://openai.com/safety/)
- [OpenAI Policies](https://openai.com/policies/)

## Benchmark Pattern Summary

| Benchmark | Useful IA pattern | FermatMind adaptation | Do not copy |
|---|---|---|---|
| Truity | Test directory, personality/career content clusters, article-to-test paths. | Keep tests as product entry points and use articles/topics/guides as supporting clusters. | Claims, test framing, titles, visual style, paid/report wording. |
| 123test | Broad test matrix, category hubs, public test landing depth. | Keep `/tests`, test detail pages, and related content modules linked without overclaiming. | Test items, scoring logic, paid flow structure, proprietary wording. |
| 16Personalities | Resource/article hub connected to type pages and career surfaces. | Use `/topics` and article relations to connect type, test, and career clusters. | Type descriptions, product funnel copy, relationship/career article titles. |
| OpenAI | Institutional separation of news, research, safety, policies, and company. | Split FermatMind content by evidence level and governance before splitting routes. | Institutional authority claims, safety/research wording, content design. |

## Current Content Surface Inventory

| Surface | Route | zh status | en status | Source | CMS/backend authority? | Indexable? | Sitemap? | llms? | Schema | Classification | Notes |
|---|---|---:|---:|---|---|---|---|---|---|---|---|
| Articles index | `/articles` | 200 | 200 | `articles/page.tsx` + `/v0.5/articles` | Yes | Yes | Yes | Yes | CollectionPage, BreadcrumbList | ready_current_public_surface | Primary content ops root. |
| Article detail | `/articles/[slug]` | representative detail API exists | representative detail API exists | `/v0.5/articles/{slug}` | Yes | Record-gated | Sitemap when public | llms when eligible | Article fallback governed | ready_current_public_surface | Needs CMS relation expansion for scalable clusters. |
| Blog alias | `/blog` | 308 to `/articles` | 308 to `/articles` | `blog/page.tsx` | No separate authority | No direct index | No | No | None | redirect_only | Do not link from footer. |
| Blog detail alias | `/blog/[slug]` | redirect/legacy behavior | redirect/legacy behavior | frontend legacy route | No separate authority | No direct index | No | No | None | redirect_only | Keep as compatibility only. |
| Topics index | `/topics` | 200 | 200 | `topics/page.tsx` + `/v0.5/topics` | Yes | Yes | Yes | Yes | WebPage, BreadcrumbList | ready_current_public_surface | Strong cluster root. |
| Topic detail | `/topics/[slug]` | CMS-gated | CMS-gated | `/v0.5/topics/{slug}` | Yes | Record-gated | Sitemap when public | llms when eligible | Topic detail SEO surface | ready_current_public_surface | Use for canonical cluster pages, not article category replacement. |
| Research index | `/research` | 404/noindex | 404/noindex | none | No | No | No | No | None | 404 | Not footer-ready. |
| Research detail | `/research/[slug]` | route exists | route exists | `/v0.5/research/{slug}` | Partial detail authority | Record-gated | Not confirmed | Not confirmed | Page metadata if record exists | hold_until_review | Detail requires published record plus method and boundary fields. No index route. |
| Career guides index | `/career/guides` | 200 with 20 guide links | 200 with 0 guide links | `career/guides/page.tsx` + `/v0.5/career-guides` | Yes, but EN inventory gap | Yes | Yes | zh yes, en not observed | None on index | hold_until_cms_ready for EN parity | Current bilingual footer use needs EN guide inventory or locale-aware gating. |
| Career guide detail | `/career/guides/[slug]` | CMS-backed | CMS-backed if record exists | `/v0.5/career-guides/{slug}` | Yes | Record-gated | Sitemap when public | llms when eligible | Career guide SEO surface | ready when record exists | Do not use as broad article category route. |
| Dataset method | `/datasets/occupations/method` | 200 | 200 | backend career dataset method API | Yes | Yes | No | No | Article, BreadcrumbList | hold_until_discoverability_aligned | Future Research candidate after sitemap/llms and review alignment. |
| Personality hub | `/personality` | 200 | 200 | product/CMS hybrid | Partial | Yes | Yes | Yes | WebPage, ItemList | ready_current_public_surface | Header duplicate; not an article category route. |
| Career hub | `/career` | 200 | 200 | career product surface | Yes | Yes | Yes | Yes | WebPage | ready_current_public_surface | Header duplicate; do not relabel as career articles. |
| Method boundaries | `/method-boundaries` | 200 | 200 | content page | Yes | Yes | Yes | partial in sampled llms | WebPage, BreadcrumbList | duplicate_requires_approval | Keep frozen in Terms and Policies unless Product/SEO approves duplicate placement. |
| Test hub | `/tests` | 200 | 200 | test public entry authority | Yes | Yes | Yes | Yes | CollectionPage, ItemList | ready_current_public_surface | Do not use footer Articles slot for this group. |
| Test landing | `/tests/[slug]` | selected pages 200 | selected pages 200 | scale registry/test authority | Yes | Scale-gated | Sitemap when approved | llms when approved | Scale-specific | ready_current_public_surface | Sensitive tests require separate review gates. |
| Result guide/public result hub | `/results` | 308 to lookup | 308 to lookup | private result utility | No public guide authority | No | No | No | None | private | Do not use for SEO content until a public CMS-backed hub exists. |
| Science/methodology hub | `/science` | 404/noindex | 404/noindex | none | No | No | No | No | None | 404 | Do not launch thin hub. |
| RIASEC technical note | test technical-note path | 200 | 200 | scale technical note route | Yes for page | no explicit robots sampled | No | No | None sampled | hold_until_discoverability_aligned | Future method candidate only after review/discoverability alignment. |

Note: Raw HTML contains global not-found boundary payload markers on many successful pages. This scan treats a page as route-ready only when the HTTP status, title, H1, canonical, robots, visible content, sitemap, and authority source agree; the global boundary payload should remain a separate frontend hygiene issue if it persists.

## Backend CMS Authority Summary

| Authority | Current support | SEO ops implication |
|---|---|---|
| Articles | Public list/detail, category, tags, related test slug, public test edges, author/reviewer names, reading minutes, media metadata, SEO meta, translation revision contract. | Strong enough to operate ordinary articles now; needs content type, evidence, citation, topic relations, and category routes before route expansion. |
| Topics | Public list/detail, sections, entry groups, SEO meta, JSON-LD overrides, answer/landing surfaces. | Strong cluster authority; should be the main hub layer before blog/research route creation. |
| Career guides | Public list/detail, related jobs, industries, articles, personality profiles, SEO surface. | Good career content model; EN inventory gap blocks symmetrical footer confidence. |
| Content pages | Trust/help/policy/company static pages, indexability, SEO fields, content body. | Keep method-boundaries in policy/trust grouping unless duplicate placement is approved. |
| Landing surfaces | Homepage/tests/page-block operations. | Useful for homepage modules, not for article taxonomy by itself. |
| Research reports | Public detail API and detail route exist; required fields include methodology and claim boundary. | Not enough for Research footer because no public bilingual index route exists. |
| Sitemap source | Backend cached source with career runtime gating. | Good authority pattern; future content family exposure should reuse this style. |

## Strategic Findings

1. `/articles` is the correct first operating system for SEO articles, blog-style content, and research-style longform.
2. `/blog` is not a route family today; linking it would add redirect noise and no additional authority.
3. `/research` is not route-ready; publish research-style content inside `/articles` first with an evidence/review taxonomy.
4. `/topics` is the strongest current cluster hub and should absorb topic-level internal linking work.
5. Article category pages should not be linked until real routes exist and canonicalization does not collapse category intent back to `/articles`.
6. `/career/guides` is useful but has a bilingual parity gap: Chinese has 20 visible guide links; English sampled as 0.
7. Dataset and technical-note method pages should not enter footer until review and discoverability alignment are intentional.
8. Content operations need CMS fields and release rules more urgently than new public routes.
9. Search/LLM discoverability must be record-gated by backend/CMS authority, not frontend fallback copy.
10. Footer Research requires a hub strategy; a column with one duplicated policy link would be premature.

## First Implementation Recommendation

Start with a CMS/content-ops planning PR, not a frontend footer PR:

- Add or design non-runtime CMS taxonomy fields for content family, evidence level, research note eligibility, method note eligibility, footer eligibility, llms eligibility, related topics, related articles, related career guides, citations, data source note, reviewer state, and content decay date.
- Keep `/articles` as the route.
- Keep `/topics` as the cluster hub.
- Do not create `/blog` or `/research` yet.

Suggested next PR id:

`SEO-CONTENT-OPS-CMS-TAXONOMY-PLANNING-01`

Scope:

- Backend/CMS schema planning docs or non-runtime admin requirements first.
- No public route changes.
- No article copy.
- No sitemap/llms changes until fields and review workflow are accepted.

## Final Scan Decision

`content_ops_scan_completed_ready_for_review`
