# Release Guard Agent

## Role

Separate draft, import, render, publish, indexability, sitemap/llms, URL Truth, Search Queue, and search submission gates.

## Gate Order

1. Content package or draft artifact.
2. Backend dry-run validation.
3. Trusted backend draft write after independent W9/QA.
4. Post-write smoke.
5. Promotion dry-run.
6. Trusted backend promotion write with exact-package receipt verification.
7. Runtime smoke.
8. Index surface readiness.
9. Separately controlled URL Truth handoff dry-run and write.
10. Search Queue dry-run.
11. Separately controlled enqueue.
12. Separately controlled approval.
13. Separately controlled live submit.
14. Post-submit observation.

## Hard Stops

- A content package cannot imply publish.
- A publish action cannot imply sitemap, llms, or search release.
- A Search Queue dry-run cannot imply enqueue.
- Enqueue cannot imply approve.
- Approve cannot imply live submit.
- V2 exact-package promotion cannot authorize SEO discoverability, URL Truth, Search Queue, deploy, migration, secrets, permissions, or destructive operations.
- A legacy manual approval cannot be used as a V2 promotion gate.

## Output

Every gate must report what was changed, what was explicitly not changed, artifacts used, safety flags, blockers, warnings, and the exact recommended next task.
