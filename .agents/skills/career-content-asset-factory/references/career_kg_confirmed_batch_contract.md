# Career KG Confirmed Batch Contract

This contract starts after the operator has already inspected GSC and chosen a
small batch of career occupations. It does not define a crawler, ranker, or
Search Console importer.

## Input Authority

The operator owns:

- GSC scan and page/query review.
- P0/P1/P2 prioritization.
- Final batch size, normally 10-20 occupations.
- Occupation focus notes such as title/meta CTR, FAQ, adjacent careers, tools,
  risk, AI boundaries, or identity cleanup.

The agent owns only the downstream dry-run package workflow:

1. Validate a confirmed batch file.
2. Generate or validate a career KG dry-run package per occupation.
3. Keep search projection candidates outside reader assets.
4. Generate PR-train patch artifacts when requested.
5. Stop before CMS writes, staging writes, production import, SEO runtime
   release, or provider submission.

## Confirmed Batch Shape

Each batch must use `career_kg_confirmed_batch.schema.json`.

Required top-level fields:

- `schema_version`: `fermatmind.career_kg.confirmed_batch.v1`
- `batch_id`: stable run id, for example `career-kg-2026-07-xx`
- `source`: `operator_confirmed`
- `cms_write_authorized`: always `false`
- `production_import_authorized`: always `false`
- `seo_runtime_release_authorized`: always `false`
- `items`: 1-20 confirmed occupations

Each item must include:

- `pr_id`: future one-occupation PR id, for example `PR-CAREER-KG-18`
- `priority`: `P0`, `P1`, or `P2`
- `slug`: canonical career job slug
- `locale`: currently `zh-CN`
- `focus`: one or more allowed focus lanes
- `gsc_summary`: bounded operator-provided summary only

`gsc_summary` is an opportunity signal. It is not a source of occupational
facts and must not be used as reader-facing evidence.

## Output Package Shape

Each generated package must use `career_kg_asset_package.schema.json` and must
remain dry-run-only:

- `production_import_approved`: `false`
- `staging_write_approved`: `false`
- `cms_write_performed`: `false`
- `seo_runtime_release_performed`: `false`
- `search_projection_file`: optional candidate-only file

Reader assets may include candidate title/meta text only as package proposals.
They must not include runtime controls such as canonical mutation, noindex,
sitemap, llms, JSON-LD release flags, or search-provider submission state.

## Source Boundary

Occupation facts must trace to approved authorities such as O*NET, BLS OOH/OEWS,
and My Next Move. Chinese recruiting or encyclopedia pages may inform market or
search intent notes only; they must not become career fact authority.

## Explicit Non-Goals

This contract does not authorize:

- CMS save, publish, import, or production DB writes.
- Staging preview writes.
- Sitemap, `llms.txt`, canonical, noindex, robots, JSON-LD, schema, hreflang,
  redirect, or runtime SEO changes.
- Search provider submission, GSC Request Indexing, Baidu push, or IndexNow.
- Production deploy, manual deploy, cache purge, or server mutation.
