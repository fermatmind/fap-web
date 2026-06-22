# Competitor Alternative Page Policy

Task: FA30-WEB-07

Status: planning policy only. This document does not create routes, public pages, CMS records, sitemap entries, llms entries, canonical changes, JSON-LD, search submissions, competitor fetches, or runtime behavior.

## Purpose

Future competitor or alternative pages may be useful only when they help readers compare assessment entry points, method boundaries, evidence state, pricing or access model, and public product fit without copying competitor content or making superiority claims.

The policy is conservative because alternative pages can easily become thin programmatic SEO, trademark-risk copy, or subjective ranking content.

## Allowed Page Families

| Page family | Allowed only if | Notes |
| --- | --- | --- |
| Category alternatives | A reviewed category exists, there is first-party FermatMind value, and the page explains selection criteria rather than ranking claims. | Example family: assessment alternatives by task or method. |
| Method comparison | The comparison is about public method boundaries and evidence state, not a claim that one provider is objectively better. | Requires claim review. |
| Product fit comparison | The page compares fit for use cases, access model, language, report depth, or audience. | Must use reviewed first-party facts and sanitized competitor observations. |
| Competitor-name page | Legal/trademark and claim review pass, competitor facts are sourced, and no affiliation or endorsement is implied. | Not allowed for MVP. |

## Forbidden Page Families

- N x N competitor pages.
- Auto-generated `best alternative to X` pages.
- Pages based on scraped descriptions, ratings, reviews, rankings, prices, or testimonials.
- Pages that copy competitor IA, wording, metadata, FAQs, screenshots, logos, or review claims.
- Pages that imply FermatMind is endorsed by or affiliated with a competitor.
- Pages that attack a competitor or make unverified superiority claims.
- Pages that create search pages before backend/CMS authority, legal review, and claim gates exist.

## Claim Boundary

Allowed:

- "This page compares public assessment entry points and method boundaries."
- "FermatMind focuses on these first-party features or constraints."
- "Use this as an exploration guide, not a definitive ranking."

Forbidden:

- "FermatMind is the best alternative to [competitor]."
- "More accurate than [competitor]."
- "Cheaper/better/faster unless a reviewed source proves the exact claim and legal review approves it."
- Any clinical, hiring, admission, salary, success, or deterministic outcome comparison.

## Data Boundary

Allowed sources:

- FermatMind first-party product facts.
- Backend/CMS reviewed public projections.
- Read-only competitor URL inventory as an advisory signal.
- Operator-reviewed public source notes.

Forbidden sources:

- Raw competitor scraped copy.
- Private dashboards, cookies, sessions, emails, or paywalled content.
- User reviews copied from third-party sites.
- Unverified pricing, ranking, ratings, review counts, or claims.

## SEO Boundary

- No alternative URL enters sitemap, llms, llms-full, robots allowlist, canonical map, hreflang map, or search submission until backend/CMS authority and legal/claim gates pass.
- No bulk programmatic expansion.
- Each page must have a clear reader job, a reviewed source ledger, and enough first-party substance to avoid thin content.
- Competitor URL inventory can suggest gaps, but it must not generate pages directly.

## Runtime Authority

- Future public copy must be backend/CMS authoritative.
- Frontend may render reviewed projections only.
- Frontend must not hardcode competitor comparison copy, competitor rankings, local fallback content, or alternative page data.
- Empty backend projections must render withheld or unavailable states rather than local editorial copy.

## MVP Decision

For the current 50-project MVP horizon, do not ship competitor-name alternative pages. The acceptable near-term path is:

- Keep this policy as a planning gate.
- Use competitor inventory only for internal gap analysis.
- Prefer category or task pages after backend authority exists.
- Require separate legal/claim review before any named competitor page.

## Negative Guarantees

This PR does not:

- Add competitor or alternative routes.
- Add public frontend content.
- Fetch competitor pages.
- Create CMS records.
- Submit search URLs.
- Change sitemap, llms, canonical, hreflang, robots, noindex, or JSON-LD output.
- Deploy.
