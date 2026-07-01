# Multi-Article Release Retro

Use this workflow for read-only retrospective scans after one or several SEO
articles have moved through content package generation, CMS import/update,
preview, publish, discoverability, Search Channel, and observation planning.

Default daily cadence is one article pair. Use the multi-article dimensions for
batch/exception days, but still report each article pair separately. A
successful two-article batch is not a reason to change the default daily SOP
away from one high-quality bilingual article.

## Inputs

Prefer current evidence in this order:

1. current public article API.
2. current public HTML.
3. public `sitemap.xml`, `llms.txt`, and `llms-full.txt`.
4. URL Truth evidence.
5. current Search Channel Queue item state.
6. provider response summaries.
7. GSC/Baidu platform evidence.
8. generated reports and old final summaries.

Old generated reports are inputs, not final truth.

## Required Dimensions

For each article, reconstruct:

- topic and title;
- `operation_type`;
- article ID;
- current published revision ID;
- target working revision ID when relevant;
- route and slug;
- package version or source;
- CMS import/update state;
- media asset state;
- preview QA;
- publish/public state;
- sitemap/llms/llms-full state;
- public HTTP status, self-canonical, and robots;
- CTA target routes and locked `content_id`;
- answer-surface FAQ state, including whether package-specific FAQ or generic FAQ rendered;
- URL Truth state;
- Search Channel queue state;
- IndexNow state;
- Baidu state;
- GSC state;
- schema state;
- hreflang state;
- D1/D7/D14 observation state;
- final classification.

Preferred final classification for a normal daily article is
`ARTICLE_RELEASE_COMPLETE_SEARCH_OBSERVATION_PENDING`. Provider-specific holds
such as Baidu quota, GSC login/CAPTCHA, or schema/hreflang holds must be
reported without redefining the content release as failed when public and
discoverability evidence are complete.

## Blocker Taxonomy

Classify blockers as:

- content package issue;
- route/canonical issue;
- article identity lock issue;
- image asset/Media Library issue;
- CMS draft import issue;
- existing article promote/publish issue;
- new article publish issue;
- preview QA issue;
- metadata issue;
- claim/editorial review issue;
- sitemap/llms issue;
- URL Truth issue;
- Search Channel queue issue;
- IndexNow issue;
- Baidu provider issue;
- GSC manual issue;
- schema issue;
- hreflang issue;
- deploy/runtime issue;
- skill/memo rule gap;
- operator authorization gap;
- batch workflow design gap.

## Stale Summary Handling

If old `FINAL_SUMMARY.md`, `FINAL_DECISION.md`, or generated reports conflict with current public/API/queue evidence:

- mark stale fields explicitly;
- prefer current runtime evidence;
- output `FINAL_SUMMARY_STALE_NEEDS_RECONCILIATION` until corrected.

## Output Recommendations

Produce:

- executive summary;
- per-article final state matrix;
- blocker taxonomy and root cause;
- daily pipeline automation gaps;
- hard-stop list;
- search batch policy retro;
- Baidu quota/retry plan;
- GSC manual lane plan;
- sitemap/llms/URL Truth retro;
- existing article promote retro;
- new article release retro;
- media asset pipeline retro;
- claim gate retro;
- schema/hreflang lane retro;
- D1/D7/D14 observation patch plan;
- next-topic feedback notes from D1/D7/D14, with missing metrics preserved as `Unknown`;
- answer-surface FAQ optimization recommendations;
- skill patch requirements;
- Mode C patch requirements;
- daily memo patch requirements;
- runtime tooling PR recommendations;
- next task instructions.

## Hard Boundaries

This workflow is read-only unless the user separately authorizes a bounded action. Do not mutate CMS, Media Library, Search Channel, provider state, schema, hreflang, revalidation, deploy, or PR state during the retro scan.
