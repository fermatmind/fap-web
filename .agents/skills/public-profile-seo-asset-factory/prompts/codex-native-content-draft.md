# Codex Native Content Draft Prompt

Generate a FermatMind public profile content package using Codex-native content production.

Output strict JSON only.

Do not output Markdown fences, comments, unquoted keys, trailing commas, JSON-like pseudo objects, or prose outside JSON.

Use exact canonical paths:

- zh-CN: `/zh/personality/big-five/openness`
- en: `/en/personality/big-five/openness`

Do not use `/zh-CN` in public routes. Do not use `/en/big-five`.

Use only:

- `robots="noindex,follow"`
- `index_eligible=false`
- `sitemap_eligible=false`
- `llms_eligible=false`

Do not output boolean fields named `noindex`, `nofollow`, `indexable`, or `allow_index`.

Use lowercase `faq`. Use `sections` as an array.

Include all required keys:

- framework
- entity_type
- code
- locale
- slug
- title
- summary
- seo
- canonical
- hreflang
- robots
- launch_state
- index_eligible
- sitemap_eligible
- llms_eligible
- sections
- faq
- media
- schema
- method_boundary
- evidence_notes
- internal_links
- last_reviewed_at

Do not invent source IDs outside the source ledger. Do not copy result page text. Do not copy competitor wording.
