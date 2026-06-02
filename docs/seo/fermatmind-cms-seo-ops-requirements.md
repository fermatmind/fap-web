# FermatMind CMS SEO Ops Requirements

This document defines the operational requirements needed before FermatMind scales article, journal, method, and research-style content.

## CMS Field Audit

| Field need | Existing? | Current source | Needed for SEO article? | Needed for blog-style content? | Needed for research-style longform? | Needed for method page? | Recommendation |
|---|---|---|---|---|---|---|---|
| `content_type` / content family | Partial | `articles.voice` exists; research has `research_type`; no unified family field. | Yes | Yes | Yes | Yes | Add unified content family field or map existing fields through a content ops contract. |
| Category | Yes | `article_categories`, `category_id`; career guide `category_slug`. | Yes | Yes | Yes | Optional | Keep; add route-ready category governance. |
| Topic | Partial | Topic profiles exist; article-to-topic relation not first-class. | Yes | Yes | Yes | Yes | Add related topics picker/relation. |
| Article type | Partial | `voice`, category, tags. | Yes | Yes | Yes | Optional | Formalize as content family. |
| Blog/journal flag | No dedicated field | Could use `voice`. | Optional | Yes | No | No | Add family enum; do not create route first. |
| Research/report flag | Partial | Research report model; no article-level research family. | No | No | Yes | Yes | Add evidence/review fields before route exposure. |
| Related tests | Yes partial | `related_test_slug` and `article_test_edges`. | Yes | Optional | Yes | Yes | Keep and expand to multi-select UI. |
| Related topics | Partial | Topic entry groups can link outward. | Yes | Yes | Yes | Yes | Add article-side relation. |
| Related result pages | Not public-ready | Private/result flows are noindex utility surfaces. | No | No | No | No | Do not add until public result guide authority exists. |
| Related articles | Partial | Career guide article map; topic entry groups. | Yes | Yes | Yes | Yes | Add article-to-article relation. |
| Related career guides | Partial | Career guide maps to articles; article side not first-class. | Yes | Optional | Yes | Optional | Add article-side relation. |
| Author | Yes partial | Article author name, admin author id. | Yes | Yes | Yes | Yes | Add author profile readiness before rich display. |
| Reviewer | Yes partial | Article reviewer name; research reviewer field. | Sensitive only | Optional | Required | Required | Add review completion gate. |
| Editor | Partial | admin users/revisions. | Yes internal | Yes internal | Yes internal | Yes internal | Use internal audit; public display optional. |
| Review required | Partial | Publish actions check editorial review in Filament. | Sensitive only | Optional | Required | Required | Expose as explicit field/gate. |
| Review completed | Partial | Editorial audit state. | Sensitive only | Optional | Required | Required | Make release/readiness visible. |
| Evidence level | No unified field | Some research fields. | Optional | No | Required | Required | Add enum. |
| Citation list | Partial | Research report references. | Optional | Optional | Required when cited | Required when cited | Add article-level structured citations. |
| Data source note | Partial | Research reports; dataset method API. | Optional | No | Required when data-informed | Required | Add field. |
| Methodology note | Partial | Research and dataset method surfaces. | Optional | No | Required | Required | Add field and review gate. |
| Reading time | Yes | Article field. | Yes | Yes | Yes | Optional | Keep. |
| Hero image | Yes | Media metadata. | Yes | Optional | Optional | Optional | Must use media authority, not new local assets. |
| Canonical URL | Yes | Article/topic/guide SEO meta. | Yes | Yes | Yes | Yes | Keep; validate against route family. |
| Meta title/description | Yes | SEO meta tables and services. | Yes | Yes | Yes | Yes | Keep. |
| Schema type | Partial | JSON-LD fields/services. | Yes | Yes | Yes | Yes | Restrict to visible-grounded schema. |
| Sitemap inclusion | Partial | Public/indexable fields and sitemap source. | Yes | Yes | Yes | Yes | Add explicit eligibility field for new families. |
| llms inclusion | Partial | frontend route logic and backend sitemap source. | Yes | Yes | Yes | Yes | Add explicit eligibility and evidence gating. |
| noindex flag | Yes | `is_indexable`, SEO robots. | Yes | Yes | Yes | Yes | Keep. |
| Publish state | Yes | status/is_public/published_at/revisions. | Yes | Yes | Yes | Yes | Keep. |
| Locale | Yes | locale fields. | Yes | Yes | Yes | Yes | Keep. |
| Source language | Partial | translation fields. | Yes | Yes | Yes | Yes | Keep and surface in ops. |
| Translation status | Yes partial | article translation contract. | Yes | Yes | Yes | Yes | Extend to topics/guides where needed. |
| Updated/reviewed timestamps | Partial | updated_at, last_reviewed_at for research. | Yes | Yes | Yes | Yes | Add review due and content decay fields. |

## SEO Ops Feature Requirements

| Feature | Needed for | Current support | Gap | Priority | Notes |
|---|---|---|---|---|---|
| Content family field | Separating evergreen, journal, insight, method, guide. | Partial via `voice` and separate research model. | No unified taxonomy. | P0 | First CMS planning PR. |
| Article category routes | Footer/category SEO. | Categories exist; routes absent. | No public indexable category route. | P1 | Do after taxonomy. |
| Topic taxonomy relation | Cluster depth. | Topics exist; article relation incomplete. | Article-side relation needed. | P0 | Connect `/articles` to `/topics`. |
| Related tests picker | Article-to-test links. | Partial. | Multi-test UI and safety levels. | P0 | Use `article_test_edges`. |
| Related topics picker | Cluster links. | Partial. | Dedicated picker missing. | P0 | Avoid hardcoded frontend links. |
| Related articles picker | Internal links. | Partial. | Article-side relation missing. | P1 | CMS-owned related modules. |
| Related career guides picker | Career/article bridges. | Partial. | Article-side relation missing. | P1 | Useful for career cluster. |
| Review required flag | Risk gating. | Partial via editorial workflow. | Not family-wide explicit. | P0 | Sensitive and research-style content. |
| Reviewer field | Public trust only when approved. | Partial. | Needs profile/readiness discipline. | P1 | Avoid invented credentials. |
| Evidence level | Research/method boundaries. | Partial. | Missing article-level enum. | P0 | Blocks `/research`. |
| Citation list | Research/method notes. | Partial. | Article-level structured citations missing. | P1 | Required for externally sourced claims. |
| Data source note | Data-informed longform. | Partial. | Not article-level. | P1 | Required before data-informed labeling. |
| llms inclusion toggle | GEO governance. | Partial through code/route policy. | CMS eligibility missing. | P1 | Do not rely on frontend inference. |
| Sitemap inclusion toggle | Discoverability governance. | Partial through indexability and generator. | Explicit family-level policy missing. | P1 | Needed for category/research routes. |
| Canonical override | SEO meta. | Yes. | Needs route-family validation. | P2 | Keep but validate. |
| Noindex toggle | Risk control. | Yes. | Needs workflow visibility. | P0 | Must block sensitive surprises. |
| Translation workflow | ZH/EN parity. | Articles partial. | Extend expectations across families. | P1 | Required before route splits. |
| Author profile | E-E-A-T surface. | Partial string field. | Profile governance missing. | P2 | Do not invent credentials. |
| Editor profile | Internal ops. | Partial audit. | Public display not needed now. | P3 | Keep internal. |
| Content decay tracking | Refresh operations. | Not explicit. | Missing due dates and refresh state. | P1 | Needed after 50+ articles. |
| Refresh queue | Long-term SEO quality. | Not explicit. | Missing ops queue. | P1 | Helps avoid stale content. |
| Search/analytics tagging | Measurement. | Some analytics surfaces. | Content-level campaign taxonomy missing. | P2 | Read-only until ops approved. |
| Publish checklist | Safe release. | Partial Filament actions. | Needs family-specific gates. | P0 | Prevents thin route exposure. |
| Post-publish smoke | Runtime QA. | Manual today. | Needs checklist. | P0 | Status, canonical, robots, sitemap, llms. |
| Footer eligibility flag | Footer governance. | No. | Missing. | P1 | Link only stable bilingual hubs. |
| Research route readiness flag | `/research` launch gate. | No. | Missing. | P1 | Prevents thin hub launch. |

## SEO/GEO/LLM Discoverability Rules

| Content type | Sitemap | llms.txt | llms-full | Footer | Homepage | Schema | Review gate |
|---|---|---|---|---|---|---|---|
| Ordinary SEO article | Include when public/indexable/published. | Include if summary and canonical are safe. | Include if visible content and boundary policy pass. | Index only, not individual article by default. | Eligible if selected by CMS. | Article + BreadcrumbList. | Standard; sensitive escalates. |
| Blog-style post | Same as article. | Same as article. | Same as article unless thin. | No until `/blog` route exists. | Limited. | Article. | Editorial. |
| Research-style longform | Include only after review. | Include only after review. | Include only after evidence/boundary fields. | No until `/research` index exists. | Rare. | Article; dataset-like schema only with real dataset authority. | Required. |
| Method/boundary page | Include if public and approved. | Include after review and visible boundary copy. | Include after evidence/source note. | Frozen group unless approved. | No by default. | WebPage or Article. | Required. |
| Topic page | Include when public/indexable. | Include when entries are grounded. | Include if sections and entry groups are complete. | `/topics` footer-safe. | Eligible. | WebPage + BreadcrumbList. | Sensitive topics require review. |
| Article category page | Include after real route and enough inventory. | Include after category authority. | Include only if useful summaries exist. | Eligible only after route launch. | Optional. | CollectionPage. | Category-specific. |
| Private/result/support utility page | Exclude. | Exclude. | Exclude. | Exclude except safe support pages. | Exclude. | None or noindex utility. | N/A. |
| Clinical-sensitive content | Exclude until explicit review decision. | Exclude until explicit review decision. | Exclude until explicit review decision. | Exclude. | Exclude. | Conservative only. | Required. |
| Ability-sensitive content | Include only under existing approved authority. | Include only if boundary policy passes. | Include only with visible limits. | Do not expand via footer. | Rare. | Conservative only. | Required. |
| Career-sensitive content | Include when backend claim permissions and public cohort gates pass. | Include when sitemap authority agrees. | Include when no heavy fanout and boundaries are visible. | Hubs only, not full detail directory. | Eligible by CMS. | WebPage/Article as supported. | Career claim review. |

## Publish Checklist

Before a new article, journal note, insight, or method note is public/indexable:

1. Public record has locale, slug, title, excerpt, body, publish state, and canonical.
2. Content family and cluster are set.
3. Related tests/topics/articles/guides are selected from backend authority.
4. Sensitive-topic flag is reviewed.
5. Evidence level matches the label.
6. Review-required content has reviewer completion.
7. No unsupported outcome, clinical, employment-screening, salary, or ability authority claims.
8. Sitemap and llms eligibility are explicit.
9. Hreflang and canonical targets are valid.
10. Runtime smoke checks pass for status, title, H1, robots, canonical, and visible body.

## Post-Publish Smoke

Minimum checks:

- `GET /{locale}/articles/{slug}` returns 200.
- No 404 title/body/metadata.
- Canonical self-points to approved localized URL.
- Robots policy matches CMS indexability.
- Hreflang pair exists when counterpart is published.
- Sitemap inclusion matches eligibility.
- llms inclusion matches eligibility.
- Related modules use backend/CMS data only.
- No private/result/order/checkout/report/share URL is exposed.
- Sensitive content remains excluded unless review explicitly approved.

## First PR Recommendation

`SEO-CONTENT-OPS-CMS-TAXONOMY-PLANNING-01`

Recommended scope:

- Add a backend/CMS requirements document or schema plan for content family, evidence, related content, and discoverability flags.
- Confirm whether fields should be implemented on `articles` first or via a shared content operations table.
- No public route, footer, sitemap, llms, or article copy changes.

Validation later:

- Backend model/resource tests if fields are implemented.
- API contract tests for no public response change unless approved.
- Claim guard tests for generated docs and runtime-adjacent copy.
- Sitemap/llms no-widening tests if eligibility fields are introduced but not activated.
