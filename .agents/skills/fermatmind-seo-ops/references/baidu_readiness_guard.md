# Baidu Readiness Guard

Use for Baidu readiness, dry-run, and retry safety.

## Rules

- No automatic retry on `site init fail`.
- Do not print tokens.
- Do not enable live gates without exact approval.
- Baidu live push is separate from GSC and IndexNow.
- Platform-side blockers must stop the pipeline.
- If live push is requested, verify endpoint, site, token presence, queue item IDs, URL Truth, public/indexable/sitemap/llms state, and prior provider response.

## Decisions

- `BAIDU_READINESS_PASSED_HELD`.
- `BAIDU_LIVE_PUSH_NEEDS_EXACT_APPROVAL`.
- `BAIDU_PLATFORM_BLOCKED`.
- `NO_GO_BAIDU_RETRY`.
