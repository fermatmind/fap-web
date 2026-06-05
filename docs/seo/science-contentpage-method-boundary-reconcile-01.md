# SCIENCE-CONTENTPAGE-METHOD-BOUNDARY-RECONCILE-01

Date: 2026-06-05
Mode: read-only reconciliation + docs-only PR
Branch: `codex/science-method-boundary-reconcile-01`

This report reconciles the existing public `/method-boundaries` authority page with draft package page `METHOD-BOUNDARY-CONTENT-01`. It does not modify CMS records, import content, create routes, publish content, or change sitemap, robots, llms, schema, metadata, canonical, footer, header, deployment, or runtime behavior.

## Decision

**CONDITIONAL / revision proposal only.** `METHOD-BOUNDARY-CONTENT-01` must not create a new `ContentPage`. The existing `/method-boundaries` page remains the authority. The draft can be used only as a reconciliation input for a future CMS working revision after field mapping, claim lint, and science/legal review.

Final status label: `method_boundary_reconcile_completed_ready_for_review`

## 1. Current authority summary

Public checks against `https://fermatmind.com` and `https://api.fermatmind.com` showed:

| Surface | zh | en | Notes |
|---|---|---|---|
| Route status | 200 | 200 | `/zh/method-boundaries`, `/en/method-boundaries` are live. |
| Canonical | `https://fermatmind.com/zh/method-boundaries` | `https://fermatmind.com/en/method-boundaries` | Current frontend canonical is self-referential. |
| Robots | `index, follow` | `index, follow` | Current page is indexable. |
| Sitemap presence | Yes | Yes | Route is included in production sitemap. |
| llms presence | No | No | Not found in `llms.txt` or `llms-full.txt` checks. |
| Footer presence | Not found on checked zh homepage path | Found on checked en homepage path | Footer exposure should be verified in a dedicated footer QA pass before any nav change. |
| JSON-LD | WebPage + BreadcrumbList | WebPage + BreadcrumbList | Generic ContentPage route does not emit FAQPage. |
| ContentPage source | Confirmed | Confirmed | Public API returns `ok=true` for `method-boundaries`. |

Current public API record summary:

| Locale | slug | kind | page_type | status | review_state | is_public | is_indexable | review flags |
|---|---|---|---|---|---|---:|---:|---|
| `zh-CN` | `method-boundaries` | `policy` | `boundary` | `published` | `approved` | true | true | legal=false, science=false |
| `en` | `method-boundaries` | `policy` | `boundary` | `published` | `approved` | true | true | legal=false, science=false |

Current frontend authority:
- `app/(localized)/[locale]/method-boundaries/page.tsx` is a thin wrapper over shared `contentPageRoute`.
- Shared `contentPageRoute` reads CMS ContentPage through `getContentPageWithLastKnownGood`.
- Missing CMS records resolve to notFound/noindex behavior.
- Non-indexable CMS records use the existing metadata noindex path.
- Generic ContentPage pages emit WebPage and BreadcrumbList JSON-LD only.

## 2. Draft summary

Draft source: `/Users/rainie/Desktop/science_contentpage_cms_draft_package 2/pages/02-method-boundary-content-01.md`

| Field | Draft value |
|---|---|
| `page_key` | `METHOD-BOUNDARY-CONTENT-01` |
| `proposed_slug` | `/method-boundaries` |
| `fallback_slug_if_nested_route_not_supported` | `/method-boundaries` |
| `page_type` | `boundary` |
| `kind` | `trust_methodology_boundary` |
| `review_state` | `science_review` |
| `science_review_required` | true |
| `legal_review_required` | true |
| `is_public` | false |
| `is_indexable` | false |
| `sitemap_eligible` | false |
| `llms_eligible` | false |
| `footer_eligible` | false |

The draft contains visible FAQ-style items, claim boundary notes, reviewer checklist items, allowed public internal links, forbidden private routes, and explicit publish blockers.

## 3. Conflict matrix

| Area | Existing `/method-boundaries` | Draft `METHOD-BOUNDARY` | Conflict? | Recommendation |
|---|---|---|---:|---|
| Title | Current API title is "测评方法与使用边界" / "Assessment Method and Boundaries". | Draft title is "方法边界" / "Method Boundaries". | Yes | Do not replace title automatically; treat as editorial review item. |
| H1 | Current production H1 follows current API title. | Draft H1 follows shorter draft title. | Yes | Reconcile in CMS revision only after review. |
| Route | Root route exists and is live. | Same root route requested. | Yes | Existing route remains authority; no duplicate route or nested route. |
| `page_type` | `boundary`. | `boundary`. | No | Compatible. |
| `kind` | `policy`. | `trust_methodology_boundary`. | Yes | Draft kind is incompatible with current backend validation; map to `policy` or defer enum extension. |
| `review_state` | `approved`. | `science_review`. | Yes | Draft is not publishable; use as working revision candidate only. |
| Review flags | legal=false, science=false. | legal=true, science=true. | Yes | Preserve draft flags as review requirements for any future revision. |
| Body scope | Current page is approved and published. | Draft expands/changes boundary explanation and FAQ-style blocks. | Yes | Compare section-by-section in CMS review; do not overwrite live body in this PR. |
| FAQ items | No FAQPage schema on generic route; current visible FAQ state not asserted here. | Draft includes visible FAQ-style items. | Conditional | Keep visible FAQ as body review input only; do not create FAQ schema. |
| Claim boundaries | Current page has approved boundary posture. | Draft adds explicit high-risk usage boundaries and private-route blocks. | Partial | Useful as review input; claim lint must pass before publication. |
| Internal links | Current page links are CMS-authored. | Draft allows only public canonical routes. | Conditional | Verify every link is public canonical before any CMS revision publish. |
| Discoverability | Current page is public, indexable, and in sitemap; not in llms checks. | Draft sets public/indexable/sitemap/llms/footer to false. | Yes | Do not change discoverability automatically. Existing live behavior remains unchanged until explicit publish decision. |

## 4. Merge strategy

Classify `METHOD-BOUNDARY-CONTENT-01` as:

| Classification | Decision |
|---|---|
| Revision proposal | Yes |
| Supplemental section proposal | Possible after content review |
| Rejected duplicate | Yes for any new `ContentPage` creation |
| Pending science/legal review | Yes |
| Blocked until field mapping | Yes for direct import |

The draft is not rejected as editorial input. It is rejected as a new page or direct replacement.

## 5. Safe CMS workflow

Required workflow for any future CMS action:

1. Keep existing `/method-boundaries` as the only authority record.
2. Do not create `/science/method-boundaries`.
3. Do not create another root `/method-boundaries` record.
4. Treat draft content as a proposed working revision or merge-note package.
5. Normalize unsupported draft `kind` to current `policy` unless a future backend enum extension is approved.
6. Preserve science/legal review requirements for the revision.
7. Keep current `is_public`, `is_indexable`, sitemap, llms, canonical, footer, and route behavior unchanged until explicit publish approval.
8. Run claim lint and private-route lint before publication.
9. Run route QA after any approved CMS revision publication.

## 6. Claim lint checklist

Any future revision must keep these blocks:

- No medical, clinical, diagnosis, treatment, care-path, or crisis-support authority framing.
- No employment, hiring, firing, promotion, admissions, eligibility, or screening authority framing.
- No career outcome guarantee or deterministic career recommendation.
- No ability/IQ authority expansion.
- No private result, order, share, payment, checkout, history, tokenized, or user-specific route.
- No invented evidence, unpublished validation metric, norm table, sample claim, or external endorsement.
- No competitor attack or imitation framing.
- No FAQ schema unless the visible-content schema gate is separately implemented and approved.

## 7. Next task recommendation

Recommended next task: **CMS field mapping follow-up / importer normalization**, then **method-boundaries CMS reconciliation**.

Reason:
- Current backend field mapping PR recommends normalizing science/trust draft `kind` values to `policy`.
- `/method-boundaries` must not be imported as a new page.
- A dedicated reconciliation pass should compare current CMS markdown with the draft body and produce operator review notes before any CMS write.

Do not run route wrappers before `/method-boundaries` reconciliation; this page already has a route.

## 8. Validation

Validation required for this docs-only PR:

```bash
git diff --check -- docs/seo/science-contentpage-method-boundary-reconcile-01.md
rg -n "clinical diagnosis|medical diagnosis|career guarantee|hiring guarantee|best job|最适合|精准职业匹配|AggregateRating|Product|Offer|FAQPage schema enabled|is_public: true|is_indexable: true|sitemap_eligible: true|llms_eligible: true|footer_eligible: true" docs/seo/science-contentpage-method-boundary-reconcile-01.md
git diff --name-only origin/main..HEAD
```

Runtime commands such as `pnpm typecheck`, production build, or contract suites are not applicable to this docs-only reconciliation PR because no application code, CMS adapter, route, schema, sitemap, llms, footer, header, or runtime file changed.

## 9. Final decision table

| Gate | Decision | Reason |
|---|---|---|
| Existing authority confirmed | GO | Production and API checks confirm `/method-boundaries` is live CMS authority. |
| Duplicate page creation | NO-GO | Existing route and CMS record already own the slug. |
| Direct draft import | NO-GO | Existing authority conflict plus incompatible draft `kind`. |
| CMS working revision | CONDITIONAL | Allowed only after field normalization, claim lint, science/legal review, and operator approval. |
| Route changes | NO-GO | Existing route wrapper must remain unchanged. |
| Sitemap/llms/footer changes | NO-GO | Current discoverability must not be changed by this reconciliation. |
| FAQ schema | NO-GO | Generic ContentPage route has no FAQPage schema gate for this page. |
| Next train item | GO after merge | Proceed to field/import normalization or dedicated CMS reconcile implementation planning. |

