# MBTI 性格资产任务线复盘索引

生成日期：2026-07-13

## 当前结论

2026-07-03 至 2026-07-13 的 MBTI 任务线完成了从页面结构、内容包、CMS 导入、权威 readmodel、
indexability promotion、sitemap/LLMS gate 到 GSC 提交的首个完整闭环。

当前已完成并通过最终 release gate 的 cohort 是 9 条 URL：

- Profile：`istj-a`、`istp-a`、`isfp-a`、`esfj-a`。
- Comparison：`intp-a-vs-intp-t`、`intj-vs-intp`、`entj-vs-intj`、`infj-vs-infp`、`istj-vs-isfj`。

最终证据：

- INDEX-24R：CMS/API、canonical、robots、JSON-LD、FAQ parity、sitemap、`llms.txt`、
  `llms-full.txt` 均为 9/9，private URL leaks 为 0。
- GSC-25：sitemap 已存在且成功，9 条 URL 均完成 inspection 记录和 indexing request；
  28 天基线为 13 clicks、1409 impressions、CTR 0.9%、average position 9.2。

这不代表全部 32 人格页、A/T 对比页和 cross-type 对比页均已完成。未进入上述 cohort 的资产仍须经过
GSC evidence、内容 QA、CMS approval/import、readback、indexability 与 discoverability gate。

## 文档

- `01-pr-taskline-timeline.md`
  - 按阶段复盘 fap-web 与 fap-api 的主要 PR、产物和完成边界。
- `02-technical-architecture-and-authority.md`
  - 记录 backend authority、前端消费边界、状态机及 release gate。
- `03-incidents-root-causes-and-lessons.md`
  - 总结反复出现的 API 超时、noindex 分歧、JSON-LD、LLMS 缓存和台账漂移问题。
- `04-scan-and-operations-runbook.md`
  - 提供后续只读扫描、异常分流和验证命令。
- `05-next-phase-roadmap.md`
  - 记录 GSC 7/14/28 天监控和下一批资产的正确扩展顺序。

## 后续扫描的事实优先级

1. 线上公开 API、页面 HTML、sitemap、LLMS 的当次只读结果。
2. GitHub PR merged 状态与 `origin/main` 可达的 merge commit。
3. 已合并的 JSON/Markdown/CSV 证据包。
4. `docs/codex/pr-train-state.json`。

ledger 是执行台账，不是运行时权威。并行窗口或 merge 后回写延迟可能让 ledger 暂时停留在
`ready_to_merge`；扫描时必须核对 GitHub 和 `origin/main`，但不得在无授权的复盘 PR 中顺手修改 ledger。
