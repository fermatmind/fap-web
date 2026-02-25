# Landing Meta Spec（`/tests` Canonical 版）

## 1. 顶层约束

- `slug` 字段必须为 canonical slug。
- Web 落地页路径统一为 `/tests/{slug}`。
- legacy `/test/{slug}` 不作为 meta 主规范，只做 308 兼容入口。

## 2. 示例（MBTI）

```json
{
  "schema": "fap.landing.meta.v1",
  "schema_version": 1,
  "scale_code": "MBTI",
  "slug": "mbti-personality-test-16-personality-types",
  "landing": {
    "canonical_path": "/tests/mbti-personality-test-16-personality-types",
    "seo_title": "MBTI Personality Test (16 Personality Types)",
    "seo_description": "Canonical MBTI landing page for SEO and user entry.",
    "seo_keywords": ["mbti", "16 personality types", "personality test"]
  }
}
```

## 3. 必填规则

- `landing.canonical_path` 必须以 `/tests/` 开头。
- `landing.canonical_path` 必须是相对路径，禁止带域名。
- `slug` 与 `canonical_path` 末段必须一致。

## 4. 兼容说明

- alias slug 由路由层 resolver 处理，不写入 canonical_path。
- legacy URL 统一 308 到 canonical URL。
