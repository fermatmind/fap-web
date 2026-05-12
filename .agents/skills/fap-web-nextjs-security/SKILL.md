---
name: fap-web-nextjs-security
description: Use for scoped fap-web Next.js security fixes involving route handlers, middleware, API adapters, rendering boundaries, headers, cache behavior, or sensitive client/server data exposure.
---

## Purpose
Repair fap-web Next.js security boundaries without broad refactors or weakened controls.

## When to use
- Use for middleware, route handlers, API proxies, cache controls, redirects, headers, SSR/SSG data exposure, and client/server trust issues.
- Use when a security finding needs a minimal frontend or edge-side fix and targeted proof.

## When not to use
- Do not use for backend authority fixes that belong in fap-api.
- Do not use for speculative cleanup without a concrete security boundary.

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

## Standard workflow
1. Identify the exact route, component, middleware, server action, API adapter, or config boundary.
2. Preserve existing auth, cache, origin, and public/private data conventions.
3. Apply the smallest safe fix and add or update focused tests when the task includes code changes.
4. Verify no rendered output, metadata, or client bundle exposes sensitive internals.
5. Run common acceptance commands and any focused test for the touched boundary.

## Acceptance commands
```bash
cd /Users/rainie/Desktop/GitHub/fap-web && pnpm typecheck
cd /Users/rainie/Desktop/GitHub/fap-web && NEXT_PUBLIC_API_URL=https://api.fermatmind.com pnpm build
cd /Users/rainie/Desktop/GitHub/fap-web && pnpm test:contract
cd /Users/rainie/Desktop/GitHub/fap-web && git diff --check
```

## Output contract
- Report affected boundary, fix summary, evidence, tests, residual risk, and deploy/runtime impact.

## Stop conditions
- Stop if the fix requires backend authority changes, lowers an existing guard, lacks evidence, or creates a higher severity concern.
