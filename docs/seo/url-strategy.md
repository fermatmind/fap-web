# URL 策略与抓取规范（`/tests` Canonical 版）

目标：在保留旧链接兼容能力的前提下，确保 SEO 权重长期沉淀到 canonical URL，避免重复收录与多跳损耗。

## 1. 永久路由策略

### 1.1 可收录页面（Index）
- `/tests`
- `/tests/{slug}`

说明：`/tests/{slug}` 是唯一量表落地页 canonical。

### 1.2 非收录页面（Noindex）
- `/tests/{slug}/take`
- `/result/{id}`
- `/orders/{orderNo}`
- `/share/{shareId}`
- `/api/*`

## 2. 旧路径兼容（Legacy Compatibility）

兼容入口长期保留，但不作为主规范：
- `/test` -> `308` -> `/tests`
- `/test/{slug}` -> `308` -> `/tests/{canonical-slug}`
- `/test/{slug}/take` -> `308` -> `/tests/{canonical-slug}/take`
- `/quiz/{slug}` -> `308` -> `/tests/{canonical-slug}/take`

约束：
- 必须单跳直达，禁止多跳链。
- 必须保留 query string。

## 3. Canonical 规则

- `/tests/{slug}` 页面 canonical 必须指向自身绝对 URL（无 query/hash）。
- 带参数请求（如 `?utm=*`）的 canonical 仍回落到无参数 URL。
- 所有 alias slug 与 legacy path 都以 308 跳转到 canonical URL。

## 4. Robots 与抓取预算

`robots.txt` / 头策略统一：
- 允许：`/tests`、`/tests/*`（不含 take）
- 禁止：`/tests/*/take`、`/result/*`、`/orders/*`、`/share/*`、`/api/*`

## 5. Sitemap 策略

`sitemap.xml` 仅收录：
- `/tests`
- `/tests/{canonical-slug}`

不收录 alias slug 与 legacy `/test/*` 路径。

## 6. 变更与回滚策略

- slug 变更时：旧 slug 必须 308 一跳到新 canonical slug。
- 兼容窗口：长期兼容，不做强制下线。
- 删除页面：优先 410；临时下线：302 到 `/tests`。

## 7. 六模型 canonical 清单

- `mbti-personality-test-16-personality-types`
- `big-five-personality-test-ocean-model`
- `clinical-depression-anxiety-assessment-professional-edition`
- `depression-screening-test-standard-edition`
- `iq-test-intelligence-quotient-assessment`
- `eq-test-emotional-intelligence-assessment`
