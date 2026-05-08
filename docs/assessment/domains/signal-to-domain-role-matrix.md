# Signal-to-Domain Role Matrix

Runtime behavior changed: no.

This artifact defines how approved first-batch UASP signals and explicitly
blocked future placeholders may participate in the first three Core Decision
Domains. Roles are governance semantics only; they do not grant recommendation,
profile, SEO/GEO, freemium, CTA, report entitlement, or runtime eligibility.

## Role Enum

- primary
- secondary
- supporting
- future
- blocked

## Matrix

| Signal | self_understanding | career_decision | workstyle_decision |
| --- | --- | --- | --- |
| MBTI | primary | supporting | secondary |
| BIG5_OCEAN | primary | supporting | primary |
| RIASEC | supporting | primary | blocked |
| ENNEAGRAM | supporting | blocked | supporting |
| future_DISC | future | blocked | future |
| future_EQ | future | blocked | future |
| future_career_values | future | future | blocked |
| future_ability_tests | future | blocked | blocked |

## Boundaries

- RIASEC cannot enter Workstyle Decision.
- Big Five Career Decision role is supporting only and is not a recommender.
- Enneagram cannot enter Career Decision.
- Future signals cannot be marked ready.
- Signal role mapping does not grant recommendation, profile, SEO/GEO, freemium,
  CTA, or report entitlement eligibility.

## No Runtime Change Statement

This role matrix is artifact, generated JSON, and contract only.
