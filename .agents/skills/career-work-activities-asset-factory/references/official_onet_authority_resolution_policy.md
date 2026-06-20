# Official O*NET Authority Resolution Override Policy

This policy is a narrow source-authority repair path for career-work-activities evidence collection when a seed row has a missing or stale O*NET/SOC mapping.

Policy name:

`official_onet_authority_resolution_override_v1`

## When It May Be Used

The override may be used only when all conditions are true:

1. The seed row has `onet_code_seed` missing, empty, or a direct O*NET fetch for the seed code returns a permanent 404.
2. The candidate mapping is verified on an official O*NET OnLine occupation page.
3. The official O*NET page title exactly matches the normalized seed occupation title.
4. The official O*NET page exposes a stable O*NET code and occupation URL.
5. `ambiguity_count = 0`.
6. The override is recorded in a sidecar artifact, not written into the canonical seed.
7. The evidence/source boundary records that the source mapping came from a reviewed official authority override.

## Allowed Mapping Bases

- `exact_official_title_match`: official O*NET title and normalized seed title match.
- `official_code_redirect`: official O*NET page redirects from a stale code to the current occupation page.
- `official_code_replacement_notice`: official O*NET page states the old code is no longer active and points to the replacement code.

## Disallowed

- Fuzzy title similarity.
- Broad adjacent occupation mapping.
- Civilian proxy substitution for military occupations.
- CareerOneStop-only, BLS-only, job-board, salary, competitor, or generated-source mappings.
- Mutating the canonical seed.
- Mutating frozen baselines.
- Using the override to pass unsupported evidence.
- Generalizing this policy into a title-matching fallback.

## Required Sidecar Fields

Each override row must include:

- `slug`
- `title_en_seed`
- `title_zh_seed`
- `original_soc_code_seed`
- `original_onet_code_seed`
- `resolved_soc_code`
- `resolved_onet_code`
- `official_title`
- `official_source_url`
- `mapping_quality = reviewed_official_authority_override`
- `mapping_basis`
- `seed_mutated = false`
- `allowed_for_block = career-work-activities`
- `allowed_for_stage = evidence_collection`
- `expires_or_review_policy`
- `audit_boundary`

## Audit Boundary

This policy repairs source authority resolution only. It does not create evidence, synthesis, reader-facing assets, search projection, runtime output, staging data, or production imports.

Future `career-identity-asset-factory` work may separately decide whether the canonical seed should be repaired. This policy must not make that seed change.
