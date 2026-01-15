cd ~/Desktop/GitHub/fap-web
mkdir -p docs/seo
cat > docs/seo/slugs.md <<'EOF'
# Slug 清单与命名规范（V2.0 · 权重增强版）
目标：Slug 是 SEO 权重的“资产编号”。一旦上线会被外链、收藏、AI 引用与站内索引使用，必须长期稳定；同时要具备“长尾词覆盖能力”，对标 123test 的专业度并提升 GEO（AI 搜索）可提取性。

---

## 0. 核心原则（必须读完）
1. **URL 永久不变**：版本、灰度、内容回滚都不得进入路径；仅在内容包/配置层处理。
2. **语义优先**：slug 必须能让用户与爬虫一眼看懂“这是什么测试”。
3. **长尾优先**：在竞争极高的头部词上，优先采用“核心词 + 意图词”的组合，提升精准匹配与点击率。
4. **可扩展**：未来量表多、语言多、内容多时，不需要重构 URL 体系。

---

## 1. 多语言路径预留（Global-ready）
路径结构建议：
- 国内默认（Stage 2）：`/test/{slug}`（中文默认路径可不加前缀）
- 海外未来：`/en/test/{slug}`

说明：
- slug 本身不含语言信息
- 语言通过路径前缀区分，避免后期全站 URL 重构

---

## 2. 命名规范（强约束）

### 2.1 命名公式（推荐）
**[category]-[core-keyword]-test**

- `category`：体现垂直领域聚合（让搜索引擎更容易理解站点主题密度）
- `core-keyword`：量表/测试名称的核心搜索词（可带意图词）
- `test`：明确这是“测评类页面”，增强“测评意图”匹配

**示例**
- ✅ 推荐：
  - `personality-mbti-test`
  - `personality-big-five-test`
  - `career-holland-test`
  - `emotion-anxiety-test`
  - `relationship-love-language-test`
- ❌ 禁止：
  - `fap-001`（无语义）
  - `test-102`（无语义）
  - `mbtiTest`（驼峰）
  - `Mbti`（大写）
  - `mbti-v1`（版本号进 URL）

> 说明：并非所有页面都必须包含 `-test`。但作为“长期 SEO 入口页”，建议统一使用 `-test`，减少后期命名不一致带来的内部竞争与维护成本。

### 2.2 “意图词”规则（Search Intent）
当核心词竞争极高（例如 mbti、disc、iq），建议采用“核心词 + 意图词”增强精准度：
- `mbti` → `mbti-test` / `mbti-personality-test`（更强）
- `disc` → `disc-personality-test` / `disc-profile-test`
- `iq` → `iq-test` / `iq-test-online`

意图词候选（按常见搜索）：
- `personality` / `career` / `online` / `free` / `profile` / `assessment`
（注意：不要堆砌，保持 3–5 个单词内）

### 2.3 分类前缀（Category Prefix）
建议的分类前缀集合（可扩展）：
- `personality`（人格/性格）
- `career`（职业/求职）
- `emotion`（情绪/心理状态）
- `relationship`（亲密关系/沟通）
- `cognition`（认知/智力/学习）

原则：
- 前缀用于“站点主题聚合”，不是目录层级；URL 仍然保持扁平 `/test/{slug}`。
- 同一量表若有多个变体（例如“MBTI 职场版/恋爱版”），应使用不同 `core-keyword` 或意图词区分，避免 slug 冲突。

### 2.4 物理规范
- 全小写；唯一分隔符为 `-`
- 不含空格、不含下划线、不含中文、不含特殊符号
- 不含动态 id（禁止 `/test/123`）
- 不含版本号（版本由 Content Pack 内部处理）
- **长度限制**：建议控制在 3–5 个单词（可读、可分享、可抓取）

---

## 3. 生命周期与状态（Status）
状态定义：
- `active`：运行中，可收录
- `planning`：规划中，未上线
- `redirect`：已迁移，旧 slug 301 到新 slug（需注明 target）
- `paused`：临时下线（302 到 `/tests`）
- `gone`：永久删除（410 Gone）

---

## 4. 迁移与权重保护规则（必须遵守）
1. **尽量不改 slug**：slug 一旦上线不建议更改。
2. **若必须改名**（命名规范升级、内容替换）：
   - 旧 slug 必须 **301** 到新 slug（单跳直达）
   - 保留至少 **12 个月**
3. **禁止多重重定向链**：`A -> B -> C` 不允许，必须 `A -> C`
4. **上线前唯一性检查**：
   - 站内唯一（不得重复）
   - 站外检索（百度/Google）确认该 slug 具备可竞争性与清晰意图

---

## 5. 已上线 Slug 资产台账（权重资产）
> 建议每次上线都记录：Focus Keyword、实体名（GEO 友好）、状态与备注（便于运营复盘）

| Slug | Focus Keyword（核心关键词） | Category | Entity Name（GEO 实体） | 上线日期 | 状态 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| personality-mbti-test | MBTI测试, 16型人格 | personality | MBTI / Myers-Briggs Type Indicator | 2026-01-15 | active | 现行主 slug（canonical 指向此 URL） |

---

## 6. 兼容别名（alias）台账（可选策略）
如果你早期已经上线过“短 slug”（如 `mbti`）并积累了外链/收藏：
- 允许将其作为 **alias** 保留，但必须：
  - `301 /test/mbti -> /test/personality-mbti-test`
  - 并在本表中记录该 alias

| Alias Slug | Alias URL | Target Slug | Target URL | HTTP | 状态 | 备注 |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| mbti | /test/mbti | personality-mbti-test | /test/personality-mbti-test | 301 | planning | 若历史存在 /test/mbti 或未来要做短入口，必须 301 单跳到主 slug |
EOF
