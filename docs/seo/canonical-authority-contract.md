# Canonical Authority Contract

Scope: PR-SEO-01C.

Backend/CMS canonical values remain authoritative only when they are safe, public, route-consistent, locale-correct, and self-referential for localized detail pages. The frontend may assemble metadata, but it must not silently accept a canonical target that moves an article or test detail page away from its own public URL.

## Rules

- Localized detail pages use self-referencing canonicals.
- Article detail canonicals must resolve to the current localized article URL.
- Test detail canonicals must resolve to the current localized test detail URL.
- Backend/CMS canonical candidates are rejected when they point to an unrelated host, homepage fallback, wrong locale, unpublished sibling path, query/hash URL, or private/noindex flow.
- Private flows include take, result, orders, share, pay, checkout, account, profile, and app paths.
- Hreflang alternates are sibling references. They do not replace the current page canonical.
- Article alternates still come from backend/CMS published sibling payloads. The frontend must not invent unpublished sibling hreflang or canonical targets from slug parity.
- Test detail x-default remains the test-specific English URL when the test route is valid.

## Deferred

- Sitemap and llms exposure changes are out of scope.
- Product, Offer, Review, AggregateRating, and fake rating schema remain forbidden.
- Backend/CMS canonical production monitoring can be added later, but unsafe values must already fail closed in frontend metadata assembly.

## Repository Rule Impact

This PR tightens SEO metadata authority. It does not move content ownership into frontend code, add public routes, widen discoverability, or alter runtime scoring, recommendation, payment, profile, or report behavior.
