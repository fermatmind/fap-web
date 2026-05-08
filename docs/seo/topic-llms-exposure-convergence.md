# Topic / llms Exposure Convergence

Scope: `PR-PRA1B-03`

Runtime behavior changed: yes, scoped to future topic fallback containment.

This PR converges topic CTA fallback and `/llms.txt` / `/llms-full.txt` topic fallback exposure behind one shared compatibility fixture. It does not add topics, widen llms exposure, change the sitemap URL set, expand Topic Graph, or invent frontend topic content.

## Authority Rule

Backend/CMS remains the desired owner for topic public truth:

- Topic detail CTAs prefer CMS `landing_surface_v1`.
- `/llms.txt` prefers CMS topic listing via `listTopics`.
- `/llms-full.txt` prefers CMS topic listing and then attempts topic detail enrichment via `getTopicBySlug`.
- Frontend compatibility fallback is allowed only for explicitly approved slugs in `lib/seo/topicLlmsAuthority.ts`.

## Compatibility Fixture

The current approved fixture is intentionally narrow:

| slug | llms | llms-full | topic CTA fallback |
| --- | --- | --- | --- |
| `mbti` | yes | yes | yes |
| `big-five` | yes | yes | yes |
| `iq-eq` | yes | yes | yes |

The fixture is not Topic Graph authority. It exists only to preserve current exposure when CMS topic listing is unavailable.

## Hard Gates

- No silent topic addition to llms.
- No topic exposure without backend/CMS or explicit compatibility fixture.
- No llms-full enrichment without answer/evidence readiness.
- Topic CTA fallback must prefer `landing_surface_v1` / CMS.
- Future topic expansion must require an authority entry.
- Private flows remain excluded.

## No Expansion Statement

This PR does not create topic pages, add new topics, expand Topic Graph, change sitemap output, change llms URL sets, or add frontend-authored topic content.
