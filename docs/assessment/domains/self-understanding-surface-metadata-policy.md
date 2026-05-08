# Self-understanding Existing Surface Metadata Policy

Scope: `PR-4B-03`

Train: `domain-runtime-metadata-integration-train`

Runtime behavior changed: no.

## Purpose

This policy defines where `self_understanding` domain metadata may be recognized in existing public/runtime surfaces without creating a domain hub, public route, visible copy, CTA runtime, SEO/GEO exposure, recommendation trigger, profile write, freemium change, report entitlement change, checkout/payment change, or scoring change.

## Runtime Position

`self_understanding` is the first candidate for minimal domain metadata integration, but Phase 4B keeps it artifact-governed and existing-surface-only. The current recommendation is `existing_result_report_only`; no runtime import or payload merge is introduced by this PR.

## Allowed Signals

| Signal | Domain role | Runtime policy |
| --- | --- | --- |
| `MBTI` | `primary` | Existing result/report and personality surfaces only. |
| `BIG5_OCEAN` | `primary` | Existing result/report surfaces only. |
| `ENNEAGRAM` | `supporting` | Existing result/report surfaces only. |
| `RIASEC` | `supporting` | Supporting only if already present; never primary for self-understanding. |

## Existing Surface Candidates

| Surface | Route family | Policy |
| --- | --- | --- |
| Result/report | `/result/[id]` | Metadata-only candidate; no visible badge or copy. |
| Personality detail | `/personality/[type]` | Existing-surface-only; no new sections. |
| Topic detail | `/topics/[slug]` | Existing-surface-only; no SEO/GEO widening. |
| Article detail | `/articles/[slug]` | Existing-surface-only; no content rewrite. |
| Test detail | `/tests/[slug]` | Existing-surface-only; no CTA or copy change. |

## Guard Rules

- No new hub.
- No new public route.
- No `/decision/*` or `/domains/*` route.
- No visible copy.
- No visible domain badge.
- No new CTA.
- No CTA copy change.
- No SEO/GEO expansion.
- No sitemap, llms, or llms-full URL set change.
- Evidence remains partial unless visible evidence exists.
- CTA must remain existing source-owned or artifact-governed.
- Frontend fallback must not become domain authority.

## Claim Boundaries

- No determinism.
- No diagnosis.
- No destiny framing.
- No personality entertainment framing.

## No Runtime Change Statement

This PR does not modify personality, topic, test, article, result, report, CTA, SEO/GEO, recommendation, profile, freemium, checkout, payment, entitlement, or scoring runtime.
