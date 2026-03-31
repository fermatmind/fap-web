# MBTI Desktop Storage Cutover

## Authoritative owner
- `fap-api` is now the authoritative owner for MBTI desktop clone authored正文/列表内容.
- Public read path: `GET /api/v0.5/personality/{fullCodeSlug}/desktop-clone?locale=zh-CN`.
- `fap-web` consumes published storage content and no longer treats local 32-type registry as runtime source.

## Runtime boundary (unchanged)
- Runtime still owns: `fullCode/baseCode`, display title, bars/dimensions, tools/actions, unlock/purchase handlers, runtime price.
- Storage content owner provides: `content` (hero/intro/traits/chapter/finalOffer copy) + `asset_slots` metadata.
- Asset refs are still placeholder metadata in this PR; real asset ownership wiring remains in follow-up PR.

## Consumer behavior in `fap-web`
- Adapter: `/Users/rainie/Desktop/GitHub/fap-web/lib/cms/personality-desktop-clone.ts`
  - `fullCode`: `INFJ-A` -> `infj-a` (exact 32-type slug route)
  - `locale`: `zh`/`zh-CN` -> `zh-CN`
  - non-zh returns `null` (placeholder path)
  - shape/meta validation failures return `null`
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

## Follow-ups
1. AI asset owner wiring for `asset_slots.assetRef`.
2. Locale expansion (e.g. `en`) in `fap-api`.
3. Optional ops/cms editing expansion for desktop clone content.
