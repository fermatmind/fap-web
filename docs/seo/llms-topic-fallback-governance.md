# llms Topic Fallback Governance

Scope: PR-SEOF-03, SEO Foundation Authority Convergence.

This is a compatibility governance contract for topic fallback exposure in
`llms.txt` and `llms-full.txt`. It does not change runtime llms output, sitemap
output, public URLs, Topic Graph behavior, page rendering, or CMS content.

## Current Fallback Set

The current stable public topic fallback set is:

- `mbti`
- `big-five`
- `iq-eq`

These slugs are used only when the topics CMS cannot provide topic entries. They
are not final topic exposure authority.

## Explicit Exclusions

The following topics must not enter llms fallback implicitly:

- `riasec`
- `enneagram`
- `career`

RIASEC is excluded because its topic route and CMS graph authority are not ready.
Enneagram and career are excluded because they are not part of the current stable
topic fallback set and need dedicated ownership before exposure.

## Future Authority Requirement

Before Topic Graph expansion, topic exposure in llms surfaces must move to one
of:

- backend/CMS topic exposure authority; or
- a reviewed versioned compatibility fixture with explicit inclusion and
  exclusion states.

No new topic slug should appear in `llms.txt` or `llms-full.txt` through implicit
frontend fallback.

## Non-Goals

- No new topics in this PR.
- No llms exposure widening in this PR.
- No sitemap change in this PR.
- No Topic Graph rollout in this PR.
- No backend/CMS migration in this PR.

## Repository Rule Impact

This PR adds governance around an existing compatibility fallback. It does not
introduce a new content surface. It reinforces the repository rule that sitemap,
llms, SEO metadata, topics, personality, and career content must enumerate from
CMS/public APIs rather than local files, with temporary fallbacks explicitly
inventoried and gated.
