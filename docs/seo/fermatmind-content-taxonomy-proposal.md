# FermatMind Content Taxonomy Proposal

This proposal defines a practical taxonomy for content operations without creating new route families before the CMS authority layer is ready.

## Taxonomy Principles

- One content record should carry its operational family, evidence boundary, review state, target cluster, and discoverability eligibility.
- Route families should follow inventory depth and authority, not brand preference.
- Footer links should point to stable, indexable, bilingual, CMS/backend-authoritative surfaces.
- Research-style content requires evidence and review gates. Lower-evidence content should be labeled as analysis, monthly insight, method note, or editorial commentary.
- Sensitive topics require manual review and conservative discoverability.

## Content Families

| Family | Purpose | Target search intent | Route now | Route later | CMS model requirement | Schema recommendation | Review requirement | Footer eligibility | Sitemap/llms eligibility | First phase |
|---|---|---|---|---|---|---|---|---|---|---|
| Ordinary SEO articles | Evergreen answers, explainers, comparison pages, user questions. | Informational long-tail queries. | `/articles/[slug]` | Optional category routes after CMS support. | Article with category, topic relations, related tests, freshness date. | Article + BreadcrumbList when visible content supports it. | Standard editorial review; sensitive topics escalate. | Footer index only, not individual articles. | Public/indexable/published only. | Phase 1-3 |
| Blog-style / Journal | Product notes, editorial observations, short commentary, brand education. | Brand-adjacent discovery and returning-reader context. | `/articles/[slug]` with content family field. | `/blog` only after enough inventory and direct index route. | Article plus family, voice, author/editor, homepage eligibility. | Article. | Editorial review; no sensitive expansion. | Not footer-ready until route exists. | Same as articles if public and indexable. | Phase 4 |
| Research-style longform | Monthly insight, method note, theme report, data-informed observation. | High-trust exploratory queries and LLM answer surfaces. | `/articles/[slug]` with evidence fields. | `/research` only after bilingual hub and enough approved inventory. | Article or research record with evidence level, citations, source/data note, reviewer, claim boundary. | Article; Dataset only if actual dataset page authority exists. | Required reviewer and evidence review. | Not footer-ready today. | Only after review and visible evidence. | Phase 5-6 |
| Methods / boundaries | Explain measurement models, scoring limits, privacy/data boundaries, interpretation limits. | Trust and method questions. | Existing content pages and approved technical notes. | Method/research hub after inventory. | Content page or article with method family and review fields. | WebPage or Article depending on body structure. | Product/review required. | Method boundaries stays in frozen policy group unless approved. | Only when sitemap/llms policy agrees. | Phase 5-7 |
| Assessment guides | How to choose tests, combine results, interpret outcomes. | Pre-test and post-test education. | `/articles` and selected guide surfaces. | Category route or guide hub later. | Article with related tests and related topics. | Article + BreadcrumbList. | Standard review; sensitive results escalate. | Footer via `/articles`/`/topics`, not a fake guide route. | Record-gated. | Phase 3-5 |
| Topics | Cluster hubs for MBTI, Big Five, RIASEC, career choice, relationships, methods. | Broad cluster navigation and answer-hub intent. | `/topics`, `/topics/[slug]`. | Stay as main cluster hub. | Topic profile with sections and entry groups. | WebPage + BreadcrumbList; structured data only visible-grounded. | Review required for sensitive clusters. | Footer-safe now for `/topics`. | Yes when public/indexable. | Phase 1-2 |
| Career guides | Practical career choice and transition guidance. | Career exploration and decision-support queries. | `/career/guides` and details. | Keep as career content library. | CareerGuide with related jobs/articles/personality. | Article/WebPage as backend SEO service allows. | Career claim review. | Conditional until EN guide inventory is fixed. | Public/indexable only. | Phase 2 sidecar |

## Proposed CMS Taxonomy Fields

| Field | Type | Purpose | Applies to |
|---|---|---|---|
| `content_family` | enum | `evergreen_article`, `journal_note`, `monthly_insight`, `method_note`, `guide`, `topic_bridge`. | Articles, research-like records. |
| `content_cluster` | enum/string | MBTI, Big Five, RIASEC, Enneagram, EQ, career choice, work, relationships, methods. | Articles, topics, guides. |
| `primary_intent` | enum | Informational, comparison, pre-test, post-test, method, trust, editorial. | Articles and guides. |
| `evidence_level` | enum | Commentary, source-informed, data-informed, reviewed method, externally cited. | Longform and methods. |
| `review_required` | boolean | Forces manual review before publish/exposure. | All content. |
| `review_completed_at` | datetime | Release gate for sensitive or research-style content. | All content. |
| `reviewer_name` | string/reference | Public reviewer display only when approved. | Articles, research, methods. |
| `citation_list` | structured list | Visible references or sources. | Research-style and method notes. |
| `data_source_note` | text | Explains what data was and was not used. | Research-style and method notes. |
| `claim_boundary_note` | text | Visible limit statement for method/research/career-sensitive pages. | Research, methods, career. |
| `related_tests` | relation | Connect articles to tests without local inference. | Articles, topics. |
| `related_topics` | relation | Connect articles to topic pages. | Articles, guides. |
| `related_articles` | relation | Backend/CMS-owned related content. | Articles, topics, guides. |
| `related_career_guides` | relation | Connect articles to career guide authority. | Articles and topics. |
| `footer_eligible` | boolean | Explicit approval for footer candidate indexes only. | Hubs/categories, not individual articles by default. |
| `sitemap_eligible` | boolean | Explicit discoverability policy. | All public content. |
| `llms_eligible` | boolean | AI/GEO entry eligibility. | All public content. |
| `llms_full_eligible` | boolean | Enriched context eligibility after evidence and boundaries. | Longform/method pages. |
| `decay_review_due_at` | datetime | Refresh queue for stale content. | All SEO content. |

## Route Strategy

| Route option | Pros | Cons | SEO impact | CMS complexity | Route risk | Recommendation | Phase |
|---|---|---|---|---|---|---|---|
| Keep `/articles` as universal content index | Already live, bilingual, sitemap/llms exposed, CMS-backed. | Needs filters/categories to avoid one flat list. | Positive; safest route. | Low now, medium after taxonomy. | Low. | Use now. | 0-1 |
| Add query filters to `/articles` | Easy UI iteration. | Current canonical collapses category intent; weak for footer. | Limited. | Low. | Medium duplicate/canonical risk. | Do not use as footer targets. | 3 |
| Real `/articles/category/[slug]` routes | Clear SEO category pages. | Requires CMS category authority, metadata, sitemap, hreflang. | Strong when inventory exists. | Medium. | Medium. | Build later. | 3 |
| Standalone `/blog` | Brand/editorial clarity. | Current route redirects; route would be thin without inventory. | Negative if launched too soon. | Medium. | Medium. | No now; revisit after inventory. | 6 |
| Standalone `/research` | High-trust IA. | No index route; needs evidence/review model. | Negative if thin or unreviewed. | High. | High. | No now; plan only. | 6-7 |
| Keep `/topics` as cluster hub | Live, CMS-backed, sitemap/llms exposed. | Needs more topic entries. | Strong. | Medium. | Low. | Use now. | 1-2 |
| Use `/career/guides` in footer | Good Chinese inventory and sitemap presence. | English inventory gap; sampled llms parity gap. | Mixed until EN fixed. | Low/medium. | Low route risk, medium content parity risk. | Conditional. | 2 sidecar |
| Use `/datasets/occupations/method` in Research footer | Real page and backend API. | Not in sitemap/llms; review and hub missing. | Premature. | Medium. | Medium. | Hold. | 7 |
| Use `/method-boundaries` in Research footer | Stable trust page. | Frozen policy group; duplicate IA. | Could confuse governance. | Low. | Medium. | Requires approval. | 7 |

## Cluster Taxonomy

| Cluster | Primary route now | Supporting routes | Notes |
|---|---|---|---|
| MBTI | `/topics/mbti`, MBTI test page, `/articles` | Personality hub, career guides | Keep official-product boundary clear. |
| Big Five | Big Five test page, `/articles` | Future topic page, method notes | Needs topic hub and cautious career framing. |
| RIASEC | RIASEC test page, `/articles` | Career hub, career guides, technical note | Keep as interest-direction content, not outcome authority. |
| Enneagram | Enneagram test page, `/articles` | Future topic page | Keep explainers and interpretation guides. |
| EQ | EQ test page, `/articles` | Future topic page | Avoid clinical or workplace-screening framing. |
| Career choice | `/career`, `/career/jobs`, `/career/guides` | Articles, topics | 1046 detail SEO belongs to sitemap/detail pages, not footer. |
| Relationships | `/articles`, future topic | MBTI/personality related content | Avoid deterministic compatibility claims. |
| Methods and boundaries | `/method-boundaries`, technical notes | Future method hub | Requires review and discoverability alignment. |

## Footer Eligibility Rule

A footer candidate is eligible only when all of the following are true:

1. Bilingual public route exists.
2. Both locales render non-thin visible content.
3. Backend/CMS authority exists.
4. Canonical and robots are stable.
5. Sitemap policy is aligned.
6. llms policy is either aligned or explicitly deferred as a sidecar.
7. It is not already frozen into Company or Terms and Policies unless approved.
8. It does not introduce sensitive-topic acquisition without review.

## Phased Roadmap

| Phase | Scope | Non-goals | Likely files later | CMS/backend dependency | Review requirement | Validation | Risk | Acceptance | Rollback |
|---|---|---|---|---|---|---|---|---|---|
| 0 | This scan/docs only. | Runtime changes. | Docs only. | None. | Strategy review. | Diff check and guarded phrase scan. | Low. | Docs approved. | Remove docs. |
| 1 | CMS taxonomy and content type planning. | Public route launch. | Backend CMS models/resources/docs. | High. | Product/SEO/content. | Schema/admin tests. | Medium. | Fields accepted and non-runtime. | Revert planning/schema PR. |
| 2 | Footer Articles current-safe links. | Research column. | Footer only if approved. | Route readiness. | SEO/product. | Footer link smoke, sitemap/llms check. | Medium because EN guides gap. | No broken/thin bilingual links. | Restore prior footer group. |
| 3 | Article category routes or canonical-safe filters. | Blog/research hubs. | App routes, CMS API filters, sitemap/llms. | Article category authority. | SEO/content. | Route/canonical/hreflang tests. | Medium. | Real category pages. | Remove category route exposure. |
| 4 | Blog-style model inside Articles. | `/blog` route. | CMS fields/admin, article filters. | Content family field. | Editorial. | CMS/API contract tests. | Low. | Journal notes distinguishable in CMS. | Hide family/filter. |
| 5 | Research-style longform inside Articles. | `/research` route. | CMS evidence fields, review gates. | Evidence/reviewer/citations. | Required. | Claim and discoverability gates. | Medium/high. | Monthly insight can publish safely. | Unpublish/revert exposure. |
| 6 | Dedicated `/blog` or `/research` only after inventory. | Empty hubs. | Routes, sitemap/llms, nav/footer. | Sufficient records. | Required. | Full SEO smoke. | High. | Bilingual index with inventory. | Redirect to `/articles`. |
| 7 | Method/research hub. | Thin science page. | Routes, content pages/topics. | Method records and review. | Required. | Evidence and route checks. | High. | Hub has enough reviewed pages. | Remove hub exposure. |
| 8 | SEO ops dashboard/calendar. | Search submission automation. | CMS ops/admin, analytics docs. | GA/Search data integration. | Ops. | Dashboard QA. | Medium. | Refresh queue and smoke checklist. | Disable dashboard/module. |
