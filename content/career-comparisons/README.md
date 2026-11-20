# Career comparison local preview assets

734 fixed pairs × 3 locales. Each pair contains its unchanged source Markdown and matching input context. `manifest.json` binds the page and context file hashes. `zh-CN` assets use the `/zh/` reader path; English uses `/en/`; Traditional Chinese uses `/zh-TW/`.

The first four existing previews stay in `app/(localized)/[locale]/career-compare/[pair]/approvedPreviews.json` and remain bilingual. They are separate from these 734 pairs. The index therefore has 738 Simplified/English entries and 734 Traditional entries.

Local run (from this worktree):

```sh
FERMATMIND_FIXED_COMPARE_PREVIEW=1 pnpm exec next dev --webpack --hostname 127.0.0.1 --port 3164
```

Open `/zh-TW/career-compare`, `/zh/career-compare` or `/en/career-compare`. Search matches titles in all three languages and career slugs. In-page and header language navigation preserve pair identity. First-party content links stay on the local host; external citations keep their source URL. The Markdown files themselves are not rewritten for navigation.

Launch preparation: all locales share one reader and emit `noindex, follow` in metadata and HTTP headers. Readers are enabled by this release. `FERMATMIND_FIXED_COMPARE_ENABLED=0` disables the reader and entry links in every environment. No sitemap or llms inventory is added.

For a local production preview, build with the locked dependencies, then run `HOSTNAME=127.0.0.1 PORT=3165 FERMATMIND_FIXED_COMPARE_ENABLED=1 node .next/standalone/server.js`. The existing standalone packager accepts only the runtime three-language Markdown files; context JSON remains source-side.

The display layer hides module seven when it has no explicit sample-answer section. Source Markdown and source/context hashes are preserved. This is a display rule, not factual or professional validation. These assets retain their source jurisdictions; Traditional Chinese is a translation and does not imply Taiwan/Hong Kong legal localization. Deployment, payment acceptance and professional content review remain separate from local preparation.
