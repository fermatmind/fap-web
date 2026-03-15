## Executive summary

本轮 runtime 迁移已完成收口。

最终结果：
- canonical runtime 从 Node 20 切换到 Node 24
- proxy 迁移与边界验证已完成
- staging 与 production 已完成 Node 24 人工验收
- deploy/runtime enforcement 与项目文档已对齐
- 当前无阻塞性遗留项

结论：
- 本条迁移主线关闭
- 后续 Node/runtime 相关工作按新议题处理

# 2026-03 Runtime Governance / Proxy / Node 24 Closeout

## 1. Final verdict

- status: CLOSED
- track: runtime governance / deploy-runtime enforcement / proxy migration / Node 24 standardization
- canonical runtime standard: Node 24.x
- repo canonical package manager: pnpm@10.28.1
- post-proxy stabilization gate: CLOSED
- staging acceptance: PASS
- production acceptance: PASS

## 2. Acceptance anchor

- repo merge anchor for PR-5: `0b582b9e73e6e273d976de85d5cd2214a73c0754`
- production/staging deployed-and-validated main commit: `ec3fd4d05e4d2052c6fb3a1bd2a9f412f98b911e`
- gate evidence directory: `/Users/rainie/Desktop/post-proxy-gate-20260315-174402`

## 3. Scope closed in this track

| Item | Status | Notes |
|---|---|---|
| PR-1 Repo Runtime Governance Closure | DONE | Node version policy, pnpm-only policy, runtime check |
| PR-2 Deploy / Runtime Enforcement | DONE | PM2/systemd/runtime authority aligned |
| PR-3 Middleware → Proxy migration | DONE | boundary behavior migrated and preserved |
| Post-proxy stabilization gate | DONE | staging + production canary completed |
| PR-4 Node 24 Readiness Validation | DONE | Node 24 validated without changing canonical standard |
| PR-5 Node 24 Standardization | DONE | canonical standard moved from Node 20 to Node 24 |

## 4. Canonical standard after closeout

- `.nvmrc = 24`
- `package.json engines.node = >=24 <25`
- canonical `.github/workflows/ci.yml` runs on Node 24
- experimental `node24-readiness.yml` removed
- `scripts/check-runtime.mjs` now enforces Node 24 as canonical runtime
- `scripts/deploy_web_pm2.sh` now enforces Node 24 for deployment/runtime preflight
- deploy/runtime docs updated to Node 24 wording
- `/usr/bin/node` remains the expected runtime binary path on hosts
- only the required major version changed: `20 -> 24`

## 5. Repo-side completion summary

The repository is no longer in a dual-state.  
Node 20 is no longer the canonical runtime.  
Node 24 is now the single canonical standard across:

- local development baseline
- repo runtime policy
- canonical CI
- deploy/runtime enforcement
- runbooks and reference docs

No proxy behavior was rewritten in this closeout.  
No business code or backend code was changed in this closeout.

## 6. Staging acceptance

### Host
- server: Node4 `49.234.55.28`
- service: `fap-web-staging.service`

### Runtime
- `node -v = v24.14.0`
- `/usr/bin/node -v = v24.14.0`

### Deployment result
- `pnpm install --frozen-lockfile`: PASS
- `pnpm build`: PASS
- standalone assets synced: PASS
- `systemctl restart fap-web-staging`: PASS
- `systemctl status fap-web-staging`: PASS

### Public smoke
- `https://staging.fermatmind.com/en`: 200
- `https://staging.fermatmind.com/robots.txt`: 200
- `https://staging.fermatmind.com/sitemap.xml`: 200

### Verdict
- staging acceptance: PASS

## 7. Production acceptance

### Host
- server: Node1 `49.235.131.248`
- runtime process manager: PM2
- app: `fap-web`

### Runtime
- `node -v = v24.14.0`
- `/usr/bin/node -v = v24.14.0`

### Deployment result
- `bash scripts/deploy_web_pm2.sh`: PASS
- rolling reload convergence: PASS
- PM2 process shape: `cluster`, `2 instances`, `online`
- deployed app path: `/opt/apps/fap-web/.next/standalone/server.js`

### Public smoke
- `https://fermatmind.com/en`: 200
- `https://fermatmind.com/robots.txt`: 200
- `https://fermatmind.com/sitemap.xml`: 200
- `https://fermatmind.com/articles?utm=a`: 308, relative redirect
- `https://fermatmind.com/types`: 308, relative redirect
- `Accept-Language: zh-CN` on `/personality`: 308, relative redirect

### Redirect correctness
- no `localhost:3000` leak remains in public redirect `Location` headers

### Verdict
- production acceptance: PASS

## 8. Operational notes

- PM2 logs still contain historical Next.js / Server Action / invariant noise from earlier deploys
- those historical log lines were not blockers for this release line
- current blocking runtime issues were resolved before closeout
- Node4 previously used NodeSource `node_20.x`; it was switched to `node_24.x`
- Node1 previously used NodeSource `node_20.x`; it was switched to `node_24.x`

## 9. Residual housekeeping

- Node1 generated sitemap diff was restored after acceptance
- Node4 NodeSource backup file should be removed to avoid `apt update` warning
- no repo-side blocking residue remains
- no deploy/runtime blocking residue remains

## 10. What this closeout does not include

This closeout does not include:

- new business features
- proxy logic redesign
- backend feature work
- dependency modernization beyond the Node standard switch
- broader CI expansion
- visual or UAT scope expansion

## 11. Final command evidence summary

### Local repo / CI-side
- canonical Node 24 runtime check: PASS
- `pnpm install --frozen-lockfile`: PASS
- `pnpm build`: PASS
- `pnpm exec tsc --noEmit --pretty false`: PASS
- selected contract tests: PASS
- selected e2e smoke: PASS

### Staging
- Node 24 runtime: PASS
- build + restart + public smoke: PASS

### Production
- Node 24 runtime: PASS
- deploy script + PM2 + public smoke: PASS

## 12. Closure statement

This runtime migration line is complete and closed.

The repo, CI, deploy/runtime policy, staging, and production are now aligned on Node 24 as the single canonical standard.

Future work should be treated as a new track rather than an extension of this closure.