# SEO CTA Attribution

`SEO-OPS-02` preserves safe article CTA attribution from the article page into test navigation and `attempts/start`.

## Model

- Article CTAs append safe attribution query params to the target test URL.
- Article CTAs also hydrate from stored first-touch attribution when App Router search params are not available to the client wrapper.
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
- `meta` fields for source context: source route family, source slug, CTA id, target test slug, target action, safe UTM fields, and safe click ids

## SEO-OPS-02B Live Gap Closure

Production verification after `SEO-OPS-02` showed the code was deployed but article CTA `href` could still render without UTM on the live article route. `SEO-OPS-02B` closes that gap by reading the stored safe attribution payload after hydration and using it to rebuild the CTA href before click. The same safe UTM keys are kept explicit in RIASEC `attempts/start.meta` when present.

## SEO-OPS-02C Visible Navigation Closure

Production verification after `SEO-OPS-02B` showed `attempts/start.meta` carried UTM correctly, but the visible article CTA, test detail URL, and take URL could still omit UTM. `SEO-OPS-02C` closes that URL-level gap by allowing the client CTA wrapper to read the current browser URL query when App Router search params and stored attribution are not yet available. Only the existing safe attribution allow-list is copied into CTA hrefs. Email, arbitrary query params, order identifiers, payment identifiers, and Ads conversion behavior remain excluded.

## Deferred

- Standard RIASEC funnel event observability remains separate `SEO-OPS-03`.
- Backend attribution ingest expansion for first-class `source_slug`, `cta_id`, and `target_test_slug` fields remains a backend-owned follow-up.
- Big Five and generic quiz already have partial query attribution paths; this PR keeps runtime changes focused on the RIASEC live pilot path.
