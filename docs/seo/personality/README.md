# Personality SEO And Asset Operations

This directory stores read-only personality SEO, GEO, GSC, content-asset, and import-readiness artifacts.

The current priority is the MBTI personality asset operations train. The train coordinates frontend rendering
readiness, non-production CMS review packages, backend import dry-runs, query evidence, and QA gates without
changing public runtime behavior or writing production CMS content.

## Current MBTI Asset State

Primary SOP artifact:

- `docs/seo/personality/mbti-asset-ops-09-personality-asset-sop-2026-07-04.json`
- `docs/seo/personality/mbti-asset-ops-09-personality-asset-sop-2026-07-04.md`
- `docs/seo/personality/mbti-asset-ops-09-personality-asset-sop-2026-07-04.csv`

| State | Count | Current status | Next PR | Required gate |
| --- | ---: | --- | --- | --- |
| Top10 profile assets | 10 | Non-production CMS review package ready | `MBTI-CMS-12` | fap-api profile import dry-run, schema mapping, approval |
| comparison20 assets | 20 | Non-production CMS review package ready | `MBTI-CMS-13` | fap-api comparison import dry-run, schema mapping, approval |
| remaining58 | 58 | Historical review input, pending stronger QA | `MBTI-QA-14` | semantic quality and duplicate-risk gate |
| Pending GSC query export | 10 URL targets | Pending manual/API query evidence | `MBTI-GSC-11` | real query evidence without credentials or Search Console mutation |
| Pending CMS import | 30 approved-review assets | Dry-run only, no production write | `MBTI-CMS-12` / `MBTI-CMS-13` | backend dry-run and operator approval |

## PR Route

| PR | Repo | Purpose | Produces |
| --- | --- | --- | --- |
| `MBTI-ASSET-OPS-09` | fap-web | Asset status overview and batch SOP | SOP artifact and train route |
| `MBTI-ASSET-SKILL-10` | fap-web | MBTI agent matrix and executable runbook update | GSC to QA to dry-run to promotion workflow |
| `MBTI-GSC-11` | fap-web | GSC query evidence export stabilization | query evidence packet for title/FAQ/answer-block decisions |
| `MBTI-CMS-12` | fap-api | Profile CMS import dry-run | profile schema and field-mapping report |
| `MBTI-CMS-13` | fap-api | Comparison CMS import dry-run | comparison schema and field-mapping report |
| `MBTI-QA-14` | fap-web | Semantic quality and duplicate-risk gate | remaining58 and comparison batch QA guard |

## Authority Boundaries

- fap-api CMS/public APIs remain the authority for personality profiles, comparison pages, and import shape.
- fap-web may render structures, generate audit artifacts, and validate contracts, but must not add frontend
  editorial fallback content for publishable personality pages.
- Production CMS writes, production imports, DB migrations, Search Console mutations, production deploys, and
  manual deploys are out of scope unless a later task provides exact authorization.
- Sitemap, `llms.txt`, canonical, noindex, and JSON-LD runtime changes require separate scoped authorization.
- Missing GSC query rows are pending evidence, not zero demand.

## Re-run OPS-09

```bash
node scripts/seo/build-mbti-asset-ops-09-personality-asset-sop.mjs
```

The script reads existing local artifacts only. It does not read credentials, call GSC APIs, write CMS content,
submit URLs, import data, deploy, or modify runtime behavior.

## Legacy Indexation Audit

The older indexation audit can still be re-run when needed:

```bash
AUDIT_DATE=2026-06-18 node scripts/seo/audit-personality-indexation.mjs
```

That script reads public production pages and public production exposure files:

- `https://fermatmind.com/sitemap.xml`
- `https://fermatmind.com/llms.txt`
- `https://fermatmind.com/llms-full.txt`
- MBTI A/T personality variant and A-vs-T comparison pages

It does not read private routes, use GSC credentials, submit URLs, import CMS content, or modify runtime behavior.

GSC metric fields are recorded as `Unknown` when credentials are unavailable. `Unknown` is not a pass or fail state.

## Exposure Matching

Sitemap exposure is based on exact normalized `<loc>` URL membership. `llms.txt` and `llms-full.txt` exposure are
based on exact normalized URL sets parsed from those files.

Substring matches are not used for the main exposure fields. For example, `/en/personality/intj-a` must not be
counted as exposed only because `/en/personality/intj-a-vs-intj-t` appears. Fuzzy diagnostic fields may be emitted
for investigation, but they do not affect the main `in_sitemap`, `in_llms`, or `in_llms_full` values.
