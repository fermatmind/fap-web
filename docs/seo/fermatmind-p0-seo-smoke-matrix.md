# FermatMind P0 SEO Smoke Matrix

日期：2026-05-27
执行范围：P0 technical SEO only. No CMS body content, no frontend editorial content, no new science/results/refund/business/API pages.

## 1. Validation Context

- Local validation base: `http://127.0.0.1:3017`
- Runtime env used for smoke checks: `NEXT_PUBLIC_API_URL=https://api.fermatmind.com`
- Sitemap source: regenerated `public/sitemap.xml` through `pnpm seo:generate-sitemap`
- Decision authority: `docs/seo/fermatmind-site-map-proposal.md`

Task mapping:

| P0 task | Implementation / decision |
|---|---|
| P0-001 / TECH-001 | Sitemap P0 allowlist gate and trust-page inclusion. |
| P0-002 / TECH-002 | Clinical/depression pages remain pending review decision, render `noindex, follow`, and are not in sitemap/footer/header/language switch/tests hub cards/homepage JSON-LD/hreflang. |
| P0-003 / TECH-003 | Footer links restricted to allowlist URLs. |
| P0-004 / TECH-004 | English trust-layer 404 URLs remain unlinked and unsitemapped. |
| P0-005 / TECH-005 | `/help`, `/zh/help`, `/en/help` redirect to support canonical paths. |
| P0-006 / TECH-006 | `/results/lookup` remains private noindex and absent from sitemap/footer/header. |
| P0-008 / TECH-008 | Root `/privacy` and `/terms` redirect to Chinese default localized policy URLs. |
| P0-009 / TECH-009 | `/career/jobs` remains pending sitemap/indexability decision. |
| P0-012 / TECH-011 | High-risk clinical/depression and IQ review gates remain documented; no new high-risk content or schema was added. |
| P0-013 / TECH-012 | This smoke matrix records status, canonical, robots, sitemap, footer, hreflang, authority, review, and decision state. |

## 2. Redirect Smoke

| URL | Status | Location | Sitemap included? | Decision |
|---|---:|---|---|---|
| `/privacy` | 308 | `/zh/privacy` | No | Deterministic root redirect; source stays out of sitemap. |
| `/terms` | 308 | `/zh/terms` | No | Deterministic root redirect; source stays out of sitemap. |
| `/help` | 308 | `/zh/support` | No | Help root canonicalizes to zh support. |
| `/zh/help` | 308 | `/zh/support` | No | Locale help canonicalizes to support. |
| `/en/help` | 308 | `/en/support` | No | Locale help canonicalizes to support. |

## 3. P0 Allowlist Matrix

| URL | Status | Canonical | Robots / indexability | Sitemap included? | Footer linked? | Hreflang present? | CMS/backend authority? | Review required? | Review completed? | Decision | Notes |
|---|---:|---|---|---|---|---|---|---|---|---|---|
| `/` | 200 | `https://fermatmind.com` | `index, follow` | Yes | No | Yes | Existing route / product authority | No | N/A | Keep in sitemap | Chinese default homepage. |
| `/en` | 200 | `https://fermatmind.com/en` | `index, follow` | Yes | No | Yes | Existing route / product authority | No | N/A | Keep in sitemap | English homepage. |
| `/zh/tests` | 200 | `https://fermatmind.com/zh/tests` | `index, follow` | Yes | Yes | Yes | Existing tests hub authority | No | N/A | Footer + sitemap | Footer uses localized `/zh/tests`. |
| `/en/tests` | 200 | `https://fermatmind.com/en/tests` | `index, follow` | Yes | Yes | Yes | Existing tests hub authority | No | N/A | Footer + sitemap | Footer uses localized `/en/tests`. |
| `/zh/personality` | 200 | `https://fermatmind.com/zh/personality` | `index, follow` | Yes | Yes | Yes | Existing hub authority | No | N/A | Footer + sitemap | No new topic body content added. |
| `/en/personality` | 200 | `https://fermatmind.com/en/personality` | `index, follow` | Yes | Yes | Yes | Existing hub authority | No | N/A | Footer + sitemap | No new topic body content added. |
| `/zh/career` | 200 | `https://fermatmind.com/zh/career` | `index, follow` | Yes | Yes | Yes | Existing career hub authority | No | N/A | Footer + sitemap | Does not imply `/career/jobs` sitemap inclusion. |
| `/en/career` | 200 | `https://fermatmind.com/en/career` | `index, follow` | Yes | Yes | Yes | Existing career hub authority | No | N/A | Footer + sitemap | Does not imply `/career/jobs` sitemap inclusion. |
| `/zh/articles` | 200 | `https://fermatmind.com/zh/articles` | `index, follow` | Yes | Yes | Yes | Existing articles/CMS authority | No | N/A | Footer + sitemap | No article content edited. |
| `/en/articles` | 200 | `https://fermatmind.com/en/articles` | `index, follow` | Yes | Yes | Yes | Existing articles/CMS authority | No | N/A | Footer + sitemap | No article content edited. |
| `/zh/about` | 200 | `https://fermatmind.com/zh/about` | `index, follow` | Yes | Yes | Yes | Existing trust page authority | No | N/A | Footer + sitemap | English 404 trust children remain unlinked. |
| `/en/about` | 200 | `https://fermatmind.com/en/about` | `index, follow` | Yes | Yes | Yes | Existing trust page authority | No | N/A | Footer + sitemap | English 404 trust children remain unlinked. |
| `/zh/support` | 200 | `https://fermatmind.com/zh/support` | `index, follow` | Yes | Yes | Yes | Existing support page authority | No | N/A | Footer + sitemap | Canonical target for `/help` and `/zh/help`. |
| `/en/support` | 200 | `https://fermatmind.com/en/support` | `index, follow` | Yes | Yes | Yes | Existing support page authority | No | N/A | Footer + sitemap | Canonical target for `/en/help`. |
| `/zh/privacy` | 200 | `https://fermatmind.com/zh/privacy` | `index, follow` | Yes | Yes | Yes | Existing policy page authority | No | N/A | Footer + sitemap | Root `/privacy` redirects here. |
| `/en/privacy` | 200 | `https://fermatmind.com/en/privacy` | `index, follow` | Yes | Yes | Yes | Existing policy page authority | No | N/A | Footer + sitemap | Localized policy remains indexable. |
| `/zh/terms` | 200 | `https://fermatmind.com/zh/terms` | `index, follow` | Yes | Yes | Yes | Existing policy page authority | No | N/A | Footer + sitemap | Root `/terms` redirects here. |
| `/en/terms` | 200 | `https://fermatmind.com/en/terms` | `index, follow` | Yes | Yes | Yes | Existing policy page authority | No | N/A | Footer + sitemap | Localized policy remains indexable. |
| `/zh/method-boundaries` | 200 | `https://fermatmind.com/zh/method-boundaries` | `index, follow` | Yes | Yes | Yes | Existing method-boundary page authority | No | N/A | Footer + sitemap | P0 method/trust entry only. |
| `/en/method-boundaries` | 200 | `https://fermatmind.com/en/method-boundaries` | `index, follow` | Yes | Yes | Yes | Existing method-boundary page authority | No | N/A | Footer + sitemap | P0 method/trust entry only. |
| `/zh/tests/mbti-personality-test-16-personality-types` | 200 | `https://fermatmind.com/zh/tests/mbti-personality-test-16-personality-types` | `index, follow` | Yes | Yes | Yes | Existing test authority | No | N/A | Footer + sitemap | Core test allowlist. |
| `/en/tests/mbti-personality-test-16-personality-types` | 200 | `https://fermatmind.com/en/tests/mbti-personality-test-16-personality-types` | `index, follow` | Yes | Yes | Yes | Existing test authority | No | N/A | Footer + sitemap | Core test allowlist. |
| `/zh/tests/big-five-personality-test-ocean-model` | 200 | `https://fermatmind.com/zh/tests/big-five-personality-test-ocean-model` | `index, follow` | Yes | Yes | Yes | Existing test authority | No | N/A | Footer + sitemap | Core test allowlist. |
| `/en/tests/big-five-personality-test-ocean-model` | 200 | `https://fermatmind.com/en/tests/big-five-personality-test-ocean-model` | `index, follow` | Yes | Yes | Yes | Existing test authority | No | N/A | Footer + sitemap | Core test allowlist. |
| `/zh/tests/enneagram-personality-test-nine-types` | 200 | `https://fermatmind.com/zh/tests/enneagram-personality-test-nine-types` | `index, follow` | Yes | Yes | Yes | Existing test authority | No | N/A | Footer + sitemap | Core test allowlist. |
| `/en/tests/enneagram-personality-test-nine-types` | 200 | `https://fermatmind.com/en/tests/enneagram-personality-test-nine-types` | `index, follow` | Yes | Yes | Yes | Existing test authority | No | N/A | Footer + sitemap | Core test allowlist. |
| `/zh/tests/holland-career-interest-test-riasec` | 200 | `https://fermatmind.com/zh/tests/holland-career-interest-test-riasec` | `index, follow` | Yes | Yes | Yes | Existing test authority | No | N/A | Footer + sitemap | Core test allowlist. |
| `/en/tests/holland-career-interest-test-riasec` | 200 | `https://fermatmind.com/en/tests/holland-career-interest-test-riasec` | `index, follow` | Yes | Yes | Yes | Existing test authority | No | N/A | Footer + sitemap | Core test allowlist. |
| `/zh/tests/iq-test-intelligence-quotient-assessment` | 200 | `https://fermatmind.com/zh/tests/iq-test-intelligence-quotient-assessment` | `index, follow` | Yes | Yes | Yes | Existing test authority | Yes | Needs manual confirmation | Existing public core test retained; no expansion before review | No new IQ claims, schema, content, result guide, quality page, paid upsell copy, or expert endorsement added. Future IQ expansion requires review owner and `review_completed=true`. |
| `/en/tests/iq-test-intelligence-quotient-assessment` | 200 | `https://fermatmind.com/en/tests/iq-test-intelligence-quotient-assessment` | `index, follow` | Yes | Yes | Yes | Existing test authority | Yes | Needs manual confirmation | Existing public core test retained; no expansion before review | No new IQ claims, schema, content, result guide, quality page, paid upsell copy, or expert endorsement added. Future IQ expansion requires review owner and `review_completed=true`. |
| `/zh/tests/eq-test-emotional-intelligence-assessment` | 200 | `https://fermatmind.com/zh/tests/eq-test-emotional-intelligence-assessment` | `index, follow` | Yes | Yes | Yes | Existing test authority | No | N/A | Footer + sitemap | Core test allowlist. |
| `/en/tests/eq-test-emotional-intelligence-assessment` | 200 | `https://fermatmind.com/en/tests/eq-test-emotional-intelligence-assessment` | `index, follow` | Yes | Yes | Yes | Existing test authority | No | N/A | Footer + sitemap | Core test allowlist. |

## 4. Holdlist And Decision Matrix

### 4.1 Results Routes

| URL | Status | Canonical | Robots / indexability | Sitemap included? | Footer linked? | Header linked? | Hreflang present? | CMS/backend authority? | Review required? | Review completed? | Decision | Notes |
|---|---:|---|---|---|---|---|---|---|---|---|---|---|
| `/zh/results` | 308 | N/A | Redirect | No | No | No | N/A | Public hub authority not confirmed | Yes for future result guides | No | Hold | Redirect to private lookup can remain temporarily; no footer/sitemap. |
| `/en/results` | 308 | N/A | Redirect | No | No | No | N/A | Public hub authority not confirmed | Yes for future result guides | No | Hold | Redirect to private lookup can remain temporarily; no footer/sitemap. |
| `/zh/results/lookup` | 200 | `https://fermatmind.com/zh/results/lookup` | `noindex, nofollow, noarchive, nocache` plus `X-Robots-Tag: noindex, nofollow, noarchive` | No | No | No | No | Private utility route authority | No | N/A | Keep private noindex | Not a public SEO page. P0.1 disables header/language switch anchors; P0.2 verification confirms no hreflang alternate. |
| `/en/results/lookup` | 200 | `https://fermatmind.com/en/results/lookup` | `noindex, nofollow, noarchive, nocache` plus `X-Robots-Tag: noindex, nofollow, noarchive` | No | No | No | No | Private utility route authority | No | N/A | Keep private noindex | Not a public SEO page. P0.1 disables header/language switch anchors; P0.2 verification confirms no hreflang alternate. |

### 4.2 Clinical / Depression Routes

| URL | Status | Canonical | Robots / indexability | Sitemap included? | Footer linked? | Header linked? | Hreflang present? | CMS/backend authority? | Review required? | Review completed? | Decision | Notes |
|---|---:|---|---|---|---|---|---|---|---|---|---|---|
| `/zh/tests/clinical-depression-anxiety-assessment-professional-edition` | 200 | `https://fermatmind.com/zh/tests/clinical-depression-anxiety-assessment-professional-edition` | `noindex, follow, noarchive, nocache` | No | No | No | No | Existing test route; review authority not verified | Yes | No verified flag found | Pending decision; 200 self-canonical noindex/follow until review_completed=true | P0.2 removes tests hub card exposure, homepage/test hub JSON-LD exposure, language switch anchors, and hreflang alternates. |
| `/en/tests/clinical-depression-anxiety-assessment-professional-edition` | 200 | `https://fermatmind.com/en/tests/clinical-depression-anxiety-assessment-professional-edition` | `noindex, follow, noarchive, nocache` | No | No | No | No | Existing test route; review authority not verified | Yes | No verified flag found | Pending decision; 200 self-canonical noindex/follow until review_completed=true | P0.2 removes tests hub card exposure, homepage/test hub JSON-LD exposure, language switch anchors, and hreflang alternates. |
| `/zh/tests/depression-screening-test-standard-edition` | 200 | `https://fermatmind.com/zh/tests/depression-screening-test-standard-edition` | `noindex, follow, noarchive, nocache` | No | No | No | No | Existing test route; review authority not verified | Yes | No verified flag found | Pending decision; 200 self-canonical noindex/follow until review_completed=true | P0.2 removes tests hub card exposure, homepage/test hub JSON-LD exposure, language switch anchors, and hreflang alternates. |
| `/en/tests/depression-screening-test-standard-edition` | 200 | `https://fermatmind.com/en/tests/depression-screening-test-standard-edition` | `noindex, follow, noarchive, nocache` | No | No | No | No | Existing test route; review authority not verified | Yes | No verified flag found | Pending decision; 200 self-canonical noindex/follow until review_completed=true | P0.2 removes tests hub card exposure, homepage/test hub JSON-LD exposure, language switch anchors, and hreflang alternates. |

### 4.3 Career Jobs Routes

| URL | Status | Canonical | Robots / indexability | Sitemap included? | Footer linked? | Header linked? | Hreflang present? | CMS/backend authority? | Review required? | Review completed? | Decision | Notes |
|---|---:|---|---|---|---|---|---|---|---|---|---|---|
| `/zh/career/jobs` | 200 | `https://fermatmind.com/zh/career/jobs` | `index, follow` | No | No | Yes | Yes | Existing public career route/API; sitemap inclusion authority pending | No | N/A | Pending product/SEO decision | Do not add to sitemap during P0 without explicit inclusion rule. |
| `/en/career/jobs` | 200 | `https://fermatmind.com/en/career/jobs` | `index, follow` | No | No | Yes | Yes | Existing public career route/API; sitemap inclusion authority pending | No | N/A | Pending product/SEO decision | Do not add to sitemap during P0 without explicit inclusion rule. |

### 4.4 English Trust-Layer 404 Holdlist

| URL | Status | Sitemap included? | Footer linked? | Header linked? | Hreflang present? | CMS/backend authority? | Decision | Notes |
|---|---:|---|---|---|---|---|---|---|
| `/en/charter` | 404 | No | No | No | No verified source link | No | Hold | Requires CMS content_page before linking. |
| `/en/brand` | 404 | No | No | No | No verified source link | No | Hold | Requires CMS content_page before linking. |
| `/en/foundation` | 404 | No | No | No | No verified source link | No | Hold | Requires business confirmation and CMS content_page before linking. |
| `/en/careers` | 404 | No | No | No | No verified source link | No | Hold | Requires CMS content_page and real hiring state before linking. |
| `/en/policies` | 404 | No | No | No | No verified source link | No | Hold | Requires CMS policy hub before linking. |

## 5. Sitemap Final State

`public/sitemap.xml` retains the existing backend-authoritative inventory snapshot and contains 261 URLs. P0.2 does not use local frontend content as authority; it preserves backend/CMS-authoritative dynamic detail URLs while applying P0 holdlist, redirect-source, private-route, robots, and high-risk pending gates.

Sitemap includes P0 core public surfaces plus existing backend-authoritative dynamic surfaces such as article detail, topic detail, career guide detail, career job detail, personality detail, and approved test detail URLs.

Confirmed absent from sitemap:

- Redirect sources: `/privacy`, `/terms`, `/help`, `/zh/help`, `/en/help`
- Results: `/zh/results`, `/en/results`, `/zh/results/lookup`, `/en/results/lookup`
- Clinical/depression: `/zh/tests/clinical-depression-anxiety-assessment-professional-edition`, `/en/tests/clinical-depression-anxiety-assessment-professional-edition`, `/zh/tests/depression-screening-test-standard-edition`, `/en/tests/depression-screening-test-standard-edition`
- Career jobs index hubs: `/zh/career/jobs`, `/en/career/jobs`
- English trust 404: `/en/charter`, `/en/brand`, `/en/foundation`, `/en/careers`, `/en/policies`
- P1/P2 holdlist: `/science`, `/methodology`, `/reliability-validity`, `/refund-policy`, `/business/api`, `/business/team-assessment`, `/business/coaches`, `/business/research`

## 6. Open Manual Decisions

| Decision | Owner type | Current P0 state | Required before changing sitemap/footer/header |
|---|---|---|---|
| Clinical/depression indexability | Product, SEO, clinical/content review | Pages are 200/self-canonical `noindex, follow` and absent from sitemap/footer/header/language switch/tests hub cards/homepage JSON-LD/hreflang | Explicit indexability decision and `review_completed=true` before any reindexing or SEO exposure expansion. |
| IQ review gate | Product, SEO, content review | Existing IQ test remains allowlisted; no new content/schema added | Confirm review owner and `review_completed=true` definition before any IQ expansion or stronger claims. |
| Career jobs sitemap inclusion | Product, SEO, dev | Jobs hub is 200/indexable, linked in career header dropdown, absent from sitemap/footer | Decide whether to sitemap, noindex, or keep pending with explicit rationale. |
| Public `/results` hub | Product, SEO, CMS/backend | `/results` redirects to private noindex lookup and is absent from sitemap/footer/header | CMS/backend result-guide authority and approved template before indexable launch. |
| English trust pages | Product, content, SEO | `/en/charter`, `/en/brand`, `/en/foundation`, `/en/careers`, `/en/policies` are 404 and unlinked | CMS content_page plus approved metadata; `/en/foundation` also needs business confirmation. |
| Refund policy | Product, legal/content, SEO | Holdlist, not linked or sitemapped | Business/legal-confirmed refund policy and CMS page. |
