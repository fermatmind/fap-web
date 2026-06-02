# Footer Articles and Research Column Plan

This plan incorporates `docs/ux/footer-v2-articles-research-specialized-scan.md` and updates it with current production evidence from 2026-06-02.

No footer implementation was changed.

## Frozen Footer Areas

Do not modify in this workstream:

- Company column.
- Terms and Policies column.
- Tests group.
- Header.
- Social icons.
- Legal bar.

## Current Footer State

`components/layout/SiteFooter.tsx` currently renders:

- Tests: all tests, MBTI, Big Five, Enneagram, RIASEC, IQ, EQ.
- Articles: `/articles`, `/personality`, `/career`.
- Company: about, brand, charter, foundation, careers.
- Terms and Policies: support, privacy, terms, policies, method boundaries.

Issue:

- The Articles group duplicates header-level product hubs and labels `/personality` and `/career` as content links, even though they are not article category routes.

## Current-Safe Articles Decision

| Candidate | Current route | Status | Indexable? | CMS/backend authority? | Thin risk | Review required? | Header duplicate? | Recommendation |
|---|---|---|---|---|---|---|---|---|
| All articles | `/articles` | 200 zh/en | Yes | Yes, `/v0.5/articles` | Low | Standard editorial | Header already has Articles | add_now |
| Topics | `/topics` | 200 zh/en | Yes | Yes, `/v0.5/topics` | Low/medium depending topic count | Topic-sensitive review if needed | Not top-level header | add_now |
| Career guides | `/career/guides` | 200 zh/en | Yes | Yes, `/v0.5/career-guides` | Medium: zh has 20 guide links; en sampled 0 guide links | Career claim review | Header career dropdown includes it | hold_until_cms_ready for bilingual footer; add_now only if locale-aware gating is approved |
| Personality articles | no dedicated article category route | N/A | N/A | Article categories exist, route absent | High if mapped to `/personality` | Standard editorial | `/personality` is header hub | hold_until_route_exists |
| Career articles | no dedicated article category route | N/A | N/A | Article categories exist, route absent | High if mapped to `/career` | Career review if needed | `/career` is header hub | hold_until_route_exists |
| Assessment guides | no dedicated route | N/A | N/A | No dedicated public route confirmed | High | Product/SEO | Would duplicate tests/articles | hold_until_route_exists |
| Blog | `/blog` redirects to `/articles` | 308 | No direct page | No separate authority | N/A | Editorial | No | do_not_add |

Recommended current Articles footer for a bilingual global footer:

1. `/articles`
2. `/topics`

Optional third link:

- `/career/guides` only after one of these is true:
  - English CMS guide inventory is populated and route shows real guide cards.
  - Footer rendering gates the link by locale/inventory and Product/SEO accepts locale asymmetry.

Do not place 1046 career detail links, random occupations, or full job directory slices in the footer. Career detail SEO should be carried by sitemap, job detail pages, and the career directory, not global footer links.

## Current-Safe Research Decision

| Research candidate | Current route | Status | Indexable? | CMS/backend authority? | Thin risk | Review required? | Header duplicate? | Recommendation |
|---|---|---|---|---|---|---|---|---|
| Research index | `/research` | 404 zh/en | No | No index authority | High | Required | No | hold_until_route_exists |
| Research detail | `/research/[slug]` | route exists | Record-gated | Partial detail API | High without index | Required | No | hold_until_route_exists |
| Method boundaries | `/method-boundaries` | 200 zh/en | Yes | Content page | Low | Already trust/policy reviewed | Terms group | duplicate_requires_approval |
| Occupations dataset method | `/datasets/occupations/method` | 200 zh/en | Yes | Backend dataset method API | Medium because sitemap/llms absent | Data/product review | No | hold_until_discoverability_aligned |
| RIASEC technical note | scale technical-note path | 200 zh/en | Not sitemap-listed | Scale technical note | Medium | Product/method review | No | hold_until_discoverability_aligned |
| Business and research use | `/help/for-business-and-research` | 200 zh/en | Yes | Help/content page | Medium as Research label | Product/legal review | Help area | hold_until_discoverability_aligned |

Recommended current Research footer links:

- None.

Alternative only with explicit Product/SEO approval:

- Keep Method Boundaries in Terms and Policies and do not duplicate it.
- If duplicated later, label it as methods/boundaries, not Research.

## Future Articles Backlog

| Backlog item | Required authority | Why it waits |
|---|---|---|
| Blog route | Real bilingual `/blog` index, content family, inventory, metadata, sitemap policy. | Current route redirects. |
| Article category routes | Category route, canonical, sitemap, llms, hreflang, enough records. | Current categories have no public route. |
| Personality articles | Article category route or topic cluster. | `/personality` is a product/type hub, not article category. |
| Career articles | Article category route or career guide parity. | `/career` is product career hub, not article category. |
| Assessment guides | CMS category/guide route and review gates. | No confirmed guide/category route. |
| Relationship/growth category | Category route and enough records. | Prevent thin category launch. |

## Future Research Backlog

| Backlog item | Required authority | Footer readiness condition |
|---|---|---|
| `/research` index | Route, bilingual metadata, inventory, CMS/API list, sitemap, llms. | At least several reviewed records per locale. |
| Research notes | Evidence level, citations/source note, reviewer, claim boundary. | Approved content family and review gate. |
| Assessment methods | Method note family and test authority. | Review and discoverability alignment. |
| Dimension mechanics | Test-specific method authority. | Visible evidence and safe wording. |
| Norms/scoring | Backend authority and review. | No ability or outcome overreach. |
| Model boundaries | Content page/topic/article authority. | Product/SEO review. |
| Big Five method | Method note route/content. | Review and related test authority. |
| RIASEC method | Existing technical note plus sitemap/llms decision. | Discoverability alignment. |
| MBTI boundaries | Method/article/topic authority. | Official-product boundary clear. |
| Occupations dataset method | Existing page plus sitemap/llms alignment. | Data/product review and hub placement. |

## Proposed Footer V2 IA

Do not implement until approved.

Articles / 内容:

- Articles / 全部文章 -> `/articles`
- Topics / 主题 -> `/topics`
- Career guides / 职业指南 -> `/career/guides` only after EN parity or locale-aware gating approval

Research / 方法:

- No column now.
- Future column only after `/research` or method hub exists.

## Implementation Guardrails

If a footer PR is authorized later:

1. Do not modify Company or Terms and Policies columns.
2. Do not add `/blog`.
3. Do not add `/research`.
4. Do not map `/personality` to "personality articles".
5. Do not map `/career` to "career articles".
6. Do not add query-string article categories.
7. Do not add dataset/method technical pages until sitemap/llms alignment is approved.
8. Do not add career detail links.
9. Do not add any sensitive-topic acquisition link.
10. Keep all labels concise and route-accurate.

## Acceptance Criteria For A Future Footer PR

- Every footer link is localized.
- Every linked route returns 200 with real visible content in the target locale.
- Canonical and robots are correct.
- Sitemap exposure is intentional.
- llms exposure is either aligned or recorded as a sidecar.
- No 404, redirect-only, noindex, private, clinical-sensitive, result/order/report/share, or thin route is linked.
- EN and ZH footer structures are intentionally symmetrical or explicitly gated.

## Current Recommendation

Do not ship a Research footer column now.

For Articles, implement only after deciding whether `/career/guides` should wait for English CMS parity. The safest immediate bilingual Articles group is:

- `/articles`
- `/topics`

The more complete group is:

- `/articles`
- `/topics`
- `/career/guides`

but only after the English guide inventory gap is resolved or Product/SEO approves locale-aware gating.
