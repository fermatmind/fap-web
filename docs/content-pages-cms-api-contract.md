# Content Pages CMS API Contract

Company and policy pages are rendered by the frontend through the public Content API first, with Word-derived seed content as a fallback.

## Detail Endpoint

```http
GET /api/v0.5/content-pages/{slug}?locale=zh-CN&org_id=0
```

The public frontend uses this endpoint for rendering.

## Ops List Endpoint

```http
GET /api/v0.5/internal/content-pages?locale=zh-CN&org_id=0
```

Expected response:

```json
{
  "ok": true,
  "items": [
    {
      "slug": "about",
      "path": "/about",
      "kind": "company",
      "title": "关于费马测试",
      "kicker": "Company",
      "summary": "费马测试是一个面向青年人与长期成长者的认知成长与决策平台。",
      "template": "company",
      "animation_profile": "mission",
      "locale": "zh-CN",
      "published_at": "2026-04-19",
      "updated_at": "2026-04-19",
      "effective_at": null,
      "is_public": true,
      "is_indexable": true
    }
  ]
}
```

## Ops Save Endpoint

```http
PUT /api/v0.5/internal/content-pages/{slug}
Content-Type: application/json
```

Request body:

```json
{
  "title": "关于费马测试",
  "kicker": "Company",
  "summary": "费马测试是一个面向青年人与长期成长者的认知成长与决策平台。",
  "kind": "company",
  "template": "company",
  "animation_profile": "mission",
  "locale": "zh-CN",
  "published_at": "2026-04-19",
  "updated_at": "2026-04-19",
  "effective_at": null,
  "source_doc": "01_关于费马测试.docx",
  "is_public": true,
  "is_indexable": true,
  "content_md": "## 我们是谁\n\n正文...",
  "content_html": "",
  "seo_title": "关于费马测试",
  "meta_description": "费马测试是一个面向青年人与长期成长者的认知成长平台。"
}
```

Expected response:

```json
{
  "ok": true,
  "page": {
    "slug": "about",
    "title": "关于费马测试",
    "content_md": "## 我们是谁\n\n正文..."
  }
}
```

Supported slugs:

- `about`
- `charter`
- `foundation`
- `careers`
- `brand`
- `terms`
- `privacy`
- `policies`

## Response Shape

```json
{
  "ok": true,
  "page": {
    "slug": "about",
    "path": "/about",
    "kind": "company",
    "title": "关于费马测试",
    "kicker": "Company",
    "summary": "费马测试是一个面向青年人与长期成长者的认知成长与决策平台。",
    "template": "company",
    "animation_profile": "mission",
    "locale": "zh-CN",
    "published_at": "2026-04-19",
    "updated_at": "2026-04-19",
    "effective_at": null,
    "source_doc": "01_关于费马测试.docx",
    "is_public": true,
    "is_indexable": true,
    "headings": ["我们是谁", "我们为什么存在"],
    "content_md": "## 我们是谁\n\n正文...",
    "content_html": "",
    "seo_title": "关于费马测试",
    "meta_description": "费马测试是一个面向青年人与长期成长者的认知成长与决策平台。"
  }
}
```

## Field Notes

- `kind`: `company` or `policy`.
- `template`: `company`, `charter`, `foundation`, `careers`, `brand`, or `policy`.
- `animation_profile`: `mission`, `principles`, `editorial`, `brand`, `policy`, or `none`.
- `content_md`: raw Markdown, not compiled MDX.
- `content_html`: optional trusted CMS HTML. If present, the frontend renders it before Markdown.
- `effective_at`: recommended for policy pages.
- `is_indexable`: controls `robots` metadata.

The frontend currently falls back to `lib/cms/fixtures/company-policy-pages.zh.json` when this endpoint returns `404` or `422`.
