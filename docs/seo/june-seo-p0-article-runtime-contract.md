# June SEO P0 Article Runtime Contract

PR-SEO-JUNE-03 locks article detail pages to backend/CMS-provided runtime SEO assets. The frontend may render article structure, but it must not invent product SEO completeness signals when CMS fields are absent.

## Contract states

Each article runtime feature is classified by `resolveArticleRuntimeContract` in `lib/cms/articles.ts`:

- `backend_cms_provided`: the feature exists in the article, landing surface, or answer surface API payload.
- `missing_deferred`: the feature is not currently present in the backend/CMS contract.

Every feature has `frontendFallbackPolicy: "forbidden_frontend_fallback"`.

## Runtime features

| Feature | Backend/CMS source | Frontend behavior |
| --- | --- | --- |
| Visible FAQ | `answer_surface_v1.faq_blocks` | Render visible FAQ and FAQPage JSON-LD only when question and answer are visible. |
| Visible CTA | `landing_surface_v1.cta_bundle` or `answer_surface_v1.next_step_blocks` | Render existing CMS CTAs only. Do not local-fallback CTA copy or hrefs. |
| Related test | `related_test_slug`, `landing_surface_v1.start_test_target`, or answer/landing test CTA | Use backend/CMS test references only. |
| Related topic | `landing_surface_v1` or `answer_surface_v1` topic links/keys | Use backend/CMS topic links only. Do not infer from tags. |
| Related articles | Deferred backend contract | Do not fabricate local related article lists. |
| Evidence/citation | Visible answer surface content plus `answer_surface_v1.evidence_refs` | Treat as evidence-ready only when both visible content and backend refs exist. |
| Report preview | Deferred backend contract | Do not render local report previews. |
| Claim boundary metadata | Deferred backend contract | Do not invent article-level claim metadata in the frontend. |

## Boundaries

- Article body, SEO, landing surface, answer surface, FAQ, CTA, and evidence signals remain backend/CMS authoritative.
- Missing fields stay missing or deferred; empty CMS responses do not become local editorial copy.
- Related content slots may render only when backend/CMS provides items through a future explicit contract.
- This PR does not expand sitemap, llms, page routes, article content, pSEO, recommendation, report, scoring, checkout, or payment behavior.
