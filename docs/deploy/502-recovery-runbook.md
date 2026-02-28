# 502 Recovery Runbook (fap-web)

## Scope
Use this runbook when `https://fermatmind.com` returns `502 Bad Gateway` and upstream `127.0.0.1:3000` is suspected down.

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

## 3) Process and port verification
```bash
pm2 status
pm2 logs fap-web --lines 80 --nostream
ss -ltnp | grep ':3000'
```

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
4. If app code/config regression is confirmed, follow rollback drill:
   - `docs/release/rollback-drill.md`
