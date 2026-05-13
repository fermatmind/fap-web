# RIASEC V11 Launch Acceptance Report

## Decision

Status: Conditional GO for launch readiness through the production build and contract-smoke chain.

This acceptance pass verifies the merged RIASEC Trusted Result v1.5, Personalization, and Deep Copy runtime in fap-web. It does not add result-page structure, scoring behavior, content-pack changes, career recommendation logic, AI-generated report copy, or local frontend fallback copy.

The remaining condition is operational: run the same acceptance against the deployed production URL after release/deploy, using production API data. The repository build and contract gates are GO.

## Verified Runtime Scope

| Area | Evidence | Status |
| --- | --- | --- |
| Result page smoke | `RiasecResultShell` renders projection v2, trusted result card, six-dimension map, and backend deep content slots | Passed |
| Deep content slot render | `deep_content_slots_v1` slots render only when backend-authored and frontend fallback is disabled | Passed |
| Missing/pending fail-closed | Pending and unknown launch fixture slots are omitted | Passed |
| Report/share/PDF/history | Existing smoke contract covers result, report, report access, share, PDF metadata, and history compare guard | Passed |
| Technical Note | Existing smoke contract covers the RIASEC Technical Note API route and frontend route contract | Passed |
| Examples-only career boundary | Fixture matrix keeps occupation examples as `content_example_not_registry_match_without_reviewed_registry_source` | Passed |
| Analytics safety | Launch smoke confirms RIASEC result/activity/feedback/share events omit raw score, raw feedback, fit, match, and recommendation fields | Passed |
| Production build | `NEXT_PUBLIC_API_URL=https://api.fermatmind.com NEXT_PUBLIC_SITE_URL=https://www.fermatmind.com pnpm build` | Passed |

## No-Go Claim Scan

Runtime source and backend-authority fixtures are checked for disallowed claim surfaces:

- occupation match / job fit / ranking / hiring suitability;
- career success or probability claims;
- unsupported 140Q accuracy claims;
- cross-form raw score delta claims;
- feedback or aspirations changing measured result.

Allowed test-only mentions appear only as forbidden assertions.

## Launch Conditions

Required before public announcement:

1. Deploy the merged fap-web main that contains `RIASEC-DEEP-COPY-10` and this acceptance PR.
2. Run a live smoke against production result/share/Technical Note routes with a real snapshot-bound RIASEC attempt.
3. Confirm production PDF delivery uses snapshot metadata and does not expose raw feedback.
4. Confirm analytics events arrive with the same safe payload shape used in contract tests.

## Sidecar Issues

1. Isolated worktree dependency bootstrap was required because the launch acceptance worktree did not have `node_modules`. `pnpm install --frozen-lockfile` created ignored dependency files only.
2. The production build postbuild step may regenerate `public/sitemap.xml`; generated diffs are restored and are not part of this PR.

## Changed Runtime

None. This PR only adds launch acceptance metadata, report, and contract tests.

## Final Assessment

Conditional GO: repository-level V11 launch acceptance passes. Final production GO still requires post-deploy live smoke on the deployed URL and production API data.
