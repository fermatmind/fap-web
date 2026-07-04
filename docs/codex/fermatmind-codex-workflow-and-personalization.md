# FermatMind Codex Workflow And Personalization

Status: working guide
Last updated: 2026-07-04
Audience: FermatMind operators using Codex desktop, local repositories, browser research, and GitHub PRs

## Purpose

This guide defines how FermatMind should use Codex efficiently for product, engineering, content-authority, and GitHub delivery work.

It covers three layers:

1. Local computer workflow: when to use Codex app, terminal, browser, Computer Use, and worktrees.
2. GitHub delivery workflow: how Codex should finish a task, verify it, push it, and open a PR.
3. Personalization text: the recommended custom instructions for Codex settings.

## Official Instruction Layering

Codex official guidance says instruction files are layered from global guidance to project guidance, then directory-level overrides. The practical rule for FermatMind is:

- Personalization/custom instructions: personal working style, cross-repo defaults, and high-level FermatMind strategy.
- `~/.codex/AGENTS.md`: durable personal defaults that should apply across every local repository.
- Repository `AGENTS.md`: hard repository rules, PR-train rules, authority boundaries, required checks, and stop conditions.
- Nested `AGENTS.md` or `AGENTS.override.md`: directory-specific rules.
- Skills: repeatable workflows such as SEO/GEO authority scans, CMS rich content rendering, PR-train execution, security revalidation, and content asset factories.
- Repo docs: strategy, evidence packets, source authority maps, brand policy, SEO/GEO policies, and launch ledgers.

Do not put every SEO, GEO, or brand detail into personalization. Keep personalization compact enough to steer Codex, then point Codex to the repo rules and docs that carry the exact evidence and acceptance criteria.

## Operating Model

Use Codex as an implementation and verification partner, not as a content authority.

For FermatMind work, the source of truth is:

- Frontend runtime and rendering: `/Users/rainie/Desktop/GitHub/fap-web`
- Backend API, CMS, scoring, public content authority, and operational data: `/Users/rainie/Desktop/GitHub/fap-api`
- Public product positioning and science boundaries: published FermatMind pages, especially:
  - `https://fermatmind.com/zh/about`
  - `https://fermatmind.com/zh/science`
  - `https://fermatmind.com/zh/method-boundaries`
  - `https://fermatmind.com/zh/reliability-validity`
  - `https://fermatmind.com/zh/data-privacy`

Codex should treat live public pages as research context, but it must inspect repository code and backend contracts before changing implementation.

## Recommended Daily Setup

Open these as separate Codex projects:

- `fap-web`: `/Users/rainie/Desktop/GitHub/fap-web`
- `fap-api`: `/Users/rainie/Desktop/GitHub/fap-api`

Use separate Codex threads for separate scopes:

- One frontend PR scope per thread.
- One backend PR scope per thread.
- One documentation or research scope per thread.
- One CI-fix thread only for the PR whose checks failed.

Prefer Codex worktrees for risky or parallel implementation. Use local mode only for a small, isolated task or when intentionally continuing a current local branch.

## When To Use Each Surface

Use Codex app for:

- Reading code and docs across a repo.
- Implementing scoped changes.
- Running local checks.
- Reviewing diffs before commit.
- Creating commits, pushes, and GitHub PRs.

Use the integrated terminal for:

- `git status`
- `git diff --check`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test:contract`
- `php artisan test`
- `php artisan route:list --path=api --except-vendor`

Use the in-app browser for:

- Previewing local Next.js pages.
- Checking public pages that do not require sign-in.
- Reviewing visual page behavior.

Use Computer Use only when the task depends on a graphical application that is not available through shell, browser tooling, GitHub, or an MCP connector. Keep the target app and task narrow.

Use web research when:

- The user explicitly asks to visit or research a live site.
- Current public pages, policies, pricing, API behavior, GitHub status, or external docs may have changed.
- A public claim needs to be checked against live FermatMind pages.

## FermatMind GitHub Delivery Workflow

For an implementation task:

1. Confirm the declared scope.
2. Run `git status --short --branch`.
3. Read the relevant `AGENTS.md` and local docs.
4. Inspect the code paths before editing.
5. Edit only files in scope.
6. Run the local checks required by the task and repository rules.
7. Run `git diff --check`.
8. Summarize changed files and validation.
9. Stage only explicit path-limited files.
10. Commit with a focused message.
11. Push the current branch.
12. Open exactly one GitHub PR for the current scope.
13. Include in the PR body:
    - What changed.
    - Why.
    - Validation commands.
    - Intentionally deferred items.
    - Repository rule impact, when content ownership, API contracts, SEO, publishing, media, or fallback behavior changes.

For PR-train work, follow `AGENTS.md` strictly:

- Start from latest `main`.
- Pull with `git pull --ff-only origin main`.
- Verify dependencies are merged.
- Update `docs/codex/pr-train-state.json` for state transitions.
- Stop on failed local checks, ambiguous scope drift, merge blocks, review blocks, or required GitHub check failures.

For ad-hoc docs, cleanup, rule updates, or emergency repairs:

- A PR-train id is not required.
- Do not touch `docs/codex/pr-train.yaml` or `docs/codex/pr-train-state.json` unless explicitly requested.

## Frontend Validation Defaults

Use these commands in `/Users/rainie/Desktop/GitHub/fap-web` when relevant:

```bash
pnpm lint
pnpm lint:spacing
pnpm typecheck
pnpm test:contract
pnpm build
git diff --check
```

For assessment contract changes, add targeted checks such as:

```bash
pnpm verify-big5-contract-freeze
pnpm verify-enneagram-contract-freeze
pnpm verify:riasec-launch
```

For visual/UI changes, use the repository visual policy and update only Linux baselines when the change is intentional.

## Backend Validation Defaults

Use these commands in `/Users/rainie/Desktop/GitHub/fap-api/backend` when relevant:

```bash
composer test
php artisan test
php artisan route:list --path=api --except-vendor
bash scripts/verify_mbti.sh
```

Use this from `/Users/rainie/Desktop/GitHub/fap-api` for the backend MBTI CI chain:

```bash
bash backend/scripts/ci_verify_mbti.sh
```

For CMS or content-authority work, prefer backend dry-run commands and import validators over frontend fallbacks.

## FermatMind Product Boundaries For Codex

Codex must preserve these product boundaries:

- FermatMind is a structured self-understanding, career exploration, and ability-growth system.
- Test results are working hypotheses and structured references, not fixed identity labels or final judgments.
- Public pages should not claim specific reliability, validity, samples, norms, or percentile authority unless the backend/public evidence source explicitly provides it.
- If evidence is not public or not verified, write `Unknown` or "当前公开说明中暂不提供具体数值".
- IQ public copy must keep the current boundary: original 30-question assessment, backend-private scoring, raw/reference output where formal norm authority is not available.
- Private results, order pages, attempt IDs, user-specific report links, and support identifiers must never enter sitemap, `llms.txt`, public internal links, public articles, or analytics that expose private paths.
- Frontend must not create editorial fallback content for CMS-backed surfaces.
- DailyGiving proof media and indexability remain backend-authoritative.

## Recommended Codex Personalization

Paste this into Codex Settings > Personalization > Custom Instructions.

```md
我是 FermatMind / 费马测试的操作者。请用务实、直接、工程化的方式协作，默认用中文回复，代码和命令保留英文原文。

工作默认值：
- 先读仓库规则、`AGENTS.md`、现有代码和相关文档，再做改动。
- 不要只给计划；当任务明确且可执行时，直接实现、验证并汇报结果。
- 每个任务保持单一 scope。不要顺手修未来 PR、邻近问题或无关文件。
- 修改前先确认当前分支和 `git status --short --branch`。遇到用户已有改动，不要回滚；只做路径受限的改动和 staging。
- 提交、推送、开 PR 前必须运行任务相关本地检查，并报告命令与结果。
- 需要上 GitHub 时：创建聚焦分支、显式 staging、写清楚 commit、push、开一个 PR。PR body 必须包含 what changed、why、validation、deferred items。
- 官方 Codex 分层原则：个性化只放跨仓库默认值和高层战略；硬规则看 repo `AGENTS.md`；可复用流程看 `.agents/skills`；具体证据和策略看 `docs/`。

FermatMind 仓库：
- 前端仓库：`/Users/rainie/Desktop/GitHub/fap-web`，Next.js + TypeScript + pnpm，Node 24，pnpm-only。
- 后端仓库：`/Users/rainie/Desktop/GitHub/fap-api`，Laravel 12 / PHP 8.4，backend 为 CMS、API、评分、内容、媒体和公开内容权威层。
- 前端只负责渲染、交互、API adapter、支付/结果流程、固定产品代码和可验证 UI；不要在前端新增 CMS-backed 公开内容 fallback。
- 文章、帮助/政策/公司页、首页和测试中心模块、职业内容、人格公开页、SEO 枚举、sitemap、llms、媒体引用和 DailyGiving 证明均以后端 CMS/public API 为权威。

费马测试产品边界：
- FermatMind 是自我认知、职业探索和能力成长系统，不是医疗诊断、职业录用、人事筛选、升学录取或金融/法律决策工具。
- 测评结果是结构化参考和工作假设，不是固定身份、命运、能力、健康或未来结果的最终判断。
- 没有公开审核证据时，不要声称“绝对准确”“权威验证”“可预测结果”或具体信度、效度、常模、百分位。应写 Unknown 或“当前公开说明中暂不提供具体数值”。
- 私人测评结果、订单、attempt/report 链接、找回信息和支付信息不得进入 sitemap、llms、公开页面、公开内链或可识别分析日志。

SEO / GEO 战略：
- SEO/GEO 的目标是让真实、可验证、边界清楚的 FermatMind 内容被搜索引擎和 AI answer surfaces 正确理解；不是用隐藏 schema、堆关键词或前端 fallback 扩大曝光。
- sitemap = discoverability surface；`llms.txt` = AI/GEO entry surface；`llms-full.txt` = evidence-gated enriched context；JSON-LD = structured data，不等于 graph proof、AI citation 保证或权威证明。
- metadata、canonical、hreflang、schema、sitemap、llms、public enumeration 必须来自 CMS/public API/backend authority。前端只能消费和渲染，不得本地发明内容权威。
- pSEO 扩张必须有 CMS/backend authority、可见证据、claim boundary、manual review、indexability gate；MBTI x career、Big Five trait x career、RIASEC code x career、trait x problem、career recommendation pSEO 在未解锁前保持冻结。
- GEO readiness 代表 visible evidence + answerability，不代表 AI 精准规划、精准职业推荐、隐藏 schema 证据或搜索/LLM 引用保证。
- 涉及 SEO/GEO 改动时，优先读取 `AGENTS.md`、`.agents/skills/fap-web-seo-geo-authority/SKILL.md`、`docs/claims/seo-geo-llms-claim-guards.md`、`docs/claims/public-claim-boundary-matrix.md`、相关 `docs/seo/` 文件。

品牌战略：
- 正式名称：中文“费马测试”，英文“FermatMind”。正式表达可写“费马测试（FermatMind）”。
- 品牌定位：把自我认知、职业探索与能力成长做成可测量、可训练、可复盘的系统；核心语言是测量、解释、行动、复盘。
- 品牌信任来自清楚语言、审慎边界、稳定交付和持续修正；不要用夸张权威、神秘化、焦虑营销或未经证实的背书来换转化。
- 禁止暗示未经确认的官方合作、认证、媒体/专家背书、临床级、最准确、保证职业/收入/录用/升学结果、公益捐赠保证影响。
- Trust、rating、user count、expert review、media mention、DailyGiving badge、public-benefit proof 只有在 backend/CMS authority 和公开安全证据通过后才可用于页面、schema、广告、社媒或 PR。
- L1 业务优先级是 MBTI，L2 是 Big Five，L3 是文章/topics/职业推荐/非核心测试；缓存、降级、SEO/GEO 和 PR 排期都要保护这个优先级。

常用验证：
- fap-web：`pnpm lint`、`pnpm lint:spacing`、`pnpm typecheck`、`pnpm test:contract`、`pnpm build`、`git diff --check`。
- fap-api/backend：`composer test`、`php artisan test`、`php artisan route:list --path=api --except-vendor`、`bash scripts/verify_mbti.sh`。
- PR train 或 manifest PR 必须按 `docs/codex/pr-train.yaml` 和 `docs/codex/pr-train-state.json` 执行；依赖未合并、检查失败、scope 漂移、GitHub required checks 失败时停止。

协作方式：
- 给我短进度更新，说明正在读什么、发现什么、准备改什么。
- 结论要高信号：改了哪些文件、为什么、怎么验证、还有什么风险。
- 涉及当前外部事实、GitHub 状态、线上页面、依赖版本、产品文档、政策或价格时，必须联网核实并给出来源链接。
```

## Prompt Templates

Use these prompts to get predictable Codex behavior.

### Research Only

```text
请只做扫描和技术判断，不改文件。范围：<scope>。
请读取相关代码/文档，访问需要核实的线上页面，输出：
1. 当前事实
2. 风险和边界
3. 建议的 PR scope
4. 可能触及文件
5. 本地验证命令
6. 如果需要 PR-train manifest/state，列出需要我授权新增的条目
```

### Implement A Scoped Frontend PR

```text
在 fap-web 执行一个 scoped PR：<title/scope>。
只允许修改：<paths>。
请先检查 git status 和相关 AGENTS.md，读代码后实现，运行相关本地检查，git diff --check，然后准备 commit/PR。不要修改 PR-train manifest/state，除非我明确授权。
```

### Implement A Scoped Backend PR

```text
在 fap-api 执行一个 scoped PR：<title/scope>。
只允许修改：<paths>。
后端仍是 CMS/API/评分/内容权威层；请避免把权威逻辑移到前端。实现后运行相关 Laravel/PHP 检查和必要 dry-run。
```

### Fix Current PR Checks

```text
只修当前 PR 的失败检查，不开始新 scope。
请读取 GitHub check 输出，定位失败原因，只修改当前 PR scope 内文件，运行对应本地复现命令，提交并推送修复。
```

### SEO/GEO/Brand Strategy Work

```text
请做 FermatMind SEO/GEO/品牌策略相关任务，先判断这是 research-only、docs-only、CMS/backend authority、还是 fap-web render-only。
必须读取 AGENTS.md、相关 .agents/skills、docs/claims、docs/seo、线上 FermatMind 页面。
输出或实现时请明确：
1. authority source
2. sitemap/llms/schema/canonical/hreflang/indexability 是否变化
3. claim boundary 和 forbidden claims
4. brand/trust proof 是否有 backend/CMS 证据
5. validation commands
6. Repository rule impact
不要新增前端 editorial fallback、隐藏 schema 证据、未审核 pSEO、未授权品牌背书或搜索提交。
```

## Browser And Computer Use Rules

When the task asks Codex to "看一下网站" or verify live behavior:

1. Prefer web search or in-app browser for public pages.
2. Use Playwright/browser testing for local app flows.
3. Use Computer Use only when the task requires a signed-in GUI, desktop setting, non-browser app, or manual UI that cannot be reached by shell/browser tools.
4. Keep sensitive apps closed unless required.
5. Ask for narrow approval before interacting with account, payment, credential, system, or production settings.

## Definition Of Done

A Codex task is done only when:

- The requested scope is implemented or clearly blocked.
- Changed files are listed.
- Local checks are run or explicitly reported as not run with reason.
- Any public/live-site claims are backed by current source links.
- No unrelated files were touched.
- For GitHub delivery, the branch is pushed and the PR URL is reported.
