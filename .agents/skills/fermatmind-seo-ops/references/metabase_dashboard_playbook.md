# Metabase Dashboard Playbook

Purpose: interpret private Metabase evidence safely.

Allowed inputs:

- Operator-provided screenshot.
- Sanitized CSV export.
- Dashboard card summary copied by operator.

Rules:

- Metabase remains localhost/private only.
- Do not create public links.
- Do not enable anonymous sharing.
- Do not iframe or reverse proxy.
- Do not modify datasources, permissions, cards, or dashboards.
- Only use sanitized SEO middle-office data.

Review areas:

- URL Truth overview.
- Issue Queue overview.
- Search Channel Queue state.
- Collector readiness/live distinction.
- Private URL safety.
- Daily review and weekly article review gaps.

Output: cite dashboard/export identifier and mark unverified fields as `Access required`.
