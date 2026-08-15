# Topology and control plane

Last verified: 2026-08-10.

## Runtime roles

- Production Web: Alibaba ECS, immutable Next.js standalone releases, PM2, containerized OpenResty.
- Production API: separate Alibaba ECS running Laravel, PHP-FPM, Supervisor workers, Scheduler, and local Redis.
- Staging: separate Alibaba ECS running staging Web and API with its own runtime services.

Do not encode raw IP addresses or credentials in Skills. Resolve targets from GitHub Environments and local SSH aliases.

## Authoritative workflows

The repository has exactly four entrypoints:

- `.github/workflows/ci.yml` classifies the exact main-push diff, runs the validation union, and produces an attested standalone artifact plus exact-SHA receipt.
- `.github/workflows/deploy.yml` serializes staging, staging smoke, production activation, production smoke, and bounded previous-LKG restoration.
- `.github/workflows/nightly.yml` owns full regression, security, dependency, and performance checks.
- `.github/workflows/recovery.yml` is the only manual workflow and is incident-only.

Historical task-specific deployment workflow names are not authority after trunk cutover.

- `.github/workflows/ci.yml`: exact-SHA standalone artifact and attestations.
- `.github/workflows/deploy-staging.yml`: exact latest-main staging deployment and receipt.
- `.github/workflows/deploy-production.yml`: exact-SHA production application deployment; merged-PR promotion uses `production-web-auto`, while manual recovery approval remains on protected `production`.
- `.github/workflows/web-public-ingress.yml`: protected OpenResty ingress preflight/apply/rollback.

Read these files at execution time. Workflow source overrides examples in this reference.

## Configuration authority

- Deployment connection material belongs only to GitHub `staging`, `production-web-auto`, or `production` Environments.
- `production-web-auto` contains only application-deployment connection material and has no required reviewer. It must not receive ingress, DNS, CMS, content-release, llms artifact, database, or rollback credentials.
- `production` remains protected and owns manual recovery plus the existing separately controlled ingress, DNS, CMS, content-release, llms artifact, and rollback operations.
- Non-secret topology values belong in Environment variables.
- SSH keys, known-host material, tokens, and sensitive ingress data belong in Environment secrets.
- Local operations use configured aliases such as `WEB_NODE1_SSH_ALIAS`; never paste key paths or passwords into chat.
- Repository-level deployment credentials and retired Tencent/Greenfield source credentials are not valid runtime authority.

## Release chain

```text
main SHA
  -> required checks
  -> attested standalone artifact
  -> successful staging deployment + receipt
  -> approval-free production-web-auto application promotion
  -> immutable production release + receipt
  -> public revision and product smoke
```

Every commit in the promoted range must map unambiguously to a merged PR. A failed or ambiguous deployment is terminal: the workflow does not rerun, redispatch, or roll back automatically.

An ingress config-set, certificate action, DNS change, database change, CMS publication, content release, llms artifact operation, or manual recovery is not part of this automatic chain and needs its existing protected control.
