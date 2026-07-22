# Fap Web Public Ingress Control

## Purpose

The public Next.js runtime emits a request-specific CSP nonce. Any shared cache of HTML can replay that nonce, so the production ingress must preserve the application's private/no-store response and bypass its proxy cache for every non-static route.

The canonical candidate is `deploy/openresty/fap-web-public.conf`. It keeps long-lived caching only for content-hashed `/_next/static/**` assets, bounded favicon responses, and the existing static `/share/**` surface. API forwarding, sitemap, llms feeds, `/revision`, tests, articles, and all other page routes continue through the generic non-caching proxy location.

## Versioned controls

- `.github/workflows/web-public-ingress-config.yml` validates the candidate structure and runs `openresty -t` using the exact observed production image digest.
- `.github/workflows/web-public-ingress.yml` is manual-only and uses the protected `production` environment.
- `scripts/ops/web-public-ingress.sh` accepts only `preflight`, `apply`, or `rollback`; it checks the container image, exact managed-config-set SHA, candidate SHA, live backup inventory, and final HTTPS vhost count.
- Backups are stored outside the active include root. Backup-like files inside the active root fail closed.
- Apply never triggers rollback automatically. A rollback requires a separate SHA-bound approval.

The production environment must provide the existing Node1 SSH credentials plus these non-secret variables or secrets:

- `WEB_NODE1_OPENRESTY_CONTAINER`
- `WEB_NODE1_OPENRESTY_CONFIG_ROOT`
- `WEB_NODE1_OPENRESTY_MANAGED_FILES`
- `WEB_NODE1_OPENRESTY_PRIMARY_FILE`
- `WEB_NODE1_OPENRESTY_BACKUP_DIR`
- `WEB_PUBLIC_BASE_URL`

All configured filenames must be basenames, and the backup root must be outside the live config root. Logs and artifacts contain only SHA-256 values, counts, boolean observations, response status, cache policy, and redacted failure text. They do not publish host addresses, certificate paths, upstream addresses, raw vhost configuration, SSH material, or approval secrets.

## Controlled sequence

1. Merge the ingress boundary PR and the dependent analytics smoke repair PR with all required checks green.
2. Dispatch `Web Public Ingress Control` in `preflight` mode for the exact latest `main` SHA. This reads production state and public responses but does not alter the server.
3. Review the sanitized evidence and obtain the exact phrase emitted by preflight:

   `APPROVE_FAP_WEB_PUBLIC_INGRESS:<main-sha>:<candidate-config-sha256>:<current-config-set-sha256>`

4. Only after that separate authorization, dispatch `apply` with the three exact SHA values and phrase. The workflow stages the candidate, validates it inside the pinned container, backs up the managed set outside the include root, atomically converges to one HTTPS vhost, reloads OpenResty, and enforces the public cache/nonce probe.
5. Deploy the same exact `main` SHA through the existing production workflow only after its separate risky-deploy authorization. Do not use SSH to deploy or restart the application.
6. If rollback is later authorized, use the exact apply release id and backup-set SHA with:

   `APPROVE_FAP_WEB_PUBLIC_INGRESS_ROLLBACK:<main-sha>:<release-id>:<backup-config-set-sha256>`

## Acceptance boundary

The release remains blocked if the exact SHA or config-set SHA drifts, syntax validation fails, more than one public HTTPS vhost remains, HTML is share-cacheable, consecutive public HTML responses reuse a nonce, `/revision` redirects or disagrees with the authorized SHA, or a Next static asset is not publicly immutable. No automatic rollback, manual SSH edit, PM2 restart, CMS write, backend mutation, or PR23 execution is authorized by this repository change.

Repository rule impact: `AGENTS.md` now records the versioned ingress authority, nonce-bearing HTML no-cache invariant, exact-SHA workflow requirement, and ban on unversioned manual server edits. This does not change content authority, route enumeration, rendering, media, analytics identifiers, or deployment authorization policy.
