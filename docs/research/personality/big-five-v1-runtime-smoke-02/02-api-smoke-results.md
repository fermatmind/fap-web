# API Smoke Results

## Verdict

GO. Production API returns the expected Big Five V1 content-ready set and keeps every returned asset noindex/non-indexable.

## Environment

- API base: https://api.fermatmind.com
- Access date: 2026-06-15
- Backend deployed SHA verified earlier in this run: `f454c7b012a0e3a3bf365936746337e0f8e20f8e`
- Evidence type: live site evidence + API response evidence + code evidence.

## Summary

| Metric | Result |
| --- | --- |
| content_ready public readable assets | 34 |
| zh-CN content_ready assets | 17 |
| en content_ready assets | 17 |
| entity_type distribution | {"domain":10,"facet_hub":2,"hub":2,"polarity":20} |
| assets with bad index flags | 0 |
| minimum sections per asset | 11 |
| minimum FAQ per asset | 5 |

## Endpoint Checks

| check | status | count | ok | url |
| --- | --- | --- | --- | --- |
| list framework+locale zh-CN | 200 | 17 | yes | https://api.fermatmind.com/api/v0.5/personality-content-assets?framework=big_five&locale=zh-CN&org_id=0 |
| entity filter zh-CN hub | 200 | 1 | yes | https://api.fermatmind.com/api/v0.5/personality-content-assets?framework=big_five&locale=zh-CN&entity_type=hub&org_id=0 |
| entity filter zh-CN domain | 200 | 5 | yes | https://api.fermatmind.com/api/v0.5/personality-content-assets?framework=big_five&locale=zh-CN&entity_type=domain&org_id=0 |
| entity filter zh-CN polarity | 200 | 10 | yes | https://api.fermatmind.com/api/v0.5/personality-content-assets?framework=big_five&locale=zh-CN&entity_type=polarity&org_id=0 |
| entity filter zh-CN facet_hub | 200 | 1 | yes | https://api.fermatmind.com/api/v0.5/personality-content-assets?framework=big_five&locale=zh-CN&entity_type=facet_hub&org_id=0 |
| entity filter zh-CN facet | 200 | 0 | yes | https://api.fermatmind.com/api/v0.5/personality-content-assets?framework=big_five&locale=zh-CN&entity_type=facet&org_id=0 |
| list framework+locale en | 200 | 17 | yes | https://api.fermatmind.com/api/v0.5/personality-content-assets?framework=big_five&locale=en&org_id=0 |
| entity filter en hub | 200 | 1 | yes | https://api.fermatmind.com/api/v0.5/personality-content-assets?framework=big_five&locale=en&entity_type=hub&org_id=0 |
| entity filter en domain | 200 | 5 | yes | https://api.fermatmind.com/api/v0.5/personality-content-assets?framework=big_five&locale=en&entity_type=domain&org_id=0 |
| entity filter en polarity | 200 | 10 | yes | https://api.fermatmind.com/api/v0.5/personality-content-assets?framework=big_five&locale=en&entity_type=polarity&org_id=0 |
| entity filter en facet_hub | 200 | 1 | yes | https://api.fermatmind.com/api/v0.5/personality-content-assets?framework=big_five&locale=en&entity_type=facet_hub&org_id=0 |
| entity filter en facet | 200 | 0 | yes | https://api.fermatmind.com/api/v0.5/personality-content-assets?framework=big_five&locale=en&entity_type=facet&org_id=0 |
| code lookup big_five/domain/openness zh-CN | 200 | 1 | yes | https://api.fermatmind.com/api/v0.5/personality-content-assets/big_five/domain/openness?locale=zh-CN&org_id=0 |
| slug lookup big_five/big-five/openness zh-CN (informational; frontend uses code lookup) | 404 | 0 | n/a | https://api.fermatmind.com/api/v0.5/personality-content-assets/big_five/big-five/openness?locale=zh-CN&org_id=0 |

## Evidence Excerpts

- Code lookup: `https://api.fermatmind.com/api/v0.5/personality-content-assets/big_five/domain/openness?locale=zh-CN&org_id=0` returned status `200`, code `openness`, launch_state `content_ready`, robots `noindex,follow`, sections `11`, FAQ `5`.
- Frontend runtime code evidence shows Big Five pages call `/v0.5/personality-content-assets/big_five/{entityType}/{code}`; the extra slug-form probe is informational and not a blocker for this route set.
- Facet filter returns zero public readable facet stubs in both locales, so 60 facet stubs are not exposed as render candidates by the public list endpoint.
- All returned assets have `robots=noindex,follow`, `index_eligible=false`, `sitemap_eligible=false`, and `llms_eligible=false`.
