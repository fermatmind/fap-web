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
  - non-zh returns `null` (placeholder path)
  - shape/meta validation failures return `null`
  - P0 modules are parsed as optional fields and never crash rendering when missing:
    - `letters_intro`
    - `overview`
    - `chapters.{career,growth,relationships}.{strengths,weaknesses}`
    - `chapters.career.{matched_jobs,matched_guides}`
- Resolver: `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/mbtiDesktopClone.resolve.ts`
  - priority: `storage content` -> `placeholder`
  - no local registry fallback
  - no baseCode fallback

## Local registry status
- `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/content/index.ts`
- `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/content/variants/*.zh.ts`

Both are downgraded to migration artifacts / seed history only, not runtime owner.

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
  - unlock & purchase flow
  - runtime offer price / access state

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
2. Expand `ready` asset coverage in backend owner data (no schema change).
3. Locale expansion (e.g. `en`) in `fap-api`.
