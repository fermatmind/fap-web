# Implementation dependencies and PR proposals

## PUBLIC-TOPIC-GRAPH-AUTHORITY-CONTRACT-01

Repo: fap-api
Title: `PUBLIC-TOPIC-GRAPH-AUTHORITY-CONTRACT-01: expose CMS-authoritative public topic edges`
Depends: completed G03 governed registry, A01, P03–P05, R04; C06 remains required only before any later Career activation; fap-api Program Controller registration is next.
Likely scope: edge model/existing relation extension, public API resource/service, validation/publication gate, cache/readback, focused contracts, repository rule impact.
Checks: focused PHP contracts, route list, scoped Pint, Composer validate/audit, JSON/YAML, diff/scope.

Proposed manifest entry (not applied):

```yaml
- id: PUBLIC-TOPIC-GRAPH-AUTHORITY-CONTRACT-01
  repo: fap-api
  title: "PUBLIC-TOPIC-GRAPH-AUTHORITY-CONTRACT-01: expose CMS-authoritative public topic edges"
  depends_on: [G03, A01, P03-P05, R04]
  scope: backend CMS/public edge contract, projection, gates, cache/readback, focused tests
  local_checks: [focused PHP contract tests, route list, scoped Pint, composer validate, composer audit, diff-check, scope-check]
  merge_policy: {github_checks_required: true, squash: true}
```

Proposed fap-api state entry (not applied here): initial `status: user_authorized`, all SHAs/PR URL/merge facts null or false. G03 and M06 are complete. Phase one must reject Career independently of database contents until C06 passes. A01, P03–P05 and R04 are completed inputs and must not appear in the failure reason.

## PUBLIC-TOPIC-GRAPH-RENDERER-01

Repo: fap-web
Title: `PUBLIC-TOPIC-GRAPH-RENDERER-01: render and track backend-authoritative public topic edges`
Depends: authority PR merged, approved fixture, approved M06 contract, C06 for Career, Program Controller registration.
Likely scope: API adapter, shared deterministic SSR renderer, privacy-safe event adapter under the approved contract, focused contracts, repository rule impact.
Checks: focused Vitest/contracts, lint touched scope, typecheck, production-API build if required, diff/scope.

Proposed manifest entry (not applied):

```yaml
- id: PUBLIC-TOPIC-GRAPH-RENDERER-01
  repo: fap-web
  title: "PUBLIC-TOPIC-GRAPH-RENDERER-01: render and track backend-authoritative public topic edges"
  depends_on: [PUBLIC-TOPIC-GRAPH-AUTHORITY-CONTRACT-01, M06]
  scope: backend-only edge adapter, deterministic SSR renderer, safe tracking, focused tests
  local_checks: [focused Vitest/contracts, lint, typecheck, production-API build, diff-check, scope-check]
  merge_policy: {github_checks_required: true, squash: true}
```

Proposed state entry (not applied): `status: pending_dependency`; Career rendering remains a separate C06-gated activation within the same contract, not default active behavior.

The fap-web Program Controller entries are now registered. This contract PR reconciles the merged audit dependency and closes M06 approval only; it does not start the renderer.

Handoff status: G03 and M06 are complete and not deployed. Register and execute the fap-api Authority contract next, with Career rejected in service and contract tests; renderer work remains a later PR lifecycle.
