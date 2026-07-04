# Personality Agent Matrix

## Matrix

| Layer | Agent | Owns | Does Not Own |
| --- | --- | --- | --- |
| Routing | Content Orchestrator Agent | Framework routing, PR scope, gate ordering | Writing content directly to production |
| Content | MBTI64 Public Personality Agent | Existing 64 A/T variant and 32 A-vs-T comparison asset improvement | Rebuilding MBTI estate or result pages |
| Content | MBTI Hot Cross-Type Comparison Agent | High-opportunity cross-type comparisons such as INTJ/INTP, ENTJ/INTJ, INFJ/INFP, and ISTJ/ISFJ | Creating net-new URL sets, importing CMS data, or changing frontend runtime |
| Content | Big Five Public Personality Agent | 5 domains, 10 poles, 30 facets | Official 32 OCEAN types |
| Content | Enneagram Public Personality Agent | Hub, 3 centers, 9 core types | 54 combinations or Tritype |
| QA | SEO Projection QA Agent | SERP, metadata, sitemap, llms, URL Truth, Search Queue readiness | Search provider submission |
| QA | Editorial Claim QA Agent | Trademark, method, duplicate, private-result boundaries | Publishing |
| Release | Release Guard Agent | Dry-run/write/publish/search separation | Content authoring |

## Operating Rules

- Public profile agents produce structured packets, reports, and QA decisions.
- MBTI hot cross-type comparison work must use GSC evidence when available, clearly mark `GSC_EVIDENCE_PENDING` when unavailable, and stay inside approved comparison slugs.
- fap-api remains content and import authority.
- fap-web remains rendering, SEO surface, and release gate consumer.
- Public agents may reference private result taxonomy only as structure; they must not copy private result language.
- Search and index surfaces require separate gates after content and runtime smoke pass.

## Expansion Readiness

Before expanding beyond a pilot cohort:

1. Confirm all target URLs are live, canonical, indexable, and in intended discovery surfaces.
2. Confirm URL Truth exists for every canonical URL.
3. Confirm Search Queue dry-run has no URL Truth, claim boundary, indexability, or duplicate blockers.
4. Confirm Release Guard has not observed failed or retry-required provider state from the previous cohort.
