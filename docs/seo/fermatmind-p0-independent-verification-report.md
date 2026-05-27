# FermatMind P0.2 Independent Verification Report

日期：2026-05-27
模式：P0.2 Clinical/Depression Pending SEO Gate 最小修复后独立验收。
限制：本次只验证 P0/P0.1/P0.2 technical SEO，不把 smoke matrix 当作事实证据。

## 1. 终端检查摘要

本次事实依据来自实际源码、`public/sitemap.xml`、本地 rendered HTML、fetch/curl 等价状态检查、`git diff` 和 `rg`。

本地验证环境：

- Dev server: `NEXT_PUBLIC_API_URL=https://api.fermatmind.com pnpm exec next dev -p 3017`
- Base URL: `http://127.0.0.1:3017`

已执行检查：

- `rg` 检查 footer 源码 forbidden URLs。
- 抓取 `/`, `/en`, `/zh/tests`, `/en/tests`, `/zh/articles`, `/en/articles` rendered HTML 并解析 `<footer>` href。
- 解析 `public/sitemap.xml` 全部 32 个 `<loc>`，逐 URL 请求本地 route，检查 status、redirect、robots、`X-Robots-Tag` 和 holdlist。
- 对 `/privacy`, `/terms`, `/help`, `/zh/help`, `/en/help` 在 plain、English Accept-Language、Chinese Accept-Language、Googlebot UA 下检查 redirect。
- 对 `/zh/results`, `/en/results`, `/zh/results/lookup`, `/en/results/lookup` 检查 status、redirect、robots、`X-Robots-Tag`、canonical、sitemap、footer/header。
- 对 clinical/depression 四个 URL 检查 status、canonical、robots、sitemap、footer/header、language switch、hreflang、tests hub card exposure、homepage/test hub JSON-LD exposure、`review_completed=true` 来源。
- 检查 `git diff --stat`, `git diff --name-only`, `git diff -- components app lib next.config.mjs next-sitemap.config.js`，确认是否新增正文、route、schema。

总体结论：**PASS**。P0.1 失败项保持修复状态；P0.2 已将 clinical/depression pending 页面从主动 SEO 曝光链路移除：不进 sitemap/footer/header/language switch/tests hub cards/homepage JSON-LD/test hub JSON-LD/hreflang，并改为 `noindex, follow`。IQ 按产品/SEO 决策保留为 existing public core test，记录为 `PASS with note`，不伪造 `review_completed=true`。

## 2. 六项验收表

| Check | Result | Evidence | Notes |
|---|---|---|---|
| 1. Footer 有没有误链 Holdlist 页面 | PASS | `components/layout/SiteFooter.tsx` forbidden grep 无命中；6 个抽样页面 rendered footer `forbidden: []`。 | Footer 当前只出现 allowlist + social URLs。 |
| 2. Sitemap 有没有误收 noindex / 404 / redirect source / clinical pending 页面 | PASS | `public/sitemap.xml` 解析到 32 URLs；逐 URL 请求：`not200: []`, `redirects: []`, `noindex: []`, `forbiddenInSitemap: []`。 | No redirect source, no lookup, no clinical/depression, no English trust 404。 |
| 3. Root redirect 是否确定性 | PASS | 5 个 redirect 在 plain、`Accept-Language: en-US`、`Accept-Language: zh-CN`、`User-Agent: Googlebot` 下均返回 expected `308 Location`。 | 未发现 Accept-Language 分支。 |
| 4. `/results` 有没有被做成空壳 indexable 页面 | PASS | `/zh/results` 和 `/en/results` 为 `308` 到 lookup；lookup 是 noindex，不进 sitemap/footer/header，rendered header sensitive links 为 `[]`。 | 未发布 `/results` 空壳页。 |
| 5. clinical/depression 是否被擅自加入 sitemap/footer/header | PASS | 四个 clinical/depression URL 均不在 sitemap/footer/header/language switch；robots 为 `noindex, follow, noarchive, nocache`；tests hub/homepage JSON-LD 不含 pending slugs；未发现 `review_completed=true`。 | 页面保持 200/self-canonical，但在 review 前不主动 SEO 曝光；未新增 clinical 文案。 |
| 6. Codex 有没有偷偷加内容文案 | PASS | `git diff --name-only` 没有 `app` route 变更；diff forbidden editorial/schema grep 无实质命中。 | 唯一 grep 命中是 `persistLocalePreference` 中的 `reference` 子串，不是 editorial copy。 |

## 3. Forbidden Links 检查表

Forbidden set checked:

- `/science`
- `/methodology`
- `/reliability-validity`
- `/refund-policy`
- `/results`
- `/results/lookup`
- `/science/clinical-boundaries`
- `/science/iq-test-quality`
- `/business/api`
- `/business/team-assessment`
- `/business/coaches`
- `/business/research`
- `/en/charter`
- `/en/brand`
- `/en/foundation`
- `/en/careers`
- `/en/policies`
- `/zh/tests/clinical-depression-anxiety-assessment-professional-edition`
- `/en/tests/clinical-depression-anxiety-assessment-professional-edition`
- `/zh/tests/depression-screening-test-standard-edition`
- `/en/tests/depression-screening-test-standard-edition`

Footer source grep:

```bash
rg -n '(/science|/methodology|/reliability-validity|/refund-policy|/results|/results/lookup|/business/api|/business/team-assessment|/business/coaches|/business/research|/en/charter|/en/brand|/en/foundation|/en/careers|/en/policies|clinical-depression-anxiety-assessment-professional-edition|depression-screening-test-standard-edition)' components/layout/SiteFooter.tsx || true
```

Result: no output.

Rendered footer HTML:

| Page | Status | Footer href count | Forbidden links found | Result |
|---|---:|---:|---|---|
| `/` | 200 | 25 | `[]` | PASS |
| `/en` | 200 | 25 | `[]` | PASS |
| `/zh/tests` | 200 | 25 | `[]` | PASS |
| `/en/tests` | 200 | 25 | `[]` | PASS |
| `/zh/articles` | 200 | 25 | `[]` | PASS |
| `/en/articles` | 200 | 25 | `[]` | PASS |

Footer verdict: **PASS**.

## 4. Sitemap Forbidden Inclusion 检查表

Sitemap source/config evidence:

- `next-sitemap.config.js` imports and uses `isP0SitemapAllowlistedPath`.
- `next-sitemap.config.js` keeps `if (!isP0SitemapAllowlistedPath(normalized)) return false;`.
- `lib/seo/sitemapAuthorityAdapters.cjs` contains `P0_SITEMAP_ALLOWLIST_PATHS`.
- `lib/seo/sitemapAuthorityAdapters.cjs` keeps clinical/depression slugs hidden.
- `lib/seo/sitemapAuthorityAdapters.cjs` keeps `/en/brand`, `/en/careers`, `/en/charter`, `/en/foundation`, `/en/policies`, `/en/results/lookup`, `/zh/results/lookup` in excludes.

Sitemap URL total: **32**.

All sitemap URL paths:

`/en/about`, `/zh/about`, `/en/career`, `/zh/career`, `/en/method-boundaries`, `/zh/method-boundaries`, `/en/personality`, `/zh/personality`, `/en/privacy`, `/zh/privacy`, `/en/support`, `/zh/support`, `/en/terms`, `/zh/terms`, `/en/tests`, `/zh/tests`, `/`, `/en`, `/en/articles`, `/zh/articles`, `/en/tests/mbti-personality-test-16-personality-types`, `/en/tests/big-five-personality-test-ocean-model`, `/en/tests/enneagram-personality-test-nine-types`, `/en/tests/holland-career-interest-test-riasec`, `/en/tests/iq-test-intelligence-quotient-assessment`, `/en/tests/eq-test-emotional-intelligence-assessment`, `/zh/tests/mbti-personality-test-16-personality-types`, `/zh/tests/big-five-personality-test-ocean-model`, `/zh/tests/enneagram-personality-test-nine-types`, `/zh/tests/holland-career-interest-test-riasec`, `/zh/tests/iq-test-intelligence-quotient-assessment`, `/zh/tests/eq-test-emotional-intelligence-assessment`.

| Check | Result | Evidence |
|---|---|---|
| Forbidden URL inclusion | PASS | `forbiddenInSitemap: []` |
| 404 in sitemap | PASS | `not200: []` |
| Redirect source in sitemap | PASS | `redirects: []` |
| noindex in sitemap | PASS | `noindex: []` |
| clinical/depression pending in sitemap | PASS | Four clinical/depression paths absent. |
| English trust 404 in sitemap | PASS | `/en/charter`, `/en/brand`, `/en/foundation`, `/en/careers`, `/en/policies` absent. |
| business/science/refund holdlist in sitemap | PASS | All absent. |

Sitemap verdict: **PASS**.

## 5. Redirect Determinism 检查表

All requests used manual redirect handling.

| URL | Variant | Status | Location | Expected | Result |
|---|---|---:|---|---|---|
| `/privacy` | plain | 308 | `/zh/privacy` | `/zh/privacy` | PASS |
| `/privacy` | `Accept-Language: en-US,en;q=0.9` | 308 | `/zh/privacy` | `/zh/privacy` | PASS |
| `/privacy` | `Accept-Language: zh-CN,zh;q=0.9` | 308 | `/zh/privacy` | `/zh/privacy` | PASS |
| `/privacy` | `User-Agent: Googlebot` | 308 | `/zh/privacy` | `/zh/privacy` | PASS |
| `/terms` | plain | 308 | `/zh/terms` | `/zh/terms` | PASS |
| `/terms` | `Accept-Language: en-US,en;q=0.9` | 308 | `/zh/terms` | `/zh/terms` | PASS |
| `/terms` | `Accept-Language: zh-CN,zh;q=0.9` | 308 | `/zh/terms` | `/zh/terms` | PASS |
| `/terms` | `User-Agent: Googlebot` | 308 | `/zh/terms` | `/zh/terms` | PASS |
| `/help` | plain | 308 | `/zh/support` | `/zh/support` | PASS |
| `/help` | `Accept-Language: en-US,en;q=0.9` | 308 | `/zh/support` | `/zh/support` | PASS |
| `/help` | `Accept-Language: zh-CN,zh;q=0.9` | 308 | `/zh/support` | `/zh/support` | PASS |
| `/help` | `User-Agent: Googlebot` | 308 | `/zh/support` | `/zh/support` | PASS |
| `/zh/help` | plain | 308 | `/zh/support` | `/zh/support` | PASS |
| `/zh/help` | `Accept-Language: en-US,en;q=0.9` | 308 | `/zh/support` | `/zh/support` | PASS |
| `/zh/help` | `Accept-Language: zh-CN,zh;q=0.9` | 308 | `/zh/support` | `/zh/support` | PASS |
| `/zh/help` | `User-Agent: Googlebot` | 308 | `/zh/support` | `/zh/support` | PASS |
| `/en/help` | plain | 308 | `/en/support` | `/en/support` | PASS |
| `/en/help` | `Accept-Language: en-US,en;q=0.9` | 308 | `/en/support` | `/en/support` | PASS |
| `/en/help` | `Accept-Language: zh-CN,zh;q=0.9` | 308 | `/en/support` | `/en/support` | PASS |
| `/en/help` | `User-Agent: Googlebot` | 308 | `/en/support` | `/en/support` | PASS |

Redirect verdict: **PASS**.

## 6. Results Route 检查表

| URL | Status | Redirect target | Robots meta | X-Robots-Tag | Canonical | Sitemap? | Footer link? | Header sensitive links | Thin indexable page? | Result |
|---|---:|---|---|---|---|---|---|---|---|---|
| `/zh/results` | 308 | `/zh/results/lookup` | N/A | N/A | N/A | No | No | N/A | No | PASS |
| `/en/results` | 308 | `/en/results/lookup` | N/A | N/A | N/A | No | No | N/A | No | PASS |
| `/zh/results/lookup` | 200 | N/A | `noindex, nofollow, noarchive, nocache` | `noindex, nofollow, noarchive` | `https://fermatmind.com/zh/results/lookup` | No | No | `[]`; no hreflang alternate | No | PASS |
| `/en/results/lookup` | 200 | N/A | `noindex, nofollow, noarchive, nocache` | `noindex, nofollow, noarchive` | `https://fermatmind.com/en/results/lookup` | No | No | `[]`; no hreflang alternate | No | PASS |

Additional HTML check:

- `/zh/results` and `/en/results` are redirects, not indexable thin pages.
- `/results/lookup` pages did not contain new public result-hub copy.
- `/results/lookup` pages no longer render cross-locale `/results/lookup` anchors in `<header>`.

Results verdict: **PASS**.

## 7. Clinical / Depression 检查表

| URL | Status | Canonical | Robots / indexability | Sitemap? | Footer link? | Header / language switch links | Hreflang alternate? | `review_completed=true` found? | Result |
|---|---:|---|---|---|---|---|---|---|---|
| `/zh/tests/clinical-depression-anxiety-assessment-professional-edition` | 200 | `https://fermatmind.com/zh/tests/clinical-depression-anxiety-assessment-professional-edition` | `noindex, follow, noarchive, nocache` | No | No | `[]` | No | No | PASS |
| `/en/tests/clinical-depression-anxiety-assessment-professional-edition` | 200 | `https://fermatmind.com/en/tests/clinical-depression-anxiety-assessment-professional-edition` | `noindex, follow, noarchive, nocache` | No | No | `[]` | No | No | PASS |
| `/zh/tests/depression-screening-test-standard-edition` | 200 | `https://fermatmind.com/zh/tests/depression-screening-test-standard-edition` | `noindex, follow, noarchive, nocache` | No | No | `[]` | No | No | PASS |
| `/en/tests/depression-screening-test-standard-edition` | 200 | `https://fermatmind.com/en/tests/depression-screening-test-standard-edition` | `noindex, follow, noarchive, nocache` | No | No | `[]` | No | No | PASS |

Findings:

- No clinical/depression URL entered sitemap.
- No clinical/depression URL entered footer.
- No clinical/depression URL appears in rendered header sensitive links or language switch anchors.
- No clinical/depression URL appears in `/zh/tests` or `/en/tests` rendered test cards.
- No clinical/depression URL appears in homepage or tests hub JSON-LD.
- No clinical/depression pending page emits cross-locale hreflang alternate.
- Clinical/depression pending pages remain 200 and self-canonical, but now render `noindex, follow` until review and indexability are explicitly approved.
- No `review_completed=true` source was found, so these remain pending decision.
- No clinical/depression body copy, disclaimer copy, crisis resource copy, or schema was added in current diff.

Clinical/depression verdict: **PASS** for P0.2 exposure gate. Future reindexing remains pending Product/SEO/clinical review decision.

## 8. Git Diff Editorial-Copy 检查表

`git diff --name-only`:

| File | Allowed scope? | Reason |
|---|---|---|
| `components/i18n/LocaleSwitcher.tsx` | Yes | Disable locale switch anchors on private/holdlist routes. |
| `components/layout/SiteFooter.tsx` | Yes | Footer link allowlist. |
| `components/layout/SiteHeader.tsx` | Yes | Header private utility link removal and mobile locale switch suppression. |
| `lib/navigation/headerDropdownMenus.ts` | Yes | Header dropdown private utility link removal. |
| `lib/seo/seoHoldlistRoutes.ts` | Yes | Helper for private/holdlist route link suppression. |
| `lib/seo/sitemapAuthorityAdapters.cjs` | Yes | Sitemap allowlist/exclusion policy. |
| `next-sitemap.config.js` | Yes | Sitemap allowlist gate. |
| `next.config.mjs` | Yes | Redirect config. |
| `public/sitemap.xml` | Yes | Generated sitemap artifact. |

Forbidden content/schema grep:

```bash
git diff -- components app lib next.config.mjs next-sitemap.config.js | rg -n '^\+.*(science|methodology|reliability|refund|results|clinical|depression|anxiety|IQ test quality|business API|team assessment|coaches|research|Review|AggregateRating|author|reviewer|rating|price|reference|citation|审稿|作者|评分|评价|价格|顾问|引用)' || true
```

Result: one substring-only hit:

```text
+                      persistLocalePreference();
```

This is not editorial copy; it is an existing locale cookie helper call moved inside a conditional render block.

Forbidden schema grep:

```bash
git diff -- components app lib next.config.mjs next-sitemap.config.js | rg -n 'Review|AggregateRating|schema.org/Review|schema.org/AggregateRating|aggregateRating|reviewRating|ratingValue' || true
```

Result: no output.

| Check | Result | Notes |
|---|---|---|
| 新增 app route 页面 | PASS | None. |
| 新增 science/results/refund/business/API 正文页面 | PASS | None. |
| TSX/MDX/JS/TS 中新增超过 300 字符 editorial copy | PASS | None found. |
| 新增作者/审稿人/评分/评价/价格/顾问/引用文献 | PASS | None found. |
| 新增 Review 或 AggregateRating schema | PASS | None found. |

Git diff editorial-copy verdict: **PASS**.

## 9. IQ 边界判断

Product/SEO decision retained through P0.2:

**Existing IQ public core test retained.**

Actual IQ route state:

| URL | Status | Sitemap? | Footer linked? | `review_completed=true` found? | Decision |
|---|---:|---|---|---|---|
| `/zh/tests/iq-test-intelligence-quotient-assessment` | 200 | Yes | Yes | No | Existing public core test retained; no expansion before review. |
| `/en/tests/iq-test-intelligence-quotient-assessment` | 200 | Yes | Yes | No | Existing public core test retained; no expansion before review. |

Judgment: **PASS with note**.

Notes:

- IQ remains `review_required=true`.
- `review_completed` is not fabricated as true.
- Current diff does not add IQ claims, IQ quality page, IQ result guide, IQ schema, Review/AggregateRating, paid upsell copy, or expert endorsement.
- Future IQ content expansion, including `/science/iq-test-quality`, `/results/iq`, stronger IQ claims, paid-report copy, or schema expansion, remains blocked until review owner and `review_completed=true` exist.

## 10. Career Jobs Pending Note

`/zh/career/jobs` and `/en/career/jobs` remain pending:

- Current state from prior verification: 200/index follow.
- Not in sitemap.
- Not in footer.
- Header career dropdown still has an entry.
- No sitemap inclusion was added in P0.2.

This is not a P0.2 blocker unless Product/SEO requires strict header/sitemap alignment for career/jobs.

## 11. Final Conclusion

Final status: **PASS**.

Passed:

- Footer has no forbidden holdlist links in source or rendered footer HTML.
- Sitemap has 32 URLs, all 200, no redirects, no noindex, no forbidden holdlist entries.
- Root redirects are deterministic across Accept-Language and Googlebot variants.
- `/results` itself is not an indexable thin page.
- `/results/lookup` remains noindex and no longer appears in rendered header/footer/sitemap/language switch/hreflang.
- Clinical/depression pages render `noindex, follow`, remain out of sitemap/footer/header/language switch/test hub cards/homepage JSON-LD/test hub JSON-LD/hreflang.
- No forbidden editorial copy, new app route, fake author/reviewer/rating/price/reference, Review schema, or AggregateRating schema was added.

Still pending, but not blocking P0.2 review:

- Clinical/depression future reindexing and `review_completed=true` owner.
- IQ formal review owner and future expansion gate.
- Career/jobs sitemap inclusion policy.

Merge recommendation:

- Current P0.2 state can enter human review.
- Human review should explicitly confirm clinical/depression future review criteria, the IQ retained-existing-core-test decision, and the career/jobs pending exception.
