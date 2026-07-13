# MBTI 性格资产后续路线图

## 当前完成边界

已完成的是首批 9 条 top-blocker cohort 的内容修复、CMS 导入、readmodel、schema、promotion、release gate 和 GSC
提交。以下工作仍未自动完成：

- 其余 32 人格变体的逐页 query fit 与内容质量确认。
- 其余 A/T comparison 与 cross-type comparison 的 authority/import/promotion。
- remaining assets 的重复风险、模板页风险和人工审核。
- GSC 7/14/28 天效果复盘。

因此下一阶段不应“一次性开放全部人格 URL”，而应复制已验证的 batch pipeline。

## 近期：GSC 监控

固定 cohort 的计划读回时间：

| Window | Date | 需要记录 |
| --- | --- | --- |
| 7 天 | 2026-07-19 | coverage、impressions、query-page match、异常 canonical |
| 14 天 | 2026-07-26 | clicks、CTR、average position、页面间 cannibalization |
| 28 天 | 2026-08-09 | 相对提交日 baseline 的变化、下一批优先级 |

监控任务只读。Title、FAQ、answer block 或内容调整必须形成独立内容资产 PR，并通过 CMS/backend authority。

## 下一批选择规则

按以下顺序评分，而不是按人格知名度主观选择：

1. GSC impressions 已存在且排名 4-20。
2. query 与目标页面意图高度匹配。
3. 当前内容通过语义 QA，或 blocker 可在一个 scope 内修复。
4. 有明确的 Profile/A-T/cross-type 内链闭环。
5. backend entity、readmodel 和 import mapping 已存在。

每批建议保持 8-12 条，并锁定：URL、locale、entity type、source hash、approval hash、expected pre-state。

## 每批必须经过的任务

1. GSC evidence export：只读取 query/page 证据。
2. Content package：直接答案、适合/不适合、误解、A/T、职业/关系/压力、FAQ 或 comparison 判断模块。
3. Semantic QA：重复、空泛模板、claim boundary、FAQ parity。
4. CMS dry-run/approval：字段映射和 exact package。
5. Production import：单独授权并只写指定 batch。
6. Read-only readback：正文、FAQ、SEO、sections、内链。
7. Schema/indexability promotion：单独 exact authorization。
8. INDEX release gate：两次稳定通过。
9. GSC submit/monitor：只处理 gate 已释放 URL。

## 技术债务优先级

### P0：监控稳定性

- 将 INDEX-24R 的两次运行结果保留为结构化 evidence，而非只留 stdout。
- 对 Profile API latency、noindex shell 和 LLMS authority cache 建立只读周期检查。

### P1：台账可观测性

- 扫描工具同时展示 GitHub merged、`origin/main` reachable、ledger status，减少假阻塞。
- ledger reconciliation 继续遵守授权和 same-repo 原则，不自动改历史。

### P1：批量 QA

- 对未发布资产继续检查句式重复、相同 FAQ、低信息密度、无证据百分比和诊断性表达。
- 任何批量生成结果都必须保留 manual review 与 needs_revision 队列。

### P2：性能预算

- 公开 Profile/Comparison API 应保留缓存和预热合同。
- 前端 feed authority 与页面 authority 使用独立、有限预算；失败时 fail closed，但避免一次瞬时错误污染长期缓存。

## 成功标准

- 新 cohort 在 release 前保持 noindex 且不进入 sitemap/LLMS。
- release 后 CMS/API、canonical、robots、JSON-LD、FAQ、sitemap、LLMS 连续两次全量通过。
- 无 result、attempt、report、order、payment、history 或私人分享 URL 泄漏。
- GSC 指标用于排序和诊断，不承诺收录、排名前三或 AI 引用。
