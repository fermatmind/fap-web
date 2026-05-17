# Search Intelligence Data Contract

Version: search_intelligence_data_contract.v1
Scope: SEO-DASH-00B
Status: contract_design

## A. Purpose

This document locks the Search Intelligence data contract after SEO-DASH-00A and the BACKEND-RUNTIME-02D public API authority acceptance gate.

It is a design contract only. It does not create a database, migration, collector, Metabase deployment, cloud connection, search engine integration, tracking change, sitemap change, llms change, payment change, order change, report change, email change, recommendation change, scoring change, env change, deployment, or SSH action.

## B. Source-of-Truth Hierarchy

Search Intelligence must resolve data conflicts in this order:

1. Backend business truth.
2. Backend events.
3. `fap-web` public runtime.
4. Search engine data.
5. Browser analytics.

Rules:

- Backend business truth means orders, payments, and benefit grants owned by `fap-api` / Node3 authority.
- Backend events are first-party event records and daily read models.
- `fap-web` is the deterministic public renderer and public URL observation surface.
- Search engine data includes Google, Baidu, Bing/IndexNow, llms, and future adapters.
- Browser analytics includes GA4, Baidu Tongji, and ads telemetry.
- Purchase truth comes from backend orders, payment events, and benefit grants, not GA4.
- GA4 and Baidu Tongji are behavior telemetry only.
- `/api/track` is transport. It is not the final source of truth.
- Node2 local Laravel, local DB, and local queue are non-authority and must not feed Search Intelligence.

## C. Key Model

SEO URL key:

- `canonical_url + locale`

Page entity key:

- `page_entity_type + entity_id_or_slug + locale`

Rules:

- `canonical_url` must be normalized before storage.
- `locale` is part of the key because localized pages may share entity identity but differ in URL, metadata, visibility, and search channel state.
- `entity_id_or_slug` may be a backend ID when stable and non-sensitive, or a slug when the backend public API exposes slug as the public identity.
- Private flows cannot become SEO URL entities.
- Excluded private flows include result, order, take, share, pay, checkout, webhook, email-bind, report download, account, auth, token, invite accept, and recovery URLs.

## D. Page Entity Type Taxonomy

Allowed first-version page entity types:

- `home`
- `test_hub`
- `test_detail`
- `article`
- `topic`
- `personality`
- `career_job`
- `career_recommendation`
- `methodology`
- `dataset`
- `report_preview`
- `landing_page`

New page entity types require a future contract update before collector implementation.

## E. Canonical Funnel Event Taxonomy

Canonical funnel events:

- `start_attempt`
- `submit_attempt`
- `view_result`
- `click_unlock`
- `create_order`
- `payment_confirmed`
- `purchase_success`

Alias rule:

- `pay_success` is a legacy alias for `purchase_success`.

Secondary events:

- Scale-specific, career-specific, invite, share, clinical, or diagnostic events are diagnostics only.
- Secondary events must not become primary SEO conversion metrics unless a later contract explicitly promotes them.

## F. Attribution Model

Windows:

- `first_touch_window_days`: 30
- `last_touch_window_days`: 7
- `cta_touch_window`: same session or 24 hours

Rules:

- First touch captures the earliest eligible non-internal landing source inside the 30-day window.
- Last touch captures the most recent eligible non-internal source inside the 7-day window.
- CTA touch captures explicit CTA context in the same session or within 24 hours.
- Purchase truth comes from backend orders, payment events, and benefit grants.
- Keyword must not directly attribute purchase.
- Search query and keyword data may explain discovery, but purchase attribution must use first-party landing, CTA, event, and backend commerce truth.
- If session data is unavailable, derived metrics must use explicit proxy names.

## G. Search Channel Model

First-class channels:

- `google`
- `baidu`
- `bing_indexnow`
- `llms`
- `direct`
- `paid_google`
- `paid_baidu`
- `unknown`

Reserved or planned channels:

- `so360`
- `sogou`
- `shenma`
- `quark`
- `ai_search`

Rules:

- Domestic search engines are channel adapters, not alternate SEO truth.
- Google, Baidu, Bing/IndexNow, and llms adapters may disagree with one another; the canonical public URL and CMS/backend SEO truth remain authoritative.
- Channel status must record observation quality, credential status, submission status, and last seen time where available.
- A channel adapter must not publish content, mutate CMS state, or create pSEO pages.

## H. Revenue Model

Revenue source of truth:

- Backend orders.
- Backend payment events.
- Backend benefit grants.

Excluded from revenue:

- Pending payments.
- Failed payments.
- Cancelled payments.
- Refunded payments.
- Test payments.
- Internal or QA purchases.

Metrics:

- `revenue`
- `orders_count`
- `purchase_count`
- `AOV`
- `RPV`
- `purchase_rate`

Rules:

- `AOV = revenue / orders_count` for accepted paid orders only.
- `purchase_rate` must name its denominator explicitly.
- If sessions are unavailable, `RPV_proxy` must be used instead of `RPV`.
- GA4 purchase and ad conversion events may be used for telemetry reconciliation only, not purchase truth.

## I. PII and Sensitive Data Rules

Forbidden in `seo_intel` detail rows:

- email
- raw cookies
- provider event IDs
- payment payloads
- raw order numbers for normal dashboards
- raw attempt IDs for normal dashboards
- auth tokens
- bearer tokens
- checkout URLs
- report URLs
- recovery URLs
- payment provider payloads

Allowed only when explicitly needed:

- masked references
- hashed internal references
- aggregate references
- internal-only reconciliation IDs with dashboard exclusion

Dashboard rules:

- Normal ops dashboards must not expose raw order numbers.
- Normal ops dashboards must not expose raw attempt IDs.
- Metabase must be read-only and should query `seo_intel` aggregate or sanitized tables, not CMS/business tables directly.

## J. Consent State Model

Required field:

- `consent_state`

Allowed values:

- `analytics_granted`
- `analytics_denied`
- `unknown`
- `not_applicable_backend_business_event`

Rules:

- Browser analytics events without analytics consent must not enter marketing analytics.
- Backend business events may be used for non-identifying aggregate operations when legally and operationally allowed.
- Consent state must be preserved or explicitly marked when deriving daily aggregates.
- GA4, Ads, Baidu, or other third-party tools must not receive PII from Search Intelligence.

## K. Internal, QA, and Bot Filtering

Traffic labels:

- `codex_qa`
- `controlled_pilot`
- `acceptance`
- `internal_ip`
- `test_user`
- `qa_email`
- `test_order`
- `bot_crawler_user_agent`
- `non_production_environment`

Rules:

- Default dashboards must exclude internal, QA, bot, crawler, and non-production traffic.
- Filtered traffic may be retained only in restricted QA/debug aggregates.
- Test purchases must not contribute to revenue metrics.
- Bot and crawler traffic may contribute to crawlability diagnostics but not human funnel conversion metrics.

## L. Semantic and Claim Naming Boundaries

Forbidden metric names or dashboard claims must not imply:

- RIASEC as a complete recommender for career outcomes.
- Big Five as a recommender for career outcomes.
- AI career planning.
- Diagnosis.
- True IQ authority.

Allowed naming examples:

- `career_support_view`
- `career_direction_page_view`
- `riasec_result_view`
- `workstyle_content_view`
- `interest_signal_page_view`

Rules:

- RIASEC and Big Five may be described as interest, personality, or workstyle signals only within product-approved language.
- Career Decision surfaces must not be rebranded as full AI career planning from analytics labels.
- SEO metrics must not manufacture stronger claims than the product, CMS, or backend contract supports.

## M. Logical seo_intel Table Plan

Planned logical tables only:

- `seo_urls`
- `seo_url_entities`
- `seo_event_funnel_daily`
- `seo_landing_attribution_daily`
- `seo_revenue_daily`
- `seo_cluster_daily`
- `seo_search_channel_status`
- `seo_consent_daily`
- `seo_internal_traffic_rules`
- `seo_issue_queue`

Planned future tables:

- `seo_gsc_daily`
- `seo_baidu_push_logs`
- `seo_baidu_landing_daily`
- `seo_indexnow_submissions`
- `seo_crawler_logs_daily`

Rules:

- This contract does not create migrations.
- Table names are logical planning names only.
- Final physical schema, indexes, retention, and access policy belong to a later approved PR.
- `seo_intel` must be logically isolated from business DB tables.

## N. Forbidden Assumptions

Do not assume:

- GA4 is purchase truth.
- Keyword directly attributes purchase.
- Browser analytics is more authoritative than backend business truth.
- `/api/track` is a final source of truth.
- Node2 local Laravel is backend authority.
- Sitemap or llms output is complete graph truth.
- Domestic search adapters create alternate SEO truth.
- CMS can become SEO BI.
- Metabase can query raw CMS/business tables directly.
- Raw emails, cookies, order numbers, attempt IDs, payment IDs, or provider payloads may enter detail analytics.
- RIASEC or Big Five is a complete runtime for career recommendation.

## O. Forbidden Actions

This PR must not:

- Create DB/schema/migrations.
- Implement collectors.
- Deploy Metabase.
- Connect GSC, Baidu, IndexNow, or other search APIs.
- Change tracking.
- Change payment, order, report, email, recommendation, scoring, profile, sitemap, or llms behavior.
- Change env.
- Deploy.
- SSH.
- Touch production.

## P. First Implementation Path

If this contract passes, the next task is:

- `SEO-DASH-01`: `seo_intel` DB and collector skeleton design.

SEO-DASH-01 must still be design-first. It must not deploy production collectors, connect live search APIs, or create production dashboards without a later explicit approval.
