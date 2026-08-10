# Implementation dependencies and PR proposals

## PUBLIC-TOPIC-GRAPH-AUTHORITY-CONTRACT-01

Repo: fap-api
Title: `PUBLIC-TOPIC-GRAPH-AUTHORITY-CONTRACT-01: expose CMS-authoritative public topic edges`
Completion: initial PR #3594 and G03 alignment PR #3605 are merged. G03, A01, P03–P05, R04 and Program Controller evidence are bound; C06 remains required before any later Career activation.
Likely scope: edge model/existing relation extension, public API resource/service, validation/publication gate, cache/readback, focused contracts, repository rule impact.
Checks: focused PHP contracts, route list, scoped Pint, Composer validate/audit, JSON/YAML, diff/scope.

Historical pre-execution manifest sketch (superseded by the merged fap-api Program Controller entry):

```yaml
- id: PUBLIC-TOPIC-GRAPH-AUTHORITY-CONTRACT-01
  repo: fap-api
  title: "PUBLIC-TOPIC-GRAPH-AUTHORITY-CONTRACT-01: expose CMS-authoritative public topic edges"
  depends_on: [G03, A01, P03-P05, R04]
  scope: backend CMS/public edge contract, projection, gates, cache/readback, focused tests
  local_checks: [focused PHP contract tests, route list, scoped Pint, composer validate, composer audit, diff-check, scope-check]
  merge_policy: {github_checks_required: true, squash: true}
```

The authoritative fap-api state now records PR #3594 and the merged G03 alignment repair #3605. G03 and M06 are complete. Phase one rejects Career independently of database contents until C06 passes.

## PUBLIC-TOPIC-GRAPH-RENDERER-01

Repo: fap-web
Title: `PUBLIC-TOPIC-GRAPH-RENDERER-01: render and track backend-authoritative public topic edges`
Depends: authority PR merged, approved fixture, approved M06 contract, C06 for Career, Program Controller registration.
Likely scope: API adapter, shared deterministic SSR renderer, privacy-safe event adapter under the approved contract, focused contracts, repository rule impact.
Checks: focused Vitest/contracts, lint touched scope, typecheck, production-API build if required, diff/scope.

Current fap-web Program Controller entry is registered; the original scan sketch was:

```yaml
- id: PUBLIC-TOPIC-GRAPH-RENDERER-01
  repo: fap-web
  title: "PUBLIC-TOPIC-GRAPH-RENDERER-01: render and track backend-authoritative public topic edges"
  depends_on: [PUBLIC-TOPIC-GRAPH-AUTHORITY-CONTRACT-01, M06]
  scope: backend-only edge adapter, deterministic SSR renderer, safe tracking, focused tests
  local_checks: [focused Vitest/contracts, lint, typecheck, production-API build, diff-check, scope-check]
  merge_policy: {github_checks_required: true, squash: true}
```

The current fap-web state entry is in progress after its dependencies merged; Career rendering remains a separate C06-gated activation within the same contract, not default active behavior.

The fap-web Program Controller entries are now registered. This contract PR reconciles the merged audit dependency and closes M06 approval only; it does not start the renderer.

Handoff status: G03 and M06 are complete and not deployed. Backend Authority plus its G03 alignment are merged, locally and remotely verified, and still carry no production migration/import. Execute the registered fap-web renderer next; Career remains rejected until current C06 PASS.
