# Topology and control plane

Deployment roles below must be checked against the exact candidate workflow and current Environment inputs.

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

Read these four files at the exact candidate SHA. Retired deploy-staging/deploy-production/web-public-ingress workflows, required-check lists and merged-PR promotion are historical records, not ordinary entrypoints.

## Configuration authority

- Deployment connection material belongs only to GitHub `staging`, `production-web-auto`, or `production` Environments.
- `production-web-auto` contains only application-deployment connection material and has no required reviewer. It must not receive ingress, DNS, CMS, content-release, llms artifact, database, or rollback credentials.
- `production` holds the existing classifier-selected post-production ingress job and incident recovery boundary. Ordinary ingress applies only the exact repository candidate after same-SHA production smoke; DNS, certificates, CMS/data and other unselected mutations are not implied.
- Non-secret topology values belong in Environment variables.
- SSH keys, known-host material, tokens, and sensitive ingress data belong in Environment secrets.
- Local operations use configured aliases such as `WEB_NODE1_SSH_ALIAS`; never paste key paths or passwords into chat.
- Repository-level deployment credentials and retired Tencent/Greenfield source credentials are not valid runtime authority.

## Release chain

```text
main SHA
  -> path-aware exact-SHA CI receipt
  -> attested standalone artifact
  -> same-workflow staging success + timing + installer outcome
  -> approval-free production-web-auto application promotion
  -> immutable production release + receipt
  -> public revision and product smoke
```

Require main containment and the exact successful CI/artifact/staging binding, not a merged PR. Pre-activation failure leaves production unchanged; smoke failure in the installer's verify phase before install_complete invokes its same-attempt bounded LKG restoration. Checks after install_complete require their own outcome and current health readback; do not infer rollback from a failed outer job. Diagnose ambiguity read-only, repair with a new commit, and reserve recovery.yml for a real incident after automatic restoration failed.

Classifier-selected ingress runs inside deploy.yml after production smoke and retains atomic rollback of the ingress candidate. Certificate/DNS changes, CMS/data publication and manual recovery keep their own authority; application activation does not authorize them.
