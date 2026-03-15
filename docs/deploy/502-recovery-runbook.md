# 502 Recovery Runbook (fap-web)

## Scope
Use this runbook when `https://fermatmind.com` returns `502 Bad Gateway` and upstream `127.0.0.1:3000` is suspected down.

Node1 has been verified to run the frontend under PM2 with `/usr/bin/node` on Node 24.x, serving `/opt/apps/fap-web/.next/standalone/server.js`.
On Node1, `fap-web.service` may be absent; `systemctl status fap-web` returning `not-found` is not itself an incident signal.
Only use `systemd` checks on hosts that explicitly install the tracked fallback/reference unit.

## 1) Login and switch operator
```bash
ssh ubuntu@49.235.131.248
sudo -iu ubuntu
cd /opt/apps/fap-web
```

## 2) Deploy from the single entrypoint
```bash
pnpm run deploy:pm2
# or:
bash scripts/deploy_web_pm2.sh
```

Do not use hand-typed multi-line PM2 commands.

Current runtime standard is Node 24.x.
If either the shell `node` or `/usr/bin/node` is not Node 24.x, fix the runtime first and only then retry deploy.

## 2.5) Authoritative runtime and PM2 checks on Node1
```bash
pm2 status
pm2 show fap-web
pm2 logs fap-web --lines 80 --nostream

/usr/bin/node -v
readlink -f /usr/bin/node

node -v
which node
readlink -f "$(which node)"
```

`pm2 show fap-web` should point to `/opt/apps/fap-web/.next/standalone/server.js`.

## 3) Process and port verification
```bash
pm2 status
pm2 show fap-web
pm2 logs fap-web --lines 80 --nostream
ss -ltnp | grep ':3000'
```

## 3.5) Optional systemd check for hosts that explicitly install the fallback unit
```bash
systemctl status fap-web --no-pager || true
systemctl cat fap-web || true
```

On Node1, `systemctl status fap-web` may return `not-found`; that does not contradict the current PM2-backed production topology.

## 4) Endpoint probe verification
```bash
curl -fsSI  http://127.0.0.1:3000/en | head -n 20
curl -fsSI  http://127.0.0.1:3000/zh | head -n 20
curl -fsSIL https://fermatmind.com/en | head -n 20
curl -fsSIL https://fermatmind.com/zh | head -n 20
curl -fsSIL https://fermatmind.com/zh/tests/clinical-depression-anxiety-assessment-professional-edition/take | head -n 20
```

## 5) Success criteria
1. `pm2 status` shows `fap-web` as `online`.
2. `ss` confirms Node is listening on `127.0.0.1:3000`.
3. No `502` in local/public probe outputs.

## 6) If deployment still fails
1. Check build artifacts:
   - `.next/standalone/server.js`
   - `.next/standalone/.next/static`
2. Check PM2 config path:
   - `ecosystem.config.cjs`
3. Capture the first startup error:
   - `pm2 logs fap-web --lines 120 --nostream`
4. If the target host explicitly installs `fap-web.service`, inspect that fallback/reference unit with:
   - `systemctl status fap-web --no-pager || true`
   - `systemctl cat fap-web || true`
5. If app code/config regression is confirmed, follow rollback drill:
   - `docs/release/rollback-drill.md`
