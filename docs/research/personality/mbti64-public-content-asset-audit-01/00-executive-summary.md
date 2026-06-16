# MBTI64 Public Content Asset Audit 01

## Scope

Read-only audit for FermatMind public MBTI-like 16 type + A/T personality content pages. This audit does not modify runtime code, backend seed data, sitemap, llms files, scoring, or result pages.

## Inventory

- Hub pages audited: 2
- A/T variant pages audited: 64
- A-vs-T comparison pages audited: 32
- Total URLs audited: 98
- HTTP 200 pages: 98
- `index, follow` pages: 98

## Search Console Seed Signals

User-provided GSC screenshots show early Google exposure for MBTI pages:

| URL | Screenshot signal |
|---|---:|
| `/en/personality/intj-a-vs-intj-t` | 18 impressions / 0 clicks in 24h screenshot |
| `/zh/personality/istj-a` | 11 impressions / 0 clicks in 24h screenshot |
| `/en/personality/intp-a-vs-intp-t` | 10 impressions / 0 clicks in 24h screenshot |
| `/zh/personality/infp-t` | GSC recommendation card: more impressions than usual |

## Main Findings

1. FermatMind already has indexable MBTI A/T public pages. The immediate opportunity is content and technical SEO uplift, not net-new route creation.
2. The `/en/personality` and `/zh/personality` hubs each expose 32 A/T entries, so bilingual variant coverage is present at the route level.
3. Comparison pages such as `/en/personality/intj-a-vs-intj-t` are already receiving impressions; A-vs-T comparison intent should be treated as a P0/P1 content lane.
4. Many variant pages need deeper semantic sectioning and stronger internal links. The audit flagged 64 pages with fewer than 4 detected H2 elements and 64 pages with weak personality internal-link counts.
5. Static HTML parsing did not detect JSON-LD on 0 pages. This needs runtime/source verification before implementation, but it is a high-value technical SEO check.
6. Content should remain backend/CMS/API authoritative. Frontend should consume content packages and improve rendering semantics; it should not add local editorial fallback copy.

## Recommendation

Proceed with a GPT 5.5 pilot for 8 pages before generating all 64 variant pages. Use `02-gpt55-content-package-input.csv` as the input queue and start with the P0 rows.

## Evidence

- Live site evidence: `01-live-url-inventory.csv`, fetched 2026-06-16 with low-rate public HTTP reads.
- GSC evidence: user-provided screenshots from 2026-06-16.
- Code evidence: existing fap-web adapters reference `/v0.5/personality`, `/v0.5/personality/{slug}`, `/v0.5/personality/{slug}/seo`, and comparison endpoints.
- Inference: priority ordering combines GSC screenshot seeds, page type, and current SEO structure.
