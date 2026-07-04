# MBTI Existing Asset Enhancement Runbook

## Scope

Enhance existing MBTI public personality assets without changing runtime authority. This runbook covers:

- 64 A/T variant profile pages.
- 32 A-vs-T comparison pages.
- Approved hot cross-type comparison pages, such as INTJ/INTP, ENTJ/INTJ, INFJ/INFP, and ISTJ/ISFJ.

fap-api remains the CMS/import/API authority. fap-web may prepare packets, QA gates, render contracts, and release evidence, but must not write CMS content or add frontend editorial fallback content.

## Pipeline

### 1. GSC Evidence

Inputs:

- Existing sanitized GSC page export.
- Existing sanitized GSC query export.
- OPS08/OPS09 priority tables and current URL inventory.

Actions:

- Attach page-level and query-level evidence to each target slug when available.
- Mark `GSC_EVIDENCE_PENDING` when query evidence has not been exported yet.
- Classify intent as profile definition, A/T variant, A/T comparison, cross-type comparison, career/relationship/growth, or test-return path.

Outputs:

- Target list with evidence status, intent, current ranking signal, and next PR route.
- No Search Console mutation, provider submission, or live URL indexing action.

### 2. Content Package

Inputs:

- Approved target list from the GSC step.
- Backend CMS/API field expectations.
- MBTI framework rules and source ledger.

Actions:

- Prepare backend-authoritative draft packets for title, description, H1, answer block, FAQ, sections, internal links, and duplicate differentiation notes.
- Keep hot cross-type comparison packages distinct from A-vs-T comparison packages.
- Preserve current route authority and approved slug inventory.

Outputs:

- Content package draft with source refs, claim boundaries, internal-link targets, and `GSC_EVIDENCE_PENDING` flags where needed.
- No production CMS write, no frontend fallback copy, and no sitemap/llms expansion.

### 3. QA

Required gates:

- Schema and field completeness.
- Trademark and MBTI method-boundary review.
- A/T official-status disclaimer.
- Duplicate/template risk across profile and comparison pages.
- Private-result and private-report leakage scan.
- SERP intent fit and GEO answer-surface readability.
- Internal-link graph coverage and orphan-risk scan.

Outputs:

- QA report with `go`, `repair`, or `blocked` status.
- Repair notes tied to exact slugs and fields.

### 4. fap-api Import Dry-Run

Inputs:

- QA-passed content package.
- Schema/field mapping expected by fap-api.

Actions:

- Prepare dry-run handoff instructions for fap-api import validation.
- Require dry-run evidence before any CMS import approval.
- Record mapping gaps, rejected fields, missing authority fields, or route/indexability conflicts.

Outputs:

- Dry-run handoff packet and expected importer report shape.
- No backend production import, database migration, or CMS write in this fap-web skill scope.

### 5. Approval

Required before promotion:

- Operator approval for CMS import or promotion.
- Confirm no production import, production deploy, sitemap, llms, Search Queue, or indexability change is bundled into this PR.
- Confirm backend authority and API smoke plan.

Outputs:

- Explicit approval record, or `blocked_approval_required`.

### 6. Promotion

Promotion can start only after:

- fap-api import PR is merged or otherwise approved by the backend authority layer.
- Public API smoke confirms the expected fields.
- fap-web render contract can consume the API output without local editorial fallback content.

Outputs:

- Rendering/release PR handoff.
- No implicit production deploy.

### 7. sitemap/llms Gate

Indexability work must be a separate gate after content authority and runtime smoke pass.

Required checks:

- `launch_state=published`.
- `index_eligible=true`.
- `robots=index,follow`.
- Canonical and hreflang are valid.
- Duplicate and template-risk gates pass.
- Live API/render smoke passes.
- sitemap, llms, llms-full, URL Truth, and Search Queue eligibility are aligned.

Outputs:

- Indexability approval or blocked report.
- No sitemap/llms URL set expansion inside this runbook unless the current PR is explicitly the sitemap/llms gate.

## Stop Rules

Stop when:

- GSC query evidence is required for the current target and cannot be represented as `GSC_EVIDENCE_PENDING`.
- The target slug is not in the approved profile, A/T comparison, or hot cross-type comparison inventory.
- A draft requires frontend local editorial fallback content.
- A draft requires production CMS import, production deploy, DB migration, secrets, or Search Console mutation.
- QA finds private-result leakage, official MBTI/A-T overclaiming, deterministic career/relationship claims, or unresolved duplicate risk.

## Forbidden

- Do not regenerate all 64 pages.
- Do not replace existing route authority.
- Do not write production CMS.
- Do not import into fap-api outside a dry-run handoff.
- Do not expand sitemap, llms, llms-full, URL Truth, Search Queue, robots, canonical, or noindex/indexability state without a separate explicit gate.
