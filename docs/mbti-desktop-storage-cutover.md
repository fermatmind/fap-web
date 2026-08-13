# MBTI Desktop Storage Cutover

## Authoritative owner
- `fap-api` is now the authoritative owner for MBTI desktop clone authored正文/列表内容.
- Public read path: `GET /api/v0.5/personality/{fullCodeSlug}/desktop-clone?locale=zh-CN`.
- `fap-web` consumes published storage content and no longer treats local 32-type registry as runtime source.

## Runtime boundary (unchanged)
- Runtime still owns: `fullCode/baseCode`, display title, bars/dimensions, tools/actions, unlock/purchase handlers, runtime price.
- Storage content owner provides: `content` (hero/intro/traits/chapter/finalOffer copy) + `asset_slots`.
- Asset slot consumption cutover details are documented in:
  - `/Users/rainie/Desktop/GitHub/fap-web/docs/mbti-desktop-asset-slot-consumption.md`

## Consumer behavior in `fap-web`
- Adapter: `/Users/rainie/Desktop/GitHub/fap-web/lib/cms/personality-desktop-clone.ts`
  - `fullCode`: `INFJ-A` -> `infj-a` (exact 32-type slug route)
  - `locale`: `zh`/`zh-CN` -> `zh-CN`
  - non-zh returns `null`（英文行为保持不变）
  - 中文 shape/meta/hash/revision validation 失败返回 `null`，正式结果路由 fail closed
  - P0 modules are parsed as optional fields and never crash rendering when missing:
    - `letters_intro`
    - `overview`
    - `chapters.{career,growth,relationships}.{strengths,weaknesses}`
    - `chapters.career.{matched_jobs,matched_guides}`
  - Compatibility transition fields are also parsed/held as optional:
    - `chapters.career.{career_ideas,work_styles}`
    - `chapters.growth.{what_energizes,what_drains}`
    - `chapters.relationships.{superpowers,pitfalls}`
  - Compatibility transition fields are retained for contract safety and are not current desktop main-flow render source.
- Resolver: `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/mbtiDesktopClone.resolve.ts`
  - 中文正式结果路由只接受 `storage content`；placeholder 仅保留给隔离组件测试和非中文兼容路径
  - no local registry fallback
  - no baseCode fallback

## Local registry status

旧 `components/result/mbti/clone/content/**` 及对应 registry contracts 已删除。前端不再保存 16 个 base 或 32 个 A/T 变体正文，也不存在可回接的本地正文 fallback。

## Current coverage
- Published storage seed expected in backend owner: `32 fullCode` x `zh-CN` for `mbti_desktop_clone_v1`.
- Desktop clone shell now renders P0 content blocks from storage under zh:
  - Hero bridge: `letters_intro`, `overview`
  - Career: `strengths`, `weaknesses`, `matched_jobs`, `matched_guides`
  - Growth: `strengths`, `weaknesses`
  - Relationships: `strengths`, `weaknesses`

## Field ownership split
- Storage-authored content fields:
  - `content.hero.summary`
  - `content.intro.paragraphs`
  - `content.letters_intro`
  - `content.overview`
  - `content.traits.*`
  - `content.chapters.*`
  - `content.finalOffer.*`
  - `asset_slots`
- Runtime-owned fields (unchanged):
  - `fullCode/baseCode` runtime truth
  - display title / bars / dimension winners
  - actions and CTA wiring
  - access state；`free_full` 时隐藏购买/邀请入口，未来切回 `paid_unlock` 时复用保留的付费能力

## Not rendered yet (intentionally out-of-scope)
- Runtime personalization:
  - `selection_fingerprint`
  - `evidence`
  - `adaptive`
  - `memory`

P1 deep-content module rendering status now lives in:
- `/Users/rainie/Desktop/GitHub/fap-web/docs/mbti-desktop-p1-render.md`

## Follow-ups
1. Runtime personalization integration without changing owner boundaries.
2. Locale expansion (e.g. `en`) in `fap-api`.
