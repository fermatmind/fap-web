# FermatMind Project Scan Playbook

Purpose: provide a reusable project scanning guide for future SEO, GEO,
discoverability, topic graph, and authority-governance work.

This document is a planning and scan artifact. It does not define runtime
behavior, change content authority, or approve SEO expansion by itself.

## Current Foundation

FermatMind currently has three important governance layers in place:

1. Discoverability Foundation
   - sitemap governance
   - llms / llms-full governance
   - canonical / hreflang / JSON-LD parity gates
   - private-flow exposure protection
   - Evidence Container readiness gates
   - shared discoverability exposure policy

2. URL Truth & SEO Governance
   - URL inventory generator
   - llms parity contracts
   - duplicate metadata/entity detectors
   - career family authority audit
   - internal-link and orphan detection
   - expanded live/generated parity samples
   - fallback SEO authority inventory
   - Evidence Container live readiness sampling

3. SEO Foundation Authority Convergence
   - metadata surface ownership inventory
   - Article JSON-LD fallback governance
   - llms topic fallback governance
   - expanded metadata/canonical/hreflang/JSON-LD parity matrix
   - sitemap authority adapter split
   - duplicate title governance report

The current operating principle remains:

- backend/CMS owns mutable SEO and graph truth where backend/CMS surfaces exist
- frontend deterministic-renders authority
- fallbacks must be inventoried, classified, and gated
- no silent sitemap or llms widening
- no hidden schema, FAQ, or Evidence stuffing
- private flows must never become discoverable

## When To Use This Playbook

Use this scan format before work that touches any of these areas:

- sitemap, llms, llms-full, robots, canonical, hreflang, metadata, JSON-LD
- Evidence Container or GEO answer surfaces
- topic graph, entity graph, internal-link graph, or career graph
- CMS SEO authority, content ownership, page-family governance
- duplicate metadata, duplicate entity, orphan page, or URL truth cleanup
- migration away from frontend fallback authority

Do not use this playbook to justify broad SEO expansion. Expansion work should
start only after the relevant authority, parity, and content ownership gates are
green.

## Source Of Truth Order

Use this priority order during scans:

1. backend `seo.surface.v1`
2. backend sitemap-source
3. backend/CMS graph and content authority
4. generated governance artifacts in `docs/seo/generated`
5. live production HTML, only as validation evidence
6. frontend render adapters and compatibility wrappers

Forbidden fallback:

- frontend-invented SEO authority
- frontend-invented topic or graph authority
- AI-generated thin content
- speculative canonical, schema, or FAQ generation
- hidden schema or answer stuffing

## Scan Preflight

Before starting a scan:

1. Confirm the current branch and worktree state.
2. Identify unrelated dirty files and keep the scan isolated from them.
3. Read `AGENTS.md`, `docs/codex/pr-train.yaml`, and relevant train state when
   the scan may become a PR train.
4. Identify the exact page families and route families in scope.
5. State what must not be touched.

Useful commands:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
find docs/seo -maxdepth 3 -type f | sort
find docs/graph -maxdepth 3 -type f | sort
```

## Core Scan Sequence

Run scans in this order unless the task is explicitly narrower.

### 1. URL Truth Inventory

Build or inspect inventory by route family:

- home
- tests hub
- test detail
- topic
- article
- career job
- career family
- personality
- help / static
- private flows: take, result, results, order, share, pay, payment

For each family, record:

- public URL
- canonical URL
- sitemap inclusion
- llms / llms-full inclusion
- robots or noindex state
- hreflang alternates
- JSON-LD type and canonical alignment
- Evidence Container readiness
- authority owner
- fallback classification

### 2. Sitemap / llms Parity

Check:

- sitemap URL set vs llms URL set
- llms vs llms-full topic parity
- intentional differences
- route-family drift
- duplicated inclusion logic
- private-flow exclusion

Output:

- intentional differences
- unexpected missing URLs
- unexpected added URLs
- migration-required fallback surfaces

### 3. Metadata / Canonical / Hreflang / JSON-LD Parity

Check:

- generated canonical vs live canonical
- sitemap URL vs canonical
- hreflang reciprocity
- JSON-LD `url` / `@id` vs canonical
- metadata ownership classification
- duplicate title and description clusters

Blockers:

- canonical drift introduced by current work
- duplicate canonical entity introduced
- hreflang reciprocity regression
- JSON-LD authority split

### 4. Noindex And Private Flow Protection

Protected flows:

- `/tests/*/take`
- `/result/*`
- `/results/*`
- `/orders/*`
- `/share/*`
- `/pay/*`
- `/payment/*`

Each protected flow must remain:

- noindex
- nofollow where applicable
- excluded from sitemap
- excluded from llms and llms-full
- without public JSON-LD

### 5. Authority Ownership

Classify every surface:

- `backend_owned`
- `cms_backed`
- `product_code_only`
- `private_noindex`
- `migration_required`
- `watchlist`
- `safe_static`

Flag:

- frontend fallback metadata
- frontend fallback JSON-LD
- local content authority for CMS-backed page families
- duplicated schema generation
- compatibility wrappers that could become hidden authority

### 6. Evidence Container And GEO Readiness

Check:

- visible answer or evidence blocks
- visible FAQ alignment
- JSON-LD alignment with visible content
- grounded decision-oriented content
- hidden FAQ/schema stuffing risk

Classify each page family:

- ready
- partial
- not ready
- dangerous

### 7. Graph Readiness

For topic or career scans, inspect graph edges:

- topic_to_test
- topic_to_type
- type_to_career
- career_to_trait
- topic_to_article
- topic_to_faq
- topic_to_cta

Classify:

- CMS/backend governed
- deterministic frontend render
- compatibility fallback
- missing
- dangerous frontend authority

## Standard Scan Report Template

Use this structure for future scan reports:

1. Executive Summary
2. Current Foundation Status
3. URL Inventory Matrix
4. Sitemap / llms Parity Audit
5. Metadata / Canonical / Hreflang / JSON-LD Audit
6. Noindex / Private Flow Audit
7. SEO Authority Ownership Audit
8. Evidence Container / GEO Readiness Audit
9. Topic / Entity / Career Graph Readiness, when relevant
10. Duplicate Metadata / Duplicate Entity Audit
11. Internal-Link / Orphan Page Audit
12. P0 / P1 / P2 Backlog
13. Recommended PR Split Plan
14. Dangerous Areas
15. Regression Strategy
16. What Not To Expand Yet

## Backlog Severity

Use these definitions consistently.

P0:

- private-flow exposure
- sitemap or llms widening without an explicit fixture
- canonical drift
- JSON-LD authority split
- hidden schema or hidden FAQ stuffing
- frontend-invented SEO authority for CMS/backend-owned surfaces

P1:

- migration-required fallback on a public SEO surface
- duplicate canonical entity clusters
- weak or missing parity coverage for high-value page families
- orphan indexable pages in core traffic families
- CMS authority gaps blocking Topic Graph or GEO expansion

P2:

- duplicate title or description watchlists
- weak internal-link graph
- Evidence Container partial readiness
- documentation gaps
- optional live sample coverage gaps

## PR Split Rules

Prefer this order for scan-to-execute trains:

1. Inventory first
2. Contract and fixture second
3. Parity gates third
4. Read-only reports fourth
5. Narrow runtime alignment only after gates are green
6. Refactor last

Avoid:

- combining inventory with remediation
- changing sitemap output while adding detector coverage
- removing fallback before ownership is complete
- expanding Topic Graph before llms/topic fallback governance is stable
- changing content while writing governance reports

## Validation Commands

Run only the commands relevant to the scan or PR scope.

Frontend:

```bash
pnpm typecheck
pnpm test:contract
pnpm seo:generate-sitemap
pnpm seo:check-sitemap
git diff --check
git diff --cached --check
```

Optional:

```bash
pnpm lint
node scripts/seo/check-canonical-hreflang-jsonld-parity.mjs --json
```

Live checks must stay optional unless an existing repo policy explicitly makes
them required. Required CI should not depend on external network availability.

## Scan Output Decision Rules

A future execute PR can start when:

- scope is single-purpose
- authority owner is known
- no private-flow exposure is involved
- generated fixtures exist or can be added first
- no unrelated runtime system must be touched

Stop and scan deeper when:

- authority owner is ambiguous
- frontend fallback is the only available SEO source
- canonical and JSON-LD disagree
- sitemap and llms disagree without an approved fixture
- page-family ownership conflicts with `AGENTS.md`
- remediation would touch commerce, payment, auth, reports, attempts, or scoring

## Current Watchlist

Known surfaces that need governance before expansion:

- Article JSON-LD fallback: governed migration risk, not final authority.
- Topic llms fallback: compatibility fixture only, not Topic Graph authority.
- Duplicate titles/descriptions: report first, CMS remediation later.
- Career family authority: audit/remediation planning before URL or canonical
  changes.
- Evidence Container: visible-content readiness before GEO expansion.
- Topic Graph: entity and edge governance before broad page expansion.

## What Not To Expand Yet

Do not expand:

- mass Topic Graph pages
- Career pSEO
- AI-generated SEO or GEO content
- hidden FAQ/schema answer surfaces
- Recommendation Engine
- Behavior Graph
- Long-term Profile
- B2B or enterprise surfaces

Do not turn compatibility fallbacks into permanent authority. A fallback must
have an owner, removal condition, and migration target before it can support
public expansion.
