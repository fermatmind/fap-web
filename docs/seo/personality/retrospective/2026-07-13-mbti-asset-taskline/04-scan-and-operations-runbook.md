# MBTI 性格资产只读扫描与运维 Runbook

## 适用场景

- 判断 MBTI 任务线当前是否健康。
- 复查某条 Profile/Comparison 为什么 noindex、未枚举或内容缺失。
- 选择下一批内容资产。
- 在 deploy、promotion 或 GSC 前确认是否满足 gate。

本 runbook 默认只读。CMS write、promotion、deploy、GSC mutation 均需要独立明确授权。

## 1. 仓库与 PR 事实

在两个仓库分别执行：

```bash
git fetch origin main --prune
git status --short --branch
git rev-parse origin/main
git log origin/main --since='2026-07-01' --oneline --decorate --grep='MBTI-'
```

检查规则：

- 不在用户脏工作树中运行生成器或切分支。
- 使用 clean detached worktree 做线上 gate。
- PR merged 事实以 GitHub 与 `origin/main` 为准；ledger 作为补充证据。

## 2. 固定 cohort

当前 released cohort：

```text
/zh/personality/istj-a
/zh/personality/istp-a
/zh/personality/isfp-a
/zh/personality/esfj-a
/zh/personality/intp-a-vs-intp-t
/zh/personality/intj-vs-intp
/zh/personality/entj-vs-intj
/zh/personality/infj-vs-infp
/zh/personality/istj-vs-isfj
```

新增 URL 不得直接加入该集合；必须形成新的、可审计的 batch manifest。

## 3. INDEX-24R 线上 gate

在最新 fap-web `origin/main` 的临时 worktree 中运行：

```bash
node scripts/seo/build-mbti-index-24r-release-gate-revalidation.mjs --allow-network
```

要求：

```text
ALLOW_URL_EXPANSION
CMS_API=9/9
CANONICAL=9/9
ROBOTS=9/9
JSONLD=9/9
FAQ_PARITY=9/9
SITEMAP=9/9
LLMS=9/9
LLMS_FULL=9/9
PRIVATE_URL_LEAKS=0
```

进行 GSC 或 release 恢复前必须连续运行两次，中间不能部署或改配置。生成器会更新证据文件，因此只在隔离 worktree
运行；扫描完成后检查并丢弃该临时 worktree 的生成差异，不污染活跃分支。

## 4. 单 URL 异常分流

| 现象 | 先查 | 常见归属 |
| --- | --- | --- |
| 页面 404 | backend detail API、slug/locale | CMS/import/readmodel |
| 页面 200 但 noindex | API effective indexability、SEO robots | backend state/readmodel |
| 正文空但 API 有数据 | frontend adapter/render cache | fap-web |
| sitemap 有、页面 noindex | API latency、frontend noindex shell cache | backend performance + frontend reads |
| JSON-LD 缺失 | API `jsonld`、canonical parity | backend schema authority |
| FAQ schema 不一致 | visible FAQ 与 API FAQ | CMS/readmodel/rendering |
| sitemap 9/9、LLMS 0/9 | authority fetch budget/cache | fap-web feed runtime |
| GSC 未收录 | inspection 状态、crawl date、canonical | 监控，不自动改内容 |

## 5. 证据包检查

```bash
jq '{final_decision, summary, baseline, monitoring, post_submission_index24r_recheck}' \
  docs/seo/personality/mbti-gsc-25-submission-monitoring-execution-2026-07-12.json

jq '{decision, expansion_allowed, metrics, private_url_leak_count}' \
  docs/seo/personality/mbti-index-24r-release-gate-revalidation-2026-07-12.json
```

如果文件字段发生演进，先查看 builder 和对应 contract，不要用临时字符串解析替代结构化读取。

## 6. 本地验证分层

文档/证据 PR：

```bash
git diff --check
```

运行时或 adapter PR：

```bash
pnpm lint . --max-warnings=0
pnpm typecheck
pnpm test:contract
NEXT_PUBLIC_API_URL=https://api.fermatmind.com pnpm build
git diff --check
```

启动完整 `test:contract` 或 build 前，先检查本机是否已有 FermatMind Vitest/PHPUnit/verify 重任务；最多运行一套。

## 7. Stop 条件

出现以下任一情况立即 HOLD：

- INDEX-24R 任一字段不是 9/9 或 private leak 非 0。
- backend API 与页面 robots/indexability 不一致。
- JSON-LD canonical 或 FAQ parity 失败。
- sitemap/LLMS 通过本地 fallback 扩 URL，而非 backend authority。
- package hash、record count、slug/locale 或 expected pre-state 不匹配。
- 需要生产 CMS write、promotion、deploy 或 GSC mutation但没有 exact 授权。

不得通过延长无限 timeout、硬编码 URL、前端 editorial fallback、CodeQL suppress 或绕过 GSC quota 解决。
