# PERSONALITY-SEO-CURRENT-AUDIT-01

This document freezes the current FermatMind personality SEO baseline before
the next implementation PRs. It is an audit and contract PR only. It does not
change runtime behavior, backend content, CMS data, sitemap generation, llms
generation, or frontend editorial fallback content.

## Scope

- 2 hub pages: `/zh/personality`, `/en/personality`
- 64 detail pages: 16 base MBTI types x A/T variants x zh/en locales
- Live `sitemap.xml`, `llms.txt`, and `llms-full.txt`
- Visible HTML signals for indexability, canonical, hreflang, JSON-LD, FAQ,
  personality media, duplicate section headings, and A/T similarity risk

## Current Baseline

| Surface | Current state |
| --- | --- |
| Target URLs scanned | 66 |
| HTTP 200 | 66 |
| Detail pages scanned | 64 |
| Hub pages scanned | 2 |
| Sitemap sample A/T URLs | Present |
| llms.txt sample A/T URLs | Present |
| llms-full.txt sample A/T URLs | Present |
| Detail JSON-LD types | `AboutPage`, `WebPage`, `BreadcrumbList` |
| Detail `FAQPage` JSON-LD | Missing on 64 detail pages |
| Personality images in hub/detail HTML | Missing on 66 personality pages |
| Duplicate "what type means" heading | Present on 63 detail pages |
| A/T difference marker | Present, but not yet a strong independent module |
| Hard content coverage gap | `/zh/personality/entj-t` shows "content not synced" |

## Hard Gap

`https://fermatmind.com/zh/personality/entj-t` currently returns 200 but the
main body is effectively empty for SEO purposes:

- title: `ENTJ-T 人格类型 | FermatMind`
- H1: `ENTJ-T 人格`
- visible empty-state heading: `内容暂未同步`
- main text length: 371 characters

This must be repaired in `PERSONALITY-DETAIL-CONTENT-COVERAGE-01` before the
FAQ, A/T difference, and metadata PRs can safely treat all 64 pages as complete.

## A/T Similarity Risk

The English A/T pairs show template-risk signals. The generated artifact uses
8-character shingle Jaccard similarity after removing navigation, footer,
script, and style content. Several English pairs are above `0.65`, including:

- `enfj-a` / `enfj-t`: `0.664`
- `estj-a` / `estj-t`: `0.659`
- `istj-a` / `istj-t`: `0.658`
- `intj-a` / `intj-t`: `0.655`

The follow-up A/T difference PR should create visible backend-authored modules
that make each A/T page meaningfully distinct without the frontend inventing
content authority.

## Issue Matrix

| Issue | Affected pages | Severity | Follow-up PR |
| --- | ---: | --- | --- |
| Missing visible personality image | 66 | High | `PERSONALITY-HUB-MEDIA-RENDER-VERIFY-01` |
| Missing visible FAQ / semantic FAQ surface | 64 | Medium | `PERSONALITY-DETAIL-FAQ-SEO-01` |
| Duplicate section heading | 63 | Medium | `PERSONALITY-AT-DIFFERENCE-SECTIONS-01` |
| A/T variant similarity risk | 32 | Medium | `PERSONALITY-AT-DIFFERENCE-SECTIONS-01` |
| Metadata template risk | 66 | Medium | `PERSONALITY-SEO-TITLE-METADATA-01` |
| Missing A/T comparison long-tail pages | 32 | Medium | `PERSONALITY-COMPARISON-PAGES-01` |

## Repository Rule Impact

This PR is docs and contract only.

- No runtime behavior change.
- No CMS mutation.
- No backend content mutation.
- No frontend editorial fallback content.
- No sitemap or llms URL-set change.
- No repository rule update is required because content authority remains
  backend/CMS-authoritative and this PR only records the current baseline.

## Deferred Items

The following work is intentionally deferred to separate PRs:

1. Backend content coverage for `/zh/personality/entj-t`.
2. Frontend rendering verification for backend-provided personality images.
3. Backend-authored A/T difference sections and frontend consumption.
4. Backend-authored visible FAQ and frontend semantic rendering.
5. Search-intent-specific title and metadata updates.
6. Backend-authoritative A/T comparison pages and frontend discoverability
   wiring.
