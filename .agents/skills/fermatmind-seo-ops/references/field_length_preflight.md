# Field Length Preflight

Run before production draft dry-run and before publish metadata rehearsal.

## Fields To Check

- `seo_title`, maximum 60 characters.
- meta title fields, maximum 60 characters unless CMS contract says shorter.
- slug, maximum CMS column length and route policy.
- title, maximum CMS column length.
- excerpt, maximum CMS column length.
- meta description, maximum CMS column length and SEO display guidance.

## Rewrite Policy

If fields exceed limits:

- Meta title and excerpt may be deterministically rewritten when the Authorization Profile allows package autofix.
- Preserve the primary keyword.
- Preserve locale.
- Preserve slug and canonical.
- Do not rewrite body markdown.
- Do not alter claim gate, CTA, internal links, social image, schema hold, or hreflang hold.

## Failure Policy

If the field cannot be shortened without losing the required primary keyword or changing meaning, stop with `BLOCKED_NEEDS_OPERATOR_INPUT`.
