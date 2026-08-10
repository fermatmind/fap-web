# Topology and control plane

Last verified: 2026-08-10.

## Runtime roles

- Production Web: Alibaba ECS, immutable Next.js standalone releases, PM2, containerized OpenResty.
- Production API: separate Alibaba ECS running Laravel, PHP-FPM, Supervisor workers, Scheduler, and local Redis.
- Staging: separate Alibaba ECS running staging Web and API with its own runtime services.

Do not encode raw IP addresses or credentials in Skills. Resolve targets from GitHub Environments and local SSH aliases.

## Authoritative workflows

- `.github/workflows/ci.yml`: exact-SHA standalone artifact and attestations.
- `.github/workflows/deploy-staging.yml`: exact latest-main staging deployment and receipt.
- `.github/workflows/deploy-production.yml`: protected exact-SHA production application deployment.
- `.github/workflows/web-public-ingress.yml`: protected OpenResty ingress preflight/apply/rollback.

Read these files at execution time. Workflow source overrides examples in this reference.

## Configuration authority

- Deployment connection material belongs only to GitHub `staging` or `production` Environments.
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
  -> protected production Environment approval
  -> immutable production release + receipt
  -> public revision and product smoke
```

An ingress config-set, certificate action, DNS change, database change, or CMS publication is not part of this chain and needs its own control.
