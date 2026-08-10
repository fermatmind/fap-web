# M06 public topic edge click contract

Status: `APPROVED_CONTRACT_ONLY_NOT_DEPLOYED`.

The only approved event is `public_topic_edge_click`. It is a browser observation emitted only when a user activates an already rendered, backend-approved public edge. The event contract accepts the backend-issued `edge_id` and the declared low-cardinality rendering context; it does not accept a URL, slug, query, referrer, free text, user/session identity, assessment data or payment data.

Required fields are `edge_id`, `locale`, `source_surface`, `target_surface`, `relation_type`, `display_region`, `position_bucket` and `target_action`. Optional fields are `entry_surface` and `organic_channel`. Additional fields are rejected.

This approval defines a privacy-safe contract only. No runtime callsite was added, no telemetry was sent, no consent behavior changed, and no deployment is claimed. Backend/CMS-approved public edge identity remains authoritative.
