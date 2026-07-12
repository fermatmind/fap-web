# 九型人格内容资产页 PR 任务线技术复盘（2026-07-09 至 2026-07-12）

## 结论

这条任务线已经完成了从中文 13 页、英文 13 页、90 页翼型/本能副型，到 116 页全量公开发现、搜索提交、`llms.txt` 与 `llms-full.txt` GEO feed 的闭环。

截至 2026-07-13 只读复核：

- `/llms.txt` Enneagram canonical：116 unique / 116 expected。
- `/llms-full.txt` Enneagram canonical：116 unique / 116 expected，`x-fermatmind-llms-full-mode=complete`。
- 公开 feed 私有路径命中：0。
- 最终 fap-api closeout PR：#3026，merge SHA `4c80acbb211a17d4173aa7c742046b8a7773b403`。
- 最终 fap-web cache-only ops run：`29198788071`，结果 success。

这条线的核心价值不是单个页面上线，而是把 FermatMind 的人格内容资产发布管线拆成了可复核、可回滚、可授权、可审计的 PR train。

## 范围

本复盘覆盖以下内容资产与运行面：

- 已有 EN13 双语页：26 页。
- 新增 90 页：
  - 36 个双语翼型页。
  - 54 个双语本能副型页。
- 全量 Enneagram canonical：116 页。
- backend CMS authority、public API、sitemap authority、URL Truth、Search Queue、IndexNow、`llms.txt`、`llms-full.txt`。
- fap-web route resolver、public asset normalizer、sitemap extractor、LLMS feed enumeration、cache-only ops workflow。

不包含：

- 后续内容加厚、改写、SEO/GEO 文案优化。
- 新一轮 Search Console / Bing Webmaster 手工分析。
- 非 Enneagram 的 MBTI、Big Five、RIASEC 或 Career PR train。

## 阶段复盘

### Phase 1：中文 13 页与基础权威修复

目标是让九型人格中文内容资产进入 CMS/public API 权威层，并修正 sitemap 与 llms feed 的边界。

关键成果：

- 中文 hub、center、core type 内容资产完成 QA 与 source-of-truth 记录。
- `sitemap.xml` 与 `llms.txt` 解耦：sitemap 可包含符合 index/sitemap gate 的页面，`llms.txt` 必须单独由 `llms_eligible` 控制。
- 修复了早期 llms 泄漏风险：Enneagram 页面未授权时不进入 `llms.txt` / `llms-full.txt`。
- 明确了生产部署后的 cache warm 要求：backend deploy 后需要 sitemap source cache warm；EdgeOne 收敛需考虑 300 秒缓存。

代表 PR：

- fap-api #2825 `ENNEAGRAM-SITEMAP-GENERATOR-REPAIR-01`
- fap-api #2826 `ENNEAGRAM-CMS-PUBLISH-GATE-COMMAND-01`
- fap-api #2827 `ENNEAGRAM-SITEMAP-LLMS-ELIGIBILITY-DECOUPLE-01`
- fap-web #1633 `ENNEAGRAM-AUDIT-SOURCE-OF-TRUTH-COMMIT-01`
- fap-web #1635 `ENNEAGRAM-ZH13-CONTENT-QA-01`
- fap-web #1639 `ENNEAGRAM-LLMS-PERSONALITY-PROFILES-FEED-GATE-REPAIR-01`

### Phase 2：英文 EN13 本地化、导入与发布

目标是把 13 页英文内容从本地化包推进到 CMS，并以 noindex → publish 的节奏上线。

关键成果：

- 英文 EN13 内容包、source ledger、QA 进入 fap-api。
- Publish gate 支持 English locale，但继续强制 `llms/search=false`。
- Sitemap locale authority 支持英文枚举。
- CMS dry-run、import/promote、noindex runtime smoke、publish/cache warm、26 页双语生产复核完成。
- 修复了多个 Ops workflow 的 fail-closed 摘要、source hash refresh、readback JSON 比较问题。

代表 PR：

- fap-api #2830 `ENNEAGRAM-EN13-CONTENT-PACKAGE-01`
- fap-api #2833 `ENNEAGRAM-EN13-PUBLISH-GATE-01`
- fap-api #2837 `ENNEAGRAM-EN13-SITEMAP-LOCALE-01`
- fap-api #2840 `ENNEAGRAM-EN13-CMS-DRY-RUN-01`
- fap-api #2887 `ENNEAGRAM-EN13-CMS-IMPORT-PROMOTE-01`
- fap-api #2890 `ENNEAGRAM-EN13-NOINDEX-RUNTIME-SMOKE-01`
- fap-api #2936 `ENNEAGRAM-EN13-PUBLISH-CACHE-WARM-01`
- fap-api #2939 `ENNEAGRAM-EN13-BILINGUAL-PRODUCTION-REVALIDATION-01`

### Phase 3：90 页内容包与双仓 runtime 支撑

目标是把 90 页翼型/本能副型内容从本地资产推进到 CMS/public runtime。

关键成果：

- fap-api 冻结 90 页 CMS 内容包，包含 QA、repair ledger、dry-run evidence。
- CMS gate 支持 `wing` 与 `instinctual_subtype` 两类实体。
- CMS Ops workflow 支持 90 页 dry-run、draft import、promotion inspect/write、publish dry-run/write。
- Sitemap source 支持 en/zh wing/subtype canonical 枚举。
- fap-web 支持：
  - `/personality/enneagram/wings/:code`
  - `/personality/enneagram/type-:n/instincts/:subtype`
  - public asset contract normalization
  - backend sitemap source extractor
- Cross-repo readiness 验证通过，代码部署、CMS import/promote、noindex smoke、publish/cache warm、116 页生产复核完成。

代表 PR：

- fap-api #2974 `ENNEAGRAM-90-CONTENT-PACKAGE-FREEZE-01`
- fap-api #2976 `ENNEAGRAM-90-BACKEND-CMS-GATE-IDENTITY-01`
- fap-api #2978 `ENNEAGRAM-90-BACKEND-CMS-OPS-WORKFLOW-01`
- fap-api #2979 `ENNEAGRAM-90-BACKEND-SITEMAP-ENTITY-LOCALE-01`
- fap-web #1686 `ENNEAGRAM-90-FRONTEND-ROUTE-RESOLVER-01`
- fap-web #1687 `ENNEAGRAM-90-FRONTEND-ASSET-CONTRACT-01`
- fap-web #1690 `ENNEAGRAM-90-FRONTEND-SITEMAP-EXTRACTOR-01`
- fap-web #1692 `ENNEAGRAM-90-CROSS-REPO-READINESS-01`
- fap-web #1694 `Fix Enneagram 90 instinct subtype public routes`

### Phase 4：Search Queue、URL Truth 与 IndexNow

目标是让 116 个公开 canonical 进入受控搜索提交链路。

关键成果：

- 首轮 readiness 发现 Search Queue 缺 URL Truth authority，结论为 NO_GO。
- 新增 URL Truth handoff：只从 CMS authority 116 个已发布、公开、index/sitemap eligible 的 Enneagram assets 生成 candidates。
- URL Truth import 通过 artifact SHA、page type、limit、deployed SHA 和 operator phrase 受控。
- Search Queue enqueue 与 IndexNow submit 分离：先 enqueue，不调用搜索引擎；再 canary，后 batch。
- Search Queue、IndexNow、CMS、llms、sitemap、deploy 的 side effect 边界分别记录。

代表 PR：

- fap-api #2994 `ENNEAGRAM-SEARCH-RELEASE-READINESS-01`
- fap-api #2998 `ENNEAGRAM-SEARCH-QUEUE-READONLY-INSPECT-01`
- fap-api #3001 `ENNEAGRAM-SEARCH-RELEASE-READINESS-02`
- fap-api #3002 `ENNEAGRAM-SEARCH-URL-TRUTH-REPAIR-01`
- fap-api #3009 `ENNEAGRAM-SEARCH-URL-TRUTH-OPS-GATE-01`
- fap-api #3010 `ENNEAGRAM-SEARCH-RELEASE-READINESS-03`
- fap-api #3011 `ENNEAGRAM-SEARCH-QUEUE-ENQUEUE-01`
- fap-api #3012 `ENNEAGRAM-SEARCH-INDEXNOW-SUBMIT-01`

### Phase 5：`llms.txt` release

目标是打开 Enneagram 116 页的 AI/GEO 入口 feed，但不提前开放 enriched full feed。

关键成果：

- fap-api 添加精确 116-target `llms.txt` release gate。
- fap-web 添加从 backend public API 枚举 `llms_eligible=true` 的 Enneagram candidates。
- 修复 fap-web 1.5s budget fallback 导致 Enneagram 枚举可能降为 0 的稳定性问题。
- 最终生产复核确认：
  - `/llms.txt` Enneagram = 116/116。
  - `/llms-full.txt` Enneagram = 0/116，直到后续 full release。

代表 PR：

- fap-api #3013 `ENNEAGRAM-LLMS-TXT-RELEASE-GATE-01`
- fap-web #1702 `ENNEAGRAM-LLMS-TXT-FRONTEND-ENUMERATION-01`
- fap-web #1716 `ENNEAGRAM-LLMS-TXT-STABILITY-01`
- fap-api #3022 `ENNEAGRAM-LLMS-TXT-PRODUCTION-REVALIDATION-01`

### Phase 6：`llms-full.txt` evidence-gated release

目标是打开 enriched GEO feed，同时保证 evidence/provenance/limitations/claim boundary 足够稳定。

关键成果：

- EN13 evidence provenance 升级，解决 26 个旧 EN13 页的 source IDs、visible evidence、limitations 与双语 provenance。
- EN13 evidence CMS refresh 完成，并通过 readback repair 解决 MySQL JSON key order 造成的严格比较误判。
- Readiness-02 给出 `GO_FOR_SEPARATE_LLMS_FULL_AUTHORIZATION`。
- fap-web `llms-full.txt` 增加 Enneagram 116 条 evidence-gated 枚举。
- 新增 LLMS Feed Cache Ops workflow，用 PM2 reload 清 Next in-process cache，不部署、不拉代码、不改 CMS。
- 修复 workflow action pin、Node 22 heredoc runtime、full feed raw duplicate readback 语义。
- 最终生产读回确认 `/llms-full.txt` Enneagram 116/116，mode `complete`。

代表 PR：

- fap-api #3016 `ENNEAGRAM-EN13-EVIDENCE-PROVENANCE-UPGRADE-01`
- fap-api #3020 `ENNEAGRAM-EN13-EVIDENCE-REFRESH-READBACK-REPAIR-01`
- fap-api #3023 `ENNEAGRAM-LLMS-FULL-RELEASE-READINESS-02`
- fap-web #1719 `ENNEAGRAM-LLMS-FULL-FRONTEND-ENUMERATION-01`
- fap-web #1720 `FAP-WEB-LLMS-FEED-CACHE-OPS-01`
- fap-web #1722 `FAP-WEB-WORKFLOW-ACTION-REF-INTEGRITY-01`
- fap-web #1723 `FAP-WEB-LLMS-FEED-CACHE-OPS-NODE22-REPAIR-01`
- fap-web #1724 `FAP-WEB-LLMS-FULL-READBACK-DUPLICATE-SEMANTICS-REPAIR-01`
- fap-api #3026 `ENNEAGRAM-LLMS-FULL-RELEASE-01`

## 主要工程判断

### 1. PR train 拆分是必要的

这条线之所以能最终收敛，是因为每个 PR 都只解决一个 authority 或 gate：

- 内容包冻结不做导入。
- CMS gate 不做生产写入。
- Ops workflow 不自动执行。
- Deploy 不做 CMS import。
- CMS import 不 publish。
- Publish 不打开 llms/search。
- Search Queue enqueue 不提交搜索引擎。
- `llms.txt` 不自动等于 `llms-full.txt`。

这种拆分让失败可以定位到具体环节，也让授权语义保持可审计。

### 2. Backend authority 必须优先

九型人格公开页的内容、SEO 枚举、sitemap、llms、URL Truth 都应从 backend CMS/public API 派生。fap-web 只消费、渲染和枚举，不本地发明 editorial fallback。

这次多个修复都在维护这个边界：

- fap-web route resolver 支持新路径，但不新增静态内容 fallback。
- `llms.txt` 与 `llms-full.txt` 从 backend public API / authority 读取 eligible assets。
- sitemap extractor 不能替代 llms eligibility authority。

### 3. Ops workflow 需要先验证工具链本身

最后几次卡顿不是业务逻辑，而是 workflow 可运行性问题：

- `actions/upload-artifact` pin 到不可解析 SHA。
- Node 22 下 heredoc 混用 `require()` 与 top-level `await`。
- `/llms-full.txt` enriched feed 中 canonical raw mention 重复，被过严 duplicate counter 阻断。

结论：以后 workflow 本身必须有 action ref integrity contract、runtime syntax contract、failure artifact contract。

### 4. 单人开发要减少人工判断面

这条线中最容易消耗时间的不是写代码，而是生产授权、deploy lock、cache、workflow gate、readback mismatch 等运行状态判断。

长期应保留：

- exact SHA authorization。
- artifact SHA authorization。
- code-only release candidate lane。
- cache-only ops lane。
- PR train ledger。

但要减少临时手工修 workflow 的频率，把这些变成通用 ops lane。

## 当前完成态

| Surface | 状态 |
|---|---:|
| EN13 双语公开页 | 26/26 完成 |
| 90 页 wing/subtype | 90/90 完成 |
| 全量 Enneagram canonical | 116/116 完成 |
| sitemap / robots / canonical / hreflang | 已复核 |
| Search Queue | 已 enqueue |
| IndexNow | canary + batch 已提交 |
| `llms.txt` | 116/116 |
| `llms-full.txt` | 116/116 complete |
| CMS body / eligibility 未授权副作用 | 0 |
| Search / IndexNow 非授权副作用 | 0 |
| Deploy 非授权副作用 | 0 |

## 后续建议

1. 做内容质量二期，而不是再改发布管线：
   - 高风险页深读；
   - 内容加厚；
   - SEO/GEO answer blocks 优化；
   - 中英文一致性与差异化优化。

2. 做运维工具二期：
   - 把 cache-only workflow 的 readback classifier 抽成脚本；
   - 把 workflow action lock refresh 单独周期化；
   - 把 release ledger closeout 自动化。

3. 做搜索效果观察：
   - IndexNow submit 结果；
   - Bing / Google 收录；
   - Enneagram 页面 impression/query cluster；
   - llms feed 被抓取状态。

