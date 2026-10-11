---
name: fermatmind-frontend-deploy-sre
description: Verify, deploy, diagnose, and roll back FermatMind fap-web releases through the protected GitHub exact-SHA control plane. Use for staging or production web deployment readiness, standalone artifact and staging evidence verification, PM2/OpenResty health, curl --resolve origin checks, post-deploy smoke, or read-only deployment incident assessment on the Alibaba three-node topology.
---

# FermatMind Frontend Deploy SRE

Operate `fap-web` through the four-workflow trunk control plane. Keep DNS/certificate mutations and incident recovery outside ordinary application delivery.

## Start here

1. Read `AGENTS.md` and inspect `git status --short --branch`.
2. Run `fermatmind-task-status` and `fermatmind-heavy-guard check` before a heavy build or full contract suite.
3. Read [topology-and-control-plane.md](references/topology-and-control-plane.md) for current roles, workflows, and Environment inputs.
4. Read [incident-and-rollback.md](references/incident-and-rollback.md) only for failed or ambiguous releases.
5. Select one mode: `readiness`, `staging`, `production`, `incident`, or `rollback-assessment`.

## Invariants

- Resolve and bind one full 40-character pushed SHA. Never substitute a newer `main` SHA while that activation is in flight.
- Use an isolated worktree from `origin/main` for source inspection or changes. Do not touch an active dirty worktree.
- Bind the exact `ci.yml` receipt, classifier result, and attested artifact; the main ruleset does not carry required checks.
- Use only the exact-SHA standalone artifact produced by CI and the successful staging result from the same deploy workflow.
- Deploy production only through `deploy.yml`; every pushed SHA uses its successful exact-SHA CI artifact and staging result. Never copy Tencent artifacts, build on production, edit `current`, or run direct PM2 promotion.
- Apply changed OpenResty public ingress only through the post-production ingress job in `deploy.yml`.
- Treat SSH as read-only outside the exact deployment or incident-recovery job that owns the bounded write.
- Never print secret values, raw keys, passwords, private paths, or Environment secret contents.
- Do not rerun a failed SHA. The immutable installer may atomically restore its previous LKG during the same attempt after a committed activation fails smoke; every repair uses a new commit.
- Keep DNS, certificate, destructive cleanup, and recovery-only actions outside ordinary delivery.

## Readiness

1. Fetch `origin` and record `origin/main` plus the requested deployment SHA.
2. Prove the SHA is `origin/main` or an explicitly selected ancestor contained in `main`.
3. Resolve the exact push and CI receipt for the SHA.
4. Before requiring an application artifact or staging evidence, resolve the release classifier union of pushed paths and unreleased runtime differences. A pure docs/rules change with no pending runtime requires exact-SHA CI and deploy-skip only; report staging/production as not applicable and finish closeout. Do not infer deploy-skip from the current diff alone.
5. For runtime-selected releases, require successful path-aware CI and verify its exact-SHA artifact digest/attestation and transport binding, the successful staging job in the same deploy workflow, staging-timing.json, and installer deploy-outcome.json.
6. Run `NEXT_PUBLIC_API_URL="$API_PUBLIC_HOST" pnpm check:cms-api` when the release consumes backend CMS/API data.
7. Confirm no conflicting production mutation workflow is active.
8. With read-only SSH authorization, verify public `/revision`, active release identity, PM2 state, and origin health.
9. Keep the classifier-selected scope through activation and closeout. A chat request does not bypass that classification.

## Staging

- Let successful exact-SHA `ci.yml` trigger staging inside `deploy.yml`; no manual staging path exists.
- Require the workflow to consume the CI standalone artifact; do not build or copy an application on the host.
- Verify the policy job binds the exact CI run/attempt and artifact/transport digests; the staging job must succeed for that SHA in the same deploy workflow. Read staging-timing.json and deploy-outcome.json for the actual activation and smoke outcome. The standalone staging-receipt.mjs script is not called by the current workflow; do not require an invented receipt or expiry proof.
- Verify staging Web/API, login entry, MBTI, static chunks, and CMS-backed pages before production eligibility.

## Automatic production

Every successful exact-SHA staging deployment triggers production once. The policy guard requires the exact SHA, path-aware CI receipt, attested standalone artifact, and successful staging result. The deploy job uses `production-web-auto` without a reviewer and refuses stale/out-of-order activation.

Do not dispatch or approve a normal release manually. If the automatic run fails, diagnose and push a new commit; switch to `incident` only when production is affected and the same-attempt LKG restore failed.

## Manual recovery

`recovery.yml` is the only manual workflow and is reserved for a real incident after automatic LKG restoration fails. It supports read-only diagnosis, previous-LKG selection, and an exact SHA with a successful CI artifact. It is not a daily deploy path.

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

- If transfer fails before promotion, preserve the resumable partial artifact and stop. Repair with a new commit; its successful exact-SHA CI starts a fresh automatic run.
- If promotion or connection state is ambiguous, switch to `incident`; inspect revision, active release, receipt, PM2, and workflow checkpoints read-only.
- For smoke inside installer phase=verify before install_complete, inspect the same-attempt prior-LKG restore and recovery verification. A later outer receipt/revision check after install_complete is a different boundary: do not assume it restored the release. Diagnose current health read-only; use incident recovery only for a real incident after applicable automatic restoration failed.
- Never unlock, restart, terminate, edit, or roll back during diagnosis.

## Validation for Skill changes

```bash
python3 "$HOME/.codex/skills/.system/skill-creator/scripts/quick_validate.py" \
  .agents/skills/fermatmind-frontend-deploy-sre
git diff --check
```

## Delivery closeout

Follow [AGENTS.md — Delivery closeout](../../../AGENTS.md#delivery-closeout): acceptance -> closeout -> final report. Apply it to both deployed and deploy-skip changes. Report cleanup results and concrete reasons for retained files, services, worktrees, or branches; ordinary closeout does not wait for another user request.

## Output

Report exact SHA, ruleset evidence, CI artifact and actual staging evidence identity, production run ID, deployed revision, PM2 and smoke status, actions performed or skipped, rollback readiness, and remaining risks. Mention a PR only for the one-time transition or when the user explicitly requests one. Do not print infrastructure secrets or raw connection values.
