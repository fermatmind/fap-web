# GSC Manual Inspection Readiness

Use this workflow when the operator wants to inspect Google Search Console
readiness, or when a full-chain release goal explicitly preauthorizes manual
Request Indexing for the target canonical URLs.

## Inputs

- URL.
- public runtime evidence.
- current robots/canonical/schema/hreflang/sitemap/llms evidence.
- GSC screenshot/export if provided.
- resource/enhancement warning evidence if provided.

## Checks

| Area | Check |
|---|---|
| Public URL | HTTP 200, canonical route, intended robots state. |
| Indexability | Page is indexable only if operator released it. |
| Sitemap | Inclusion matches sitemap eligibility. |
| Schema | JSON-LD presence matches schema gate. |
| Hreflang | alternate/x-default presence matches hreflang gate. |
| Request Indexing | Readiness is read-only unless the URL has separate exact Request Indexing approval or `allow_gsc_manual_request_indexing=true` with an exact target canonical URL match. |
| FAQ enhancement | Warning reviewed; do not enable FAQ schema as a reflex. |
| Crawled page resources | Missing resources classified; social image placeholder blocks search readiness. |
| Private URL | No result/order/payment/share/history/take/token/ID leak. |

## Decisions

- `GO_FOR_MANUAL_GSC_INSPECTION`.
- `GO_FOR_GSC_REQUEST_INDEXING`.
- `GO_FOR_GSC_OBSERVATION_ONLY`.
- `NO_GO_GSC_WARNING_BLOCKED`.
- `ACCESS_REQUIRED`.

## Output

Use `assets/gsc_manual_inspection_readiness_template.md`.

## Hard gates

Do not request indexing, submit sitemap, click live GSC actions, change CMS, or
change runtime behavior unless the current full-chain Authorization Profile or a
separate exact approval lists the target canonical URL for Request Indexing.
Do not include GSC in IndexNow/Baidu bounded executor tasks.

Stop instead of requesting indexing when:

- the current GSC property does not match the target domain;
- the inspected URL differs from the preauthorized canonical URL;
- the public page is not 200/indexable;
- canonical/robots/private URL checks fail;
- Google shows a login, permission, CAPTCHA, or account-selection blocker;
- schema/hreflang enablement would be needed as part of this action.
