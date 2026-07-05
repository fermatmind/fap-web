# Production Runtime Evidence

## Scale Lookup API

URL:

`https://api.fermatmind.com/api/v0.3/scales/lookup?slug=mbti-personality-test-16-personality-types&locale=zh`

Result:

- HTTP: 200
- `x-fastcgi-cache`: `BYPASS`
- `content_i18n_json` keys: `en`, `zh`
- `content_i18n_json.zh.faq` count: 8

Questions:

1. MBTI 测试免费吗？
2. MBTI 完整结果能看到什么？
3. MBTI 测试一般多久？
4. MBTI 能决定职业吗？
5. MBTI 是心理诊断吗？
6. 16 型人格结果会变吗？
7. MBTI 和大五人格有什么区别？
8. 做完 MBTI 后下一步看什么？

## Canonical Production Page

URL:

`https://www.fermatmind.com/zh/tests/mbti-personality-test-16-personality-types`

Final URL:

`https://fermatmind.com/zh/tests/mbti-personality-test-16-personality-types`

Result:

- `www` redirect: HTTP 308 to apex
- final HTTP: 200
- `cache-control`: `public, s-maxage=60, stale-while-revalidate=300`
- `x-proxy-cache`: `STALE`
- visible FAQ count: 4
- FAQPage JSON-LD count: 4
- contains old question: yes
- contains new API question `MBTI 测试免费吗？`: no

## Cache-Bust Production Page

URL shape:

`https://fermatmind.com/zh/tests/mbti-personality-test-16-personality-types?codex_faq_diag={timestamp}`

Result:

- HTTP: 200
- `cache-control`: `public, s-maxage=60, stale-while-revalidate=300`
- `x-proxy-cache`: `MISS`
- visible FAQ count: 8
- FAQPage JSON-LD count: 8
- contains new API question `MBTI 测试免费吗？`: yes
- contains old question `费马的 MBTI免费测试会收费吗？`: no

Interpretation:

The runtime path can render the 8-entry FAQ payload. The canonical URL remains stale.
