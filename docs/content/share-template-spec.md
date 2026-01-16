# Share Template Spec (Content Pack): share_templates

目的：把“分享链路”从事件升级为**可版本化、可回滚、可灰度**的传播资产；并让社交传播成为 SEO/GEO（AI 搜索）权重养料。  
范围：约束 Content Pack 的 `share_templates` 资产协议、校验规则（self-check）、以及消费端（share 页面/分享卡）必须使用模板字段。

---

## 0) 数据源与优先级（Single Source of Truth）

### 0.1 数据源优先级
1) **fap-api Content Pack（权威）**  
`content_packages/<pack>/share_templates/*.json`（本规范定义的模板协议）  
`content_packages/<pack>/share_assets/*`（封面图等资源）

2) **fap-web 本地兜底（Stage 2 可选）**  
`fap-web/content/share_templates/<slug>/*.json`（仅用于开发/预览；线上必须以内容包为准）

> 规则：当 web 能读取内容包模板时，必须以内容包为准；本地模板仅允许做开发兜底。

---

## 1) 目录结构与能力开关

### 1.1 manifest 能力声明（必须）
内容包 manifest 必须声明：
- `capabilities.share_templates = true`

### 1.2 目录约定（必须）
内容包内固定：
- `share_templates/`：存放模板 JSON
- `share_assets/`：存放分享封面图等静态资产（或你现有 assets 目录下的 `share/` 子目录）

推荐最小集（本任务包只做 1 套即可）：
- `share_templates/wechat_default.json`

可扩展（不要求本期实现，但规范先写死）：
- `share_templates/wechat_moments.json`
- `share_templates/wechat_group.json`
- `share_templates/baidu_default.json`
- `share_templates/google_default.json`

---

## 2) 模板模型（Schema）

### 2.1 模板顶层字段（必填/推荐）
| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `schema_version` | string | ✅ | 固定：`share-template/v1` |
| `template_id` | string | ✅ | 全局唯一（建议：`mbti.wechat_default.v1`） |
| `scale_slug` | string | ✅ | 对应落地页 slug（如：`personality-mbti-test`） |
| `distribution_channel` | string | ✅ | `wechat` / `baidu` / `google` / `generic` |
| `sync_to_meta` | boolean | ✅ | 语义对齐开关（见 3.1） |
| `title` | string | ✅ | 分享标题（给人看） |
| `abstract` | string | ✅ | 分享摘要（给人看；受 3.3 前 15 字策略约束） |
| `tagline` | string | 推荐 | 短标语（如“免费测评·免费报告”） |
| `keywords` | string[] | 推荐 | >=3 推荐；用于站内检索/SEO 语义补充 |
| `cover_image_wide` | string | ✅ | 1200×630，相对路径（见 3.4） |
| `cover_image_square` | string | 推荐 | 600×600，相对路径（见 3.4） |
| `is_free_badge` | boolean | 推荐 | 是否强调“免费”标签（对 CTR 有帮助） |
| `placeholders` | object | 推荐 | 占位符白名单与默认值（见 2.2） |
| `social_count_template` | string | 推荐 | 社会化证据模板（见 3.2） |
| `social_proof_schema` | object | 推荐 | 结构化社会化证据声明（见 3.2） |

### 2.2 占位符（Placeholders）
#### 2.2.1 白名单（推荐）
允许在 `title/abstract/tagline/social_count_template` 使用的占位符（白名单）：
- `{{is_free}}`（建议在摘要前 15 字使用，适配百度截断）
- `{{scale_name}}`
- `{{year}}`
- `{{count}}`（仅 social_count_template 使用）

#### 2.2.2 缺数据策略（必须）
- 运行时缺少占位符数据：必须用 `placeholders` 默认值替换；若无默认值，则移除对应片段或不输出该字段。
- 禁止把未替换的 `{{xxx}}` 原样输出到最终 HTML/OG。

---

## 3) SEO/GEO 增强规则（对标 123test/Truity）

### 3.1 `sync_to_meta`：社交传播与 SEO 语义一致性（Hard Rule）
当 `sync_to_meta = true` 时：
- share 页面（被抓取的 URL）的：
  - `<title>` 必须使用 `template.title`
  - `<meta name="description">` 必须使用 `template.abstract`
- 同时：
  - `og:title` / `og:description` / `twitter:title` / `twitter:description` 必须使用模板字段

当 `sync_to_meta = false` 时（允许但不推荐）：
- `<title>` 与 `<meta name="description">` 可沿用 landing SEO（但 OG/Twitter 仍需使用模板，确保传播一致）

> 目的：避免“分享文案 A、SEO 文案 B”被 Google 判定为诱导分享/内容不一致。

### 3.2 社会化证据（Social Proof）与结构化声明（对 GEO 友好）
#### 3.2.1 `social_count_template`（推荐）
- 示例：`已有 {{count}} 位用户获取了专业报告`
- 要求：必须包含 `{{count}}`（否则 warning）

#### 3.2.2 `social_proof_schema`（推荐）
允许输出一段 JSON-LD（或被消费端转换为 JSON-LD），用于向 AI 引擎提供“互动计数”语义：
- 推荐类型：`InteractionCounter`（或 `SocialMediaPosting` + `interactionStatistic`）
- 必须字段（若输出）：
  - `interactionType`（ShareAction / ViewAction）
  - `userInteractionCount`（数字 count）
  - `name/description`（可引用渲染后的 social_count_template）

计数来源（不在本期强制实现，但规范先写清）：
- `share_click` / `result_view` / `report_view` 的统计聚合
- 低于 `min_threshold` 可不输出（避免“1 人”显得不专业）

### 3.3 百度摘要截断策略（Front 15 chars）——强制约束（Hard/Warn）
由于百度/微信摘要会截断，规定：
- `abstract` **前 15 个字**必须命中：
  - “免费/免费报告/免费测评/真免费”之一，或包含 `{{is_free}}`
  - 或（备选）“深度报告/专业版/完整版”等结果导向词（可作为 warning 规则）

执行建议（本期默认）：
- 先做 **WARNING**（不阻断）
- 对 MBTI 模板可手动保证达标（验收时需展示）

### 3.4 封面图规格（Hard Rule）
为了同时适配 Google/微信/百度：
- `cover_image_wide`：1200×630（1.91:1），必填
- `cover_image_square`：600×600（1:1），推荐

路径规则（必须）：
- 必须为相对路径（禁止写域名）
- 必须在 manifest.assets 声明
- 文件必须存在

体积规则（建议 Hard Fail）：
- 任一封面图文件大小 > 200KB：**FAIL**（加载慢会影响平台预览与权重）

---

## 4) self-check 校验项（门禁）

### 4.1 Hard Fail（阻断发布）
- manifest 已声明 `share_templates=true`，但缺少任何模板文件
- 模板 JSON 缺必填字段：`schema_version/template_id/scale_slug/distribution_channel/sync_to_meta/title/abstract/cover_image_wide`
- `cover_image_wide` 文件不存在 / 未在 manifest.assets / 非相对路径
- `cover_image_*` 文件体积 > 200KB
- `sync_to_meta=true` 但 title/abstract 为空
- `title` 命中敏感词/过度诱导词（最小黑名单即可）

### 4.2 Warning（不阻断，但必须输出）
- `keywords` 数组少于 3 个
- `abstract` 前 15 字未命中“免费/深度报告”等策略词
- `social_count_template` 存在但不包含 `{{count}}`
- 缺 `cover_image_square`

---

## 5) 消费端约束（必须遵守）

### 5.1 share 页面（推荐存在）
share 页面（或 share 入口 URL）必须消费模板字段，输出：
- `<title>` / `<meta name="description">`（按 sync_to_meta）
- `og:title/og:description/og:image`
- `twitter:title/twitter:description/twitter:image`
- 优先选择 `cover_image_wide` 作为 OG 图片；若渠道要求可选择 square

### 5.2 分享卡（微信/网页）
- 分享标题/摘要/封面图不得使用工程默认值
- 必须由模板字段驱动

---

## 6) 证据包（不截图也可验收）

目录建议：
- `docs/content/evidence/<slug>/share-templates/`

最小证据文件（文本/HTML 即可）：
1) `1-template.json`（模板内容或摘录）
2) `2-selfcheck-pass.txt`（PASS 10–30 行）
3) `3-selfcheck-fail.txt`（FAIL 10–30 行，证明门禁生效）
4) `4-share-head.html`（share 页 HTML Head 片段，grep 能看到 title/description/og 来自模板）

---

## 7) PR 验收模板（Checklist + Evidence）

### Checklist
- [ ] `docs/content/share-template-spec.md` 已落地（含 sync/social/前15字/多图/门禁）
- [ ] manifest capability：`share_templates=true`
- [ ] MBTI 至少 1 套模板（wechat_default）
- [ ] 模板包含：title/abstract/keywords/tagline/cover_image_wide（square 推荐）
- [ ] self-check：缺字段/缺图/体积过大可 FAIL
- [ ] share 页面/分享卡消费模板字段（非默认值）

### Evidence
- [ ] Spec 路径：`docs/content/share-template-spec.md`
- [ ] 模板路径：`content_packages/.../share_templates/wechat_default.json`
- [ ] 证据路径：`docs/content/evidence/<slug>/share-templates/`