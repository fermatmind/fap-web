# 九型人格内容资产页架构与运维复盘

## 目标架构

九型人格公开内容资产页的目标架构是：

```text
CMS content package
  -> backend CMS authority
  -> backend public API
  -> sitemap / URL Truth / Search Queue / llms eligibility
  -> fap-web rendering and feed enumeration
  -> production readback and audit ledger
```

关键原则：

- CMS/backend 是内容、eligibility、canonical、provenance、publication state 的权威。
- fap-web 不新增 CMS-backed editorial fallback。
- sitemap、Search、`llms.txt`、`llms-full.txt` 是不同出口，必须分 gate。
- 生产动作必须由 exact SHA / artifact SHA / operator phrase 锁定。

## 内容资产发布模型

### 内容包

内容包分三层：

1. 内容源资产：
   - 13 页中文 EN13。
   - 13 页英文 EN13。
   - 90 页 wing/subtype。
2. 质量证据：
   - source ledger。
   - QA report。
   - repair ledger。
   - duplicate report。
3. CMS 导入证据：
   - dry-run report。
   - promotion inspect。
   - write/readback report。

这次的经验是：JSON 内容资产作为唯一源，Markdown 只作为人工 review preview。不能形成第二套内容权威。

### Entity model

最终公开 entity 覆盖：

| Entity | Count bilingual | Route family |
|---|---:|---|
| hub | 2 | `/personality/enneagram` |
| center | 6 | `/personality/enneagram/centers/:center` |
| core_type | 18 | `/personality/enneagram/type-:n` |
| wing | 36 | `/personality/enneagram/wings/:code` |
| instinctual_subtype | 54 | `/personality/enneagram/type-:n/instincts/:subtype` |
| Total | 116 | all above |

## Gate model

### CMS gate

CMS import / promote / publish 必须分开：

- draft import：只写 draft。
- promotion inspect：只读判断能否 promote。
- promotion write：promote 到 `content_ready/noindex`。
- publish dry-run：只读。
- publish write：打开 index/sitemap gate，但保持 search/llms 分离。

这次多次修复的共同点是 fail-closed：

- hash mismatch fail。
- source mismatch fail。
- stale/invalid asset fail。
- private path fail。
- forbidden side effect fail。
- readback mismatch fail。

### Sitemap gate

sitemap 是 discoverability surface，不等于 llms 或 Search release。

要求：

- 只枚举 published / public / indexable / sitemap eligible 的 canonical。
- hub、center、core、wing、subtype 都必须由 backend authority 枚举。
- cache warm 是生产动作，必须单独授权。

### Search gate

Search release 被拆成：

1. Readiness：只读确认 116 URL 可提交。
2. URL Truth：从 backend CMS authority 导出可审计 candidates。
3. URL Truth import：只写 `seo_urls` / `seo_url_entities`。
4. Queue enqueue：只写 queue，不调用搜索引擎。
5. IndexNow submit：canary 后 batch。

这个拆分避免了“页面刚上线就直接提交搜索引擎”的不可回退风险。

### `llms.txt` gate

`llms.txt` 是 AI/GEO entry surface。它比 sitemap 更严格：

- 必须 `llms_eligible=true`。
- 只允许 0 或完整 116。
- partial、duplicate、private、invalid state fail-closed。
- 不能用 sitemap extractor 替代 llms authority。

### `llms-full.txt` gate

`llms-full.txt` 是 enriched evidence surface。它比 `llms.txt` 更严格：

- 必须有 visible evidence。
- 必须有 stable source IDs。
- 必须有 limitations / method boundary。
- 必须有 bilingual provenance。
- 不能包含私人结果、订单、支付、token、内部路径。
- raw repeated canonical mentions 可作为 advisory，不应阻断 enriched feed；blocking duplicate 应基于 unique canonical set。

## fap-web runtime 模型

fap-web 负责：

- route resolver。
- API adapter。
- public asset normalizer。
- frontend rendering。
- feed enumeration。
- cache-only ops workflow。

fap-web 不负责：

- 发明内容。
- 修改 CMS eligibility。
- 替代 backend authority。
- 生产导入。
- Search Queue / IndexNow。

本次关键修复：

- wing/subtype route resolver。
- public asset contract normalizer。
- `llms.txt` 116 enumeration。
- `llms-full.txt` 116 evidence-gated enumeration。
- cache-only PM2 reload workflow。

## Workflow / Ops 经验

### 问题 1：workflow action pin 不可解析

症状：

- workflow 未进入业务步骤。
- `actions/upload-artifact` 指向无效 SHA。

修复：

- 建立 blessed actions lock。
- 所有外部 `uses:` 必须可解析。
- 带 major 注释的 pin 必须匹配对应 major tag 系列。

长期规则：

- workflow dependency refresh 单独 PR。
- 业务 PR 不临时更新 action pin。

### 问题 2：Node 22 runtime 语义

症状：

- heredoc 中同时使用 CommonJS `require()` 与 top-level `await`。
- GitHub runner Node 22 报 `ERR_AMBIGUOUS_MODULE_SYNTAX`。

修复：

- 保留 `require()`。
- 把 await 放入 `async function main()`。
- `main().catch(...)` fail-closed。

长期规则：

- workflow heredoc 应有 runtime contract。
- 不只用字符串 contract，要实际断言关键语义。

### 问题 3：`llms-full.txt` raw duplicate 误判

症状：

- `/llms-full.txt` 有 116 unique canonical，但 raw match 为 232。
- 每个 canonical 在 enriched feed 中出现 2 次。
- workflow 将 raw duplicate 当作 blocker。

修复：

- `/llms.txt` duplicate 继续严格。
- `/llms-full.txt` raw duplicate 改为 advisory。
- blocking duplicate 基于 canonical unique set。
- malformed / non-apex / forbidden 仍严格为 0。

长期规则：

- enriched feed 的正文链接重复不能等同于 canonical 集合重复。
- SEO/GEO 内容加厚后 raw canonical mentions 可能继续增长，readback classifier 应区分 raw evidence 与 blocking hygiene。

## 单人开发高效率 SOP

### 推荐分层

1. 业务 PR：
   - 只改内容、API、route 或 contract。
   - 不碰 workflow。

2. Workflow repair PR：
   - 只改 `.github/workflows/**` 和 workflow tests。
   - 不混入业务逻辑。

3. Production ops run：
   - 只运行已验证过的 workflow。
   - 不临时修改 workflow。

4. Release ledger PR：
   - 只记录生产读回证据。
   - 不承担修 workflow、修内容、修 deploy 的职责。

### 推荐授权格式

生产部署：

```text
I explicitly approve backend production deploy for SHA <40位SHA> release <release-id>.
```

CMS import / promote：

```text
Approve ENNEAGRAM CMS import and noindex promotion for SHA <deployed-40位SHA>.
```

URL Truth import：

```text
Approve ENNEAGRAM URL Truth import for SHA <deployed-40位SHA> artifact <sha256>.
```

LLMS release：

```text
I explicitly approve ENNEAGRAM-LLMS-FULL-RELEASE-01 for deployed backend SHA <40位SHA>.
```

Cache-only ops：

```text
APPROVE_FAP_WEB_LLMS_FEED_CACHE_OPS:<frontend-sha>:/llms-full.txt:116:complete
```

### 推荐检查顺序

每次发布不要直接跳到生产动作：

1. Check current deployed SHA。
2. Check exact target SHA。
3. Dry-run / inspect。
4. Write 或 release。
5. Readback。
6. Record report。
7. Merge ledger PR。

## 风险与改进项

### 当前残留风险

| 风险 | 当前状态 | 建议 |
|---|---|---|
| fap-api ledger 最后一项可能有 closeout 滞后 | 功能完成，不影响生产 | 若追求账本洁净，做 ledger-only cleanup |
| workflow classifier 仍写在 YAML heredoc | 可运行，但维护成本高 | 后续抽成 script + focused tests |
| manual approval 多 | 安全但耗时 | 对 code-only/cache-only 建稳定 ops lane |
| Search submit 后效果未知 | 已提交，不代表收录 | 建 GSC/Bing 观察任务 |
| 内容质量还可继续加厚 | 已上线，不代表最佳内容 | 做 deep-read + SEO/GEO 内容二期 |

### 推荐后续 PR

1. `ENNEAGRAM-PRODUCTION-LEDGER-CLOSEOUT-CLEANUP-01`
   - 仅修 fap-api ledger stale status。

2. `FAP-WEB-LLMS-FEED-CACHE-OPS-SCRIPT-EXTRACT-01`
   - 把 YAML heredoc readback classifier 抽成脚本。

3. `ENNEAGRAM-116-SEARCH-EFFECT-MONITOR-01`
   - 只读记录 IndexNow 后搜索效果。

4. `ENNEAGRAM-116-CONTENT-QUALITY-DEEPREAD-02`
   - 内容加厚、claim boundary、GEO answerability 深读。

## 最终判断

这次任务线的工程目标已经达成：

- 内容资产页全量上线。
- Search submission 完成。
- `llms.txt` 完成。
- `llms-full.txt` 完成。
- 关键生产动作都有 exact SHA / artifact / run evidence。

下一阶段应该从“上线工程”切换到“内容质量与搜索效果运营”。

