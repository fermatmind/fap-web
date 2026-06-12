# Scoped PR Train Automerge Deploy

Use only when the current article release discovers a runtime blocker requiring a scoped code or skill PR.

## Flow

1. Create branch from latest `main`.
2. Implement only the current audit PR scope.
3. Run local tests.
4. Run scope validation.
5. Commit.
6. Push.
7. Create PR.
8. Poll GitHub checks.
9. If checks fail, inspect and fix within scope.
10. Confirm checks green.
11. Merge if repo policy allows.
12. Sync main.
13. Clean up branch.
14. Run post-merge revalidation.
15. Deploy if and only if Authorization Profile allows scoped deploy and deploy readiness passes.
16. Resume the failed release stage.

## Must Not Do

- Unrelated refactor.
- Commit generated report directories unless the PR scope explicitly requires generated docs.
- Unrelated dependency upgrade.
- Migration deploy without explicit approval.
- Env/secret mutation.
- Auth/payment/security-risk change without exact approval.

## Resume Rule

After deploy, rerun the failed dry-run/read-only stage before any mutation.
