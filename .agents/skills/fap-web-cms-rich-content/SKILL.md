---
name: fap-web-cms-rich-content
description: Use for fap-web CMS rich-content rendering work involving article bodies, page blocks, landing surfaces, help pages, media metadata, or CMS-backed display components.
---

## Purpose
Render CMS-backed rich content in fap-web while keeping publishing authority in fap-api and CMS resources.

## When to use
- Use for rendering components, rich text, page blocks, article layouts, landing modules, help pages, media variants, and empty/error states for CMS-backed data.
- Use when frontend must adapt to backend content contracts without adding local copy authority.

## When not to use
- Do not use to add MDX, JSON, or static public image assets for publishable editorial content.
- Do not use for backend CMS model or publication-state changes.

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
- Empty CMS responses render empty/error states, not local editorial replacement copy.

## Standard workflow
1. Identify the CMS resource, field contract, media metadata, and rendering component.
2. Reuse existing renderers and product-code components before adding new abstractions.
3. Preserve sanitization, link handling, image metadata, and empty states.
4. Avoid adding public editorial copy or mutable image assets in frontend files.
5. Run common acceptance commands and focused rendering tests when available.

## Acceptance commands
```bash
cd /Users/rainie/Desktop/GitHub/fap-web && pnpm typecheck
cd /Users/rainie/Desktop/GitHub/fap-web && NEXT_PUBLIC_API_URL=https://api.fermatmind.com pnpm build
cd /Users/rainie/Desktop/GitHub/fap-web && pnpm test:contract
cd /Users/rainie/Desktop/GitHub/fap-web && git diff --check
```

## Output contract
- Always report changed files, acceptance commands run, PR URL if a PR was created, CI status, Deploy Application or deploy/runtime status when relevant, merge commit if merged, branch cleanup status when cleanup is requested, revalidation status for security-related work, stop reason when blocked, and confirmation that no unrelated files were touched.
- Report CMS resource, rendering contract, empty-state behavior, media handling, validation, and deferred backend work.

## Stop conditions
- Stop if active Critical/High/Medium appears during Low/Informational work, required checks fail, Deploy Application or deploy/runtime status regresses where relevant, the worktree is dirty in a way that cannot be isolated, scope drift appears, product/runtime behavior is ambiguous, closure would lack source/test evidence, or production deploy/rollback is requested without explicit manual confirmation.
- Stop if frontend becomes content authority, sanitization is unclear, media metadata is missing, or backend contract changes are required but out of scope.
