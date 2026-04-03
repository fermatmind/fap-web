# Homepage Redesign Plan

## Milestones

### Phase 0
Deliverables:
- `docs/homepage-redesign/spec.md`
- `docs/homepage-redesign/seo-constraints.md`
- `docs/homepage-redesign/plan.md`

Acceptance:
- narrative, SEO guardrails, and implementation phases are documented clearly enough to guide code review and rollback

### Phase A
Scope:
- navbar treatment
- homepage discoverability layer / tests mega menu or equivalent
- hero
- quick start
- first-to-second-screen continuity

Likely files/components:
- `app/(localized)/[locale]/page.tsx`
- `components/layout/SiteHeader.tsx`
- `components/marketing/*`
- `app/globals.css`
- supporting navigation/data files under `lib/`

Acceptance:
- homepage first screen is product-led and memorable
- two CTA hierarchy is clear
- quick-start questions are understandable in seconds
- desktop and mobile first two screens feel visually continuous
- discoverability remains keyboard-accessible and route-backed

Rollback notes:
- keep homepage data/config isolated so sections can be reverted without affecting test-detail or app flows
- avoid changing route semantics or analytics event names

### Phase B
Scope:
- test families
- results/value section
- trust / methodology / privacy section
- supporting mention surfaces only if they are backed by real assets

Likely files/components:
- `app/(localized)/[locale]/page.tsx`
- `components/marketing/*`
- `app/globals.css`
- optional shared disclosure primitives if needed

Acceptance:
- family browsing is broader but still curated
- value section explains results in decision language
- trust section is readable, restrained, and evidence-bounded
- no fake proof patterns introduced

Rollback notes:
- trust content should degrade to simple static blocks if disclosure behavior needs to be removed

### Phase C
Scope:
- resources hub
- final CTA
- fat footer
- semantic cleanup
- structured data
- responsive polish

Likely files/components:
- `app/(localized)/[locale]/page.tsx`
- `components/layout/SiteFooter.tsx`
- `components/seo/JsonLd.tsx`
- `lib/seo/generateSchema.ts`
- `app/globals.css`

Acceptance:
- homepage support layer closes the narrative cleanly
- footer is useful and non-spammy
- structured data reflects visible content only
- mobile retains the same core content as desktop

Rollback notes:
- structured data should be additive and removable without touching route behavior
- footer grouping should reuse existing routes so rollback is low-risk

## Verification Checklist
- run `pnpm lint`
- run `pnpm typecheck`
- run `pnpm build`
- inspect homepage in browser at desktop width (~1440)
- inspect homepage in browser at mobile width (~390)
- verify hero clarity and CTA hierarchy
- verify nav and discoverability interactions
- verify no overflow or density collapse on mobile
- verify trust disclosure accessibility
- verify footer links remain route-backed and useful
- verify JSON-LD matches visible content

## Implementation Notes
- prefer existing layout primitives and token scales
- minimize new one-off component APIs
- keep homepage content SSR-friendly
- avoid large dependencies and runtime-heavy animation
- respect `prefers-reduced-motion`
