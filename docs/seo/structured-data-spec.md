# Structured Data Spec（`/tests` Canonical 版）

范围：仅对 `/tests/{slug}` 注入 JSON-LD；`/tests/{slug}/take` 与其他敏感页不注入。

## 1. 注入范围

- ✅ `/tests/{slug}`：注入 `Quiz + BreadcrumbList + Dataset`
- ❌ `/tests/{slug}/take`、`/result/*`、`/share/*`、`/orders/*`
- ✅ legacy `/test/*` 最终 308 到 `/tests/*` 后由 canonical 页面注入

## 2. URL 规则

- JSON-LD 的 `url/item/@id` 必须基于 canonical URL。
- 规范路径示例：
  - landing: `https://<host>/tests/mbti-personality-test-16-personality-types`
  - take: `https://<host>/tests/mbti-personality-test-16-personality-types/take`

## 3. Breadcrumb 规则

- Home: `/`
- Tests: `/tests`
- Current: `/tests/{canonical-slug}`

## 4. 验收

- View Source 可见且仅见一套 `Quiz/BreadcrumbList/Dataset`。
- 访问 alias/legacy URL 时最终页面 canonical 为 `/tests/{canonical-slug}`。
