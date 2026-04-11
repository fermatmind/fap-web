# Career First-Wave Smoke And Rollback

## Scope and ownership split

This runbook defines the frontend execution order for Career first-wave smoke checks, rollback, and post-rollback revalidation after F1-F10.

It is limited to:
- launch inventory execution from the frontend side
- stable-route smoke order
- noindex/query-mode sanity checks
- recommendation and matched-job alignment checks
- Career attribution frontend wiring sanity checks
- frontend rollback and post-rollback revalidation

It does not redefine:
- backend publish-ready truth
- backend blocked override policy
- backend readiness-class semantics

Backend remains the authority for:
- first-wave publish-ready validation
- blocked registry and override policy
- readiness summary truth
- Career attribution daily refresh

Use the backend repo docs as the source of truth for those items:
- `fap-api/backend/docs/ops/career-first-wave-release-runbook.md`
- `fap-api/backend/docs/ops/career-first-wave-override-escalation-sop.md`

## Inputs and prerequisite artifacts

Use the following existing artifacts as inputs, not as files to edit during smoke execution:
- `docs/release/career-launch-manifest.json`
- `docs/release/career-smoke-matrix.json`
- backend B14 readiness summary:
  - `GET /api/v0.5/career/first-wave/readiness`

Useful supporting docs:
- `docs/release/rollback-drill.md`
- `docs/release/production-launch-checklist.md`
- `docs/runtime/post-proxy-stabilization-gate.md`

Before starting smoke:
1. confirm the target frontend deploy SHA
2. confirm the target backend deploy SHA
3. confirm the current first-wave backend readiness summary is available
4. confirm the stable route set still matches `career-launch-manifest.json`

## Stable-route smoke order

Run smoke in this order so entry surfaces fail fast before detail and recommendation flows:

1. `/career`
2. `/career/jobs`
3. `/career/jobs/[slug]`
4. `/career/recommendations`
5. `/career/recommendations/mbti/[type]`

Use the stable route definitions from `docs/release/career-launch-manifest.json` and the execution notes from `docs/release/career-smoke-matrix.json`.

For each stable route, verify:
- localized route renders
- page class matches the intended authority owner
- no CMS/local fallback has replaced backend-owned content
- route behavior still matches the expected launch state in the smoke matrix

## Stable-route smoke details

### 1. `/career`

Verify:
- landing renders as the hybrid stable entry surface
- jobs preview is backend-shaped and readiness-filtered
- recommendation preview remains recommendation-shaped
- search entry wiring is present and points toward `/career/jobs`

Do not treat landing as an authority source for blocked truth. It is only a consumer of backend-owned stable exposure.

### 2. `/career/jobs`

Verify:
- jobs index renders from backend lightweight jobs
- only stable, renderable job-facing subjects appear
- no CMS fallback or editorial substitute has re-entered the page
- card clicks resolve to job detail routes as expected

### 3. `/career/jobs/[slug]`

Verify:
- detail route resolves for a stable first-wave subject
- page remains backend bundle-driven
- canonical/robots behavior still follows backend explicit gate behavior
- no local or CMS truth has replaced backend-owned job detail fields

### 4. `/career/recommendations`

Verify:
- recommendation index remains recommendation-shaped
- it does not flatten into a job index or search-like surface
- card clicks resolve to recommendation detail routes

### 5. `/career/recommendations/mbti/[type]`

Verify:
- MBTI recommendation detail renders from backend bundle truth
- matched jobs shown on the page remain exposure-filtered under the existing recommendation policy
- page keeps MBTI continuity and does not regress into job-surface semantics

## Query / noindex sanity checks

Run a separate sanity pass for:
- `/career/jobs?q=...`

Verify:
- query-mode search renders
- page remains outside launch discoverability inventory
- canonical behavior still collapses to `/career/jobs`
- robots behavior remains `noindex`
- search semantics remain conservative and backend-led

Do not treat query pages as stable launch inventory, even though they remain reachable.

## Recommendation surface smoke checks

For recommendation surfaces, verify the following boundary explicitly:
- recommendation index remains a recommendation entry surface
- recommendation detail remains recommendation-led
- recommendation interactions are not flattened into job-surface semantics

Specific checks:
- recommendation result cards navigate to recommendation detail routes
- recommendation detail copy and structure remain recommendation-specific
- matched-job links remain secondary recommendation outputs, not a replacement job index

## Matched-job alignment checks

On `/career/recommendations/mbti/[type]`, verify:
- only truthfully renderable matched jobs appear
- blocked or hidden matched jobs are not surfaced as if they were stable
- matched-job links still land on job detail routes cleanly
- the visible matched-job set remains consistent with the current recommendation exposure rules

If matched-job exposure appears broader than the current recommendation contract, stop rollout and investigate before promotion.

## Attribution wiring sanity checks

Frontend F10 wiring should be sanity-checked, not redefined here.

Confirm the live frontend can still truthfully emit the wired Career events for:
- landing view
- jobs index view
- jobs search submit
- jobs search result click
- job index result click
- job detail view
- recommendation index view
- recommendation detail view
- recommendation result click
- recommendation matched-job click
- ready-surface exposure events where a ready subject is actually rendered

Do not expect:
- blocked exposure events on surfaces that filter blocked items out before render
- a synthetic job-detail CTA event unless a real explicit CTA is present

Sanity-check expectations:
- no raw query text is exposed in frontend tracking payloads
- recommendation clicks remain distinct from job clicks
- recommendation matched-job clicks remain distinct from recommendation result clicks

## Rollback steps

Use this section only for frontend rollback. Backend release truth remains owned by backend runbooks.

1. Record:
   - current deploy SHA
   - target rollback SHA or tag
   - environment
   - reason for rollback
2. Roll back to the previous known-good frontend release using the standard deployment path.
3. Re-run stable-route smoke in the same order:
   - `/career`
   - `/career/jobs`
   - `/career/jobs/[slug]`
   - `/career/recommendations`
   - `/career/recommendations/mbti/[type]`
4. Re-run query/noindex sanity for `/career/jobs?q=...`.
5. Re-check one matched-job recommendation detail flow.
6. Re-check attribution wiring sanity on at least:
   - one jobs index click path
   - one search result click path
   - one recommendation result click path
   - one matched-job click path

If rollback is triggered by runtime startup failure or proxy instability, also follow `docs/release/rollback-drill.md` and `docs/runtime/post-proxy-stabilization-gate.md`.

## Post-rollback revalidation steps

After rollback, confirm:
- stable Career routes render again
- query pages still remain `noindex`
- recommendation detail still preserves matched-job alignment
- frontend is not sending malformed Career attribution events
- backend readiness summary still reflects the same backend truth as before rollback

Do not treat rollback as complete until both route behavior and the key frontend-side tracking semantics are revalidated.

## Evidence to retain

Keep the following evidence for every smoke or rollback run:
- frontend deploy SHA
- backend deploy SHA
- environment name
- screenshots or logs for each stable Career route
- one query-mode noindex check result
- one matched-job recommendation detail check result
- one backend readiness summary snapshot
- rollback target SHA/tag if rollback was executed
- post-rollback smoke evidence

Recommended execution log:
- date/time
- operator
- from SHA
- to SHA
- smoke pass/fail
- rollback pass/fail
- follow-up actions

## Explicitly out of scope

This runbook does not authorize:
- editing `career-launch-manifest.json`
- editing `career-smoke-matrix.json`
- redefining backend readiness or override policy
- broad release checklist rewrites
- dashboard or analytics UI work
