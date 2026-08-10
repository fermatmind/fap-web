# Implementation dependencies and PR proposals

## PUBLIC-TOPIC-GRAPH-AUTHORITY-CONTRACT-01

Repo: fap-api
Title: `PUBLIC-TOPIC-GRAPH-AUTHORITY-CONTRACT-01: expose CMS-authoritative public topic edges`
Depends: G03 governed registry, A01, P03–P05, R04, C06 before Career activation, Program Controller registration.
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

Proposed state entry (not applied): `status: pending_dependency`, all SHAs/PR URL/merge facts null or false; unresolved dependencies are G03 governed review, M06 edge-click approval where applicable, Career C06 before Career activation, and Program Controller registration. A01, P03–P05 and R04 are completed inputs and must not appear in the failure reason.

## PUBLIC-TOPIC-GRAPH-RENDERER-01

Repo: fap-web
Title: `PUBLIC-TOPIC-GRAPH-RENDERER-01: render and track backend-authoritative public topic edges`
Depends: authority PR merged, approved fixture, M06, C06 for Career, Program Controller registration.
Likely scope: API adapter, shared deterministic SSR renderer, privacy-safe event adapter after M06, focused contracts, repository rule impact.
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

No manifest/state file was modified by this audit.

Handoff status: the Window 6 closeout is ready once its governed registry review is recorded. Backend implementation must remain non-Career until C06 passes, and renderer tracking must remain gated until the M06 contract is approved.
