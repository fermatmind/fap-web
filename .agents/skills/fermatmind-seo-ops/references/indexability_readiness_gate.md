# Indexability Readiness Gate

Use this workflow after a page is published as public noindex and post-publish smoke has passed or passed with non-blocking warnings.

## Inputs

- Public URL.
- Article ID.
- current CMS flags.
- post-publish smoke report.
- claim/science/legal/operator review evidence.
- sitemap/llms current exposure evidence.
- schema/hreflang current state evidence.
- Search Channel current state evidence.

## Checks

| Check | Pass condition |
|---|---|
| Public runtime | HTTP 200 and published/public state verified. |
| Noindex baseline | Current noindex state is understood before release. |
| Claim gate | Operator accepted for indexability, with no forbidden claims. |
| Science/legal review | Required review complete or explicitly not required with evidence. |
| CTA | CTA markup and public route target are valid; live transport gaps may be post-release observation if attribution exists. |
| Private URL | No private URL or raw ID in body, CTA, canonical, metadata, schema, or analytics URL. |
| Canonical | Accept or block according to policy. |
| Global-link exception | Accept nav/footer exceptions or block if article body leaks private routes. |
| Schema | Hold or release decision recorded separately from indexability. |
| Hreflang | Hold or release decision recorded separately from indexability. |
| Sitemap | Hold or release decision recorded separately from indexability. |
| llms | Hold or release decision recorded separately from indexability. |
| Search Channel | Hold or release decision recorded separately from indexability. |
| ISR/revalidation | Hold unless operator explicitly approves required coupled signal. |

## Decisions

- `GO_FOR_INDEXABILITY_RELEASE`.
- `GO_FOR_INDEXABILITY_RELEASE_WITH_HOLDS`.
- `NO_GO_FOR_INDEXABILITY_RELEASE`.
- `ACCESS_REQUIRED`.

## Output

Use `assets/indexability_readiness_gate_template.md`.

## Hard gates

Do not change CMS flags, publish, make indexable, enable schema/hreflang, change sitemap/llms, submit search channels, or trigger revalidation.
