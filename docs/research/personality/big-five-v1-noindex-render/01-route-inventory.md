# Big Five V1 Noindex Route Inventory

## Route Pattern

Dynamic route:

`/[locale]/personality/big-five/[[...slug]]`

The route is server-rendered on demand and resolves only a fixed Big Five V1 route registry. It does not statically generate public SEO pages.

## Locale Coverage

Each route candidate exists for:

- `en`
- `zh`

## Per-Locale Candidate Set

| Entity type | Code | English path | Chinese path |
|---|---|---|---|
| hub | `big-five` | `/en/personality/big-five` | `/zh/personality/big-five` |
| domain | `openness` | `/en/personality/big-five/openness` | `/zh/personality/big-five/openness` |
| domain | `conscientiousness` | `/en/personality/big-five/conscientiousness` | `/zh/personality/big-five/conscientiousness` |
| domain | `extraversion` | `/en/personality/big-five/extraversion` | `/zh/personality/big-five/extraversion` |
| domain | `agreeableness` | `/en/personality/big-five/agreeableness` | `/zh/personality/big-five/agreeableness` |
| domain | `neuroticism` | `/en/personality/big-five/neuroticism` | `/zh/personality/big-five/neuroticism` |
| polarity | `high-openness` | `/en/personality/big-five/high-openness` | `/zh/personality/big-five/high-openness` |
| polarity | `low-openness` | `/en/personality/big-five/low-openness` | `/zh/personality/big-five/low-openness` |
| polarity | `high-conscientiousness` | `/en/personality/big-five/high-conscientiousness` | `/zh/personality/big-five/high-conscientiousness` |
| polarity | `low-conscientiousness` | `/en/personality/big-five/low-conscientiousness` | `/zh/personality/big-five/low-conscientiousness` |
| polarity | `high-extraversion` | `/en/personality/big-five/high-extraversion` | `/zh/personality/big-five/high-extraversion` |
| polarity | `low-extraversion` | `/en/personality/big-five/low-extraversion` | `/zh/personality/big-five/low-extraversion` |
| polarity | `high-agreeableness` | `/en/personality/big-five/high-agreeableness` | `/zh/personality/big-five/high-agreeableness` |
| polarity | `low-agreeableness` | `/en/personality/big-five/low-agreeableness` | `/zh/personality/big-five/low-agreeableness` |
| polarity | `high-neuroticism` | `/en/personality/big-five/high-neuroticism` | `/zh/personality/big-five/high-neuroticism` |
| polarity | `emotional-stability` | `/en/personality/big-five/emotional-stability` | `/zh/personality/big-five/emotional-stability` |
| facet_hub | `facets` | `/en/personality/big-five/facets` | `/zh/personality/big-five/facets` |

## Exclusions

The route registry rejects multi-segment Big Five paths such as `/personality/big-five/facets/imagination`. This prevents accidental publication of 30 facet detail pages before the backend asset quality and SEO strategy are approved.

## Evidence

- Code evidence: `lib/personality/bigFivePublicRoutes.ts`
- Contract evidence: `tests/contracts/personality-big-five-v1-noindex-render.contract.test.ts`
