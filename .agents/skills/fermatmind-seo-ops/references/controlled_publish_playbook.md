# Controlled Publish Playbook

Controlled publish is allowed only after:

- package QA passed.
- production draft import succeeded.
- authenticated preview QA passed.
- publish metadata gate passed.
- publish rehearsal passed.
- Article Identity Lock passed for the exact article IDs, revision IDs, translation group ID, locale, slug, and canonical URLs.
- Authorization Profile has `allow_publish_after_rehearsal=true`.

For `operation_type=new_article`, a draft-created state is a normal intermediate state. Article ID is unknown until CMS import, and publish metadata autofill plus claim/editorial review must pass before publish rehearsal.

For `operation_type=update_existing_article`, do not use new-article fallback behavior. Lock article ID, current published revision ID, target working revision ID when known, slug, canonical, locale, and translation group. Require preview QA for the target working revision and revision approval metadata (`reviewed_by`, `reviewed_at`, `approved_at`) before promote. If no safe existing-article promote command exists, stop with `BLOCKED_NEEDS_RUNTIME_FIX`.

## Standard Command

```bash
php artisan articles:publish-controlled
```

Always dry-run first.

## Rules

- Publish can be pre-authorized in `/goal`.
- Make-indexable can be pre-authorized in `/goal`, but remains independent from sitemap/llms.
- Schema never auto-enables unless separately authorized.
- Hreflang never auto-enables unless separately authorized.
- Sitemap and llms remain independent gates after post-publish smoke.
- Only publish exact article IDs that passed rehearsal.
- Stop on article ID, revision ID, translation group, slug, or canonical mismatch.
- Do not change slug/canonical to avoid a publish blocker.
- Do not create a new article when the operation is an existing-article update.

## Success Evidence

- command `ok=true`.
- published article IDs match target.
- public URLs 200.
- robots/indexability matches profile.
- schema/hreflang holds preserved unless separately authorized.
