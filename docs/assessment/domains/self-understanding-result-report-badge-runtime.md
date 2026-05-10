# Self-understanding Result Report Badge Runtime

Scope: `PR-4D-01`

Train: `domain-runtime-metadata-integration-phase-4d-train`

Runtime behavior changed: yes (minimal visible domain label only).

## Purpose

This artifact records the addition of a minimal, non-interactive `self_understanding` domain badge to existing result/report surfaces. This is the only visible runtime change allowed by the Phase 4D manual decision lock (PR-4D-00).

## Covered Surfaces

| Surface | Component | Badge Text |
| --- | --- | --- |
| MBTI result/report | `MbtiResultShellLoadingShell` | 自我认知 / Self-understanding |
| Big Five result/report | `Big5ResultShell` | 自我认知 / Self-understanding |
| Big Five result page V2 | `Big5ResultPageV2Shell` | 自我认知 / Self-understanding |
| Enneagram result/report | `EnneagramResultShell` | 自我認知 / Self-understanding |

## Badge Component

`components/domains/SelfUnderstandingDomainBadge.tsx`

- Accepts `locale: Locale`
- Renders: `<span>` with `data-domain-id`, `data-domain-badge`, `data-domain-badge-type`, `data-domain-visible-copy-scope`
- No link, no button, no CTA, no tooltip, no modal, no popover, no click handler
- No backend access, no profile access, no recommendation access, no SEO/GEO access

## Visible Copy

| Locale | Text |
|---|---|
| zh-CN | 自我认知 |
| en | Self-understanding |

No other text is rendered. No variants, translations, explanations, or CTAs.

## What This PR Does NOT Do

- No domain hub.
- No new route.
- No CTA or link.
- No tooltip/modal/popover.
- No explanation copy.
- No SEO/GEO change.
- No sitemap/llms change.
- No JSON-LD/metadata change.
- No recommendation trigger.
- No profile/memory write.
- No freemium/paywall change.
- No checkout/payment change.
- No report entitlement change.
- No scoring change.
- No Career Decision badge.
- No Workstyle badge.
- No RIASEC badge.

## Blocked Domains

- `career_decision` — remains guard-ledger-only
- `workstyle_decision` — remains artifact-only

## No Runtime Change Statement (Beyond Badge)

This PR adds a non-interactive domain badge only. No other runtime behavior is changed. No visible output beyond the badge text is modified.
