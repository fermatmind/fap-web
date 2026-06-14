# Failure Recovery

## Common Failures

- `dirty_scope`: unrelated files changed.
- `missing_authority`: backend contract or CMS source is absent.
- `schema_failed`: JSON schema validation failed.
- `evidence_failed`: academic/source claims lack ledger support.
- `parity_failed`: zh/en assets are not equivalent in coverage.
- `private_result_leak`: private report/result content appears.
- `framework_no_go`: forbidden framework-specific pattern appears.
- `indexability_drift`: sitemap, llms, robots, or publish flags changed out of scope.

## Recovery

1. Stop content production.
2. Record the failure in the run manifest.
3. Preserve model-output ledger for audit, but do not promote it.
4. Repair only within the current scope.
5. Re-run schema and QA gates.
6. If failure touches authority or publication, split into a new PR.

## Irrecoverable In Current Run

- Secrets exposed to an external model.
- Private user payload uploaded to a model.
- Missing backend authority for the target framework.
- User asks to publish without explicit indexability gate approval.
