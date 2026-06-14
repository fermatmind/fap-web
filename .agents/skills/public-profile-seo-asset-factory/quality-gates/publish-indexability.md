# Publish And Indexability Gate

Publication requires all of:

- Explicit user approval for publish/indexability PR.
- Backend authority confirms `launch_state=published`.
- `index_eligible=true`.
- `robots=index,follow`.
- `sitemap_eligible=true` only in sitemap PR.
- `llms_eligible=true` only in llms PR.
- Canonical and hreflang pass.
- Duplicate/cannibalization audit passes.
- Live route smoke passes.

No L1/L2/L3 run may modify sitemap, llms, public generated sitemap, or indexability flags.
