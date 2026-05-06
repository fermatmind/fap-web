# URL Exposure Policy Contract

`PR-DF-02` records the current URL exposure policy as an explicit route-family contract.

The fixture lives at:

- `tests/contracts/fixtures/discoverability-foundation/url-exposure-policy.v1.json`

The contract test lives at:

- `tests/contracts/url-exposure-policy.contract.test.ts`

## Purpose

This contract makes the following route-family decisions testable before any shared discoverability policy extraction:

- indexable route families
- noindex route families
- sitemap inclusion and exclusion
- llms inclusion and exclusion
- private-flow protection
- backend-gated career job detail exposure

## Private Flows

The protected private flows remain:

- `/tests/*/take`
- `/result/*`
- `/orders/*`
- `/share/*`

They must remain:

- `noindex`
- `nofollow`
- covered by `x-robots-tag`
- excluded from sitemap
- excluded from llms

## Non-goals

This PR does not extract shared policy helpers, refactor sitemap generation, refactor llms generation, change robots output, change canonical behavior, or widen discoverability exposure.

Shared policy extraction is reserved for `PR-DF-08` after regression and parity gates are in place.
