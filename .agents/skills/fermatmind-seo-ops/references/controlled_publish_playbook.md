# Controlled Publish Playbook

Controlled publish is allowed only after:

- package QA passed.
- production draft import succeeded.
- authenticated preview QA passed.
- publish metadata gate passed.
- publish rehearsal passed.
- Authorization Profile has `allow_publish_after_rehearsal=true`.

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

## Success Evidence

- command `ok=true`.
- published article IDs match target.
- public URLs 200.
- robots/indexability matches profile.
- schema/hreflang holds preserved unless separately authorized.
