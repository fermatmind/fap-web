# CMS Frontend Audit Report

> Current status: the previous March 2026 Velite/MDX audit is obsolete. The frontend content directories for articles, career content, test landing pages, local personality type pages, and local share templates have been removed.

## Current Authority

- Articles are served by backend CMS APIs.
- Career jobs, guides, recommendations, and first-wave discoverability are served by backend APIs or backend-owned baselines.
- Test landing catalog and landing metadata is served by `/api/v0.3/scales/catalog` and `/api/v0.3/scales/lookup`.
- Personality profile pages are served by backend personality APIs.
- Topics are served by backend topic APIs where available.
- Company, policy, and help pages are served by backend ContentPage APIs.
- Homepage, tests hub, tests category, and career center marketing modules are served by backend LandingSurface/PageBlock APIs.
- Replaceable share/social media assets are governed by backend MediaAsset/MediaVariant APIs, Media Library upload forms, automatic variant generation, and baseline imports.
- Share templates are owned by backend content packages.
- Replaceable share/social media assets are served from backend static media paths.

## Frontend Boundary

The frontend should render public API responses and keep only product code, UI components, routing, interaction flows, and non-editorial product assets. It must not reintroduce local article, career, test, personality, help, policy, share-template, marketing-surface, or replaceable share/social media content directories.

## Publishing SOP

1. Editors create or update content in the backend admin workspace.
2. Replaceable images are uploaded to Media Library with alt, caption, and credit. The backend stores the source image and automatically generates hero, card, thumbnail, OG, and preload variants.
3. Landing pages are configured through LandingSurface records and ordered PageBlock payloads.
4. Editors submit the record for the existing review/release workflow where applicable.
5. Published records become available through public CMS APIs.
6. The frontend renders public API payloads only; sitemap, llms, SEO metadata, and page JSON-LD enumerate backend-owned content.
7. Frontend fallbacks for editorial body, cover image, article list, marketing module order, or replaceable media are not allowed.

## Remaining Migration Work

- Product-owned result-rendering copy and MBTI desktop clone rendering modules remain frontend product code until the report engine receives an equivalent backend contract.
- Product-owned result-rendering copy and MBTI desktop clone rendering modules remain frontend product code until the report engine receives an equivalent backend contract.
