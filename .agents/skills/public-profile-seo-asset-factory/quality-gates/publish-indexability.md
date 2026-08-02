# Publish And Indexability Gate

Publication requires all of:

- A separately controlled publish/indexability scope; a V2 promotion receipt cannot authorize it.
- Backend authority confirms `launch_state=published`.
- `index_eligible=true`.
- `robots=index,follow`.
- `sitemap_eligible=true` only in sitemap PR.
- `llms_eligible=true` only in llms PR.
- Canonical and hreflang pass.
- Duplicate/cannibalization audit passes.
- Live route smoke passes.
- The public revision pointer references the backend-published revision verified by independent W9/QA and the trusted backend receipts; a working revision is ineligible.

No L1/L2/L3 run may modify sitemap, llms, public generated sitemap, or indexability flags.
