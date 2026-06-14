# Daily SEO Memo Template

## Objective

Release or continue one SEO article safely while keeping search-provider live actions in a separate batch lane unless explicitly authorized.

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
| Search Channel enqueue/write | exact authorization required |
| IndexNow live | exact queue IDs and live phrase required |
| Baidu live | exact queue IDs and separate live phrase required |
| GSC Request Indexing | separate manual exact authorization required |
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

- Search live actions are not blanket-covered by article release approval.
- Queue IDs are generated later; approval must reference exact IDs.
- IndexNow live can execute only through the approved Search Channel queue flow.
- Baidu live push remains separate approval.
- GSC Request Indexing remains separate approval.
- Do not wait on Baidu/GSC before starting the next daily article when content/discoverability are safe.

## Provider Holds

Use `PROVIDER_QUOTA_BLOCKED_NOT_CONTENT_BLOCKER` when Baidu returns HTTP 400 `over quota`.

Retry only failed queue item IDs after quota reset. Do not retry submitted queue items.

## Schema/Hreflang Holds

Schema task: `SEO-OPS-ARTICLE-SCHEMA-ELIGIBILITY-REVIEW-00`.

Hreflang task: `SEO-OPS-BILINGUAL-HREFLANG-ROLLOUT-REVIEW-00`.

## Observation

Create D1/D7/D14 observation queue after publish/discoverability/search state is known. Do not treat missing analytics exports as zero.
