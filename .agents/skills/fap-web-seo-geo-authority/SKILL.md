---
name: fap-web-seo-geo-authority
description: Use for fap-web SEO/GEO authority work involving metadata, sitemap, llms.txt, structured data, canonical URLs, and public enumeration sourced from CMS or public APIs.
---

## Purpose
Keep fap-web SEO and GEO surfaces aligned with backend or CMS authority without local editorial fallback content.

## When to use
- Use for sitemap, `llms.txt`, `llms-full.txt`, metadata, structured data, canonical URL, and public content enumeration changes.
- Use when SEO/GEO behavior must consume CMS or public API data.
- Use `docs/seo/agent/FAPWEB_CODE_PR_WRITER.md` and `pnpm seo-agent:fapweb-code-pr-writer` when an SEO Agent runtime QA finding needs a scoped fap-web code PR for structured data, canonical/hreflang, sitemap/llms, or rendering bugs.

## When not to use
- Do not use to add local article, help, landing, topic, personality, or career editorial content.
- Do not use to edit generated SEO artifacts by hand.

## Hard invariants
- Do not modify unrelated files.
- Do not stage unrelated dirty files.
- Do not process Informational findings unless explicitly requested.
- Do not expose exploit-ready details in public PR titles/bodies.
- Do not merge unless required checks pass and scope is clean.
- Do not close security findings unless source/test evidence proves fixed.
- Stop if active Critical/High/Medium appears during Low/Informational work.
- Do not weaken previously fixed security boundaries.
- Required checks for fap-web are build, contracts, verify-big5-contract-freeze, and verify-enneagram-contract-freeze.
- Sitemap, `llms.txt`, `llms-full.txt`, metadata, and structured data must enumerate from CMS or public APIs for CMS-backed surfaces.

## Standard workflow
1. Identify the SEO/GEO surface, authoritative API, cache behavior, and fallback state.
2. Preserve backend/CMS authority and avoid full frontend editorial fallback copy.
3. Keep stale cache or minimal shell behavior distinct from source-of-truth content.
4. Validate contracts and build behavior with the production public API URL when required.
5. Document repository rule impact when enumeration or authority changes.
6. For SEO Agent code-fix requests, keep the runner as a plan generator only; after human review, Codex may open a scoped PR but must not direct-push `main`, auto-merge, auto-deploy, or bypass CMS/API authority.

## Acceptance commands
```bash
cd /Users/rainie/Desktop/GitHub/fap-web && pnpm typecheck
cd /Users/rainie/Desktop/GitHub/fap-web && NEXT_PUBLIC_API_URL=https://api.fermatmind.com pnpm build
cd /Users/rainie/Desktop/GitHub/fap-web && pnpm test:contract
cd /Users/rainie/Desktop/GitHub/fap-web && git diff --check
```

## Output contract
- Always report changed files, acceptance commands run, PR URL if a PR was created, CI status, Deploy Application or deploy/runtime status when relevant, merge commit if merged, branch cleanup status when cleanup is requested, revalidation status for security-related work, stop reason when blocked, and confirmation that no unrelated files were touched.
- Report authority source, changed SEO/GEO surface, fallback behavior, validation, and deferred CMS operations.

## Stop conditions
- Stop if active Critical/High/Medium appears during Low/Informational work, required checks fail, Deploy Application or deploy/runtime status regresses where relevant, the worktree is dirty in a way that cannot be isolated, scope drift appears, product/runtime behavior is ambiguous, closure would lack source/test evidence, or production deploy/rollback is requested without explicit manual confirmation.
- Stop if a change introduces local editorial authority, edits generated SEO output directly, breaks canonical URLs, or hides failed API contracts.
