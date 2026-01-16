# Landing Meta Spec (Taskpack-2) — v1.2

目标：把 SEO / GEO 元数据变成**内容资产的原生属性**（内容包能力），可版本化、可回滚、可灰度；并可被 `fap:self-check` 强制校验：缺字段直接阻断发布。

---

## 0. 归属与落点（必须写死）

### 0.1 Meta 的归属
- **归属：fap-api content pack（内容包）**
- Web 端（fap-web）只负责读取与渲染，不在 Web 仓库里“自造”权威 meta（允许临时本地 mock，但不得作为发布来源）。

### 0.2 文件位置（固定）
对每个 pack（以 MBTI 为例）：
- pack root：`fap-api/content_packages/<pack-root>/`
- **固定路径：** `meta/landing.json`

示例（MBTI）：
- `fap-api/content_packages/default/CN_MAINLAND/zh-CN/MBTI-CN-v0.2.1-TEST/meta/landing.json`

> 规则：该文件必须随 **pack_id / pack version** 一起走；任何版本回滚都应同时回滚这份 meta。

---

## 1. 设计原则（SEO + GEO）

1) **URL 与版本解耦**：URL 永远不带版本号；meta 也不写死域名。  
2) **canonical 只存相对路径**：禁止把域名写入内容包；域名由 Web 端的 `metadataBase` / 环境变量决定。  
3) **可被机器校验**：required 字段缺失或不合法 → self-check 直接 FAIL。  
4) **可复用**：支持占位符（placeholder），减少多量表重复劳动；支持多档版本（variants）。  
5) **多语言可扩展**：默认 `meta/landing.json` 为该 pack 当前 locale 的 landing meta；未来可扩展 `meta/landing.<locale>.json`（本 spec 先不强制实现）。  
6) **多搜索引擎兼容**：允许在内容包里存储 Google/Baidu 的可选覆盖（先存资产；渲染可后置）。  

---

## 2. JSON 顶层结构

文件必须是一个 JSON Object（禁止把 shell 命令/注释写进 JSON 文件）。推荐结构：

```json
{
  "schema": "fap.landing.meta.v1",
  "schema_version": 1,

  "scale_code": "MBTI",
  "pack_id": "MBTI-CN-v0.2.1-TEST",

  "locale": "zh-CN",
  "region": "CN_MAINLAND",
  "slug": "personality-mbti-test",
  "last_updated": "2026-01-16",

  "index_policy": {
    "landing": { "index": true, "follow": true },
    "take": { "index": false, "follow": false, "nocache": true },
    "result": { "index": false, "follow": false, "nocache": true },
    "share": { "index": false, "follow": false, "nocache": true }
  },

  "landing": { /* SEO/GEO 内容字段（见下文） */ }
}
```

### 2.1 顶层字段说明
| 字段 | 类型 | 必填 | 约束 |
|---|---|---:|---|
| schema | string | ✅ | 固定为 `fap.landing.meta.v1` |
| schema_version | number | ✅ | 当前固定为 `1` |
| scale_code | string | ✅ | 量表编码（如 `MBTI`） |
| pack_id | string | ✅ | 内容包 id（如 `MBTI-CN-v0.2.1-TEST`） |
| locale | string | ✅ | 例如 `zh-CN` |
| region | string | ✅ | 例如 `CN_MAINLAND` |
| slug | string | ✅ | 与 web 的 `/test/{slug}` 一致，仅小写 + `-` |
| last_updated | string | ✅ | `YYYY-MM-DD` |
| index_policy | object | ✅ | 至少包含 `landing` 与 `take` |
| landing | object | ✅ | 见第 3 节 |

---

## 3. landing 字段表（核心）

### 3.1 必填字段（FAIL 级别）
以下字段缺失或类型不对：**self-check 必须 FAIL（阻断发布）**

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| canonical_path | string | 必须以 `/` 开头；禁止包含 `http://` `https://` | canonical 相对路径 |
| seo_title | string | CN 建议 18–60 字符 | `<title>` |
| seo_description | string | CN 建议 60–220 字符 | `<meta name="description">` |
| seo_keywords | string[] | 3–12 个 | `<meta name="keywords">` |
| executive_summary | string | 80–260 字符 | H1 下 Quick Answer |
| data_snippet | object | 必须包含 `h1_title` / `intro` / `table` / `cta` | 页面主体事实 |
| faq_list | array | 3–8 条 | FAQ |
| open_graph | object | 必须包含 `og_title` / `og_image` / `og_type` | OG |
| share_abstract | string | 20–160 字符 | 分享摘要 |
| schema_outputs | object | 至少包含 `faqpage_jsonld` | Schema 输出开关 |

---

### 3.2 推荐字段（WARN 级别）
| 字段 | 类型 | 说明 |
|---|---|---|
| placeholders | object | 占位符字典 |
| canonical_slug | string | 建议等于 slug |
| variants | array | 多档版本（见 3.3） |
| search_engine_overrides | object | Google/Baidu 覆盖（见 3.8） |
| faq_quality_hints | object | FAQ 意图词规则 |

---

### 3.3 variants（多档版本）
当同一量表存在多种题量/耗时版本（如 24/93/144 题），推荐在 landing 中声明：

- `variant_code`：唯一，`[a-z0-9_]+`
- `question_count`：正整数
- `test_time_minutes`：string（允许 `2–3` / `8-12` / `15–20`）
- `seo_hook`：建议一句话（用于 SERP / 分享）

一致性建议（WARN）：
- 若 `variants.length >= 2`，建议 `data_snippet.table.rows` 体现多档题量/时长；否则 WARN。

---

### 3.4 data_snippet（必填）
当前 Web 模板要求 table 为 2 列（兼容性约束）：

- `table.columns` **必须为 2 列**
- `table.rows` 每行必须为长度 2 的 string 数组
- `cta.primary.href` 必须以 `/` 开头

---

### 3.5 FAQ（必填 + GEO 提示）
- FAIL：FAQ 条数不在 3–8 或缺 question/answer
- WARN：意图词命中不足（至少 2 条包含：`什么/为什么/准吗/如何/多久/多少/免费/区别/隐私`）

---

### 3.6 open_graph（必填）
- FAIL：`og_image` 含域名或不是以 `/` 开头

---

### 3.7 schema_outputs（必填）
```json
"schema_outputs": {
  "faqpage_jsonld": true,
  "quiz_jsonld": false,
  "breadcrumbs_jsonld": false,
  "dataset_jsonld": false
}
```

---

### 3.8 search_engine_overrides（可选）
允许覆盖：
- `seo_title`
- `seo_description`
- `seo_keywords`

示例：
```json
"search_engine_overrides": {
  "baidu": { "seo_title": "MBTI测试…", "seo_description": "【2026版】…" },
  "google": { "seo_title": "MBTI 16型人格测试…"}
}
```

---

## 4. 占位符（Placeholder）
- 语法：`{{key}}`
- 缺失 key：self-check WARN；Web 可保留原样或替换为空（实现后置）

---

## 5. canonical / noindex
- canonical_path 只允许相对路径（含域名 → FAIL）
- index_policy 缺 `landing` 或 `take` → FAIL

---

## 6. self-check 门禁（摘要）
- FAIL：文件缺失、JSON 解析失败、schema 不匹配、必填字段缺失、canonical 非相对路径、FAQ 条数不合法、table 不是 2 列、og_image 含域名
- WARN：title/desc 长度不在建议区间、FAQ 意图词不足、占位符缺 key、variants 多档但 table 未体现、多引擎 overrides 仅存未消费

---

## 7. 消费约定（接口层）
- `<title>` / `<meta name="description">` / `<meta name="keywords">`：优先使用 overrides（若实现），否则用默认字段
- `<link rel="canonical">`：由 `canonical_path` + `metadataBase` 组成绝对 URL
- 页面主体：`data_snippet`（H1/Intro/Table/CTA）
- take 页 robots：由 `index_policy.take` 决定

---

## 8. 版本管理
- 本 spec 版本：`v1.2`
- schema：`fap.landing.meta.v1`（schema_version=1）
- 字段变更：先改 spec → 再改 meta → 再改 self-check → PR 贴日志证据
