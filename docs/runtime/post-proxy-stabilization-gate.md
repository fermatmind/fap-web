# Post-proxy Stabilization Gate

Use this gate after PR-3 is merged and before broadening traffic confidence.

## When to run

Run the gate in both cycles below:

1. staging after the target commit is deployed
2. production canary before promoting to the wider audience

## How to run

Set the deployed origin and the expected legacy mode, then run the shared smoke script.

```bash
cd /Users/rainie/Desktop/GitHub/fap-web

BASE_URL="https://staging.example.com" \
LEGACY_MODE_EXPECTATION="redirect" \
bash scripts/http_boundary_smoke.sh
```

```bash
cd /Users/rainie/Desktop/GitHub/fap-web

BASE_URL="https://canary.example.com" \
LEGACY_MODE_EXPECTATION="gone" \
bash scripts/http_boundary_smoke.sh
```

Notes:

- staging and canary use the same script and the same URL checklist
- only `BASE_URL` and `LEGACY_MODE_EXPECTATION` change between environments
- `LEGACY_MODE_EXPECTATION` must match the mode the target deployment was built with
- production canonical host policy is `https://www.fermatmind.com/*` => `308` => `https://fermatmind.com/*`; when the target is production apex or production `www`, the script verifies representative `www` redirects and the apex final statuses
- root `/test*` is still owned by unconditional `next.config.mjs` redirects and therefore stays `308` in both modes
- under the current constrained root-quiz contract, `LEGACY_MODE_EXPECTATION=gone` expects:
  - `/quiz/:slug` => `410`
  - bare `/quiz` => `404`

## Evidence to keep

For every gate run, keep:

- script stdout with `status`, `location`, `x-robots-tag`, and `set-cookie`
- deployed commit SHA
- CI links for the `build` and `contracts` jobs
- the base URL and legacy mode used for the run

## Pass criteria

The gate passes only if all items below hold:

1. `build` and `contracts` are green for the deployed commit
2. `/` returns `200` without a redirect
3. production `www` requests return `308` to the identical apex path, and the apex final status is validated
4. `/articles`, `/career`, `/topics`, and `/personality` return `308` and preserve query strings
5. `/professions` and `/types` return `410` with `X-Robots-Tag` containing `noindex`
6. root `/test*` keeps its explicit `308` redirects and locale `/[locale]/test*` plus `/quiz*` match the selected legacy mode contract
7. canonical `/en/tests/.../take` returns `200`, keeps `X-Robots-Tag`, sets anon cookie on the first request, and does not rotate it on the second request
8. `robots`, `sitemap`, and `llms` endpoints are not redirected and do not emit proxy side-effect cookies

## Fail triggers

Treat any of the following as a gate failure:

- CI failure in `build` or `contracts`
- unexpected redirect target or missing query preservation
- `410` routes losing `X-Robots-Tag`
- take page losing `noindex` or anon-cookie stability
- `robots`, `sitemap`, or `llms` emitting redirect or stray `Set-Cookie`

## Rollback handling

If the gate fails:

1. stop promotion past the current environment
2. keep the smoke output and CI links as evidence
3. revert to the last known good deployment or restore the previous legacy mode if that was the triggering change
4. rerun the same smoke command on the recovered deployment before resuming promotion
