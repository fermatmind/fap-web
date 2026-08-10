# Dependencies and handoff

## Missing or gated inputs

- Career C06 completion artifact: not found in repository evidence/current PR search.
- Current M01/M04/M05/M06, full GSC query×page exports and GSC CWV: unavailable.
- Production RUM and GA4 Web Vitals: unavailable.
- Current independent Topic Graph corpus: unavailable; live backend sitemap-source is this freeze's authority.
- IQ/EQ metadata repository owner: pending authority payload versus consumer projection trace. `ASSESSMENT-LANDING-RUNTIME-RECOVERY-01` merged on current main, but its declared scope explicitly excluded canonical and metadata changes, so the four-route metadata finding remains open.

## Window 7 completion-train dependencies

The operator-authorized completion train is strictly serial:

1. `NONCAREER-AUDIT-STATUS-RECONCILIATION-01`
2. `NONCAREER-CRITICAL-LAB-REMEASUREMENT-01`
3. `NONCAREER-L1-INTERVAL-BASELINE-01`
4. `NONCAREER-ATTRIBUTION-CANONICAL-EVIDENCE-COMPLETION-01`
5. `NONCAREER-GSC-GA4-COHORT-EVIDENCE-01`
6. `PUBLIC-CWV-RUM-PRIVACY-SAFE-INSTRUMENTATION-01`
7. `FERMATMIND-NONCAREER-TECHNICAL-GROWTH-AUDIT-CLOSEOUT-01`

Each item starts only after its predecessor is merged, synced and cleaned. Unavailable external measurement/search data remains truthful sidecar evidence and does not authorize fabricated cohort or field conclusions.

`NONCAREER-L1-INTERVAL-BASELINE-01` retained one complete current L1 registry window (10/10 definitions) but could not establish the required three windows separated by at least 30 minutes. Two complete windows remain missing; `BASELINE_WINDOW_INCOMPLETE` and its sidecar stay open. This external evidence gap does not affect the PR's local checks, required GitHub checks, scope validation or merge policy, so the serial train may continue after merge and cleanup. Final closeout must remain `PARTIALLY_BLOCKED` unless later exact evidence closes the gap.

## Exact handoff order

1. Capture L1 layout-shift sources and execute the focused L1 CLS PR without touching APIs or L3.
2. Route-scope the global homepage image preload in an independent PR.
3. Trace IQ/EQ SEO authority ownership, then execute the exact four-route metadata contract PR.
4. Complete Career C06.
5. Implement backend authority guard.
6. Implement dependent frontend consumer guard.
7. Merge only the disabled-by-default, fail-closed privacy-safe RUM collector and contracts; production activation remains separately controlled.
8. After separate production tracking approval and activation, collect a full reporting month before setting relative regression alerts.

## Production write boundary

No production write is needed to read/use or reconcile this report. The completion train does not authorize deployment, CMS/database changes, secrets, ingress modification, Search Console mutation or production RUM activation.
