# Entertainment product content

This folder owns only the original, code-side entertainment family at `/{locale}/tests/play/{slug}`. It does not mirror or override backend assessment products, scoring, entitlements, or reports. Experimental interactive products may remain product-code-side under the backend working contract.

Each authored portrait also has a complete public guide at `/{locale}/tests/play/{slug}/results/{portrait}`. These are editorial assets, never private attempts. Public portrait path segments replace underscores in the unchanged result IDs with hyphens; the generator rejects collisions. Entries, completed quiz results and peer guides link to them. Root and tests-family sitemaps append only these declared guides when the backend source is healthy.

The bilingual `seo` block owns the test's concise search topic, description and specific reader question. Full guides consume the existing five portrait sections, actual rule examples and explicit peer comparisons, without career or MBTI inference. OG images render only these public labels using the locally subsetted Noto Sans SC font and its supplied OFL license. Emitted image URLs include the content version so a new edition gets a fresh cache key; no personal answer or score enters their URLs or pixels.

Each bilingual JSON is one product identity, containing its questions, explicit story rules, every result, and a substantive-update date. These are playful editorial stories, not validated scales. `catalog.json` and `loaders.ts` are small derived projections created by `scripts/content/build-fun-catalog.mjs`; never count locales or result types as separate tests.

Tally: add the selected option's declared points; show all tied leaders in the authored tie order. Branch: follow the declared next question until an explicit result. No randomness or MBTI mapping. The local contract exhausts every reachable answer path and checks each result. Questions and personal answers never enter a URL, analytics, or a server submission. Optional tab-session drafts expire after 24 hours and are cleared on completion or retake.
