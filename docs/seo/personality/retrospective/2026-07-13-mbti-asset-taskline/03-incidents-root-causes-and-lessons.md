# MBTI 性格资产故障复盘与长期防线

## 1. Profile API 波动导致页面 noindex

**症状**：`istp-a`、`isfp-a`、`esfj-a` 偶发 API 超时，页面进入最小 noindex shell；sitemap/LLMS 仍可枚举该 URL。

**根因**：公开 readmodel 响应波动，前端 metadata 与正文重复请求；15 秒超时后的 noindex shell 被缓存约 300 秒。

**修复**：后端 readmodel cache、预热命令和 payload 收敛；前端 authority bundle 去重、30 秒预算、有界重试和 detail/SEO 独立降级。

**长期防线**：对目标 URL 连续多次验证 API 200 与延迟；页面 robots、sitemap、LLMS 必须在同一轮 gate 内核对。

## 2. DB indexability 与 SEO robots 分裂

**症状**：API `profile.is_indexable=true`，但 variant SEO 仍为 `noindex,follow`；目录、detail、landing 与 answer surface 状态不一致。

**根因**：多个 readmodel 各自解释索引状态，没有统一 effective indexability。

**修复**：以 `is_indexable=true` 且最终 robots 不含 noindex 为硬门禁，同步 detail/list/landing/answer 字段。

**长期防线**：合同同时覆盖 DB true + robots noindex、DB true + robots index、DB false + robots index 三种组合。

## 3. Cross-type comparison 没有后端权威存储

**症状**：A/T comparison 可导入，cross-type comparison 缺 authority storage/readmodel，无法完成同一 mixed package。

**根因**：最初 importer 只覆盖已有 A/T 模型，内容包先于 cross-type authority schema 完整落地。

**修复**：先用独立 PR 增加 cross-type storage/readmodel，再交付 fail-closed mixed importer；没有在前端补正文。

**长期防线**：内容包设计前先完成 entity/storage/readmodel matrix；未知 entity type 必须整批拒绝。

## 4. Comparison JSON-LD 前后端职责不清

**症状**：4 条 cross-type API 缺 `jsonld`/`seo_surface_v1`，前端又只在 indexable 时输出 schema。

**根因**：schema authority 与 indexability gate 被绑定，且 A/T 与 cross-type readmodel 不对称。

**修复**：后端统一提供权威 JSON-LD；前端将“schema 存在/有效”与“页面是否 indexable”分离并只消费后端 payload。

**长期防线**：对 1 条 A/T 和至少 1 条 cross-type 做 canonical、FAQ parity、single JSON-LD block 合同。

## 5. `llms.txt` 人格 URL 间歇性 0/9

**症状**：sitemap 和 `llms-full.txt` 为 9/9，`llms.txt` 偶发 0/9；连续 gate 不稳定。

**根因**：人格 authority 枚举共用 1.5 秒预算；一次 backend 超时会 fail closed 为整组空集合。部署后缓存和多实例状态又放大了波动。

**修复**：人格枚举使用独立 8 秒预算与 AbortSignal；增加 persistent last-known-good authority cache，同时保持错误时不引入本地 URL fallback。

**长期防线**：INDEX-24R 必须连续运行两次且 LLMS 均为 9/9；缓存修复不得绕开 backend eligibility。

## 6. Live network probe 污染全量合同测试

**症状**：`pnpm test:contract` 因生产 API 波动或超时失败，即使当前 PR 没有修改对应运行时。

**根因**：外部网络验证被当作确定性离线合同执行。

**修复**：INDEX-24R 只在显式 `--allow-network` 下运行；离线 contract 验证 builder、schema 和 fail-closed 行为。

**长期防线**：CI 合同使用 fixture；线上只读 gate 单独运行、保存证据并可重复执行。

## 7. 部署 workflow 与并行开发竞态

**症状**：staging 先完成，而 exact SHA 的 required checks 尚未全部结束；production guard 过早判定失败。单人多窗口并行时 main 又可能前进。

**根因**：guard 使用一次性检查快照，没有轮询 exact SHA，也没有区分“自动任务被新 main 取代”与真实失败。

**修复**：轮询四项 required checks，采用最新同名 run；风险路径正常跳过自动部署，真实失败/超时仍 fail closed。

**长期防线**：所有部署绑定 exact SHA；readiness 使用干净 detached worktree；并行窗口合并后重新解析最新 SHA。

## 8. Ledger 与 GitHub merged 事实漂移

**症状**：PR 已 merged 且 commit 在 `origin/main`，ledger 仍显示 `ready_to_merge` 或 pending。

**根因**：merge 与 merge 后 ledger 回写不在同一原子事务，并行任务可能先继续。

**修复原则**：GitHub merged state + `origin/main` contains merge commit 是合并事实；ledger 仅在阻塞依赖且授权后 reconcile。

**长期防线**：扫描报告必须同时输出 Git/GitHub 状态与 ledger 状态，不得只读其中一个。

## 9. “检查绿色”不等于“没有新安全告警”

**症状**：CodeQL workflow 绿色，但 main 上仍可出现新的 Code Scanning alert；lint warnings 长期累积。

**根因**：门禁只检查 workflow conclusion，没有检查新增 alert delta；lint 未使用 `--max-warnings=0`。

**修复**：全仓 lint 零 warning；PR 流程增加新增 Code Scanning alert 必须为 0；安全告警使用真实 URL allowlist/协议校验而非 suppress。

**长期防线**：required checks、Code Scanning alert delta、scope validation 三者必须独立通过。
