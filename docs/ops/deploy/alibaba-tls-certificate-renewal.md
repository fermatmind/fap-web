# Alibaba TLS certificate renewal

## Scope

FermatMind public TLS is split across three Alibaba hosts:

- production API keeps its existing `certbot.timer` and webroot renewal configuration;
- production Web runs Certbot on the host and exposes the persistent host webroot `/opt/fermatmind/openresty/www/acme` inside OpenResty as `/www/acme`;
- staging uses host webroot `/var/www/letsencrypt` for both staging hostnames and reloads `/usr/local/nginx` through `nginx.service`.

The daily `Live result smoke` workflow checks the verified certificate chain and remaining lifetime for all four public hostnames. A certificate at or below the 21, 14, or 7 day threshold fails the scheduled job so renewal drift is visible before expiry. This job performs TLS handshakes only; it does not write to any server.

## Versioned files

- `deploy/openresty/fap-web-public.conf` owns the production Web ACME location.
- `deploy/nginx/fap-staging-acme-location.conf` is the exact staging HTTP-vhost include.
- `deploy/tls/fermatmind-certbot-deploy-hook.sh` atomically installs renewed certificate files and validates the role-specific ingress before reload.
- `scripts/ops/check-public-tls-certificates.mjs` implements the bounded public expiry monitor.

## Controlled rollout

1. Merge the exact PR with required checks green.
2. Apply the production Web ACME location only through `Web Public Ingress Control`: run `preflight`, obtain the emitted SHA-bound phrase, then run separately authorized `apply`.
3. On production Web, create the persistent webroot, install Certbot and the versioned hook, issue/renew `fermatmind.com` plus `www.fermatmind.com`, and enable `certbot.timer`.
4. On staging, install the versioned ACME include with an exact pre-change config hash, remove the HTTP vhost's server-level redirect because the versioned include owns the equivalent `location /` redirect, create the webroot, validate `/usr/local/nginx/sbin/nginx -t`, reload Nginx, install Certbot and the versioned hook, issue/renew the two staging names, and enable `certbot.timer`.
5. Run `certbot renew --dry-run` on both hosts. Verify public certificate chains, all four HTTPS health endpoints, and that the application revisions did not change.

Every server mutation requires a preflight receipt bound to the current host identities, certificate hashes, ingress hashes, source SHA, candidate configuration SHA, and versioned hook SHA. Do not use direct SSH to edit the production Web ingress. Do not print private keys, ACME account material, or certificate file contents.

## Rollback

- Production Web ingress rollback uses the separately authorized `Web Public Ingress Control` rollback mode and exact backup-set SHA.
- Certbot installation does not replace application releases. If a renewed certificate cannot validate, retain the last known-good certificate pair, leave DNS unchanged, and stop.
- Staging keeps a hash-addressed copy of its pre-change Nginx site file. Restore only that exact backup, validate with the absolute Nginx binary, and reload.

Repository rule impact: this is an operations-only certificate lifecycle change. It does not change content authority, application routes, database schema, CMS data, deployment revisions, or public product behavior.
