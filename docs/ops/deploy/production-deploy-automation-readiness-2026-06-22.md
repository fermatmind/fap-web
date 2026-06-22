# Production Deploy Automation Readiness - 2026-06-22

Status: `PASS_WITH_FOLLOW_UP_PRS_REQUIRED`

This is a scan-only artifact for `PRODUCTION-DEPLOY-AUTOMATION-READINESS-01`. It did not deploy production, write servers, mutate CMS, change sitemap/llms, enqueue search work, or expose secret values.

## Current fap-api State

Reviewed:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `.github/workflows/release-train.yml`
- `deploy.php`
- `backend/scripts/deploy/deploy_backend.sh`
- `backend/scripts/deploy/post_deploy_validate.sh`
- `backend/scripts/deploy/readiness.sh`
- `backend/scripts/ci_verify_mbti.sh`

Findings:

- Staging deploy is already automatic on `push` to `main` through `Deploy Application`.
- The deploy workflow already has `workflow_dispatch` support for `env=production` and binds the deploy job to the selected GitHub Environment.
- Staging deploy runs deploy checks, Deployer, healthcheck, auth/guest contract smoke, ops entry smoke, and ops asset smoke.
- Production runtime deploy currently remains operationally controlled through local deploy-readiness and exact SHA approval.
- The gap is not deploy mechanics; it is the missing automatic production approval path after successful staging on `main`.

## Current fap-web State

Reviewed:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/live-result-smoke.yml`
- `scripts/deploy_web_pm2.sh`
- `scripts/rolling_reload_pm2.sh`
- `scripts/healthcheck_web.sh`
- `scripts/staging_cms_baseline_smoke.sh`
- `scripts/content_release_revalidate_smoke.sh`

Findings:

- Staging deploy is already automatic on `push` to `main` through `Deploy Web Staging`.
- Staging deploy verifies deployed SHA and performs a public route smoke.
- Production deploy still uses the manual deploy-readiness path.
- There is no production GitHub Actions workflow yet for Node1.

## Recommended Architecture

Keep this chain:

`PR merge -> main checks green -> staging deploy green -> production environment approval -> production deploy -> production smoke`

The production approval should be implemented as a GitHub Environment gate named `production`. Required reviewers, branch restrictions, and secrets are configured in GitHub settings, not committed into the repository.

Runtime deploy must stay separate from content/search operations. The production deploy workflows must not run:

- CMS import/write/publish/promotion
- sitemap generation or llms release
- Search Queue enqueue/approve/submit
- IndexNow, Baidu, or GSC live submission
- frontend/backend content authority mutations outside ordinary runtime deploy mechanics

## Required GitHub Environment Setup

Environment name: `production`

Secrets referenced by name only:

- `SSH_PRIVATE_KEY`
- `SSH_KNOWN_HOSTS`

Recommended protection:

- Required reviewers enabled.
- Branch restriction to `main`.
- Separate backend and frontend concurrency groups for production deploys.

## Follow-up PRs

### FAP-API-PRODUCTION-DEPLOY-WORKFLOW-01

Repository: `fap-api`

Scope:

- `.github/workflows/**`
- deploy docs if needed

Goal:

- Chain backend production runtime deploy after successful staging deploy/checks on `main`.
- Require GitHub Environment approval before production deploy.
- Reuse existing Deployer production target and post-deploy smoke.
- Do not introduce CMS/search/sitemap/llms side effects.

### FAP-WEB-PRODUCTION-DEPLOY-WORKFLOW-01

Repository: `fap-web`

Scope:

- `.github/workflows/**`
- deploy docs if needed

Goal:

- Add Node1 production runtime deploy after successful staging deploy/checks on `main`.
- Require GitHub Environment approval before production deploy.
- Reuse existing worktree reset plus `deploy:pm2` pattern.
- Fetch sitemap/llms only as read-only smoke.

## Decision

`PROCEED_TO_WORKFLOW_PRS`
