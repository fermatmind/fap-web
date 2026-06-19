# MBTI64 Global Header Private Route Hygiene

Date: 2026-06-19

## Scope

This frontend-only hygiene change removes the same-origin `/results/lookup` header CTA from public SEO page chrome. It targets the MBTI64 promoted-content smoke warning where public personality pages rendered the global account/result lookup entry in page HTML.

Covered public SEO route families:

- `/personality`
- `/articles`
- `/topics`
- `/career`
- `/tests`

Explicitly excluded product/private route families:

- `/tests/*/take`
- `/result`
- `/results`
- `/orders`
- `/payment`
- `/pay`
- `/history`
- `/account`
- `/share`

## Non-Goals

- No CMS content changes.
- No promoted MBTI64 body, FAQ, canonical, or metadata changes.
- No sitemap, `llms.txt`, `llms-full.txt`, search queue, or search submission changes.
- No backend changes.
- No footer social URL changes.

## Footer Social Share Classification

The footer Facebook URL contains an external `facebook.com/share/...` path. It is not a same-origin FermatMind `/share` route and is intentionally left unchanged in this PR. Post-deploy smoke should classify external social share URLs separately from same-origin private route exposure.

## Post-Deploy Smoke Expectation

After deploying this change, rerun `MBTI64-CMS-REVISION-PROMOTE-POST-WRITE-SMOKE-REVIEW-04` and verify:

- 8/8 MBTI64 pilot URLs return HTTP 200.
- promoted title, H1, body sections, and FAQ remain visible.
- canonical URLs remain stable.
- same-origin `/results/lookup` no longer appears in public personality page header HTML.
- sitemap, llms, and search queue surfaces do not change as a side effect.
