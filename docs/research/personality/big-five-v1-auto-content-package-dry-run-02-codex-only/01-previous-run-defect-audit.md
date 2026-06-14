# Previous Run Defect Audit

Prior GPT/Chrome runs exposed automation instability and contract drift:

- canonical path violations: `/zh-CN/big-five/openness`, `/en/big-five/openness`; correct paths are `/zh/personality/big-five/openness` and `/en/personality/big-five/openness`.
- indexability violations: `noindex=false` and `nofollow=false`; correct fields are `robots=noindex,follow`, `index_eligible=false`, `sitemap_eligible=false`, `llms_eligible=false`.
- schema violations: JSON-like Markdown, sections object instead of `sections[]`, uppercase `FAQ`, missing seo/canonical/hreflang/media/schema, and wrong internal link paths.
- evidence gaps: DOI/URL metadata was recorded, but not all sources were full-text verified.

Conclusion: external model/browser automation is not stable enough as the default generator. Codex-native generation still requires raw draft audit and QA.
