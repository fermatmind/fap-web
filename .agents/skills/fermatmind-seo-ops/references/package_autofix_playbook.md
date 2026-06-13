# Package Autofix Playbook

Use only when `allow_package_autofix=true`.

## Deterministic Fixes Allowed

- Known route alias autofix.
- Add `contracts/PUBLIC_CANONICAL_ROUTE_CONTRACT.json` when missing and canonical routes are known.
- Add `contracts/ROUTE_ALIAS_CONTRACT.json` when missing and alias mapping is known.
- Remove private route examples from active import surfaces and replace with safe contract references.
- Resolve social image to a known public Media Library default asset when the target article type matches.
- Replace or remove unresolved body visual placeholders only when a verified asset exists or the operator explicitly authorized a fallback.
- Run field length preflight and deterministic metadata rewrite.

## Required Big Five Alias

Replace active-surface occurrences of:

`/tests/big-five-personality-test`

with:

`/tests/big-five-personality-test-ocean-model`

The old route may remain only as a key in `ROUTE_ALIAS_CONTRACT.json`, with the canonical value above.

## Required Contracts

`PUBLIC_CANONICAL_ROUTE_CONTRACT.json` must include current canonical public routes for RIASEC, MBTI, Big Five, science, method boundaries, and reliability/validity when referenced by the package.

`ROUTE_ALIAS_CONTRACT.json` must include:

```json
{
  "/tests/big-five-personality-test": "/tests/big-five-personality-test-ocean-model"
}
```

## Active Surface Cleanup

Use `references/mode_c_content_package_rules.md` to distinguish active import surfaces from contract/review surfaces.

Remove these from active import surfaces:

- `/result`
- `/results`
- `/orders`
- `/order`
- `/share`
- `/pay`
- `/payment`
- `/history`
- `/take`
- `result_id`
- `order_id`
- `payment_id`
- `report_id`
- `user_id`
- `token`

Guard contracts may include forbidden examples only in explicitly forbidden fields.

Also remove these from active import surfaces unless the referenced asset has been verified or explicitly authorized as a fallback:

- `{{ media_library_visual:* }}`
- unverified selected Media Library asset keys.
- old route aliases.
- unresolved CTA placeholders.

## Social Image Default

If the package lacks a real asset and the article is a RIASEC/career exploration article, use a verified public Media Library asset only when available, such as `article.riasec.explanation.cover.v1`. Never invent URLs.

## Body Visual Gate

Social/cover image resolution does not satisfy body visual readiness. If the body visual is required and no verified asset exists, the package must record:

- `body_visual_status: requires_media_library_resolution_before_preview`.
- `desired_body_visual_concept`.
- `fallback_asset_candidates`.
- `operator_resolution_required`.

If the operator authorizes a fallback, replace active placeholders with the authorized asset key or remove the placeholder from active import surfaces before dry-run/import.

## Completion Criteria

- Old Big Five route active surface count is `0`.
- Correct Big Five route exists where needed.
- No placeholder media.
- No unresolved body visual placeholder.
- Body visual and social/cover image gates are reported separately.
- No private route or sensitive key in active surfaces.
- Field length preflight passes.
