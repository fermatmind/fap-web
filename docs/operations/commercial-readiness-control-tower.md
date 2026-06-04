# Commercial Readiness Control Tower

Date: 2026-06-04

Scope: `COMMERCIAL-READINESS-CONTROL-TOWER-01`

Mode: docs, PR train, and coordination only. This document does not change runtime code, CMS data, search submission, analytics platform settings, payment behavior, content assets, or deployment state.

## One-Line Decision

Overall: NO-GO for commercial promotion readiness.

FermatMind can continue parallel readiness work, but paid ads, scaled social distribution, DailyGiving trust amplification, and broad pSEO expansion remain blocked until the stop conditions and window gates below are cleared.

## Operating Authority

- Codex owns bounded scans, contracts, ledgers, implementation PRs, and verification reports.
- GPT-5.5 Pro owns approved publishable content assets, including article packages, page copy, FAQ/help copy, ad copy, social copy, public-benefit copy, and multimedia scripts.
- CMS/backend is the final authority for CMS-backed content, article publication state, SEO metadata, page blocks, landing surfaces, content pages, media assets, career content, payment truth, entitlement truth, and public discoverability state.
- fap-web is the public rendering and interaction shell. It must not become the editorial, CMS, payment, or analytics truth source.
- Unknown is not No and not zero. Missing live dashboard or backend evidence must remain Unknown.

## Global NO-GO Fence

The following remain forbidden until separately cleared by the relevant window:

- paid ads
- second SEO article publish
- DailyGiving trust badge
- DailyGiving public amplification
- GSC URL Inspection
- IndexNow
- Baidu English URL submission
- 1046 career pSEO blast
- Reddit batch posting
- competitor paragraph imitation
- Codex-generated publishable copy

## Global Stop Conditions

If any condition is observed, stop commercial promotion work and switch to the relevant P0 fix path:

| Stop condition | Severity | Immediate action |
| --- | --- | --- |
| `private_url_seen=Yes` | P0 | Stop paid ads, social scaling, search submission expansion, and commercial dashboard promotion. |
| `orderNo`, `resultId`, or `attemptId` enters analytics in clear text | P0 | Stop tracking rollout and repair privacy guards. |
| `purchase_success` is duplicated or counted without backend truth | P0 | Stop revenue reporting and purchase optimization. |
| English users can reach a Chinese paywall or CNY-only checkout unintentionally | P0 | Stop English distribution and repair backend freemium policy. |
| Chinese users pay but cannot unlock the purchased report | P0 | Stop checkout promotion and repair entitlement/report truth. |
| DailyGiving proof, receipt, internal note, or private storage path leaks publicly | P0 | Stop public benefit amplification and repair proof handling. |
| Public-benefit copy implies UN official cooperation, certification, endorsement, or guaranteed impact | P0 | Stop the copy surface and run claim repair. |
| Ad or social copy says "most accurate", "official", "clinical grade", "guaranteed career", or Chinese equivalents such as "最准", "官方", "临床级", or "保证职业" without approved evidence | P0 | Stop distribution and run claim repair. |
| Dashboard treats Unknown as 0 | P0 | Stop dashboard use for commercial decisions. |
| private, noindex, draft, preview, order, result, share, payment, history, or tokenized URL enters sitemap, llms, search queue, or submission surface | P0 | Stop discoverability expansion and repair URL truth. |

## Control Tower Windows

### 1. COMMERCIAL-READINESS-CONTROL-TOWER

- mission: Maintain the commercial readiness ledger, cross-window dependency map, NO-GO fence, and execution order without changing runtime or content.
- first task id: `COMMERCIAL-READINESS-CONTROL-TOWER-01`
- owner repo: `fap-web`
- allowed actions:
  - update docs/operations readiness coordination
  - update docs/codex PR train metadata
  - register planned follow-up tasks
  - record global stop conditions and current NO-GO fence
- forbidden actions:
  - runtime code changes
  - CMS mutation
  - publish or unpublish
  - search submission
  - deployment
  - content creation
- dependency blockers:
  - none for this docs-only control tower
- GO / NO-GO output format:
  - `GO: control tower ledger is current and parallel windows may start`
  - `NO-GO: control tower ledger is missing required windows, blockers, or forbidden-action fence`

### 2. PRIVACY-ORDER-RESULT-GATE

- mission: Prove that production analytics and public discoverability surfaces do not expose private result, order, share, payment, history, attempt, or tokenized URLs.
- first task id: `PRIVACY-ORDER-RESULT-LIVE-REVIEW-02`
- owner repo: `fap-web`
- allowed actions:
  - read-only GA4 and Baidu dashboard review through an approved authenticated operator path
  - read-only public sitemap, llms, robots, article, test, result-shell guard, and tracking code scans
  - redacted evidence reporting
- forbidden actions:
  - opening real private URLs
  - printing raw IDs or tokens
  - changing analytics settings
  - deleting dashboard data
  - CMS, payment, search, or runtime mutation
- dependency blockers:
  - authenticated read-only dashboard evidence is required before `private_url_seen=No`
- GO / NO-GO output format:
  - `GO: private_url_seen=No with authenticated dashboard and public-surface evidence`
  - `CONDITIONAL: private_url_seen=Unknown; paid ads remain blocked`
  - `NO-GO: private_url_seen=Yes; switch to P0 privacy fix`

### 3. COMMERCIAL-EVENTS-ATTRIBUTION-TRUTH

- mission: Keep commercial funnel events, legacy aliases, payload allowlists, backend purchase truth, and dashboard interpretation aligned.
- first task id: `COMMERCIAL-EVENTS-ATTRIBUTION-TRUTH-01`
- owner repo: `fap-web`
- allowed actions:
  - event taxonomy and alias-bridge scans
  - payload whitelist validation
  - dashboard-readable funnel mapping
  - backend truth contract references
- forbidden actions:
  - using GA4 or Baidu as purchase truth
  - counting missing data as 0
  - adding raw order, result, attempt, payment, or token identifiers
  - configuring analytics platform goals without separate approval
- dependency blockers:
  - `PRIVACY-ORDER-RESULT-GATE` must not be `NO-GO`
  - backend order/payment truth must be distinguishable from analytics observation
- GO / NO-GO output format:
  - `GO: event aliases, payloads, dedupe, and backend truth mapping are safe`
  - `NO-GO: commercial events cannot support paid traffic or dashboard decisions`

### 4. FREEMIUM-PAYWALL-UNLOCK-AUTHORITY

- mission: Make locale freemium, paywall visibility, checkout eligibility, entitlement grant, unlock success, and report readiness backend-authoritative.
- first task id: `FREEMIUM-LOCALE-POLICY-01`
- owner repo: `fap-api`
- allowed actions:
  - backend policy contract and tests
  - offer visibility and order creation gates
  - report access and entitlement truth checks
  - read-only frontend consumption planning
- forbidden actions:
  - frontend-only monetization truth
  - production checkout execution without approval
  - payment provider behavior changes outside scope
  - content, ad, or page-copy changes
- dependency blockers:
  - locale policy scan remains NO-GO until backend authority exists
  - checkout unlock smoke must pass before paid promotion
- GO / NO-GO output format:
  - `GO: locale policy, offer, order, entitlement, unlock, and report truth are backend-authoritative`
  - `NO-GO: locale freemium or unlock truth is not backend-authoritative`

### 5. HOMEPAGE-TEST-LANDING-READINESS

- mission: Prepare homepage and priority test landing pages to explain value, method, trust evidence, duration, free/paid boundary, and safe CTAs without frontend-invented content.
- first task id: `TEST-LANDING-PROOF-SURFACE-01`
- owner repo: `fap-web`
- allowed actions:
  - render/readiness scans
  - CMS/backend field planning
  - schema and CTA route guard planning
  - docs-only comparison with competitor patterns without copying text
- forbidden actions:
  - adding publishable copy in frontend runtime
  - fake reviews, ratings, usage numbers, or authority claims
  - Review/AggregateRating/Product schema without verified source data
  - competitor paragraph imitation
- dependency blockers:
  - proof fields must be source-backed
  - GPT-5.5 Pro must own approved page copy
- GO / NO-GO output format:
  - `GO: homepage and test landing readiness can support organic distribution`
  - `CONDITIONAL: page shells work but proof or service explanation remains thin`
  - `NO-GO: landing pages cannot safely receive commercial traffic`

### 6. RESULT-PAYWALL-HELP-SERVICE

- mission: Prove that result pages, free result value, paywall modules, help pages, refund/support explanations, and unlock flows can support paid users safely.
- first task id: `RESULT-PAYWALL-CHECKOUT-SMOKE-01`
- owner repo: `fap-web`
- allowed actions:
  - local/test smoke planning
  - docs-only result/paywall/help/service inventory
  - backend truth contract references
  - support/refund/help content gap reporting
- forbidden actions:
  - real production payment
  - real private result/order/share/payment URL access
  - exposing raw IDs
  - Codex-authored support or payment copy
- dependency blockers:
  - privacy gate must be at least conditional and not Yes
  - freemium/paywall backend authority must be clear
- GO / NO-GO output format:
  - `GO: result, paywall, unlock, and help service paths are safe for controlled commercial smoke`
  - `NO-GO: paid user support or unlock flow is not ready`

### 7. SEO-ARTICLE-SYSTEM

- mission: Continue CMS article operations through approved GPT-5.5 Pro content packages, controlled importer dry-runs, CMS review, publish preflight, and post-publish observation.
- first task id: `SEO-ARTICLE-SYSTEM-READINESS-01`
- owner repo: `fap-api`
- allowed actions:
  - package schema validation
  - importer dry-run reports
  - CMS-only docs and ledgers
  - post-publish sitemap, llms, and search-submission planning
- forbidden actions:
  - Codex-generated titles, H1, meta, body, FAQ, CTA, or article text
  - second SEO article publish before authorization
  - CMS draft or publish without exact authorization
  - GSC URL Inspection, IndexNow, or Baidu English URL submission
- dependency blockers:
  - first canary performance and safety observation remains early
  - content package ownership must stay with GPT-5.5 Pro
- GO / NO-GO output format:
  - `GO: next SEO article may enter approved package/dry-run planning`
  - `NO-GO: article system is not ready for the next publish`

### 8. CAREER-GRAPH-QUALITY-GATE

- mission: Gate career graph, career job pages, career recommendations, and career pSEO by reviewer status, claim boundary, language thickness, schema, and backend authority.
- first task id: `CAREER-QUALITY-TIERING-01`
- owner repo: `fap-web`
- allowed actions:
  - read-only public/API career sampling
  - generated quality tier reports
  - schema and sitemap readiness scans
  - docs-only pSEO decision ledgers
- forbidden actions:
  - 1046 career pSEO blast
  - search submission for career pages without explicit GO
  - frontend-authored career copy
  - strong salary, AI, hiring, or career-guarantee claims without backend approval
- dependency blockers:
  - thin or pilot pages must not be treated as approved pSEO inventory
  - backend reviewer/claim gates must be respected
- GO / NO-GO output format:
  - `GO: approved career subset is ready for controlled SEO planning`
  - `NO-GO: career inventory cannot be amplified`

### 9. PUBLIC-BENEFIT-TRUST-GATE

- mission: Ensure DailyGiving and foundation trust surfaces are backed by public-safe records, private proof storage, redaction, noindex/index gates, and claim-safe copy.
- first task id: `DAILY-GIVING-PUBLIC-PROOF-READINESS-01`
- owner repo: `fap-api`
- allowed actions:
  - proof storage and redaction readiness scans
  - public API records/months smoke
  - noindex/indexability gate validation
  - claim boundary checks
- forbidden actions:
  - DailyGiving trust badge before records/proof readiness
  - public amplification with zero public records
  - leaking proof private paths or receipts
  - implying official UN cooperation, certification, endorsement, or guaranteed impact
- dependency blockers:
  - public records/months must exist and be safe
  - proof privacy must be proven at storage/path level
- GO / NO-GO output format:
  - `GO: DailyGiving can be used as a limited public trust asset`
  - `NO-GO: DailyGiving remains private/operator-only or noindex`

### 10. MULTIMEDIA-CONTENT-KITCHEN

- mission: Prepare video, image, short-form, social, Reddit, and channel content operations with claim gates, UTM rules, landing-page mapping, QA, and human approval.
- first task id: `MULTIMEDIA-CONTENT-KITCHEN-01`
- owner repo: `fap-web`
- allowed actions:
  - docs-only content kitchen SOP
  - UTM and channel taxonomy
  - landing page mapping
  - claim-review checklist
  - GPT-5.5 Pro brief handoff
- forbidden actions:
  - publishing social or Reddit batches
  - Codex-generated publishable copy
  - competitor content imitation
  - unreviewed medical, hiring, official, or guarantee claims
- dependency blockers:
  - privacy and claim gates must pass before scale distribution
  - UTM governance must be in place before paid/social attribution
- GO / NO-GO output format:
  - `GO: multimedia briefs may be produced for human review`
  - `NO-GO: distribution remains blocked`

### 11. DASHBOARD-LIVE-DATA-READINESS

- mission: Move SEO and commercial dashboards from artifact-backed shells toward live-backed read models without weakening privacy, truth-source, or Unknown handling.
- first task id: `SEO-DASH-REAL-DATA-READINESS-01`
- owner repo: `fap-web`
- allowed actions:
  - docs-only data source planning
  - artifact vs live truth labeling
  - dashboard issue queue contract planning
  - backend/public API read-model scans
- forbidden actions:
  - writing CMS or analytics data
  - treating Unknown as 0
  - exposing private URLs or raw identifiers
  - using GA4/Baidu as purchase truth
- dependency blockers:
  - privacy live review must define safe read paths
  - backend truth contracts must exist for revenue/unlock/report metrics
- GO / NO-GO output format:
  - `GO: dashboard can consume approved live read models`
  - `NO-GO: dashboard remains artifact-backed or planning-only`

## First Allowed Parallel Tasks

The first allowed parallel tasks are planned only. Starting each task still requires its own scoped authorization.

| Task id | Window | Repo | Current intent |
| --- | --- | --- | --- |
| `PRIVACY-ORDER-RESULT-LIVE-REVIEW-02` | PRIVACY-ORDER-RESULT-GATE | `fap-web` | Repeat live privacy review with authenticated read-only dashboard evidence. |
| `FREEMIUM-LOCALE-POLICY-01` | FREEMIUM-PAYWALL-UNLOCK-AUTHORITY | `fap-api` | Add backend-authoritative locale freemium policy. |
| `TEST-LANDING-PROOF-SURFACE-01` | HOMEPAGE-TEST-LANDING-READINESS | `fap-web` | Define source-backed homepage/test proof surface readiness. |
| `CAREER-QUALITY-TIERING-01` | CAREER-GRAPH-QUALITY-GATE | `fap-web` | Tier career inventory before pSEO or search amplification. |

## Current Window Start Decision

| Window | Can start next? | Reason |
| --- | --- | --- |
| Window 1: COMMERCIAL-READINESS-CONTROL-TOWER | Yes | This PR defines the ledger and current fence. |
| Window 3: COMMERCIAL-EVENTS-ATTRIBUTION-TRUTH | Yes, docs/readiness only | Runtime event aliases exist, but purchase truth and live privacy gates remain blockers. |
| Window 4: FREEMIUM-PAYWALL-UNLOCK-AUTHORITY | Yes, backend-authority implementation only | Existing policy is not backend-authoritative. |
| Window 7: SEO-ARTICLE-SYSTEM | Yes, planning/package/dry-run only | Second article publish remains forbidden until separately authorized. |

## Repository Rule Impact

This PR updates coordination rules and readiness ledgers only. It reinforces existing authority boundaries:

- CMS/backend remains the content and payment truth authority.
- fap-web remains a rendering and interaction shell.
- Codex must not generate publishable content.
- Commercial promotion remains blocked by explicit P0 gates rather than optimistic readiness language.
