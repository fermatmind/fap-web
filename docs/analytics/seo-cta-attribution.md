# SEO CTA Attribution

`SEO-OPS-02` preserves safe article CTA attribution from the article page into test navigation and `attempts/start`.

## Model

- Article CTAs append safe attribution query params to the target test URL.
- Test detail pages preserve the same safe context when linking into `/take`.
- RIASEC take pages copy the safe context into `attempts/start` metadata after guest-token readiness.
- Backend remains the receiver of attempt attribution; this PR does not change backend ingest or event allow-lists.

## Safe Params

Allowed URL attribution params:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `gclid`
- `msclkid`
- `fbclid`

Allowed CTA context params:

- `entry_surface`
- `source_page_type`
- `source_route_family`
- `source_slug`
- `content_id`
- `topic_id`
- `target_action`
- `test_slug`
- `target_test_slug`
- `cta_id`
- `landing_path`
- `entrypoint`

## Blocked Data

Do not include email, phone, name, order/payment identifiers, arbitrary query params, or full unsafe URLs in CTA attribution or `attempts/start` metadata.

## Attempt Start Payload

RIASEC `attempts/start` receives:

- top-level backend-supported attribution: `landing_path`, `referrer`, and `utm`
- `meta` fields for source context: source route family, source slug, CTA id, target test slug, target action, and safe click ids

## Deferred

- Standard RIASEC funnel event observability remains separate `SEO-OPS-03`.
- Backend attribution ingest expansion for first-class `source_slug`, `cta_id`, and `target_test_slug` fields remains a backend-owned follow-up.
- Big Five and generic quiz already have partial query attribution paths; this PR keeps runtime changes focused on the RIASEC live pilot path.
