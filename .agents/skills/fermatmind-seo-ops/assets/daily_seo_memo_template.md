# Daily SEO Memo Template

## Objective

Release or continue one SEO article safely. Search-provider live actions stay in
a separate batch lane unless the daily goal uses a full-chain Authorization
Profile or separate exact authorization.

## Default Cadence

Default to one high-quality bilingual SEO article per day.

Use two or more articles in the same day only when the operator explicitly
marks the run as a batch/exception. The default daily SOP optimizes for:

- one selected topic with a clear cannibalization boundary;
- one complete Mode C package;
- one Stage 4 repaired package;
- one full-chain release goal;
- one final release matrix;
- one D1/D7/D14 observation queue.

Do not start the next daily article until the current article is either
`ARTICLE_RELEASE_COMPLETE_SEARCH_OBSERVATION_PENDING` or safely held at a
documented terminal state such as `DISCOVERABILITY_RECONCILED_SEARCH_BATCH_HELD`
or `PROVIDER_QUOTA_BLOCKED_NOT_CONTENT_BLOCKER`.

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
| Article/Breadcrumb schema + bilingual hreflang | full-chain profile or exact independent gate required |
| FAQPage schema | held unless visible FAQ parity passes |

## Daily Target State

The preferred daily terminal state is:

- `ARTICLE_RELEASE_COMPLETE_SEARCH_OBSERVATION_PENDING`

The daily content lane may also stop at:

- `DRAFT_CREATED_PUBLIC_RELEASE_HELD`
- `PUBLISHED_DISCOVERABILITY_HELD`
- `CONTENT_RELEASED_SEARCH_BATCH_HELD`
- `DISCOVERABILITY_RECONCILED_SEARCH_BATCH_HELD`
- `GSC_MANUAL_HELD`
- `SCHEMA_HREFLANG_HELD`
- `D1_D7_D14_OBSERVATION_QUEUED`

## Daily Completion Definition

A one-article daily release is complete only when the final matrix records:

- zh-CN and en public URLs return `200`;
- each public URL is self-canonical;
- each public URL renders `index, follow`;
- each localized CTA points to a public canonical test/article route;
- CTA links include the locked article `content_id`;
- `sitemap.xml` contains both localized public URLs;
- `llms.txt` contains both localized public URLs;
- `llms-full.txt` contains both localized public URLs;
- URL Truth and Search Channel state are recorded, even when provider work is held;
- IndexNow, Baidu, and GSC states are recorded as submitted, held, quota-blocked, or platform-blocked;
- Article schema, Breadcrumb schema, and bilingual reciprocal hreflang are
  enabled and verified when the full-chain profile or exact independent gate
  authorized them; otherwise record the explicit hold;
- FAQPage schema is held unless visible FAQ and JSON-LD parity passed;
- D1/D7/D14 observation rows are queued with `Unknown` placeholders, not zeroes.

If a page passes publish/discoverability but answer-surface FAQ still renders
generic FAQ instead of package-specific visible FAQ, classify it as
`ANSWER_SURFACE_FAQ_ENHANCEMENT_RECOMMENDED`. This is not a normal publish
blocker, but it must be included in the final report and future schema/answer
surface optimization queue.

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

## Schema/Hreflang Gate Policy

Daily full-chain releases should treat Article schema, Breadcrumb schema, and
reciprocal bilingual hreflang as independent executable SEO enhancement gates
when `authorization_mode=full_chain_preapproved` allows them.

When the release is gate-by-gate or the full-chain profile does not allow these
lanes, use separate tasks:

- Schema task: `SEO-OPS-ARTICLE-SCHEMA-ELIGIBILITY-REVIEW-00`.
- Hreflang task: `SEO-OPS-BILINGUAL-HREFLANG-ROLLOUT-REVIEW-00`.

FAQPage remains held unless visible FAQ parity and claim gate evidence pass.

## Observation

Create D1/D7/D14 observation queue after publish/discoverability/search state is known. Do not treat missing analytics exports as zero.

D1/D7/D14 review must feed the next topic-selection brief. Use `Unknown` for
missing GSC/GA4/Baidu/CTA data, and never treat missing data as zero. The next
daily article brief should mention whether the previous article produced:

- new visible queries;
- CTR/title-meta opportunity;
- internal-link opportunity;
- CTA click or `start_test` signal;
- answer-surface FAQ improvement opportunity;
- provider/search submission hold.
