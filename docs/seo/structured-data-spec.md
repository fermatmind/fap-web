# Structured Data Spec (JSON-LD): Quiz + BreadcrumbList + Dataset

目的：让搜索引擎（Google/Baidu）与 AI 引擎（Gemini/Perplexity）识别费马测试为“测评/Quiz 工具站”，提升引用与富结果命中概率。  
范围：仅约束 **落地页** `/test/{slug}` 的 JSON-LD 直出；**take/结果/分享页不注入**（避免被误抓取与重复语义）。

---

## 0) 术语与数据源

### 0.1 数据源优先级（Single Source of Truth）
按优先级读取 landing meta（生成 SEO + JSON-LD）：

1. **fap-api Content Pack Meta（权威）**  
   `content_packages/<pack>/meta/landing.json`（任务包 2 已定义并 self-check 门禁）
2. **fap-web 本地落地页 JSON（兜底）**  
   `fap-web/content/landing/<slug>.json`（Stage 2 暂时用本地数据直出）

> 规则写死：当 web 能读取 API 内容包 meta 时，必须以内容包 meta 为准；本地 JSON 仅作为开发/预览兜底。

### 0.2 页面注入范围（Inject Scope）
- ✅ 只在 `/test/{slug}` 注入 JSON-LD
- ❌ `/test/{slug}/take`、结果页、分享页不注入（避免被收录、避免重复 schema）

---

## 1) Schema Router（按 scale_type 选模板）

> 本任务包只落地 `personality`；`clinical` 仅写规范，为后续合规预留。

### 1.1 personality（本任务包落地）
- `scale_type: personality`
- 输出：**Quiz + BreadcrumbList + Dataset**（三件套）

### 1.2 clinical（仅写规范，暂不实现）
- `scale_type: clinical`
- 输出：**MedicalWebPage + BreadcrumbList**（Dataset 可选）
- 强制：**免责声明（disclaimer）必须存在且直出**（否则 FAIL / 阻断发布）

免责声明（至少包含以下语义）：
- “非医疗诊断 / 仅供参考”
- “如有不适或担忧，请咨询医生/专业人士”
- “不替代专业评估/治疗建议”

> 备注：clinical 类测评涉及健康信息表达风险，实现阶段需另开任务包/PR，并新增 self-check 门禁（见 6.2）。

---

## 2) 唯一性与去重红线（De-dup Rules）

### 2.1 单页唯一性（Hard Rule）
同一页面只允许出现：
- 1 份 `Quiz`（主声明）
- 1 份 `BreadcrumbList`
- 1 份 `Dataset`

禁止出现：
- 两份或以上 `Quiz`
- `Quiz` 与第三方库（如 next-seo）自动生成的同类型 schema 冲突

### 2.2 稳定序列化（Hard Rule）
- JSON-LD 必须稳定序列化：不得包含随机字段（随机 id、时间戳、nonce 等）
- 允许使用：基于 slug/路径派生的稳定 `@id`
- `@id` 以 canonical 为基准派生（见 4）

---

## 3) JSON-LD 输出规范（Personality）

> JSON-LD 必须在 SSR/Server Component 中直出：  
> `View Source` 必须能直接看到 `<script type="application/ld+json">...`

### 3.1 Quiz（主声明）

#### 3.1.1 字段映射（Meta → Quiz）
| Quiz 字段 | 必填 | 来源优先级 | 说明 |
|---|---:|---|---|
| `@context` | ✅ | 写死 | `https://schema.org` |
| `@type` | ✅ | 写死 | `Quiz` |
| `@id` | ✅ | landingUrl 派生 | `${landingUrl}#quiz` |
| `name` | ✅ | `h1_title` → `seo_title` | 推荐用 H1（稳定且与页面一致） |
| `description` | ✅ | `executive_summary` → `seo_description` | 推荐 executive_summary（更像“直接答案”） |
| `inLanguage` | ✅ | `locale` | 例：`zh-CN` |
| `url` | ✅ | `canonical_path` + site base | 必须是绝对 URL |
| `isAccessibleForFree` | ✅ | 写死 | `true`（真免费核心） |
| `assesses` | 推荐 | `seo_keywords` | 关键词数组（MBTI/16型人格等） |
| `potentialAction` | ✅ | takeUrl | `StartAction` + `EntryPoint`（见 3.1.3） |
| `timeRequired` | ✅* | variants / `duration_iso` | 顶层总时长（见 3.1.2） |
| `hasPart` | ✅* | variants / `duration_iso` | 三档版本拆分（对标 Truity） |
| `mainEntity` | 推荐 | 指向 Dataset `@id` | 建立 Quiz ↔ Dataset 关联（见 3.3.2） |

> ✅* 说明：本任务包 3 的验收口径按“对标方案”收口：`timeRequired` 与 `hasPart` 视为 **必做**（不是最低门槛，但属于本项目明确要对标的加分项，后续可纳入门禁）。

#### 3.1.2 timeRequired（ISO 8601 Duration，强约束）
- 形式必须严格为 ISO 8601 duration：`PT{n}M`  
  示例：  
  - 24 题：`PT2M`  
  - 93 题：`PT10M`  
  - 144 题：`PT20M`

**顶层 `Quiz.timeRequired` 口径：**
- 默认取三档里 **最大分钟值**（保守表达）
- 若提供 `duration_iso`（见 3.2），则以 `duration_iso` 为准（强一致性）

> 重要：Google 对 `timeRequired` 格式非常挑剔，格式不合规会导致验证工具报错或忽略字段。

#### 3.1.3 potentialAction（StartAction + EntryPoint，强约束）
必须输出：
- `@type: "StartAction"`
- `target: { @type: "EntryPoint", urlTemplate, actionPlatform[] }`

`actionPlatform` 推荐包含：
- `http://schema.org/DesktopWebPlatform`
- `http://schema.org/MobileWebPlatform`

`urlTemplate` 指向答题入口（take page）：
- `https://<base>/test/{slug}/take`

#### 3.1.4 hasPart（三档版本拆分，对标 Truity，强约束）
- `hasPart` 必须是数组
- 每个子项至少包含：
  - `@type: "Quiz"`
  - `name`（建议含品牌/量表名，避免“版本名过短”）
  - `timeRequired`（严格 ISO 8601）
  - `url`（可先统一指向落地页 landingUrl）

推荐 `name` 模板（对标“专业度”）：
- `费马测试 MBTI 24题简易版`
- `费马测试 MBTI 93题标准版`
- `费马测试 MBTI 144题专业版`

> 备注：`url` 未来可升级为不同入口（例如带 variant 参数），但 Stage 2 先统一 landingUrl 即可。

---

### 3.2 variants 与 duration_iso（显式语义脱耦，推荐强制）
为避免 “展示文本是区间，但机器字段必须精确” 的冲突，推荐在数据层显式提供：

- `test_time_minutes`：给人看的（允许区间，如 `2–3分钟`）
- `duration_iso`：给机器看的（强制 `PT{n}M`）

#### 3.2.1 优先级（Hard Rule）
生成 JSON-LD 时：
1. **优先使用 `variant.duration_iso`** 作为每个子项的 `timeRequired`
2. 顶层 `Quiz.timeRequired` 取子项里最大分钟（优先来自 `duration_iso`）

若 `duration_iso` 缺失：
- 允许从 `test_time_minutes` 提取数字兜底（建议取最大值）
- 但该兜底口径 **不保证** 满足“PT2M/PT10M/PT20M”这类严格验收口径

> 结论：如果验收明确要求 `PT2M / PT10M / PT20M`，必须在数据层补齐 `duration_iso`（避免算法兜底误差）。

#### 3.2.2 兜底策略（Fail-safe）
- 解析失败时不要让 SSR 直接崩（宁可省略该子项的 `timeRequired`）
- 但应记录 Warning（见 6.2），避免线上结构化数据悄悄失效

---

### 3.3 Dataset（权威感 + GEO 友好，对标 123test）
目标：声明“数据/常模/结构化报告资产”语义，让 AI 引擎更愿意引用。

#### 3.3.1 字段映射（Meta → Dataset）
| Dataset 字段 | 必填 | 来源 | 说明 |
|---|---:|---|---|
| `@context` | ✅ | 写死 | `https://schema.org` |
| `@type` | ✅ | 写死 | `Dataset` |
| `@id` | ✅ | landingUrl 派生 | `${landingUrl}#dataset` |
| `name` | ✅ | `h1_title` 派生 | 推荐含 norms/report 关键词 |
| `description` | ✅ | `intro`/`executive_summary` 派生 | 必须强调：版本化更新/脱敏统计/用于结构化报告 |
| `inLanguage` | ✅ | `locale` | |
| `isAccessibleForFree` | ✅ | 写死 | `true` |
| `dateModified` | 推荐 | `last_updated` | ISO date：`YYYY-MM-DD` |
| `publisher` | ✅ | 写死/配置 | Organization：`Fermat Mind / 费马测试` |
| `url` | 推荐 | landingUrl | |

#### 3.3.2 Quiz ↔ Dataset 关联（推荐）
- 在 `Quiz.mainEntity` 指向 `Dataset.@id`（主方向）
- （可选）Dataset 里可加 `isBasedOn` / `about` 反向关联 Quiz，但本任务包不强制

---

### 3.4 BreadcrumbList（目录权重聚合）
用于让搜索引擎理解站点结构，利于长期扩量与站内主题聚合。

#### 3.4.1 路径规则
- Home → `/`
- Tests（聚合页）→ `/test`（若未来有 `/tests`，更新此处）
- Current → `/test/{slug}`（canonical）

#### 3.4.2 输出要求
- `itemListElement` 至少 3 级
- `position` 从 1 开始递增
- `item` 必须为绝对 URL

---

## 4) canonical 与 URL 规范（Hard Rules）
- JSON-LD 中所有 `url` / `item` 必须为 **绝对 URL**
- canonical 的源数据必须是相对路径（由 web 拼 base），禁止硬编码域名在 meta 中
- `canonical_path` 必须以 `/` 开头，且不得包含 query/hash

---

## 5) 注入实现约束（Implementation Constraints）
- 注入点：`/test/[slug]` 页面组件（Server Component）
- `<script type="application/ld+json">` 放在 `<h1>` 之前（便于 View Source 快速定位）
- 页面内不得出现第二份同类型 JSON-LD（避免冲突被忽略）

---

## 6) 校验与门禁建议（建议落地为轻门禁）

### 6.1 本地验收（必做）
打开：
- `http://localhost:3000/test/personality-mbti-test`
- `view-source:http://localhost:3000/test/personality-mbti-test`

搜索必须命中：
- `application/ld+json`
- `"@type":"Quiz"`
- `"BreadcrumbList"`
- `"Dataset"`
- `timeRequired`（顶层 Quiz 至少一次）
- `hasPart`

若启用 `duration_iso` 且按验收口径收口，还需命中：
- `PT2M` / `PT10M` / `PT20M`

### 6.2 与 self-check 的衔接（建议）
由于你已经有 `fap:self-check`，建议新增校验（可先 Warning，后转 Fail）：

**variants.duration_iso 校验**
- 若存在 `variants[].duration_iso`：必须匹配 `^PT\\d+M$`
- 若缺失：允许从 `test_time_minutes` 解析，但解析失败至少 Warning
- 若要对标验收口径（PT2M/PT10M/PT20M）：在 MBTI pack 中强制要求 `duration_iso` 存在（Fail）

**去重校验（可选）**
- 构建后抓取 `/test/{slug}` HTML，检查只出现 3 个 ld+json script（Quiz/Breadcrumb/Dataset）

---

## 7) 在线验证（证据包核心）
必须提供两份在线验证证据（截图）：

1. **Google Rich Results Test**
   - 输入线上 URL（或 preview/tunnel）
   - 结果：能识别结构化数据；不得出现 invalid（即使不出富结果也可接受）

2. **Schema Validator（schema.org）**
   - 同一 URL
   - 结果：Quiz/BreadcrumbList/Dataset 均被识别且无 invalid

> 若暂时没有线上可访问 URL：先提交 View Source 证据；待部署后补两张在线验证截图并追加 commit。

---

## 8) 证据包目录与命名（Repo 约定）
路径：
- `docs/seo/evidence/personality-mbti-test/structured-data/`

优先使用 **可复现文本证据**（推荐），截图仅作为补充：

**推荐（文本证据）**
1. `1-page-html.html`（保存 View Source 全量 HTML）
2. `2-validate.txt`（自动校验输出：包含 Quiz/Breadcrumb/Dataset/timeRequired/hasPart/PT*）

**如需截图（可选补充）**
3. `3-rich-results-test.png`
4. `4-schema-validator.png`

---

## 9) PR 验收模板（Checklist + Evidence）

### Checklist
- [ ] `docs/seo/structured-data-spec.md` 已落地（含 Router/映射/去重规则）
- [ ] MBTI 落地页 View Source 可见 JSON-LD
- [ ] Quiz 包含：isAccessibleForFree + potentialAction(StartAction/EntryPoint)
- [ ] Quiz 包含：timeRequired（ISO8601）+ hasPart（三档）
- [ ] BreadcrumbList 存在
- [ ] Dataset 存在（含版本化/脱敏/免费可访问语义）
- [ ] （可选）Rich Results Test 证据
- [ ] （可选）Schema Validator 证据

### Evidence（推荐文本证据）
- [ ] HTML 源码：
  - `docs/seo/evidence/personality-mbti-test/structured-data/1-page-html.html`
- [ ] 自动校验输出：
  - `docs/seo/evidence/personality-mbti-test/structured-data/2-validate.txt`

### Evidence（如有线上可访问 URL，再补）
- [ ] Rich Results Test：
  - `docs/seo/evidence/personality-mbti-test/structured-data/3-rich-results-test.png`
- [ ] Schema Validator：
  - `docs/seo/evidence/personality-mbti-test/structured-data/4-schema-validator.png`