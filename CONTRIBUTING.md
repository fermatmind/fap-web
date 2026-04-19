# Contributing

This repository follows the Night PR Train rules in `AGENTS.md`. Keep pull requests scoped, start from the latest `main`, run the manifest checks before push, and record PR train state transitions when a task is part of the train.

## Content Authority

FermatMind publishable content is CMS/backend-authoritative. Do not add or modify public editorial content directly in frontend files such as `app/`, `components/`, `lib/marketing/`, `public/`, MDX folders, JSON content sources, or other local content folders.

Content that must be managed through CMS/backend includes:

- Articles, article SEO, covers, categories, tags, related placement, and publication state.
- Homepage, tests hub, test category pages, career center modules, CTA text, ordering, featured items, and landing SEO.
- Help, policy, company, brand, careers, about, charter, foundation, privacy, terms, refund, support, and similar static pages.
- Career guides, career jobs, career recommendations, personality profiles, topics, FAQ, sections, and SEO.
- Mutable editorial, marketing, social, article, landing page, and SEO media assets.

Frontend may keep product code: rendering components, interaction flows, scoring logic, payment/order flows, API adapters, icons, fonts, fixed brand assets, SBTI product assets, loading states, empty states, and default error copy.

## Runtime Fallback

CMS-backed pages must not use frontend hardcoded editorial copy as runtime fallback. Use this order instead:

1. CMS/API response.
2. Stale last-known-good cached content.
3. Minimal shell or explicit empty/error state.

High-traffic hubs such as `/`, `/tests`, `/career`, and test category pages must not be migrated until stale-cache behavior is proven for that surface.

## Baselines And Imports

Backend content baselines are allowed for new environment setup, DB recovery, baseline imports, disaster recovery, and dry-run validation. They are not runtime rendering authority.

Large imports must validate schema and support dry-run before import, especially for career DOCX conversion, slugs, sections, SEO fields, media references, and publication state.

## Local Development

Local frontend development must be able to use local API, test/staging API, or mock API flows. Do not require production CMS access for routine UI development.

## PR Requirements

Any PR that touches content ownership, CMS/public APIs, SEO, sitemap or `llms.txt` generation, media handling, fallback behavior, or publishing workflow must include a `Repository rule impact` note in the PR body.

The note must state whether the changed surface is:

- CMS/backend-authoritative.
- Frontend product-code-only.
- Temporary migration fallback.
- Deprecated.

Temporary migration fallbacks must include an owner, removal condition, and target removal PR or issue.
