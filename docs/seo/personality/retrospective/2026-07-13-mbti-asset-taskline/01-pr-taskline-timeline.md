# MBTI 性格资产 PR 任务线时间线

## 阶段 1：页面结构与 SEO 消费能力

| 任务 | 仓库 | 结果 |
| --- | --- | --- |
| Personality directory refresh | fap-web | 重构 hub 的 32 人格卡片与对比入口，建立稳定 UI 基线。 |
| `MBTI-SEO-01` | fap-web | Hub title/meta/H1、32 人格解释、热门对比、FAQ 和 ItemList。 |
| `MBTI-SEO-02` | fap-web | 测试页、结果路径与 hub/profile/comparison 的内链闭环。 |
| `MBTI-SEO-03` | fap-web | Profile answer block、FAQ、A/T 差异和对比内链的后端内容渲染能力。 |
| `MBTI-SEO-05` | fap-web | Comparison 的最大区别、判断表、误判、场景和 FAQ 模板。 |
| `MBTI-SEO-07` | fap-web | sitemap、LLMS 和 indexability discoverability audit。 |

阶段边界：前端只提供结构、schema 消费、内链和交互，不增加 CMS-backed editorial fallback。

## 阶段 2：GSC 证据、内容包与 QA

| 任务 | 仓库 | 结果 |
| --- | --- | --- |
| `MBTI-OPS-08` | fap-web | 建立 page/query 优先级和 28 天 cohort 基线。 |
| `MBTI-ASSET-OPS-09` | fap-web | Top10、comparison20、remaining58 的批次 SOP。 |
| `MBTI-ASSET-SKILL-10` | fap-web | 将 GSC -> 内容包 -> QA -> import -> promotion -> index gate 固化为 runbook。 |
| `MBTI-GSC-11` | fap-web | 稳定 query evidence export，避免按猜测改 title/FAQ。 |
| `MBTI-QA-14` | fap-web | 增加语义质量、重复风险和模板页风险 gate。 |
| `MBTI-CONTENT-15` | fap-web | 生成 4 Profile、1 A/T comparison、4 hot comparison 的 top-blocker 修复包。 |

CONTENT-15 的 9 条记录成为后续 CMS import、promotion、INDEX-24R 和 GSC-25 的固定 cohort。批次一旦锁定，
后续命令必须通过 record count、slug/locale、source hash、authorization hash 和 expected pre-state fail closed。

## 阶段 3：CMS 审核、导入与 readmodel

| 任务 | 仓库 | 结果 |
| --- | --- | --- |
| `MBTI-CMS-12/13` | fap-api | Profile 与 Comparison 的 import dry-run 和字段映射。 |
| `MBTI-CMS-16/17` | fap-web | 将 CONTENT-15 转为可审核 approval package。 |
| `MBTI-CMS-20/21/22/23` | fap-web | 内容审核、最终 dry-run 与 exact production authorization package。 |
| `MBTI-CMS-26` | fap-api | 9 条 mixed package importer/preflight。 |
| `MBTI-CMS-26B` | fap-api | 补齐 cross-type comparison backend authority storage。 |
| `MBTI-CMS-27A` | fap-api | fail-closed production importer delivery。 |
| `MBTI-CMS-29` | fap-api | Profile FAQ/内链、A/T readmodel、cross-type quick judgment readmodel 修复。 |
| `MBTI-CMS-28A` | fap-api | 统一 DB `is_indexable` 与 SEO robots 的 effective indexability。 |

生产写入与代码合并严格分开。Importer PR 合并并不等于允许生产导入；生产动作必须绑定 exact package SHA、
authorization payload SHA、record count 和 scope mode。

## 阶段 4：Schema、indexability 与 discoverability

| 任务 | 仓库 | 结果 |
| --- | --- | --- |
| `MBTI-INDEX-24A-API` | fap-api | 为 cross-type comparison 提供 backend-authoritative SEO/JSON-LD readmodel。 |
| `MBTI-INDEX-24A` | fap-web | 前端只渲染后端 comparison JSON-LD，不构造 editorial fallback。 |
| `MBTI-INDEX-24B` | fap-api | 9 条 indexability promotion command/package 和生产 promotion。 |
| `MBTI-INDEX-24C` | fap-web | 为人格 authority 枚举提供独立 LLMS 请求预算。 |
| `MBTI-INDEX-24R` | fap-web | 9/9 线上 release gate 与 private URL leak 负向检查。 |

INDEX-24R 的通过条件是所有指标同时 9/9，而不是页面能打开或 CodeQL 绿色。任何 canonical、robots、FAQ parity、
JSON-LD、sitemap、LLMS 中的一项失败，都必须保持 `HOLD_NO_URL_EXPANSION`。

## 阶段 5：稳定性修复与 GSC 收尾

主要 ad-hoc 支撑修复：

- fap-api 增加公开人格 readmodel cache、32 人格预热命令和 payload 收敛。
- fap-web 增加 Profile authority bundle 请求去重、独立超时预算和有界重试。
- fap-web 修复 `llms.txt` authority cache，避免瞬时 API 超时导致整组人格 URL 消失。
- 将 INDEX-24R 的 live network probe 与全量离线 contract 分离，降低 CI 非确定性。
- 修复 production workflow required-check race、lint baseline 和 Code Scanning 新告警门禁。

最终 `MBTI-GSC-25` 合并到 fap-web `main`：

- 不重复提交已经成功的 sitemap。
- 记录 9 条 URL Inspection 和 Request Indexing 结果。
- 固化提交日 28 天基线与 7/14/28 天监控时间点。
- GSC 提交不代表保证收录、排名或 AI 引用。

## 关键 merge references

以下是后续扫描最常用的 fap-web merge reference；完整历史仍以 `git log origin/main` 为准：

| Reference | Merge commit | PR |
| --- | --- | ---: |
| Hub directory UI baseline | `9528bc5b` | - |
| `MBTI-ASSET-OPS-09` | `a5d0798d` | #1590 |
| `MBTI-CONTENT-15` | `57d1844c` | #1607 |
| `MBTI-INDEX-24A` | `047776a3` | #1685 |
| `MBTI-INDEX-24C` | `7417ffa1` | #1700 |
| `MBTI-INDEX-24R` | `7d3fb8e8` | #1701 |
| LLMS authority cache stabilization | `b1b4391c` / `a83b2ac0` | #1706 / #1712 |
| Profile authority read stabilization | `0e5ddb27` | #1717 |
| `MBTI-GSC-25` | `25fbdb0e` | #1728 |

短 SHA 仅用于阅读定位，不用于生产授权。部署、import 或 promotion 必须使用当时解析的 40 位 exact SHA/hash。

## 已验证事实与台账边界

- Git/GitHub merged 事实应通过 PR state 和 `origin/main` merge commit 验证。
- PR-train ledger 可能因并行窗口和 merge 后未回写而滞后。
- 复盘文档不应为了“看起来一致”改写历史 ledger；只有阻塞新任务且获得授权时才 reconcile。
