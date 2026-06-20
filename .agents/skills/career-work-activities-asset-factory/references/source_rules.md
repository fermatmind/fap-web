# Career Work Activities Source Rules

Prefer O*NET tasks/work activities, BLS OOH, national career profiles, industry profiles, and source-backed employer role descriptions.

Every source item must include source name, URL or citation handle, captured fact, source boundary, and whether the source is direct, aggregate, adjacent, or macro context.

## Direct military profiles

For direct O*NET military occupations with `55-*` codes, use `military_profile_evidence_policy.md`. The short version:

- direct military O*NET profile only
- duties/profile paragraph required
- at least 6 occupation-specific duty/workflow items
- military source boundary required
- no civilian proxy substitution
- no generalization to non-military occupations

## Missing or stale O*NET authority

When a seed row has a missing `onet_code_seed` or a stale code that returns a permanent 404, use `official_onet_authority_resolution_policy.md`.

The short version:

- official O*NET source only
- exact normalized official title match required
- ambiguity count must be 0
- no fuzzy title-similarity proxy
- no CareerOneStop/BLS/job-board/competitor-only mapping
- no canonical seed mutation
- no frozen baseline mutation
- sidecar override must record `reviewed_official_authority_override`
- evidence boundary must state that the O*NET mapping came from reviewed official authority override
