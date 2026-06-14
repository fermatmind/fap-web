# GPT Bilingual Independent Draft Prompt

Draft zh-CN and en content independently for the same public profile asset.

## Rules

- Do not translate one locale mechanically from the other.
- Keep the same structure and claims across locales.
- Use locale-appropriate examples.
- Preserve the same method boundary.
- Mark claims without sources as inference.

## Output

Return two package fragments:

- `en`
- `zh-CN`

Each fragment must include title, summary, seo, sections, FAQ, method boundary, evidence notes, and internal links.
