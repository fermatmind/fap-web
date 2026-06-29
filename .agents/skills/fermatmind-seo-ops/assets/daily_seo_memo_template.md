# Daily SEO Memo Template

## Objective

Release or continue one SEO article safely. Search-provider live actions stay in
a separate batch lane unless the daily goal uses a full-chain Authorization
Profile or separate exact authorization.

## Authorization Profile

| action | default |
| --- | --- |
| package QA | allowed |
| image bundle dry-run | allowed when package has `media/` |
| Media Library import/register | exact authorization required |
| resolved package write/backfill | exact authorization required |
| CMS draft/import/update | exact authorization required |
| authenticated preview QA | allowed/read-only |
| publish metadata autofill | exact authorization required when it writes CMS |
| publish/promote | exact authorization required |
| sitemap/llms/URL Truth write | exact authorization required |
| Search Channel enqueue/write | exact authorization or full-chain profile required |
| IndexNow live | exact queue IDs or full-chain profile required |
| Baidu live | exact queue IDs or full-chain profile required |
| GSC Request Indexing | exact target URLs or full-chain profile required |
| schema/hreflang | separate task required |

## Daily Target State

The daily content lane may stop at:

- `DRAFT_CREATED_PUBLIC_RELEASE_HELD`
- `PUBLISHED_DISCOVERABILITY_HELD`
- `CONTENT_RELEASED_SEARCH_BATCH_HELD`
- `DISCOVERABILITY_RECONCILED_SEARCH_BATCH_HELD`
- `GSC_MANUAL_HELD`
- `SCHEMA_HREFLANG_HELD`
- `D1_D7_D14_OBSERVATION_QUEUED`

## Search Batch Notes

- Search live actions are not blanket-covered by article release approval unless the goal explicitly uses `authorization_mode=full_chain_preapproved`.
- Queue IDs are generated later; gate-by-gate approval must reference exact IDs, while full-chain approval may continue for queue items generated from the locked target URLs/channels.
- IndexNow live can execute only through the approved Search Channel queue flow.
- Baidu live push remains separate approval unless full-chain preauthorized.
- GSC Request Indexing remains separate approval unless full-chain preauthorized for exact canonical URLs.
- Do not wait on Baidu/GSC before starting the next daily article when content/discoverability are safe.

## Provider Holds

Use `PROVIDER_QUOTA_BLOCKED_NOT_CONTENT_BLOCKER` when Baidu returns HTTP 400 `over quota`.

Retry only failed queue item IDs after quota reset. Do not retry submitted queue items.

## Schema/Hreflang Holds

Schema task: `SEO-OPS-ARTICLE-SCHEMA-ELIGIBILITY-REVIEW-00`.

Hreflang task: `SEO-OPS-BILINGUAL-HREFLANG-ROLLOUT-REVIEW-00`.

## Observation

Create D1/D7/D14 observation queue after publish/discoverability/search state is known. Do not treat missing analytics exports as zero.
