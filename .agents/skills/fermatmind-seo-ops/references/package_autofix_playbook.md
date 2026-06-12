# Package Autofix Playbook

Use only when `allow_package_autofix=true`.

## Deterministic Fixes Allowed

- Known route alias autofix.
- Add `contracts/PUBLIC_CANONICAL_ROUTE_CONTRACT.json` when missing and canonical routes are known.
- Add `contracts/ROUTE_ALIAS_CONTRACT.json` when missing and alias mapping is known.
- Remove private route examples from active import surfaces and replace with safe contract references.
- Resolve social image to a known public Media Library default asset when the target article type matches.
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

## Social Image Default

If the package lacks a real asset and the article is a RIASEC/career exploration article, use a verified public Media Library asset only when available, such as `article.riasec.explanation.cover.v1`. Never invent URLs.

## Completion Criteria

- Old Big Five route active surface count is `0`.
- Correct Big Five route exists where needed.
- No placeholder media.
- No private route or sensitive key in active surfaces.
- Field length preflight passes.
