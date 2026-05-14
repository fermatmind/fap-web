# June SEO P0 Execution Calibration

Scope: PR-SEO-JUNE-00

Runtime behavior changed: no.

This document registers the June SEO Foundation P0 Fix Train and calibrates
execution boundaries before any runtime changes are attempted.

## Source Of Truth

| Surface | Authority | Rule |
| --- | --- | --- |
| Production frontend runtime | `/Users/rainie/Desktop/GitHub/fap-web` | Use as the only public frontend source-of-truth. |
| Backend/CMS/API authority | `/Users/rainie/Desktop/GitHub/fap-api` | Use only for scoped backend authority or attribution/API allow-list changes. |
| Nested frontend copy | `/Users/rainie/Desktop/GitHub/fap-api/fap-web` | Ignore for production frontend runtime judgments. |

## Train Scope

| PR | Scope | Runtime change allowed |
| --- | --- | --- |
| PR-SEO-JUNE-00 | Register train and calibration artifacts. | no |
| PR-SEO-JUNE-01 | Normalize SEO funnel event taxonomy. | yes, tracking only |
| PR-SEO-JUNE-01B | Backend attribution allow-list if required. | yes, backend ingest only |
| PR-SEO-JUNE-02 | Add attribution metadata for SEO page CTAs. | yes, tracking only |
| PR-SEO-JUNE-03 | Enforce article runtime FAQ/CTA/evidence contract. | limited, no fallback content |
| PR-SEO-JUNE-04 | Add mobile CWV SEO measurement gate. | no public UI change |
| PR-SEO-JUNE-05 | Harden sitemap/llms authority and truthful lastmod. | SEO enumeration guards only |
| PR-SEO-JUNE-06 | Freeze pSEO expansion and guard claim boundaries. | no runtime copy rewrite |

## Frozen Expansion

The train must not expand public SEO surface area. The following remain frozen:

- MBTI x career pSEO.
- Big Five trait x career pSEO.
- RIASEC code x career pSEO.
- Trait x problem pSEO.
- Career recommendation pSEO.
- Career Decision runtime.
- Workstyle runtime.
- RIASEC career recommendation runtime.
- Big Five trait-to-career matching runtime.
- MBTI live individualized recommendation runtime.

## Backend Change Rule

Any backend attribution/API allow-list change must be implemented in a separate
`fap-api` PR. Backend changes must not be mixed into frontend PRs.

## Claim Boundary

The train must preserve existing claim boundaries. The following claims remain
blocked unless a future human-approved replacement explicitly allows them:

- precise career recommendation
- best career
- guaranteed career success
- career success prediction
- AI career planning
- Big Five trait-to-career matching
- RIASEC recommendation engine
- MBTI individualized recommendation engine
- hiring suitability
- diagnosis or personality diagnosis

Allowed language remains limited to direction, exploration, interest signal,
workplace tendency, snapshot-based support, and evidence-backed explanation.
