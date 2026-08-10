---
name: fermatmind-frontend-deploy-sre
description: Verify, deploy, diagnose, and roll back FermatMind fap-web releases through the protected GitHub exact-SHA control plane. Use for staging or production web deployment readiness, standalone artifact and staging-receipt verification, PM2/OpenResty health, curl --resolve origin checks, post-deploy smoke, or read-only deployment incident assessment on the Alibaba three-node topology.
---

# FermatMind Frontend Deploy SRE

Operate `fap-web` through repository workflows. Keep application deployment, public ingress, DNS, rollback, and process recovery as separate controlled actions.

## Start here

1. Read `AGENTS.md` and inspect `git status --short --branch`.
2. Run `fermatmind-task-status` and `fermatmind-heavy-guard check` before a heavy build or full contract suite.
3. Read [topology-and-control-plane.md](references/topology-and-control-plane.md) for current roles, workflows, and Environment inputs.
4. Read [incident-and-rollback.md](references/incident-and-rollback.md) only for failed or ambiguous releases.
5. Select one mode: `readiness`, `staging`, `production`, `incident`, or `rollback-assessment`.

## Invariants

- Resolve and bind one full 40-character SHA. Never substitute latest `main` after approval.
- Use an isolated worktree from `origin/main` for source inspection or changes. Do not touch an active dirty worktree.
- Discover required checks from the active main ruleset and exact-SHA check runs; do not hard-code a historical check list in the Skill.
- Use only the exact-SHA standalone artifact produced by CI and the unexpired staging receipt bound to it.
- Deploy production only through `Deploy Web Production`; never copy Tencent artifacts, build on production, edit `current`, or run direct PM2 promotion.
- Apply OpenResty public ingress only through `Web Public Ingress Control`. Keep it separate from application deployment.
- Treat SSH as read-only unless an action-specific approval explicitly authorizes the exact write.
- Never print secret values, raw keys, passwords, private paths, or Environment secret contents.
- Do not retry a failed production deployment automatically.
- Keep rollback, DNS, service restart, process termination, unlock, and certificate changes separately authorized.

## Readiness

1. Fetch `origin` and record `origin/main` plus the requested deployment SHA.
2. Prove the SHA is `origin/main` or an explicitly selected ancestor contained in `main`.
3. Resolve the merged PR for the exact SHA.
4. Query the repository main ruleset and require every active required check to be successful for the exact SHA.
5. Verify the exact-SHA CI artifact, digest/attestation, successful staging deployment, and unexpired staging receipt.
6. Run `NEXT_PUBLIC_API_URL="$API_PUBLIC_HOST" pnpm check:cms-api` when the release consumes backend CMS/API data.
7. Confirm no conflicting production mutation workflow is active.
8. With read-only SSH authorization, verify public `/revision`, active release identity, PM2 state, and origin health.
9. Classify the delta as `runtime-impacting`, `skill-docs-only`, `generated-static`, or `unknown`. Skip production for a docs-only delta unless explicitly requested.

## Staging

- Let a successful push to `main` trigger `Deploy Web Staging`, or dispatch it only for exact latest `main`.
- Require the workflow to consume the CI standalone artifact; do not build or copy an application on the host.
- Verify the staging receipt binds repository, SHA, CI run/attempt, artifact digest, environment, revision, and smoke result.
- Verify staging Web/API, login entry, MBTI, static chunks, and CMS-backed pages before production eligibility.

## Production

Require both exact phrases:

```text
I explicitly approve frontend Node1 production deploy for SHA <SHA>.
APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:<SHA>
```

Use `:PRE_DNS_ORIGIN` only for an explicitly approved pre-DNS origin recovery.

Dispatch exactly once:

```bash
gh workflow run deploy-production.yml \
  --repo fermatmind/fap-web \
  -f deploy_sha="<SHA>" \
  -f manual_risk_approval="APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:<SHA>"
```

Bind monitoring to the resulting run ID. Do not dispatch a second run while the first is pending, running, or ambiguous.

## Post-deploy verification

Verify:

- workflow conclusion and production receipt;
- public `/revision` equals the approved SHA;
- PM2 expected processes are online and `127.0.0.1:3000` is healthy;
- `/`, `/en`, `/zh`, MBTI, login entry, `sitemap.xml`, `llms.txt`, and representative static chunks;
- API dependency health and absence of sustained 5xx or PHP-FPM queue growth;
- no unexpected DNS, ingress, CMS, database, Redis, or publication change.

Use `curl --resolve` before DNS changes. A successful application deploy does not authorize DNS or ingress mutation.

## Failure handling

- If transfer fails before promotion, preserve the resumable partial artifact and stop. A new run needs fresh readiness and approval.
- If promotion or connection state is ambiguous, switch to `incident`; inspect revision, active release, receipt, PM2, and workflow checkpoints read-only.
- If smoke fails, recommend rollback only after proving the prior immutable release and migration compatibility.
- Never unlock, restart, terminate, edit, or roll back during diagnosis.

## Validation for Skill changes

```bash
python3 "$HOME/.codex/skills/.system/skill-creator/scripts/quick_validate.py" \
  .agents/skills/fermatmind-frontend-deploy-sre
git diff --check
```

## Output

Report exact SHA and PR, ruleset/check status, CI artifact and staging receipt identity, production run ID, deployed revision, PM2 and smoke status, actions performed or skipped, rollback readiness, and remaining risks. Do not print infrastructure secrets or raw connection values.
