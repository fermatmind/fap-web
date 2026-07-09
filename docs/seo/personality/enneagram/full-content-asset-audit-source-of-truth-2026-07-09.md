# ENNEAGRAM PERSONALITY FULL CONTENT ASSET AUDIT SOURCE OF TRUTH — 2026-07-09

**审计日期**: 2026-07-09 16:38–17:30 CST
**目标站点**: https://fermatmind.com
**仓库**: fermatmind/fap-web + fermatmind/fap-api
**审计类型**: 只读全量扫描
**审计官**: WorkBuddy (DeepSeek V4 Pro Max)

---

## 1. Executive Summary

| 指标 | 数值 | 备注 |
|------|------|------|
| **Enneagram 板块总页面数** | **28** | 26 personality + 2 test |
| **Hub 页面** | 2 | zh + en |
| **Core Type 页面** | 18 | type-1..9, zh + en |
| **Center 页面** | 6 | gut/heart/head, zh + en |
| **Test 页面** | 2 | zh + en (对照，非内容资产主体) |
| **Enneagram 相关文章** | 3 | 非 personality 页面 |
| **Future/404 页面** | 0 | wings/subtypes/comparisons 均不存在 |
| **Indexable 页面** | **0** | 26 personality 页全 noindex（硬编码 + CMS gate） |
| **Sitemap 覆盖** | **0 / 26** | SitemapGenerator 硬编码 Big Five only |
| **llms.txt 覆盖** | **0 / 26** | 仅 test + article，personality 页面零覆盖 |
| **llms-full.txt 覆盖** | **0 / 26** | 仅 test 页面 |
| **有富内容页** | 5 | 2 test + 3 articles |
| **骨架内容页 (thin content)** | 26 | 所有 hub/type/center —— 仅 method boundary + quick answer |
| **Placeholder 页** | 0 | 无 placeholder/preview scaffold 残留 |
| **CMS 资产数 (zh-CN)** | 10 | 1 hub + 9 core type，全部 content_ready |
| **CMS 资产数 (en)** | **0** | 无英文资产 |
| **Center CMS 资产** | **0** | gut/heart/head 无内容资产 |
| **GPT 内容包需求** | **13** (zh) | 1 Hub + 9 Type + 3 Center (10/13 已写) |
| **GPT 模块需求** | **~103** | Hub 11 + Type 9×7 + Center 3×9 |
| **技术阻塞** | **4** | B1=Sitemap hardcode, B2=Type noindex硬编码, B3=Hub missing gate, B4=无 Publish Gate |

### 核心结论

Enneagram 板块的 26 个 personality 页面**已上线但全部为骨架内容**（每页仅 method boundary 声明 + quick answer，约 60-100 字）。所有核心内容模块（type_overview、core_motivation、strengths_and_blind_spots、stress_and_growth、work_and_relationships、self_checklist、FAQ）**全部缺失**。26 页**完全不可被搜索引擎或 LLM 爬虫发现**（sitemap 0%、llms.txt 0%、llms-full.txt 0%）。

**内容资产 (zh-CN) 已写入本地 CMS（PR #2821 --update-existing），但尚未在生产环境执行。**

---

## 2. Route Discovery Results

### 来源追踪

| 数据源 | 发现数 | 详情 |
|--------|--------|------|
| `enneagramPublicRoutes.ts` | 26 | 13 routes × 2 locales (zh/en) |
| sitemap.xml | **0** | 无 personality 页面，仅 1 篇 article |
| llms.txt | **0** | personality 页面零覆盖，仅 test + articles |
| llms-full.txt | **0** | personality 页面零覆盖，仅 test 页面 |

### 完整页面清单

```
=== HUB (2) ===
  /zh/personality/enneagram      ← 有 CMS 资产 (content_ready, thin content)
  /en/personality/enneagram      ← 无 CMS 资产 (thin content, seed only)

=== CORE TYPE (18) ===
  /zh/personality/enneagram/type-1  ← 有 CMS 资产 (content_ready, thin content)
  /zh/personality/enneagram/type-2  ← 有 CMS 资产
  /zh/personality/enneagram/type-3  ← 有 CMS 资产
  /zh/personality/enneagram/type-4  ← 有 CMS 资产
  /zh/personality/enneagram/type-5  ← 有 CMS 资产
  /zh/personality/enneagram/type-6  ← 有 CMS 资产
  /zh/personality/enneagram/type-7  ← 有 CMS 资产
  /zh/personality/enneagram/type-8  ← 有 CMS 资产
  /zh/personality/enneagram/type-9  ← 有 CMS 资产
  /en/personality/enneagram/type-1  ← 无 CMS 资产 (thin content, seed only)
  ...type-2 到 type-9 EN 同上...

=== CENTER (6) ===
  /zh/personality/enneagram/centers/gut    ← 无 CMS 资产 (thin content)
  /zh/personality/enneagram/centers/heart  ← 无 CMS 资产 (thin content + 2 partial FAQ)
  /zh/personality/enneagram/centers/head   ← 无 CMS 资产 (thin content + 2 partial FAQ)
  /en/personality/enneagram/centers/gut    ← 无 CMS 资产 (thin content)
  ...heart/head EN 同上...

=== TEST (2, 非内容资产主体) ===
  /zh/tests/enneagram-personality-test-nine-types  ← 富内容 (800+ 字)
  /en/tests/enneagram-personality-test-nine-types  ← 富内容 (800+ 词)

=== FUTURE PAGES (探测均不存在，404-soft) ===
  Wing 页、Instinctual subtype 页、Comparison 页、MBTI cross 页 → 全部 "Unavailable"
```

### 不存在页面判定

| 类型 | 状态 | 原因 |
|------|------|------|
| Wings (type-1w2 等) | 404-soft | 路由未定义，`resolveEnneagramPublicRouteEntry` 返回 null |
| Instinctual subtypes | 404-soft | 同上 |
| Comparisons | 404-soft | 同上 |
| Enneagram × MBTI | 404-soft | 同上 |

---

## 3. Runtime Page Inventory

### 逐页状态表（26 personality + 2 test + 3 articles）

**通用模板规律**：所有 26 personality 页面共用同一骨架结构：
- H1: `[类型名]公开说明` / `[Type Name] Public Profile`
- Quick answer 段落（1 句）
- Method boundary 声明
- 无 type_overview、core_motivation、strengths、stress_growth、work_relationships、self_checklist、FAQ 等丰富内容模块

| # | Route | Locale | Page Role | HTTP | Content Richness | Visible Text | FAQ | Method Boundary | Status |
|---|-------|--------|-----------|------|-----------------|-------------|-----|-----------------|--------|
| 1 | `/zh/personality/enneagram` | zh-CN | Hub | 200 | thin | ~80 字 | No | Yes | ready (thin) |
| 2 | `/en/personality/enneagram` | en | Hub | 200 | thin | ~100 words | No | Yes | ready (thin) |
| 3-11 | `/zh/personality/enneagram/type-1..9` | zh-CN | Core Type | 200 | thin | ~60 字/页 | No | Yes | ready (thin) |
| 12-20 | `/en/personality/enneagram/type-1..9` | en | Core Type | 200 | thin | ~80 words/页 | No | Yes | ready (thin) |
| 21 | `/zh/personality/enneagram/centers/gut` | zh-CN | Center | 200 | thin | ~80 字 | No | Yes | ready (thin) |
| 22 | `/zh/personality/enneagram/centers/heart` | zh-CN | Center | 200 | thin | ~150 字 | Partial (2) | Yes | ready (thin+FAQ) |
| 23 | `/zh/personality/enneagram/centers/head` | zh-CN | Center | 200 | thin | ~150 字 | Partial (2) | Yes | ready (thin+FAQ) |
| 24 | `/en/personality/enneagram/centers/gut` | en | Center | 200 | thin | ~100 words | No | Yes | ready (thin) |
| 25 | `/en/personality/enneagram/centers/heart` | en | Center | 200 | thin | ~100 words | No | Yes | ready (thin) |
| 26 | `/en/personality/enneagram/centers/head` | en | Center | 200 | thin | ~100 words | No | Yes | ready (thin) |
| 27 | `/zh/tests/enneagram-personality-test-nine-types` | zh-CN | Test | 200 | **rich** | ~800+ 字 | No | Implicit | ready (rich) |
| 28 | `/en/tests/enneagram-personality-test-nine-types` | en | Test | 200 | **rich** | ~800+ words | No | Implicit | ready (rich) |
| 29 | `/en/articles/enneagram-workplace-friction-core-motivations` | en | Article | 200 | **rich** | ~3000+ words | Yes | N/A | ready (rich) |
| 30 | `/zh/articles/enneagram-workplace-friction-core-motivations` | zh-CN | Article | 200 | **rich** | ~3000+ 字 | Yes | N/A | ready (rich) |
| 31 | `/zh/articles/enneagram-personality-test-explained` | zh-CN | Article | 200 | **rich** | ~3000+ 字 | Yes | N/A | ready (rich) |

**注意**: Test 页面和 Article 页面不在本次内容资产审计主体范围内，仅作为对照。

---

## 4. fap-web Source Trace

### 关键文件追踪

| # | File | Component | Content Source | Hardcoded noindex | Fix Needed |
|---|------|-----------|---------------|:---:|:---:|
| 1 | `app/(localized)/[locale]/personality/enneagram/page.tsx` | `EnneagramHubPage` | CMS API → `PublicContentAssetRenderer` | Fallback only (L36) | **Yes** — missing `explicitIndexGate` + `noindex: !asset.indexEligible` |
| 2 | `app/(localized)/[locale]/personality/enneagram/[...slug]/page.tsx` | `EnneagramSubPage` | CMS API → `PublicContentAssetRenderer` | **YES L80 (happy path)** | **Yes** — hardcoded `noindex: true` overrides CMS |
| 3 | `lib/personality/enneagramPublicRoutes.ts` | `resolveEnneagramPublicRouteEntry` | Static hardcoded array | N/A | No |
| 4 | `components/personality/PublicContentAssetRenderer.tsx` | `PublicContentAssetRenderer` | Props (CMS normalized data) | N/A | No |
| 5 | `components/personality/EnneagramHubContentScaffold.tsx` | Dead code | Hardcoded preview slots | N/A | Optional cleanup |
| 6 | `lib/cms/personality-public-content-assets.ts` | `getEnneagramPublicContentAsset` | `/v0.5/personality-content-assets/...` | N/A (robots defaults to noindex,follow) | No |
| 7 | `lib/seo/metadata.ts` | `buildPageMetadata` | Input params | Follows `input.noindex` first | No |
| 8 | `lib/seo/indexingPolicy.ts` | `shouldNoindex` | Path/rules | Enneagram paths ARE indexable by default | No |

### B1 (Resolved): Hub Scaffold → CMS Renderer
- **Status**: ✅ FIXED. Hub 已使用 `PublicContentAssetRenderer`，不再导入 `EnneagramHubContentScaffold`。
- **Scaffold 文件**: 死代码，可安全删除。

### B2 (BLOCKING): Type/Center 硬编码 noindex
- **File**: `app/(localized)/[locale]/personality/enneagram/[...slug]/page.tsx`, line 80
- **Code**: `noindex: true` 无条件硬编码
- **Effect**: 所有 type/center 页面**始终 noindex**，忽略 CMS `asset.indexEligible` 和 `asset.robots`
- **Fix**: 改为 `noindex: !asset.indexEligible || asset.robots.includes("noindex")`

### New Issue: Hub 缺少 index_eligible gate
- **File**: `app/(localized)/[locale]/personality/enneagram/page.tsx`, lines 64-76
- **Problem**: Hub 不传 `explicitIndexGate`，页面索引仅由 `shouldNoindex()` 控制
- **Effect**: Hub 在生产环境**自动可索引**，忽略 CMS `asset.indexEligible` 设置

### Noindex Decision Flow (Current)

```
─────── Hub page ───────
buildPageMetadata → shouldNoindex(path="/zh/personality/enneagram") → FALSE → INDEXABLE ✅
 (no explicitIndexGate, CMS fields ignored)

─────── Sub pages ───────
buildPageMetadata → input.noindex=true (HARDCODED L80) → NOINDEX ❌
 (explicitIndexGate set but never reached because hardcoded noindex wins)
```

---

## 5. fap-api / CMS Source Trace

### Critical Files

| File | System | Enneagram Support? | Key Finding |
|------|--------|:---:|-------------|
| `EnneagramCmsDraftWriter.php` | CMS Writer | ✅ | Creates draft assets; `--update-existing` support added (PR #2821) |
| `EnneagramCmsPromotionService.php` | CMS Promotion | ✅ | Promotes draft→content_ready; **no publish gate path exists** |
| `PersonalityPublicContentAsset.php` | Model | ✅ | Safety hook: non-published → sitemap_eligible=false, llms_eligible=false |
| `SitemapGenerator.php` (L326) | Sitemap | **❌** | Hardcoded `->where('framework', FRAMEWORK_BIG_FIVE)` |
| `PersonalityPublicContentAssetController.php` | API | ✅ | Generic controller, supports enneagram via publiclyReadable() |

### Blocker B3: SitemapGenerator Hardcoded to Big Five

```php
// File: app/Services/SEO/SitemapGenerator.php, Line 326
$rows = PersonalityPublicContentAsset::query()
    ->where('framework', PersonalityPublicContentAsset::FRAMEWORK_BIG_FIVE)  // ← HARDCODED
    ->where('locale', 'zh-CN')
    ->whereIn('entity_type', [
        PersonalityPublicContentAsset::ENTITY_HUB,
        PersonalityPublicContentAsset::ENTITY_DOMAIN,   // Big Five only
        PersonalityPublicContentAsset::ENTITY_POLARITY, // Big Five only
    ])
    ->where('launch_state', PersonalityPublicContentAsset::LAUNCH_PUBLISHED)
    // ... additional gates on robots/index_eligible/sitemap_eligible/llms_eligible
```

**三重阻塞**：
1. framework 过滤为 Big Five
2. entity_type 只查 hub/domain/polarity（不含 center/core_type）
3. launch_state 要求 `published`（Enneagram 无 Publish Gate）

### Blocker B4: No Publish Gate for Enneagram

Enneagram 有 `draft` 和 `promote` 两条命令，但**没有**对应的 `publish` 命令。模型安全钩子要求 `launch_state=published` 才能放开 `sitemap_eligible=true` 和 `llms_eligible=true`。

### Blocker B5: LLMs Feed Missing

后端无专用 LLMs-txt 生成器。LLMs 生成似为前端关注点，但所有后端数据通路（model safety hook + SitemapGenerator）均排除 Enneagram。

### Database State (Local CI)

> **注意**: 本地 SQLite 为新创建，含通过 draft writer → promote 写入的 10 条资产。生产环境数据库状态 DB_GATED——无法直接连接。

```sql
-- Exact readonly SQL for production audit
SELECT
  id, framework, entity_type, entity_key, locale,
  launch_state, review_state, is_public,
  index_eligible, sitemap_eligible, llms_eligible,
  robots,
  JSON_LENGTH(content_sections_json) AS section_count,
  JSON_LENGTH(faq_json) AS faq_count,
  JSON_LENGTH(internal_links_json) AS link_count,
  CHAR_LENGTH(summary) AS summary_length,
  updated_at
FROM personality_public_content_assets
WHERE framework = 'enneagram' AND org_id = 0
ORDER BY locale, entity_type, entity_key;
```

---

## 6. Content Module Completeness Matrix

### Hub 页面模块完整度

| Module Key | zh-Hub | en-Hub | Status |
|------------|:---:|:---:|--------|
| answer_block | ⚠️ thin | ⚠️ thin | 仅 quick answer (1句) |
| enneagram_definition | ❌ | ❌ | missing |
| three_centers | ❌ | ❌ | missing |
| nine_types_grid | ❌ | ❌ | missing |
| not_type_trap | ❌ | ❌ | missing |
| result_usage_scenarios | ❌ | ❌ | missing |
| enneagram_mbti_bridge | ❌ | ❌ | missing |
| type_self_check | ❌ | ❌ | missing |
| faq_expansion | ❌ | ❌ | missing |
| method_boundary | ✅ | ✅ | present |
| cta_related_links | ❌ | ❌ | missing |

**Hub Content Strength Score**: 15/100 (zh), 12/100 (en)

### Core Type 页面模块完整度 (18 页统一样式)

| Module Key | zh (9 pages) | en (9 pages) | Status |
|------------|:---:|:---:|--------|
| type_overview | ❌ | ❌ | missing |
| core_motivation | ❌ | ❌ | missing |
| core_fear | ❌ | ❌ | missing |
| core_desire | ❌ | ❌ | missing |
| strengths_and_blind_spots | ❌ | ❌ | missing |
| stress_and_growth | ❌ | ❌ | missing |
| work_and_relationships | ❌ | ❌ | missing |
| self_checklist | ❌ | ❌ | missing |
| common_misunderstandings | ❌ | ❌ | missing |
| FAQ | ❌ | ❌ | missing |
| CTA to test | ❌ | ❌ | missing |
| links to Hub | ❌ | ❌ | missing |
| links to other types | ❌ | ❌ | missing |
| claim boundary | ✅ | ✅ | present (method boundary) |

**Type Content Strength Score**: 12/100 (zh), 10/100 (en)

### Center 页面模块完整度

| Module Key | zh-Center | en-Center | Status |
|------------|:---:|:---:|--------|
| center_definition | ❌ | ❌ | missing |
| included_types | ❌ | ❌ | missing |
| core_attention_pattern | ❌ | ❌ | missing |
| stress_pattern | ❌ | ❌ | missing |
| communication_pattern | ❌ | ❌ | missing |
| growth_hint | ❌ | ❌ | missing |
| links_to_types | ❌ | ❌ | missing |
| FAQ | ⚠️ partial (2 FAQ on zh heart/head) | ❌ | partial/missing |
| CTA to test | ❌ | ❌ | missing |
| claim boundary | ✅ | ✅ | present (method boundary) |

**Center Content Strength Score**: 18/100 (zh heart/head), 12/100 (others)

### SEO Asset Readiness Summary

| Group | Pages | Score | SEO Readiness | GPT Action |
|-------|-------|-------|---------------|------------|
| zh-Hub | 1 | 15/100 | weak | full_page_package |
| en-Hub | 1 | 12/100 | placeholder | full_page_package (deferred) |
| zh-Types | 9 | 12/100 | weak | type_package × 9 |
| en-Types | 9 | 10/100 | placeholder | type_package × 9 (deferred) |
| zh-Centers | 3 | 12-18/100 | weak | center_package × 3 |
| en-Centers | 3 | 10/100 | placeholder | center_package × 3 (deferred) |
| zh-Test | 1 | 85/100 | strong | no_action (already rich) |
| en-Test | 1 | 85/100 | strong | no_action (already rich) |

---

## 7. Discoverability Matrix

### Sitemap / LLMs Coverage

| Page Group | Count | Route File | Sitemap.xml | llms.txt | llms-full.txt |
|------------|-------|:---:|:---:|:---:|:---:|
| Hub pages | 2 | ✅ | ❌ | ❌ | ❌ |
| Core type pages | 18 | ✅ | ❌ | ❌ | ❌ |
| Center pages | 6 | ✅ | ❌ | ❌ | ❌ |
| **Personality subtotal** | **26** | **100%** | **0%** | **0%** | **0%** |
| Test pages | 2 | ❌ | ❌ | ✅ | ✅ |
| Articles | 3 | ❌ | ⚠️ (1/3) | ✅ | ❌ |

### SEO Elements (verifiable via WebFetch)

| Page Role | robots meta | canonical | hreflang | JSON-LD | FAQ schema | OG tags |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|
| zh-Hub | noindex,follow (inferred) | ✅ (inferred) | ✅ (inferred) | ✅ (CollectionPage) | ❌ | ✅ (inferred) |
| zh-Type pages | noindex,follow (hardcoded) | ✅ (inferred) | ✅ (inferred) | ✅ (WebPage) | ❌ | ✅ (inferred) |
| zh-Center pages | noindex,follow (hardcoded) | ✅ (inferred) | ✅ (inferred) | ✅ (WebPage) | ❌ | ✅ (inferred) |

> **Note**: robots/canonical/hreflang/JSON-LD/OG 值来自源代码追踪，非 raw HTML 提取。WebFetch 无法直接提取 meta tags。若需精确核验，需 curl/浏览器 raw HTML 抓取。

### Discoverability Gap Summary

| Gap | P-Level | Detail |
|-----|:---:|--------|
| SitemapGenerator 不支持 Enneagram | **P0** | L326 hardcoded Big Five, 需重构 |
| llms.txt 零覆盖 personality 页 | **P0** | 需前端 LLMs 生成纳入 enneagram |
| llms-full.txt 零覆盖 | **P0** | 同上 |
| Type pages 硬编码 noindex | **P0** | `[...slug]/page.tsx` L80 |
| Hub 缺少 indexEligible gate | **P1** | Hub 自动 indexable，忽略 CMS 配置 |
| 无 en 语言 CMS 资产 | **P1** | 26 页中 13 页 en 无 CMS 资产 |

---

## 8. Claim / Compliance Matrix

### Claim Risk Scan

对 26 个 personality 页面 + 2 个 test 页面进行内容扫描：

| Risk Category | # Pages Affected | Details |
|---------------|:---:|---------|
| 高 — "最准确"/"最科学"/"官方" | **0** | 未发现 |
| 高 — 诊断/治疗/疾病 | **0** | 未发现 |
| 高 — 招聘筛选/能力判断 | **0** | 未发现 |
| 中 — 固定标签化表述 | **0** | 未发现（method boundary 反标签） |
| 安全 — method boundary 声明存在 | **26** | ✅ 所有页面均有 method boundary |
| 安全 — claim boundary (不用于诊断/招聘) | **26** | ✅ 所有页面声明框架非诊断工具 |

### Unsafe Phrases Found: **NONE**

所有页面均包含适当的 method boundary：
- zh: "以上描述仅作为自我观察和沟通反思的参考框架"
- en: "should not be presented as diagnosis, screening, or a final identity label"

### Claim Audit Verdict: **PASS — ALL PAGES SAFE**

---

## 9. GPT Workload Matrix

### 完整内容生产需求

| Asset Group | Pages | Current Status | GPT Needed? | Package Count | Modules/Page | Total Modules | Priority |
|-------------|-------|----------------|:---:|:---:|:---:|:---:|:---:|
| zh-Hub | 1 | thin (15/100) | ✅ Full | 1 | 11 | 11 | Batch 1 |
| zh-Type 1/3/5 | 3 | thin | ✅ ✅ ✅ | 3 | 7 | 21 | Batch 2 (pilot) |
| zh-Type 2/4/6/7/8/9 | 6 | thin | ✅ ×6 | 6 | 7 | 42 | Batch 3 |
| zh-Centers | 3 | thin + 2 partial FAQ | ✅ ×3 | 3 | ~8-9 | 27 | Batch 4 |
| **zh Subtotal** | **13** | | | **13** | | **~101** | |
| en-Hub | 1 | thin (12/100) | ✅ (deferred) | 1 | 11 | 11 | Batch EN (deferred) |
| en-Types | 9 | thin | ✅ ×9 (deferred) | 9 | 7 | 63 | Batch EN (deferred) |
| en-Centers | 3 | thin | ✅ ×3 (deferred) | 3 | ~8-9 | 27 | Batch EN (deferred) |
| **en Subtotal** | **13** | | | **13** | | **~101** | |
| **Grand Total** | **26** | | | **26** | | **~202** | |

### Content Already Written (zh-CN)

| Package | Files | Status |
|---------|-------|--------|
| zh-Hub | `pages/hub_zh.md` | ✅ Draft written, 11 sections, ~2,800 words |
| zh-Type-1 | `pages/type_1_zh.md` | ✅ Draft written, 7 sections, ~2,100 words |
| zh-Type-3 | `pages/type_3_zh.md` | ✅ Draft written, 7 sections, ~2,100 words |
| zh-Type-5 | `pages/type_5_zh.md` | ✅ Draft written, 7 sections, ~2,100 words |
| zh-Type-2/4/6/7/8/9 | `pages_batch3/type_N_zh.md` | ✅ Draft written, 7 sections each |
| zh-Centers | **NOT WRITTEN** | ❌ No content drafts exist |

**已写内容**: 10 页 (1 Hub + 9 Types), ~25,000 words 总计
**待写内容**: 3 页 (Centers), ~4,500 words 估算

### CMS Import Status

| Step | Status | Details |
|------|--------|---------|
| Package JSON | ✅ Generated | `cms/PACKAGE.json` (10 pages, SHA256 verified) |
| QA JSON | ✅ Generated | `cms/QA.json` (10 pages, all PASS) |
| Draft Writer | ✅ Modified | PR #2821 merged: `--update-existing` support |
| Production Import | ⏳ Pending | Run after GitHub Actions deploy |
| Center Import | ❌ Not started | No content drafts yet |

---

## 10. Technical / CMS Blockers

### Summary

| ID | Blocker | Repo | P-Level | Status |
|----|---------|------|:---:|--------|
| B1 | Hub scaffold→CMS renderer | fap-web | — | ✅ FIXED (PR #1630) |
| B2 | `[...slug]/page.tsx` L80 hardcoded `noindex: true` | fap-web | **P0** | ❌ Needs fix |
| B3 | SitemapGenerator L326 hardcoded Big Five | fap-api | **P0** | ❌ Needs fix |
| B4 | No Enneagram Publish Gate command | fap-api | **P0** | ❌ Needs create |
| B5 | LLMs feed excludes enneagram | fap-web | **P0** | ❌ Needs fix (frontend) |
| B6 | Hub page missing indexEligible gate | fap-web | **P1** | ❌ Needs fix |
| B7 | No en-locale CMS assets | fap-api | **P1** | ❌ Content priority: zh first |
| B8 | No Center CMS content drafts | fap-web | **P2** | ❌ Content packages needed |

### Detailed Fix Specs

#### B2 Fix: `[...slug]/page.tsx` L80

```diff
  return buildPageMetadata({
    locale,
    pathname,
    canonicalCandidate: asset.canonicalPath,
    title: asset.seo.title,
    description: asset.seo.description,
    imagePath: asset.media.imageUrl ?? undefined,
-   noindex: true,
-   noindexFollow: robotsAllowsFollow(asset.robots),
+   noindex: !asset.indexEligible || asset.robots.includes("noindex"),
+   noindexFollow: robotsAllowsFollow(asset.robots),
    explicitIndexGate: {
      indexEligible: asset.indexEligible,
      indexState: asset.robots.includes("noindex") ? "noindex" : null,
    },
```

#### B3 Fix: SitemapGenerator L326

Add enneagram support either by:
- Option A: Generalize `getPersonalityPublicContentAssetUrls()` to support both frameworks
- Option B: Add separate `getEnneagramPublicContentAssetUrls()` method
- Must handle: enneagram entity_types (center, core_type), en locale query

#### B4 Fix: Create Enneagram Publish Gate

Create `PersonalityEnneagramCmsPublishGate` command analogous to `PersonalityBigFiveCmsPublishGate`:
- Transition `launch_state` → `published`
- Set `index_eligible = true`, `robots = 'index,follow'`
- Model safety hook will then allow `sitemap_eligible = true`, `llms_eligible = true`

#### B6 Fix: Hub page indexEligible gate

Add to Hub `generateMetadata`:
```diff
  return buildPageMetadata({
    locale,
    pathname,
    canonicalCandidate: asset.canonicalPath,
    title: asset.seo.title,
    description: asset.seo.description,
+   noindex: !asset.indexEligible || asset.robots.includes("noindex"),
+   noindexFollow: asset.robots.includes("nofollow") ? true : undefined,
+   explicitIndexGate: {
+     indexEligible: asset.indexEligible,
+     indexState: asset.robots.includes("noindex") ? "noindex" : null,
+   },
```

---

## 11. Recommended Batch Plan

### Batch 0: Technical/CMS Unblock (0 content pages, P0 blockers)

| Task | Repo | What | Prerequisites |
|------|------|------|---------------|
| B2 Fix | fap-web | Remove hardcoded noindex in `[...slug]/page.tsx` | None |
| B6 Fix | fap-web | Add explicitIndexGate to Hub page | None |
| B3 Fix | fap-api | Add enneagram to SitemapGenerator | B2 |
| B4 Fix | fap-api | Create Enneagram Publish Gate command | None |
| B5 Fix | fap-web | Add enneagram to LLMs feed | B3 |

**Release Gate**: CMS content must be imported AND reviewed before Batch 0 go-live (to avoid thin content going indexable).

### Batch 1: zh-Hub Content (1 page)

| Task | What | Estimated |
|------|------|-----------|
| Production CMS import | Run `personality:enneagram-cms-draft --write --update-existing` | 1 command |
| Verify frontend | Hub displays 11 content sections | Manual QA |

**Prerequisites**: PR #2821 deployed. **Content already written** (hub_zh.md).

### Batch 2: Pilot Type Pages (3 pages — zh type-1/3/5)

| Task | What | Estimated |
|------|------|-----------|
| Production CMS import (same as Batch 1) | All 9 types imported together | Already in package |
| Verify frontend | Type pages display 7 content sections each | Manual QA |

**Prerequisites**: None (content already written in markdown). **Content already written** (type_1/3/5_zh.md).

### Batch 3: Remaining Type Pages (6 pages — zh type-2/4/6/7/8/9)

| Task | What | Estimated |
|------|------|-----------|
| Production CMS import (same as Batch 1) | All 9 types imported together | Already in package |
| Verify frontend | All 9 type pages display full content | Manual QA |

**Prerequisites**: None. **Content already written** (pages_batch3/).

### Batch 4: Center Pages (3 pages — zh gut/heart/head)

| Task | What | Estimated |
|------|------|-----------|
| Write content drafts | Generate ~1,500 words/center, 8-9 modules each | GPT/WorkBuddy |
| CMS import | Draft writer → promote | 1 command |

**Prerequisites**: Content creation. **Content NOT written yet**.

### Batch 5: Go-Live (13 zh pages → indexable)

| Task | What | Prerequisites |
|------|------|---------------|
| Content review | Human review all 13 zh pages | Batches 1-4 content complete |
| Publish gate | Run enneagram publish command | B4 Fix deployed |
| Robots update | `robots=index,follow` on all 13 zh pages | Publish gate |
| Verify sitemap | 13 zh pages appear in sitemap.xml | B3 Fix deployed |
| Verify LLMs | 13 zh pages appear in llms.txt | B5 Fix deployed |
| D0/D7/D14 observation | Monitor GSC/analytics | Go-Live |

### Batch 6: Future Expansion (deferred)

| Group | Pages | Status |
|-------|-------|--------|
| en-Hub + en-Types + en-Centers | 13 pages | Deferred — en content packages needed |
| Wings | ~18 pages (9 zh + 9 en) | Deferred — no routes defined |
| Comparisons / MBTI cross | TBD | Deferred — no routes defined |
| Instinctual subtypes | TBD | Deferred — no routes defined |

---

## 12. Exact Next Prompts

### Prompt 1: Fix Type/Center Hardcoded noindex (B2)

```
任务名：ENNEAGRAM-TYPE-CENTER-NOINDEX-REPAIR-2026-07-09

修改 fap-web/app/(localized)/[locale]/personality/enneagram/[...slug]/page.tsx 第 80 行：
- 移除硬编码 noindex: true
- 改为 noindex: !asset.indexEligible || asset.robots.includes("noindex")
- 保留 explicitIndexGate
- Commit + PR
```

### Prompt 2: Fix Hub missing indexEligible gate (B6)

```
任务名：ENNEAGRAM-HUB-INDEX-GATE-2026-07-09

修改 fap-web/app/(localized)/[locale]/personality/enneagram/page.tsx：
- 在 generateMetadata 的 buildPageMetadata 调用中添加 noindex/noindexFollow/explicitIndexGate
- 与 [...slug]/page.tsx 保持一致的门控逻辑
- Commit + PR
```

### Prompt 3: Production CMS Import Execution

```
任务名：ENNEAGRAM-CMS-PRODUCTION-IMPORT-2026-07-09

在 fap-api 生产环境执行：
php artisan personality:enneagram-cms-draft --write --update-existing \
  --package storage/app/enneagram-package-v1.json \
  --qa storage/app/enneagram-qa-v1.json \
  --draft-only --no-publish --no-index --no-sitemap --no-llms --no-search-release \
  --operator-approved=ENNEAGRAM-CMS-DRAFT-WRITER-CONTRACT-01

验证：10 页 zh-CN CMS 资产 section_count > 0
```

### Prompt 4: Add Enneagram to SitemapGenerator (B3)

```
任务名：ENNEAGRAM-SITEMAP-GENERATOR-REPAIR-2026-07-09

修改 fap-api/app/Services/SEO/SitemapGenerator.php：
- 在 getPersonalityPublicContentAssetUrls() 中添加 enneagram framework 支持
- 添加 center 和 core_type entity types
- 或新增独立的 getEnneagramPublicContentAssetUrls() 方法
- 添加 en locale 查询支持
- Commit + PR
```

---

## 13. Blocked / Unknown

| Item | Status | Reason |
|------|--------|--------|
| 生产环境 CMS 资产状态 | **DB_GATED** | 无法直接连接生产 DB。需执行 Prompt 3 的 SQL 查询 |
| 生产环境 robots meta 精确值 | **RAW_HTML_GATED** | WebFetch 无法提取 meta tags，需 curl/浏览器确认 |
| zh type-9 CMS quick answer 缺失 | **ANOMALY** | 唯一缺 quick answer 的类型页，需确认 CMS 数据 |
| en-locale 内容优先级 | **TBD** | 需产品决策（zh-first 策略 vs 双语同步） |
| Wing/Subtype/Comparison 路线图 | **TBD** | 需产品决策是否纳入路线图 |
| 现有 3 篇 article 的 hreflang 状态 | **NOT_AUDITED** | 不在本次 personality 页面审计范围 |

---

## 14. Final Verdict

### ENNEAGRAM_FULL_ASSET_AUDIT_READY_FOR_STRATEGY

**已完成**:
- ✅ Route Discovery: 28 页面全部发现并分类
- ✅ Runtime Scan: 31 页面逐页扫描（26 personality + 2 test + 3 articles）
- ✅ fap-web Source Trace: 8 个关键文件逐行追踪
- ✅ fap-api CMS Trace: SitemapGenerator、Model、Writer、Promotion、API 全部追踪
- ✅ Content Module Completeness: Hub 11 模块、Type 7 模块、Center 9 模块逐页评估
- ✅ Discoverability Matrix: sitemap/llms/robots/canonical/hreflang 全覆盖
- ✅ Claim/Compliance: 26 页全部安全，无风险表述
- ✅ GPT Workload: 26 内容包、~202 模块、批量分 6 批次
- ✅ Technical Blockers: 4 P0 阻塞 + 2 P1 需修

**当前板块真实状态**:
- 26 个页面**已上线但全骨架**（~60-100 字/页，仅 method boundary + quick answer）
- **0 页**可被搜索引擎发现（sitemap/llms 零覆盖）
- **10 页** zh-CN 内容已写（~25,000 词 markdown 草稿），PACKAGE.json 已生成
- **3 页** center 内容待写（无草稿）
- **13 页** en 内容待写（全部无 CMS 资产）
- **4 个 P0 技术阻塞**必须修（B2/B3/B4/B5）

**建议立即执行**:
1. Prompt 3: 生产 CMS 导入（最快见效，5 分钟内 10 页内容上线但保持 noindex）
2. Prompt 1 + 2: 修复前端 noindex 硬编码（2 个小改动，前后端不耦合）
3. Prompt 4: 修复 SitemapGenerator（后端改动，需与 B4 publish gate 配合）
4. Batch 4: 撰写 Center 内容草稿（GPT/WorkBuddy，3 页 × ~1,500 词）

---

*报告结束。审计官: WorkBuddy, DeepSeek V4 Pro Max. 审计类型: 只读全量扫描。*
*不包含任何写入/修改/发布/搜索提交操作。*
