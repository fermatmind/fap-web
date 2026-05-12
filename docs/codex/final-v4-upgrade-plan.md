# FermatMind Final V4 Upgrade Plan

## Goal

Upgrade FermatMind from a system where content authority, runtime fallback, and media ownership are still split across frontend and backend into a system with clear operational boundaries:

- CMS/backend owns publishable content and mutable media.
- Runtime fallback lives in cache and stale last-known-good data, not frontend hardcoded editorial copy.
- MBTI remains the highest-priority product path.
- Non-core surfaces can degrade without taking down MBTI.
- Content publishing, media handling, cache refresh, rollback, and validation have explicit mechanisms.

## Completed Baseline

The following work is treated as already completed and should not be repeated as part of this plan.

### Stability

- Tencent COS was removed as a runtime dependency for the homepage and MBTI primary paths.
- Lookup/questions paths are cached and have prewarm coverage.
- MBTI result is fail-open.
- `attempts/start` has lightweight reuse.
- MBTI take has `fm_token` bootstrap coverage.
- `MBTI_PRIORITY_MODE` is wired into homepage, navigation, and entry surfaces.
- Request-level dynamic signals for landing/take have been reduced.
- Homepage cache behavior has been tightened to roughly 60-second scale.

### Tencent Cleanup

- `fap-web` Tencent environment residue and COS build path residue were removed.
- `fap-api` public media URL output defenses were added.
- DB/CMS core media field checks found no Tencent URL hits.
- Public API sampling responses are clean.

The current system is considered to be in an operable primary-path state, rather than a state where old dependencies can easily take down the main product shell.

## Governing Principles

### Content Authority Belongs To CMS/Backend

All operational, publishable, frequently edited content must use CMS/backend as the source of truth.

Frontend must not add new:

- Operational marketing copy.
- Publishable MDX.
- Homepage hardcoded module copy.
- Article body, cover, or SEO content.
- Test landing page operational content.
- Mutable media assets.

### Runtime Fallback Belongs To Cache, Not Frontend Copy

High-traffic entry pages must not go blank or fail hard because of one CMS/API failure, but the fallback must not be a full hardcoded frontend editorial copy set.

The required fallback order is:

1. CMS/API content.
2. Stale last-known-good cached content.
3. Minimal shell when no usable cached content exists.

### MBTI Is Absolute Priority

Business priority is fixed:

- L1: MBTI.
- L2: Big Five.
- L3: Articles, topics, career recommendations, and non-core tests.

Performance, caching, throttling, resource isolation, and degradation decisions must preserve this order.

### No One-Shot Migration

Do not migrate all twelve content asset classes at once. Migration must proceed by risk band:

1. Low-risk content libraries.
2. Medium-risk content pages.
3. High-risk traffic hubs.

## Content Authority Boundary

These twelve content asset classes must be published or modified through CMS/backend:

1. Article content: title, slug, body, excerpt, author, reading time, publish time, visibility, and indexability.
2. Article SEO: SEO title, description, canonical, Open Graph, Twitter metadata, and JSON-LD.
3. Article covers: cover URL, alt, dimensions, variants, and Open Graph image.
4. Article classification and placement: categories, tags, related-content placement, related test slug, voice, and ordering.
5. Homepage operational content: hero, CTA, quick start, families, trust, footer, SEO, and module content.
6. Tests hub content: `/tests` title, description, category modules, featured resources, FAQ, and SEO.
7. Test category page content: `tests_category_personality`, `tests_category_career`, titles, modules, CTAs, and SEO.
8. Career center content: `/career` module order, titles, CTAs, featured jobs, guides, and resources.
9. Career content: career guides, career jobs, MBTI career recommendations, career detail SEO, body, and sections.
10. Company/help/policy pages: about, charter, foundation, brand, careers, privacy, terms, refund, support, and help.
11. Personality/topic content: personality profiles, type pages, topic pages, sections, FAQ, and SEO.
12. Mutable media assets: operational images, social images, article images, landing page images, alt, caption, credit, and variants.

Frontend may keep:

- Test engines, scoring logic, and interaction flows.
- Payment, login, order, report, and account product logic.
- UI components, layout, animation, and state management.
- Fixed icons, fonts, and foundational brand SVGs.
- API adapters, DTO normalization, routing, and caching strategy.
- Default error messages, skeletons, placeholder images, and empty states.

## Additional Engineering Protocols

### Baseline Protocol

Backend may keep `content_baselines`, but only for:

- New environment initialization.
- Recovery after DB clearing.
- Baseline content imports.
- Disaster recovery and dry-run validation.

`content_baselines` must not be used for runtime page rendering.

### Local DX Protocol

Frontend local development must support working against:

- Local API.
- Test/staging API.
- Mock API.

CMS migration must not require frontend developers to connect to production CMS for routine UI work.

### Data Validation Protocol

Large content imports must include schema validation and dry-run support, especially for:

- The 342 career DOCX files to JSON/DB flow.
- Slugs.
- Sections.
- SEO fields.
- Publication state.

The required order is dry-run first, import second.

### Experiment Boundary

Experimental pages and heavily interactive content can remain product-code-side unless explicitly converted into operational content. Do not mechanically CMS-ify every content-like object.

## Workstreams

### Workstream A: Stability Hardening

This remains the highest-priority workstream.

#### A1. Observation Window

Observe for 24 to 72 hours:

- `attempts/start`.
- `attempts/submit`.
- `/auth/guest`.
- HTTP 429.
- HTTP 5xx.
- `php-fpm` active/idle state and `max_children_reached`.

Pass condition:

- `start` is stable.
- `submit` has no sustained 5xx or 429.
- FPM is not saturated.
- `/auth/guest` noise is reduced.

#### A2. Formal Start/Submit Throttle Buckets

This is the most likely next backend engineering task.

Required work:

- Add `api_attempt_start`.
- Keep `api_attempt_submit`.
- Route `attempts/start` to the start bucket.
- Route `attempts/submit` to the submit bucket.

Goal:

- Start traffic does not crowd out submit traffic.
- Submit traffic is not slowed by start traffic.

#### A3. Auth Guest Single-Flight

Only do this if the observation window proves that `submit 401 -> /auth/guest -> 202` remains high.

Required work:

- Collapse concurrent frontend `/auth/guest` calls into a single in-flight request.
- Ensure multiple 401 responses do not independently trigger guest auth.

This should happen after the P1-C/P1-D observation window, not immediately.

#### A4. API/FPM Resource Isolation

This is required as a medium-to-long-term architecture step.

Target resource planes:

- Lookup/questions read paths.
- Auth/start/submit/result write paths.
- Non-core CMS/API paths.

Implementation options:

- Multiple API instances or worker pools.
- Separate FPM pools.
- API proxy routing by route class.
- Independent monitoring and alerting.

Goal:

- Non-core content paths cannot take down the MBTI transaction chain.

### Workstream B: Content Authority Closure

#### B1. Rules Freeze

This should happen before further migration work.

Required destinations:

- Repository rules.
- `CONTRIBUTING.md`.
- Codex constraints.
- PR review checklist.

Goal:

- Stop new frontend operational content debt.
- Stop new local MDX/JSON content sources.
- Stop `lib/marketing` from accumulating new operational copy.

#### B2. Low-Risk Content First

Migrate first:

1. `content_pages`: about, privacy, terms, refund, support, and related pages.
2. Career guides and career jobs.
3. Articles.
4. Low-risk SEO fields for topics and personality pages.

Reasoning:

- Lower traffic risk.
- Clearer content structures.
- Good validation path for CMS -> API -> Next rendering.

#### B3. High-Risk Hubs Last

Migrate last:

- Homepage.
- `/tests`.
- `/career`.
- Test category pages.

Reasoning:

- These are entry surfaces.
- API instability, ISR misconfiguration, or missing stale fallback can take down acquisition paths.
- They must wait until cache and stale last-known-good behavior are proven.

### Workstream C: Asset System Rebuild

This is not an immediate task, but it must remain part of the final architecture.

#### C1. Unified Asset Domain

Future mutable media assets should use:

- `assets.fermatmind.com`.

Avoid mixing:

- `public/`.
- Historical external links.
- Raw CMS URLs.

#### C2. Media Library And Variants

Use `MediaAssetResource` as the authority for:

- Original images.
- Variants.
- Alt text.
- Captions.
- Credits.
- SEO images.
- Social images.

All operational images must flow through this system.

#### C3. Data Cleanup And Publishing Process

After the asset system is stable, do:

- Historical URL cleanup.
- Non-core media migration.
- Backend editor guidelines.
- Content preview flow.
- Publishing flow.
- Rollback flow.

## Execution Phases

### Phase 0: Rules Freeze

Immediate work:

- Content Authority Rules PR.
- Repository standard updates.
- Review workflow updates.

### Phase 1: Continued Stability Hardening

Immediate work:

- Observe P1-C/P1-D for 24 to 72 hours.
- Decide from data whether to do start/submit bucket separation first or auth/guest single-flight first.

Expected next engineering task:

- Start/submit bucket separation, unless observation proves guest auth amplification is the more urgent blocker.

### Phase 2: Low-Risk CMS Migration

Migrate:

- Content pages.
- Career guides/jobs.
- Articles.

### Phase 3: Medium-Risk Content Migration

Migrate:

- Topics.
- Personality.
- SEO-derived pages.

### Phase 4: High-Traffic Hub Migration

Migrate last:

- Homepage.
- `/tests`.
- `/career`.
- Test category pages.

### Phase 5: Asset System Switch

Complete:

- Unified asset domain.
- Media Library closure.
- Historical media cleanup.
- Editing and publishing standards.

## Acceptance Criteria

### Stability

- Homepage, MBTI landing, take, and result remain stable for extended periods.
- `start` and `submit` do not show obvious amplification.
- `php-fpm` does not saturate.
- 429 and 5xx rates remain low.
- `/auth/guest` noise is controlled.

### Content Authority

- New publishable content no longer enters the frontend repository.
- Low-risk content pages are driven by CMS/API.
- Next.js renders and caches content but is not the source of operational copy.

### Assets

- New media assets use the unified asset domain and Media Library.
- Historical external links no longer pollute public APIs.
- Important pages no longer depend on raw external image URLs.

## Explicit Non-Goals

Do not:

- Migrate all twelve content classes at once.
- Keep full editorial fallback copy in frontend.
- Let homepage, `/tests`, or `/career` go blank when CMS fails.
- Add more operational copy to `lib/marketing`.
- Mechanically CMS-ify all experimental content.
- Start large content migration before the stability workstream is proven.

## Immediate Recommended First PR

The first implementation PR should be a rules-only PR.

Suggested branch:

- `codex/pr-content-authority-v4-rules`.

Suggested scope:

- `AGENTS.md`.
- `CONTRIBUTING.md`.
- `docs/codex/pr-review-checklist.md`.
- `docs/codex/final-v4-upgrade-plan.md`.
- Manifest/state entries only if this PR is formally added to the PR train.

Explicitly out of scope:

- `lib/marketing/homepageContent.ts`.
- `lib/marketing/testsHubContent.ts`.
- Homepage fallback runtime code.
- Tests hub fallback runtime code.
- Any CMS runtime implementation.

Reason:

- This freezes the rules before migration work begins.
- It can be staged with path-limited files and kept isolated from unrelated worktree changes.
