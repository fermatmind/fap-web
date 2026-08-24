---
name: fap-web-career-public-projection-renderer
description: Use for fap-web Career job detail rendering, adapters, contract tests, accessibility, caching, or performance work that consumes the published fap-api public projection without producing Career content.
---

# Career Public Projection Renderer

Use this Skill only for the fap-web Career job detail projection consumer. The
published fap-api public projection is the sole content authority; fap-web
validates and renders it but never generates, repairs, completes, or publishes
Career content.

## Required context

Read [the renderer contract](references/renderer-contract.md) before changing a
Career projection adapter, display surface, detail route, cache boundary, or
focused contract test. Inspect the real API response and current callers before
editing.

## Workflow

1. Identify the published API contract, adapter, renderer, cache behavior, and
   affected locale.
2. Validate the exact v4.3 28-component order or sealed v4.2 26-component
   compatibility order and every required field before rendering. Preserve API
   array order and cardinality.
3. Render all canonical published content, including FAQ question/answer pairs,
   tables, sources, links, localized CTA attribution, canonical, hreflang, and
   locale metadata.
4. Fail closed for a missing, malformed, draft, mismatched-locale, or
   mismatched-version projection. A contentless HTTP 200 is forbidden.
5. Verify responsive layout, keyboard and screen-reader access, horizontal
   overflow, request budget, and the fetch-cache/render-cache boundary.
6. Run focused Career projection and renderer contracts. Add typecheck, lint,
   and build only when runtime code changes.

## Hard boundaries

- Do not read Desktop Career assets, local JSON, generated candidates, or an
  HTML template as runtime content or fallback authority.
- Do not produce salary, AI-impact, work-activity, skills-entry, adjacent-career,
  FAQ, source, claim, or `related_next_pages` content in fap-web.
- Do not hide otherwise valid canonical published content merely because a
  derived claim permission is absent. Claim permissions constrain derived or
  risky presentation, not the published projection's canonical completeness.
- Do not reuse an older rendered HTML shape after a frontend release changes
  the projection contract. API fetch caching and rendered-page caching are
  separate responsibilities.
- Do not publish, deploy, operate PM2, manage LKG, or perform recovery here.
  Route deployment work to `fermatmind-frontend-deploy-sre`.
- Do not change sitemap, discoverability, `llms.txt`, GSC, or search submission
  unless the task explicitly includes that independently controlled scope.

## Acceptance

- One public projection is selected from fap-api and every available component
  renders in the versioned API-defined order with field and array fidelity.
- Invalid authority returns a real fail-closed response, never local content or
  a soft 404.
- Canonical/hreflang/locale and CTA attribution remain correct.
- Mobile and desktop layouts are accessible, bounded, and free of horizontal
  overflow.
- Focused tests and `git diff --check` pass; changed-file scope contains no
  content production or discoverability write.
