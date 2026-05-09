# Self-understanding Topic Article Surface Attributes

Scope: `PR-4C-03`

Train: `domain-runtime-metadata-integration-phase-4c-train`

Runtime behavior changed: no.

## Purpose

This artifact records the metadata policy for topic and article surfaces in the `self_understanding` domain. Both surfaces are currently **deferred** — no passive `data-domain-*` attributes are added to page markup because stable backend/CMS payload-backed ownership cannot be reliably determined at the page level.

## Deferred Surfaces

### Topic Detail (`/topics/[slug]`)

**Status**: `deferred`

**Reason**: `CmsTopicProfile.topicCode` does not provide a stable mapping to scale code or decision domain. Topics are CMS-authoritative content surfaces; frontend cannot reliably determine self_understanding ownership from topicCode alone. Hardcoding allowed topic slugs would create a fragile mapping that drifts with CMS changes.

**Allowed if**: A future backend/CMS payload field (e.g., `decision_domain` or `scale_code`) is added to the topic model, enabling the page to conditionally render `data-domain-id="self_understanding"`.

### Article Detail (`/articles/[slug]`)

**Status**: `deferred`

**Reason**: `CmsArticle.relatedTestSlug` can link to self_understanding test slugs (e.g., `mbti-personality-test-16-personality-types`, `big-five-personality-test`, `enneagram-personality-test-nine-types`), but this mapping depends on inverting `SCALE_CANONICAL_SLUG_MAP` and is not guaranteed stable. Articles with no `relatedTestSlug` or with RIASEC/career test slugs must not receive self_understanding attributes. Building a reliable check requires importing slug-to-domain infrastructure that is beyond this PR's scope.

**Allowed if**: A future backend/CMS payload field (e.g., `decision_domain` or `scale_code`) is added to the article model, enabling the page to conditionally render `data-domain-id="self_understanding"`.

## Policy (Contract-Only)

Until backend/CMS payload-backed domain metadata is available for topics and articles:

- No `data-domain-*` attributes are rendered on topic or article pages.
- This artifact serves as the **metadata policy** documenting the deferred status.
- Domain framing on topics/articles remains `metadata_only`.
- No visible copy, badge, label, CTA, SEO/GEO change, recommendation trigger, or profile write may be introduced through topic/article surfaces under self_understanding domain.

## Allowed Signals (When Payload-Backed)

When backend/CMS payload supports it:

| Surface | Allowed Scopes | Domain Role |
| --- | --- | --- |
| Topic detail | MBTI, BIG5_OCEAN, ENNEAGRAM | `primary` |
| Article detail | MBTI, BIG5_OCEAN, ENNEAGRAM | `primary` |

## Excluded

- `RIASEC` career-specific topics/articles
- Career decision articles
- Workstyle-only content
- SDS / Clinical / EQ / IQ topics/articles
- Future scale topics/articles
- Generic/unknown articles without stable scale/topic mapping

## Blocked Domains

- `career_decision` — remains guard-ledger-only
- `workstyle_decision` — remains artifact-only

## No Runtime Change Statement

This PR is contract-only. No page files are modified. No data attributes are rendered. No runtime behavior is changed. No visible output is modified.
