# Article Identity Lock

Use before preview QA, publish, sitemap/llms, schema, hreflang, Search Channel, GSC, Baidu, or any post-release follow-up that targets an article pair.

## Required Fields

Lock all of:

- article IDs.
- working revision IDs when draft-only.
- published revision IDs when public.
- translation group ID.
- locale.
- slug.
- public canonical URLs.

## Source Priority

Use authoritative evidence in this order:

1. production CMS/backend article records.
2. controlled import/publish command output.
3. public API article records.
4. public HTML canonical/robots evidence.
5. operator-provided screenshots or exports.

Do not use article IDs from a previous article pair, local DB state, frontend static fallback, or old final summaries as identity authority.

## Checks

| Field | Requirement |
|---|---|
| article IDs | Match the current target pair exactly. |
| revision IDs | Match the current draft/published state. |
| translation group ID | Same across locales and equals the requested group. |
| locale | Expected locale maps to expected slug/canonical. |
| slug | Matches requested and public route. |
| canonical | Public canonical URL is self-consistent and not preview/admin/private. |

## Stop Conditions

Stop with `ARTICLE_IDENTITY_LOCK_FAILED` when:

- article ID is missing.
- article ID belongs to a different translation group.
- locale/slug/canonical mismatch.
- requested article IDs conflict with production/public evidence.
- only stale generated reports are available.
- source authority is ambiguous.

## Output

Record an identity table with article ID, revision ID, locale, slug, translation group ID, canonical URL, evidence source, and decision.
