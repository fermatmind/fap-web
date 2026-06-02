# FermatMind SEO CMS Canary Preflight Scan — 2026-06-02

## 1. One-Line Conclusion

NO-GO: `SEO-CMS-CANARY-BE-01` and `SEO-CMS-CANARY-WEB-01` are merged into `origin/main`, and the public/runtime gates mostly pass, but do not enter `SEO-CONTENT-P1-08` yet because CMS operator permissions, hidden CMS draft collisions, and a safe draft preview/noindex validation path are not verified.

## 2. Scope / Limits

This scan followed the pasted `SEO-CMS-CANARY-PREFLIGHT-SCAN` limits:

- No code changes.
- No PR creation.
- No CMS draft creation.
- No publish, unpublish, sitemap submit, Baidu submit, IndexNow push, GA4/Baidu config change, CMS data mutation, dependency install, or content package edit.
- No payment/order/result/share/private-route access.
- No env, token, cookie, or secret inspection.
- One docs-only artifact was created: `docs/audits/seo-cms-canary-preflight-scan-2026-06-02.md`.

Scan worktrees:

- fap-web clean scan worktree: `/Users/rainie/Desktop/GitHub/fap-web-seo-cms-canary-web01-tracking`
- fap-api clean scan worktree: `/Users/rainie/Desktop/GitHub/fap-api`
- Report output path: `/Users/rainie/Desktop/GitHub/fap-web/docs/audits/seo-cms-canary-preflight-scan-2026-06-02.md`

The primary fap-web worktree already had unrelated untracked docs/content files before this report was created. They were not touched.

## 3. Merge Status

GitHub and local `origin/main` checks:

| Item | Status | Evidence |
| --- | --- | --- |
| `fermatmind/fap-api#1852` / `SEO-CMS-CANARY-BE-01` | MERGED | GitHub PR state `MERGED`, merged at `2026-06-02T11:46:03Z`, merge commit `dc96157c0c226ed39c2036a27670c092bc54013f`. |
| fap-api `origin/main` contains BE-01 | PASS | `git merge-base --is-ancestor dc96157c origin/main` passed. Current `main == origin/main` at `ccecc2098f77d04547626670672b7f7bc677523d`. |
| `fermatmind/fap-web#1002` / `SEO-CMS-CANARY-WEB-01` | MERGED | GitHub PR state `MERGED`, merged at `2026-06-02T12:51:32Z`, merge commit `fa1e850b9faeee932c6b67f833422910b3e8a9bf`. |
| fap-web `origin/main` contains WEB-01 | PASS | `git merge-base --is-ancestor fa1e850b origin/main` passed. Clean scan worktree `main == origin/main` at `1116b36bc85306682f4f08f13eaf7a18ff4a8bdf`. |

Bookkeeping note: `docs/codex/pr-train.yaml` still lists `SEO-CONTENT-P1-08` as `blocked`, and this scan did not update train metadata/state because the instruction allowed only this docs report.

## 4. Field Acceptance

| Field / surface | Result | Notes |
| --- | --- | --- |
| zh slug `mbti-vs-holland-career-choice` | Public collision check PASS | Production article page/API/SEO endpoint currently return 404/noindex for this public slug. Hidden CMS draft collision was not verifiable without CMS/DB read-only access. |
| en slug `mbti-vs-holland-code-career-choice` | Public collision check PASS | Production article page/API/SEO endpoint currently return 404/noindex for this public slug. Hidden CMS draft collision was not verifiable without CMS/DB read-only access. |
| Locale | PASS in code | Article model/API support `en` and `zh-CN`; fap-web maps `zh-CN` to `/zh`. |
| `translation_group_id` | PARTIAL | Backend model and controlled editorial package importer can persist an explicit group id. Standard ArticleResource UI shows `translation_group_id` as a placeholder/table value, not a direct editable field. |
| `related_test_slug` | PASS | Article model/service/API/UI accept and expose it. |
| CTA slots | PARTIAL | BE-01 projects `editorial_package_v1.cta_slots` into public article landing surface. Standard ArticleResource UI does not expose a full direct CTA-slot editor. |
| FAQ slots | PARTIAL | BE-01 projects visible `answer_surface_v1.faq_items`; hidden/private/disabled FAQ entries are filtered. Standard ArticleResource UI does not expose a full direct FAQ-package editor. |
| SEO meta / canonical | PASS in code | Article SEO service builds locale-aware canonical and alternates. |
| Exact canary package creation path | NOT VERIFIED | Controlled importer appears to be the viable path for exact translation group + CTA + FAQ package fields; actual authorized operator path was not exercised. |

## 5. CMS Draft / Publish Gate

Draft gate code evidence:

- Backend `ArticleService::createArticle()` creates articles as `status=draft`, `is_public=false`, `is_indexable=false`.
- Controlled editorial package importer creates/updates drafts with `status=draft`, `is_public=false`, `is_indexable=false`, and `published_revision_id=null`.
- Public article list/detail/SEO endpoints use `publiclyReadable()`, which requires `status=published`, `is_public=true`, and a matching published revision.
- Sitemap article enumeration uses `publiclyIndexable()`, which additionally requires `is_indexable=true`.

Publish gate code evidence:

- ArticleResource release action requires `ContentAccess::canRelease()`, an approved editorial review state, and a publishable working revision.
- `ArticlePublishService::publishArticle()` sets public fields only during publish and requires slug/title/content plus a publishable revision.

Result:

- Draft fail-closed behavior is supported in code.
- Publishing remains forbidden for this canary.
- Actual CMS role/permission for creating the draft was not verified. Do not create the draft until an authorized operator/path is confirmed.

## 6. Preview / Noindex / Sitemap / LLMS

Public production checks:

| URL / artifact | Result |
| --- | --- |
| `/zh/articles/mbti-vs-holland-career-choice` | 404, title `Unavailable page | FermatMind`, robots `noindex`. |
| `/en/articles/mbti-vs-holland-code-career-choice` | 404, title `Unavailable page | FermatMind`, robots `noindex`. |
| API detail/SEO endpoints for both slugs | 404. |
| `https://fermatmind.com/sitemap.xml` | 200; canary slugs absent; target test slugs present. |
| `https://fermatmind.com/llms.txt` | 200; canary slugs absent; target test slugs present. |
| `https://fermatmind.com/llms-full.txt` | 200; canary slugs absent; target test slugs present. |

Preview result:

- NO-GO for preview: source scan did not find a secure token-gated or operator-only public-rendered article draft preview route.
- ArticleResource has a public URL preview placeholder/action, but public URL access is only meaningful for public/published records.
- Without a safe preview or an explicitly accepted CMS-only alternative, draft article rendering cannot be validated end-to-end before publish.

## 7. Hreflang / Canonical

Result: PASS in backend code for published/indexable articles, not runtime-verifiable for a draft.

Evidence:

- BE-01 added different-slug alternates by `translation_group_id`.
- Alternates exclude draft/noindex siblings.
- Backend tests cover the canary-like pair:
  - zh slug: `mbti-vs-holland-career-choice`
  - en slug: `mbti-vs-holland-code-career-choice`
  - group: `article_mbti_vs_holland_career_choice_v1`
- fap-web consumes backend article SEO alternates and applies canonical authority guards.

Draft limitation:

- A non-public draft must not emit public hreflang. End-to-end hreflang can only be verified after a safe preview surface exists or during a publish preflight immediately before a controlled publish decision.

## 8. CTA / `article_to_test_click`

Result: PASS for the WEB-01 tracking contract.

Evidence:

- `article_to_test_click` is a separate tracking event and maps to GA4 as `article_to_test_click`.
- It is not treated as a real `start_attempt` / `test_start`.
- Payload includes `locale`, `article_slug`, `translation_group_id`, `cta_id`, `cta_priority`, `target_test_slug`, `source_path`, and `destination_path`.
- Safe article CTA destinations are limited to same-origin public localized test detail URLs like `/zh/tests/{slug}` and `/en/tests/{slug}`.
- Private, tokenized, external, `/take`, result, order, share, pay, payment, and history destinations are rejected from safe article CTA destination tracking.
- Baidu remains auxiliary/public-element only in docs and conversion mapping; it is not the private funnel source of truth.

Target canary CTA destination readiness:

- `/zh|en/tests/holland-career-interest-test-riasec`
- `/zh|en/tests/mbti-personality-test-16-personality-types`
- `/zh|en/tests/big-five-personality-test-ocean-model`

All six public test detail pages returned HTTP 200 with `index, follow` and exact canonicals.

## 9. Article / FAQ / Breadcrumb Schema

Result: PASS in code/contract for public published article rendering; not preview-verifiable for the canary draft.

Evidence:

- Backend Article SEO service generates Article JSON-LD and optional FAQPage from visible CMS FAQ items.
- Hidden/private/disabled FAQ entries are filtered.
- fap-web article detail renders Article JSON-LD when CMS SEO JSON-LD exists or visible article content permits a frontend fallback.
- fap-web article detail always renders BreadcrumbList JSON-LD for visible article detail pages.
- Contract coverage verifies:
  - FAQPage JSON-LD only from visibly rendered answer-surface FAQ.
  - No FAQPage JSON-LD when no visible answer-surface FAQ exists.
  - Article and BreadcrumbList JSON-LD are preserved on article detail.

## 10. Test Page Target Readiness

Production public target pages:

| Locale | Target | HTTP | Robots | Canonical | Take entry evidence |
| --- | --- | --- | --- | --- | --- |
| zh | RIASEC | 200 | `index, follow` | exact `/zh/tests/holland-career-interest-test-riasec` | `riasec_60`, `riasec_140` take links present. |
| zh | MBTI | 200 | `index, follow` | exact `/zh/tests/mbti-personality-test-16-personality-types` | `mbti_144`, `mbti_93` take links present. |
| zh | Big Five | 200 | `index, follow` | exact `/zh/tests/big-five-personality-test-ocean-model` | `big5_120`, `big5_90` take links present. |
| en | RIASEC | 200 | `index, follow` | exact `/en/tests/holland-career-interest-test-riasec` | `riasec_60`, `riasec_140` take links present. |
| en | MBTI | 200 | `index, follow` | exact `/en/tests/mbti-personality-test-16-personality-types` | `mbti_144`, `mbti_93` take links present. |
| en | Big Five | 200 | `index, follow` | exact `/en/tests/big-five-personality-test-ocean-model` | `big5_120`, `big5_90` take links present. |

No first-party private result/order/share/pay/payment/history anchors were found in the sampled HTML for those six test detail pages.

## 11. Tests / Contract Coverage

Frontend checks run in the clean fap-web scan worktree:

```bash
./node_modules/.bin/vitest run \
  tests/contracts/seo-cms-canary-web01-article-to-test-click.contract.test.tsx \
  tests/contracts/seo-page-cta-attribution.contract.test.ts \
  tests/contracts/tracking-whitelist.contract.test.ts \
  tests/contracts/analytics-payload-privacy.contract.test.ts \
  tests/contracts/article-answer-surface.contract.test.ts
```

Result:

- 5 test files passed.
- 34 tests passed.

Backend coverage was scanned but not executed in this preflight because the instruction allowed read-only checks and prohibited destructive migration/data mutation. Relevant backend tests in source cover:

- Different-slug article alternates by `translation_group_id`.
- Draft/noindex siblings excluded from alternates.
- Public reads require published revision.
- Sitemap source excludes draft/noindex articles.
- CTA slot and visible FAQ projection.
- Controlled editorial package dry-run and draft creation semantics.

## 12. Dashboard Readiness

Result: PARTIAL / human confirmation required.

Repository docs are ready enough for a monitoring plan:

- `docs/analytics/seo-cta-attribution.md`
- `docs/analytics/conversion-setup-qa-checklist.md`
- `docs/analytics/tracking-activation-runbook.md`
- `docs/operations/seo-baseline-template-2026-06-02.md`

Observed docs include:

- `article_to_test_click` as article CTA intent, separate from `test_start`.
- GA4 as public-funnel reporting surface, not purchase truth.
- Backend/Ops funnel data as business truth for payment/unlock/report stages.
- Baidu Tongji limited to public traffic/auxiliary CTA analysis, not private funnel conversion truth.
- 7-day and 14-day baseline columns for landing PV, `article_to_test_click`, starts, completions, result views, checkout, purchase, and private URL leakage checks.

Not verified:

- GA4 production DebugView/Realtime.
- GSC property/API access.
- Baidu Search Resource Platform / Baidu Tongji readonly dashboards.
- Whether production dashboards already contain the new `article_to_test_click` event.

These are not safe to infer from code. User/Ops must confirm them before publication decisions.

## 13. GO / NO-GO

Overall decision: NO-GO for entering `SEO-CONTENT-P1-08` as a normal CMS draft creation task today.

What is GO:

- BE-01 and WEB-01 are merged and contained in `origin/main`.
- Public canary slugs are not currently exposed.
- Sitemap/llms do not contain canary slugs.
- Target test pages are live, indexable, canonical, and present in sitemap/llms.
- Frontend article CTA tracking contract is implemented and tested.
- Backend code supports fail-closed draft gates and controlled importer semantics.

What blocks GO:

- CMS operator permissions and actual authorized draft-creation path were not verified.
- Hidden CMS/DB collision checks for existing draft/private records were not possible.
- No secure draft preview URL or accepted safe preview alternative was found.
- Standard CMS Article UI does not directly expose the full canary package fields needed for exact `translation_group_id`, CTA slots, and FAQ package data; controlled importer appears required.
- Train ledger/state remains stale for `SEO-CONTENT-P1-08` because this scan was docs-only.

## 14. Follow-Up Task Split

Existing manifest task:

```yaml
id: SEO-CONTENT-P1-08
title: "create bilingual CMS canary draft without publish"
repo: fap-api
scope:
  - CMS draft creation by authorized operator or controlled importer only
  - Draft-only validation artifacts
required_checks:
  - BE-01 merged
  - WEB-01 merged
  - draft hidden from public API
  - draft absent from sitemap, llms.txt, and llms-full.txt
  - preview/noindex verification if preview exists
```

Recommended split before executing `SEO-CONTENT-P1-08`:

1. `SEO-CMS-CANARY-PREFLIGHT-LEDGER-01`
   - Title: `chore(codex): reconcile SEO CMS canary train state`
   - Scope/files likely touched: `docs/codex/pr-train-state.json` and possibly status fields in `docs/codex/pr-train.yaml`.
   - Checks: JSON parse, YAML parse, `git diff --check -- docs/codex`.
   - Dependency: BE-01 and WEB-01 merged.
   - User authorization needed before editing manifest/state.

2. `SEO-CMS-CANARY-DRAFT-PATH-01`
   - Title: `docs(cms): verify canary draft creation path and preview alternative`
   - Scope/files likely touched: backend CMS docs or ops checklist only, unless user authorizes a code fix.
   - Checks: hidden slug collision verification by authorized readonly CMS/DB path; CMS role/permission confirmation; controlled importer dry-run if authorized.
   - Dependency: preflight ledger reconciliation.
   - User authorization needed for any CMS/DB readonly access or importer dry-run.

3. `SEO-CMS-CANARY-PREVIEW-01` if no acceptable safe preview alternative exists
   - Title: `fix(cms): add safe article draft preview gate`
   - Scope/files likely touched: fap-api backend preview route/service/policy/tests and fap-web article preview consumption only if required.
   - Checks: draft preview requires auth/token, emits noindex, excludes sitemap/llms, does not expose private user data, backend tests, frontend preview contract if frontend code changes.
   - Dependency: user confirms preview is required before draft validation.
   - User authorization needed because this would be a new platform PR.

Suggested manifest/state entries requiring explicit authorization if new PRs are added:

```yaml
- id: SEO-CMS-CANARY-PREFLIGHT-LEDGER-01
  repo: fap-web
  branch: codex/seo-cms-canary-preflight-ledger-01
  base: main
  depends_on: [SEO-CMS-CANARY-BE-01, SEO-CMS-CANARY-WEB-01]
  title: "chore(codex): reconcile SEO CMS canary train state"
  in_scope:
    - docs/codex/pr-train.yaml
    - docs/codex/pr-train-state.json

- id: SEO-CMS-CANARY-DRAFT-PATH-01
  repo: fap-api
  branch: codex/seo-cms-canary-draft-path-01
  base: main
  depends_on: [SEO-CMS-CANARY-PREFLIGHT-LEDGER-01]
  title: "docs(cms): verify canary draft creation path and preview alternative"
  in_scope:
    - backend/docs/seo/**
    - backend/docs/operations/**

- id: SEO-CMS-CANARY-PREVIEW-01
  repo: fap-api
  branch: codex/seo-cms-canary-preview-01
  base: main
  depends_on: [SEO-CMS-CANARY-DRAFT-PATH-01]
  title: "fix(cms): add safe article draft preview gate"
  in_scope:
    - backend/app/Http/Controllers/**
    - backend/app/Services/Cms/**
    - backend/app/Policies/**
    - backend/tests/Feature/**
```

Follow-up execution prompt:

```text
Authorize updating docs/codex/pr-train.yaml and docs/codex/pr-train-state.json for the SEO CMS canary follow-up tasks listed in docs/audits/seo-cms-canary-preflight-scan-2026-06-02.md, then execute only SEO-CMS-CANARY-PREFLIGHT-LEDGER-01 from latest main.
```

## 15. User Questions

1. Who is the authorized CMS operator for `SEO-CONTENT-P1-08`, and does that role have create/edit but not publish/release permission?
2. Should the canary draft be created through the controlled editorial package importer rather than manual ArticleResource UI?
3. Can we perform a read-only CMS/DB hidden collision check for both canary slugs and the exact `translation_group_id`?
4. Is CMS-only inspection an acceptable safe preview alternative, or must a token/auth-gated rendered draft preview route exist before draft creation?
5. Can Ops provide readonly GA4/GSC/Baidu dashboard confirmation for the 7-day/14-day baseline fields before any future publish decision?
