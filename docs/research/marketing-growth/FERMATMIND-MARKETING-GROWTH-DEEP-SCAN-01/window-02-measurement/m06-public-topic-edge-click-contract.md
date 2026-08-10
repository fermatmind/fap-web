# M06 public topic edge click contract

Status: `IMPLEMENTED_RUNTIME_CALLSITE_NOT_DEPLOYMENT_PROVEN`.

The only approved event is `public_topic_edge_click`. It is a browser observation emitted only when a user activates an already rendered, backend-approved public edge. The event contract accepts the backend-issued `edge_id` and the declared low-cardinality rendering context; it does not accept a URL, slug, query, referrer, free text, user/session identity, assessment data or payment data.

Required fields are `edge_id`, `locale`, `source_surface`, `target_surface`, `relation_type`, `display_region`, `position_bucket` and `target_action`. Optional fields are `entry_surface` and `organic_channel`. Additional fields are rejected.

`fap-api`/CMS owns edge identity, eligibility, relation, locale and exact target canonical truth. `fap-web` owns validation, deterministic rendering and consent-gated dispatch. In v1, GA4 is the only telemetry sink and receives an aggregate, non-key browser observation; backend analytics forwarding and the generic `/api/track` transport are prohibited because that transport adds path and anonymous/session context.

Dispatch requires analytics consent to be granted at activation time. Unknown or denied consent is a hard stop; events are neither queued nor replayed after consent changes. Duplicate handler invocations sharing `edge_id|source_surface|display_region|position_bucket|target_action` are suppressed for 2 seconds. Dispatch is fire-and-forget with no retry and no generated user, anonymous, session or event identifier. The event is not eligible as a GA4 key event.

The rendered `href` is the exact backend-approved `target_canonical`. Tracking parameters never enter the link or canonical identity. Surface, relation, region, position bucket and action values use the machine-contract allowlists; exact DOM paths and inferred slugs/URLs remain forbidden.

The relation allowlist is bound to the merged G03/backend authority contract and is exactly `breadcrumb`, `learn_more` and `take_assessment`. A locale mismatch is not a tracking decision: the renderer must reject it unless the public backend item carries explicit `cross_locale_approved=true` and the source/target locale plus canonical checks pass. Neither the approval flag nor either canonical enters the event payload.

The scoped renderer implementation now provides a runtime callsite only on validated public-topic-edge anchors. It reuses the existing analytics-consent gate and does not change the global consent model. No production dispatch or receipt was observed by this PR, no telemetry delivery is claimed, and deployment is not proven. Backend/CMS-approved public edge identity remains authoritative.
