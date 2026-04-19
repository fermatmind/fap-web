# PR Review Checklist

Use this checklist for PRs that touch content authority, CMS/public APIs, SEO, media handling, fallback behavior, publishing workflow, or high-traffic entry surfaces.

## Scope

- Confirm the PR has one scope and does not combine adjacent train items.
- Confirm changed files stay inside the declared scope.
- Confirm unrelated worktree changes were not staged.
- Confirm the PR body includes what changed, why, validation commands, and intentionally deferred items.

## Repository Rule Impact

- Confirm the PR includes a `Repository rule impact` note when it changes content ownership, CMS models, public content APIs, media handling, SEO generation, sitemap or `llms.txt` enumeration, publishing workflow, or frontend fallback behavior.
- Confirm any new content surface is classified as CMS/backend-authoritative, frontend product-code-only, temporary migration fallback, or deprecated.
- Confirm temporary migration fallbacks include an owner, removal condition, and target removal PR or issue.

## Content Authority

- Confirm frontend files do not introduce new publishable editorial content, operational copy, MDX, content JSON, static public image assets, or local content sources.
- Confirm articles, article SEO, covers, categories, tags, related placement, and publication state remain CMS/backend-owned.
- Confirm homepage, tests hub, test category, career center, CTA, module ordering, featured item, and landing SEO content remains `landing_surfaces` / `page_blocks` owned.
- Confirm help, policy, company, brand, careers, about, charter, foundation, privacy, terms, refund, support, and similar static pages remain `content_pages` owned.
- Confirm career guides, career jobs, career recommendations, personality profiles, topics, FAQ, sections, and SEO remain CMS/public API owned.

## Runtime Fallback

- Confirm CMS-backed surfaces do not fall back to full frontend editorial copy.
- Confirm fallback order is CMS/API content, stale last-known-good cache, then minimal shell or explicit empty/error state.
- Confirm high-traffic hubs are not migrated before stale-cache behavior is proven for that surface.
- Confirm empty CMS responses are handled as empty/error states, not local editorial substitutes.

## Media Assets

- Confirm mutable editorial, marketing, social, article, landing page, and SEO images flow through Media Library metadata or generated variants.
- Confirm the PR does not add replaceable operational images to `public/`.
- Confirm media references include required alt, caption, credit, dimension, variant, and SEO/social metadata when the surface needs them.

## Baselines, Imports, And Validation

- Confirm backend content baselines are not used as runtime page-rendering authority.
- Confirm large content imports include schema validation and dry-run before import.
- Confirm slugs, sections, SEO fields, media references, and publication state are validated.
- Confirm importer fixtures are explicitly scoped as backend baseline importer fixtures when local files are added.

## Local Development

- Confirm the change works with local API, test/staging API, or mock API flows.
- Confirm routine frontend UI development does not require production CMS access.

## Priority And Degradation

- Confirm MBTI remains L1 priority, Big Five L2, and SBTI/articles/topics/career recommendations/non-core tests L3.
- Confirm caching, throttling, resource isolation, or degradation changes do not let non-core surfaces degrade MBTI paths.
- Confirm experimental or heavily interactive surfaces are not mechanically CMS-ified unless the PR explicitly converts them into operational content.

## Verification

- Confirm every manifest-listed local check was run before push.
- Confirm `git diff --check` passes.
- Confirm failed checks are recorded in `docs/codex/pr-train-state.json` and the train stops on failure.
