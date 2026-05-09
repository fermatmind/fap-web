# Self-understanding Personality Test Surface Attributes

Scope: `PR-4C-02`

Train: `domain-runtime-metadata-integration-phase-4c-train`

Runtime behavior changed: no.

## Purpose

This artifact records the addition of passive, invisible, governance-only `data-domain-*` attributes to existing personality and test detail surfaces for the `self_understanding` domain.

These attributes are static governance markers only. They do not trigger any runtime behavior, recommendation, profile write, SEO/GEO change, CTA change, checkout/payment change, or scoring change.

## Covered Surfaces

### Personality Detail (`/personality/[type]`)

Always `self_understanding` domain, `primary` role:
- `data-domain-id="self_understanding"`
- `data-domain-role="primary"`
- `data-domain-envelope-state="metadata_only"`

The personality surface is always MBTI-based content. Domain metadata does not imply SEO/index/profile/recommendation authority.

### Test Detail (`/tests/[slug]`)

Conditional: data attributes added only for MBTI, Big Five, and Enneagram test pages.

| Scale | Domain Role |
| --- | --- |
| `MBTI` | `primary` |
| `BIG5_OCEAN` | `primary` |
| `ENNEAGRAM` | `supporting` |

Excluded scales: `RIASEC`, `SDS`, `CLINICAL`, `EQ`, `IQ`, and future/unknown scales.

## Data Attributes

Each covered surface receives:

- `data-domain-id="self_understanding"`
- `data-domain-role="primary"` (MBTI, Big Five)
- `data-domain-role="supporting"` (Enneagram)
- `data-domain-envelope-state="metadata_only"`

## What This PR Does NOT Do

- No visible copy added.
- No domain badge or label rendered.
- No new route.
- No new page.
- No CTA change.
- No SEO/GEO expansion.
- No recommendation trigger.
- No profile write.
- No freemium/checkout/payment change.
- No scoring change.
- No report entitlement change.
- No layout or visual change.
- No payload-backed metadata synthesis from frontend artifacts.

## Excluded From Scope

- `/topics/[slug]` — deferred to PR-4C-03
- `/articles/[slug]` — deferred to PR-4C-03
- `/career/*` — blocked (career_decision)
- `RIASEC` test pages — no self_understanding attributes
- Clinical/ability/unknown test pages — no domain attributes
- Result/report surfaces — covered in PR-4C-01

## Blocked Domains

- `career_decision` — remains guard-ledger-only
- `workstyle_decision` — remains artifact-only

## No Runtime Change Statement

This PR adds governance-only data attributes to existing personality and test detail page `<main>` elements. No runtime behavior is changed. No visible output is modified.
