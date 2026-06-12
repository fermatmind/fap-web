# Publish Metadata Gate

Run after preview QA passes and before controlled publish.

## Required Metadata

- structured references.
- graph metadata.
- article tags.
- structured CTA slots.
- structured FAQ items.
- working revision approved or editorially approved.
- claim gate reviewed or explicitly held for human review.
- publish_allowed state matches the controlled publish command requirements.

## Required Rehearsals

Run both:

```bash
content-publish-rehearsal --dry-run --no-write
```

and:

```bash
php artisan articles:publish-controlled --dry-run --json
```

Use the actual production-safe command names available in the target runtime. If `content-publish-rehearsal` is not registered, record that and require the equivalent no-write rehearsal path.

## Hard Stops

- Missing structured CTA/FAQ fields.
- Working revision not approved when publish command requires approval.
- Article IDs mismatch.
- Schema or hreflang enabled implicitly.
- Publish rehearsal errors.
