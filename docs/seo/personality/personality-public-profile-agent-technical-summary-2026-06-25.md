# Personality Public Profile Agent Technical Summary

Date: 2026-06-25

Scope: technical summary only. This document does not change frontend runtime, CMS content, publish state, indexability, sitemap, llms, Search Queue, or search submission behavior.

## Executive Summary

FermatMind now has a reusable public personality profile agent system for MBTI64, Big Five, and Enneagram content optimization. The system is split across two repositories:

- `fap-web`: runner, recommendation artifacts, QA artifacts, scheduler artifact workflow, and public SEO evidence.
- `fap-api`: approval queue, CMS draft writers, promotion contracts, public content asset API, and production write guards.

The agent output is not production truth. It is a draft recommendation packet that must pass QA, enter human approval, be written as CMS draft content through backend commands, and pass promotion/runtime gates before public surfaces can consume it.

## Agent Matrix

| Layer | Agent / Component | Owns | Does Not Own |
| --- | --- | --- | --- |
| Routing | Content Orchestrator Agent | Framework routing, run manifests, source/output ledgers, PR scope boundaries | Direct production content writes |
| Content | MBTI64 Public Personality Agent | Existing 64 A/T variant pages and 32 A-vs-T comparison pages | Rebuilding MBTI estate, result pages, scoring |
| Content | Big Five Public Personality Agent | Big Five V1 public profile recommendations for hub/domain/polarity/facet hub pages | Official 32 OCEAN types, high/low good-bad framing |
| Content | Enneagram Public Personality Agent | Hub, 3 centers, and 9 core types | 54 wing x instinct pages, Tritype pages, clinical typing |
| QA | SEO Projection QA Agent | SERP/title/description, internal-link, duplicate-risk, sitemap/llms/search-readiness evidence | Search provider submission |
| QA | Editorial Claim QA Agent | Trademark, method boundary, deterministic-claim, private-result-boundary checks | Publishing or promotion |
| Release | Release Guard Agent | Separation of draft, approval, CMS write, promotion, runtime smoke, search release | Content authoring |

## fap-web Layer

### Runner Contract

Primary files:

- `.agents/skills/public-profile-seo-asset-factory/SKILL.md`
- `.agents/skills/public-profile-seo-asset-factory/runbooks/personality-public-profile-agent-runner.md`
- `.agents/skills/public-profile-seo-asset-factory/orchestration/personality-agent-matrix.md`
- `.agents/skills/public-profile-seo-asset-factory/schemas/public-profile-agent-recommendation.schema.json`
- `scripts/seo/run-personality-agent-auto-runner.mjs`

The runner accepts:

- target URL
- framework: `mbti64`, `big_five`, or `enneagram`
- current CMS/API or live HTML surface
- reference patterns
- GSC/SEO signal, or `GSC_EVIDENCE_PENDING`
- source ledger and framework rules

The runner outputs draft recommendations:

- SEO title
- SEO description
- H1
- quick answer
- FAQ
- internal links
- duplicate differentiation notes
- QA requirements and blocked reason

### Artifact and QA Outputs

Current personality agent artifacts include:

- MBTI64:
  - `docs/seo/personality/mbti64-agent-expansion-88-recommendations-2026-06-21.json`
  - `docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.json`
- Big Five:
  - `docs/seo/personality/big-five-public-profile-agent-pilot-2026-06-24.json`
  - `docs/seo/personality/big-five-public-profile-agent-qa-2026-06-24.json`
- Enneagram:
  - `docs/seo/personality/enneagram-public-profile-agent-pilot-2026-06-24.json`
  - `docs/seo/personality/enneagram-public-profile-agent-qa-2026-06-24.json`

Focused tests and validators exist for the runner and framework-specific artifacts:

- `tests/contracts/personality-public-profile-agent-runner-01.contract.test.ts`
- `tests/contracts/mbti64-public-profile-agent-expansion-88-01.contract.test.ts`
- `tests/contracts/big-five-public-profile-agent-pilot-01.contract.test.ts`
- `tests/contracts/big-five-public-profile-agent-qa-01.contract.test.ts`
- `tests/contracts/enneagram-public-profile-agent-pilot-01.contract.test.ts`
- `tests/contracts/enneagram-public-profile-agent-qa-01.contract.test.ts`

### Scheduler

The scheduled runner workflow exists at:

- `.github/workflows/personality-agent-auto-runner.yml`

The workflow is artifact-only:

- uploads JSON/Markdown/CSV artifacts
- does not commit
- does not open PRs
- does not deploy
- does not write CMS
- does not mutate sitemap/llms
- does not enqueue or submit search providers

Current closure evidence:

- `docs/seo/personality/personality-agent-auto-runner-scheduler-activation-closure-2026-06-25.md`
- `docs/seo/personality/personality-agent-auto-runner-scheduler-activation-closure-2026-06-25.json`

The closure decision is `PASS_SCHEDULER_ACTIVATION_CLOSED_ARTIFACT_ONLY`. Scheduler activation is therefore not a CMS, publish, index, sitemap, llms, search, or deploy surface. It only creates GitHub Actions artifacts for downstream human review.

## fap-api Layer

### Approval Queue

Primary files:

- `backend/app/Console/Commands/PersonalityAgentApprovalQueueCommand.php`
- `backend/app/Services/Cms/PersonalityAgentApprovalQueueWriter.php`
- `backend/database/migrations/2026_06_24_000100_create_personality_agent_approval_queue_tables.php`
- `backend/tests/Feature/Console/PersonalityAgentApprovalQueueCommandTest.php`

Supported frameworks:

- `mbti64`
- `big_five`
- `enneagram`

The approval queue stores QA-passed recommendations as pending human review. It does not write CMS content. CMS draft writers must consume approved items or enforce their own fail-closed approval constraints, depending on the framework contract.

The queue accepts framework QA states that mean ready for human review, including `PASS_READY_FOR_APPROVAL_REVIEW`. That status is only an approval-queue intake state. It is not permission to write CMS draft content, promote live content, publish, index, or trigger search release. CMS draft writers still require an approved queue item or a framework-specific explicit write gate.

### CMS Draft Writers

MBTI64 uses profile/variant revision contracts:

- `backend/app/Console/Commands/PersonalityMbti64CmsProjectionDraft.php`
- `backend/app/Services/Cms/Mbti64CmsProjectionDraftWriter.php`

Big Five uses `personality_public_content_assets`:

- `backend/app/Console/Commands/PersonalityBigFivePublicProfileAgentDraft.php`
- `backend/app/Services/Cms/BigFivePublicProfileAgentDraftWriter.php`

Enneagram uses `personality_public_content_assets`:

- `backend/app/Console/Commands/PersonalityEnneagramCmsDraft.php`
- `backend/app/Services/Cms/EnneagramCmsDraftWriter.php`

Draft writers must support dry-run. Write mode is guarded by explicit operator tokens plus no-publish/no-index/no-sitemap/no-llms/no-search-release flags.

### Promotion Contracts

MBTI64 promotion uses profile/variant revision promotion:

- `backend/app/Console/Commands/PersonalityMbti64CmsRevisionPromote.php`
- `backend/app/Services/Cms/Mbti64CmsRevisionPromotionService.php`

Enneagram promotion uses `personality_public_content_assets` content-ready promotion:

- `backend/app/Console/Commands/PersonalityEnneagramCmsPromote.php`
- `backend/app/Services/Cms/EnneagramCmsPromotionService.php`

Promotion updates content-readiness only within its scoped command. It must not publish, index, mutate sitemap/llms, enqueue Search Queue items, submit search providers, or change frontend runtime.

## Framework Status Matrix

| Framework | Recommendation Artifact | QA Artifact | Approval Queue | CMS Draft Writer | Promotion Contract | Current Production State |
| --- | --- | --- | --- | --- | --- | --- |
| MBTI64 | 88 expansion recommendations exist | QA exists | Backend approval queue available | MBTI64 projection draft writer available | MBTI64 revision promotion available | 8 pilot and later batches have passed through draft/promotion/search gates in separate controlled tasks |
| Big Five | 34 recommendations exist | 34/34 QA PASS | Approval queue supports `big_five` | Big Five public profile draft writer exists | Promotion path should be handled as a separate Big Five content asset promotion gate | User reported another window completed Big Five content; verify runtime artifacts/DB before claiming production closure |
| Enneagram | 26 recommendations exist | 26/26 QA PASS | Approval queue supports `enneagram` | Enneagram draft writer exists | Enneagram promotion contract exists | 26 assets promoted to live CMS content-ready, while remaining noindex and out of sitemap/llms/search |

## Safety Boundaries

The personality agent system is deliberately not fully autonomous for production mutation.

Always prohibited without a separate explicit gate:

- automatic CMS write
- automatic live promotion
- automatic publish/index change
- automatic sitemap/llms/llms-full mutation
- automatic Search Queue enqueue/approval/submission
- automatic GSC Request Indexing or external search API calls
- frontend editorial fallback content for CMS-backed surfaces
- result-page, payment, account, history, share, or private-report changes

Framework-specific no-go rules:

- MBTI64: no official MBTI affiliation implication, no deterministic career/relationship promise, no private result/report language.
- Big Five: no official 32 OCEAN types, no high/low good-bad moral framing, no clinical/hiring/recruiting decision claims.
- Enneagram: no clinical diagnosis, no hiring/screening use, no deterministic typing claims, no wing x instinct or Tritype expansion in current scope.

## Operating Route

The intended production-safe route is:

```text
GSC evidence
-> ranker
-> recommendation artifact
-> QA artifact
-> human approval queue
-> CMS draft dry-run
-> explicit CMS draft write approval
-> draft post-write smoke
-> promotion readiness
-> promotion dry-run
-> explicit promotion write approval
-> runtime smoke
-> separate sitemap/llms/index/search gate
```

This separation is the main safety property of the system. Each step has a different authority boundary, different side-effect profile, and different approval requirement.

## Recommended Next Work

1. Keep index/search release separate from content promotion. Enneagram and Big Five content-ready closure should not be treated as search-release authorization.
2. Use the approval queue as the boundary between agent recommendations and CMS draft writes. A QA pass can enter review, but only an approved item can be consumed by a draft writer.
3. Run the long-term operations track below as separate PRs or runtime gates. Do not combine scheduler, ops review, next-batch selection, approval intake, CMS draft, promotion, or search release.

## Long-Term Operations PR Split Scan

The launch/content-production lanes are substantially closed, but the agent still needs an operations layer so it can run repeatedly without turning into an unattended publisher. The remaining long-term operations track is three tasks, each with a different side-effect boundary.

### 1. `PERSONALITY-AGENT-AUTO-RUNNER-SCHEDULER-ACTIVATION-01`

Current status: closed as artifact-only by the scheduler activation closure artifacts listed above.

Purpose: run the personality agent runner on a controlled cadence and upload recommendation/ranking artifacts.

Repository: `fap-web`.

Likely files:

- `.github/workflows/personality-agent-auto-runner.yml`
- `scripts/seo/run-personality-agent-auto-runner.mjs`
- `tests/contracts/personality-agent-auto-runner-scheduler-activation-01.contract.test.ts`
- `docs/seo/personality/personality-agent-auto-runner-scheduler-activation-*.{json,md}`

Required checks:

- `node --check scripts/seo/run-personality-agent-auto-runner.mjs`
- focused scheduler workflow contract test
- `pnpm test:contract`
- `pnpm typecheck`
- `git diff --check`

Safety boundary:

- allowed: GitHub Actions artifact upload
- forbidden: git push, PR creation, CMS write, publish, sitemap/llms mutation, Search Queue enqueue/approve/submit, GSC Request Indexing, deploy, secrets or production environment use

Follow-up only if drift appears: `PERSONALITY-AGENT-AUTO-RUNNER-SCHEDULER-ACTIVATION-REPAIR-01`.

### 2. `PERSONALITY-AGENT-OPS-REVIEW-SURFACE-01`

Current status: still needed.

Purpose: expose a backend read model or ops surface for pending recommendations, QA state, risk reason, framework, locale, target URL, recommendation hash, source artifact hash, and approval state.

Repository: `fap-api`.

Likely files:

- `backend/app/Services/Cms/PersonalityAgentApprovalQueueReadService.php`
- `backend/app/Console/Commands/PersonalityAgentApprovalQueueReview.php` or existing ops controller/read-model route, depending on local pattern
- `backend/tests/Feature/Console/PersonalityAgentApprovalQueueReadModelTest.php` or focused ops read model test
- optional docs artifact under `backend/docs/seo/personality/`

Required checks:

- focused PHPUnit for approval queue read model
- `php artisan test tests/Feature/Console/PersonalityAgentApprovalQueueCommandTest.php --display-warnings`
- `bash backend/scripts/ci_verify_mbti.sh`
- `git diff --check`
- scope validation limited to read model / ops display / tests / docs

Safety boundary:

- allowed: read-only listing/aggregation of queued recommendation items and QA decisions
- forbidden: approve/reject mutation, CMS draft write, live promotion, publish/index/search, sitemap/llms mutation, queue enqueue/approve/submit, external API calls

Acceptance:

- operator can see pending recommendations without reading raw artifacts manually
- rows show enough evidence to decide review priority and risk
- no mutation endpoint or write command is added in this PR

### 3. `PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-01`

Current status: partially executed through selection, recommendation, and QA artifacts; the remaining operational handoff is approval review and CMS draft gating.

Existing fap-web artifacts:

- `docs/seo/personality/personality-agent-operations-next-batch-selection-2026-06-25.json`
- `docs/seo/personality/personality-agent-operations-next-batch-recommendations-2026-06-25.json`
- `docs/seo/personality/personality-agent-operations-next-batch-qa-2026-06-25.json`

Existing selected URLs:

- `/zh/personality/intp-a`
- `/zh/personality/esfp-a`
- `/en/personality/enfj-a`

Recommended split:

1. `PERSONALITY-AGENT-APPROVAL-QUEUE-NEXT-BATCH-3-DRY-RUN-01`
   - repository: `fap-api`
   - action: runtime dry-run only
   - purpose: verify the three next-batch recommendations can be planned into the approval queue with `PASS_READY_FOR_APPROVAL_REVIEW`
   - no writes

2. `PERSONALITY-AGENT-APPROVAL-QUEUE-NEXT-BATCH-3-WRITE-01`
   - repository: `fap-api`
   - action: approval queue write only after explicit operator authorization
   - purpose: create pending human-review approval rows
   - forbidden: CMS draft write, publish/index/search, sitemap/llms, live promotion

3. `PERSONALITY-AGENT-CMS-DRAFT-NEXT-BATCH-3-DRY-RUN-01`
   - repository: `fap-api`
   - action: dry-run only
   - prerequisite: all three approval queue items are approved by a human operator
   - purpose: verify approved items can be consumed by the CMS draft writer

4. `PERSONALITY-AGENT-CMS-DRAFT-NEXT-BATCH-3-WRITE-01`
   - repository: `fap-api`
   - action: CMS draft-only write after separate explicit approval
   - forbidden: live promotion, publish/index/search, sitemap/llms, Search Queue, frontend changes

5. `PERSONALITY-AGENT-CMS-DRAFT-NEXT-BATCH-3-POST-WRITE-SMOKE-01`
   - repository: production runtime gate
   - action: read-only
   - purpose: confirm draft rows exist, live pages are unchanged, and no side effects occurred

Required checks for artifact PR portions:

- `node --check` for selection/recommendation/QA scripts
- JSON parse or `jq empty` for artifacts
- focused contract tests for next-batch selection/recommendation/QA
- `pnpm test:contract`
- `pnpm typecheck`
- `git diff --check`

Required checks for backend approval/draft portions:

- approval queue focused PHPUnit
- CMS draft writer focused PHPUnit
- `bash backend/scripts/ci_verify_mbti.sh`
- `git diff --check`

Safety boundary:

- selection/recommendation/QA artifacts do not write CMS
- approval queue dry-run does not write DB
- approval queue write creates pending review rows only
- CMS draft write requires approved queue items and explicit operator approval
- promotion and search release remain separate gates

This three-task operations track is the path from recurring evidence to reviewable content recommendations. It is not an automated publishing system.
