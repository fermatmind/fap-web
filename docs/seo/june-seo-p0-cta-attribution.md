# June SEO P0 CTA Attribution Contract

PR-SEO-JUNE-02 adds tracking metadata to existing SEO page CTAs without changing copy, destinations, sitemap, llms, or page authority.

## Backend-safe payload

SEO page test-start CTAs may emit the existing canonical funnel event `start_attempt` with fields already accepted by the tracking pipeline:

- `slug` / `test_slug`: target test slug.
- `entry_surface`: `<route_family>_seo_cta`.
- `source_page_type`: `article_detail`, `topic_detail`, or `test_detail`.
- `target_action`: normalized CTA action.
- `landing_path` / `current_path`: source SEO page path.
- `locale`.
- UTM fields when already available in attribution payload.

## Deferred fields

The following desired attribution fields remain deferred until backend attribution ingest owns them explicitly:

- `source_route_family`
- `source_slug`
- `content_id`
- `topic_id`
- `target_test_slug`
- `cta_id`
- `campaign`

Frontend must not forward these fields as uncontrolled payload keys. `target_test_slug` maps to existing `test_slug`; `cta_id` maps to `target_action`; campaign context uses UTM fields.

## Boundaries

- Article and topic CTAs keep CMS/backend-provided label and href authority.
- Test landing CTAs keep existing product route behavior.
- CTA tracking must not trigger Google Ads purchase conversion.
- No email or PII is included in CTA attribution payloads.
