# UI Unification Release Runbook

## Scope
- Frontend-only rollout for code-driven UI unification.
- No backend API contract changes.
- Clinical crisis gating must stay fully backend-driven.

## Preflight
1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test:contract`
4. `pnpm test:a11y`
5. `pnpm test:e2e tests/e2e/home-visual.spec.ts tests/e2e/tests-list.spec.ts tests/e2e/test-detail.spec.ts tests/e2e/result-loading.spec.ts`
6. `pnpm test:e2e tests/e2e/sds-flow.spec.ts tests/e2e/clinical-combo-flow.spec.ts tests/e2e/big5-flow.spec.ts tests/e2e/big5-negative.spec.ts`
7. `pnpm test:e2e:visual`
8. `pnpm build`

Notes:
- `test:e2e:visual` is intentionally serialized (`--workers=1`) to avoid Next.js dev first-compile jitter under parallel visual workers.

## Release Gates
- CLS target: `<= 0.05` for home/tests/detail/take/result.
- LCP target: no worse than pre-release baseline (`p75` delta must stay within `+5%`).
- INP target: no worse than pre-release baseline (`p75` delta must stay within `+5%`).
- Mobile touch targets for answer and CTA controls: `>= 48px`.
- No sensitive payload leakage in logs and tracking (`answers`, `question_text`, `report_tags`).
- Crisis reports continue to hide paywall when `quality.crisis_alert === true`.
- Visual snapshot gate must pass on CI for `/en`, `/en/tests`, `/en/tests/big-five-personality-test`, `/en/support`.

## Post-Deploy 24h Checks
1. Core funnel:
   - Home -> Tests click-through
   - Tests -> Take start rate
   - Completion rate
2. Clinical safety:
   - Crisis sessions show crisis banner
   - Crisis sessions do not show unlock CTA
3. Commerce:
   - Unlock CTA click rate
   - Checkout create success rate
   - Unlock confirmation only after `locked=false`

## Post-Deploy 72h Checks
- Compare conversion and completion against pre-release baseline.
- Validate no significant increase in frontend error rate.
- Verify report generation latency remains stable.
- If any of `home -> tests`, `tests -> take`, completion rate, or unlock rate drops by `>= 8%`, trigger rollback review.

## Rollback Strategy
1. First rollback wave: visual-risk components
   - `components/commerce/UnlockCTA.tsx`
   - `components/design/*`
   - `components/assessment-cards/*`
2. Second rollback wave: entry page visual integration
   - `components/business/TestCard.tsx`
   - `/app/(localized)/[locale]/page.tsx`
   - `/app/(localized)/[locale]/tests/page.tsx`
   - `/app/(localized)/[locale]/tests/[slug]/page.tsx`
3. Last rollback wave: token/font baseline
   - `/app/globals.css`
   - `/app/(localized)/[locale]/layout.tsx`

## Emergency Guardrails
- If checkout or clinical safety metrics degrade, rollback immediately to previous deploy tag.
- Keep backend contracts unchanged during rollback to avoid cross-layer inconsistency.

## Rollback Commands
1. Find latest stable release tag:
   - `git tag --sort=-creatordate | head`
2. Rollback deployment to previous stable tag:
   - `git checkout <stable-tag>`
   - `pnpm install --frozen-lockfile && pnpm build`
3. Redeploy and run smoke checks:
   - `pnpm test:e2e tests/e2e/big5-flow.spec.ts tests/e2e/clinical-combo-flow.spec.ts`
