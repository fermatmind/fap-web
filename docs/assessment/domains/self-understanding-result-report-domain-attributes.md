# Self-understanding Result Report Domain Attributes

Scope: `PR-4C-01`

Train: `domain-runtime-metadata-integration-phase-4c-train`

Runtime behavior changed: no.

## Purpose

This artifact records the addition of passive, invisible, governance-only `data-domain-*` attributes to existing result/report surface root containers for the `self_understanding` domain.

These attributes are static governance markers only. They do not trigger any runtime behavior, recommendation, profile write, SEO/GEO change, CTA change, checkout/payment change, or scoring change.

## Covered Surfaces

| Surface | Component | Domain Role | Scale |
| --- | --- | --- | --- |
| MBTI result/report loading shell | `MbtiResultShellLoadingShell` | `primary` | `MBTI` |
| Big Five result/report shell | `Big5ResultShell` | `primary` | `BIG5_OCEAN` |
| Big Five result page V2 shell | `Big5ResultPageV2Shell` | `primary` | `BIG5_OCEAN` |
| Enneagram result/report shell (reportV2) | `EnneagramResultShell` | `supporting` | `ENNEAGRAM` |
| Enneagram result/report shell (legacy) | `EnneagramResultShell` | `supporting` | `ENNEAGRAM` |

## Data Attributes

Each root container receives:

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

## Signals

Only `self_understanding` domain signals are covered:

| Scale | Domain Role |
| --- | --- |
| `MBTI` | `primary` |
| `BIG5_OCEAN` | `primary` |
| `ENNEAGRAM` | `supporting` |

Not covered: `RIASEC`, Career Decision, Workstyle, future DISC, future EQ, future career values, future ability tests.

## Blocked Domains

- `career_decision` — remains guard-ledger-only
- `workstyle_decision` — remains artifact-only

## No Runtime Change Statement

This PR adds governance-only data attributes to existing result/report shell root containers. No runtime behavior is changed. No visible output is modified.
