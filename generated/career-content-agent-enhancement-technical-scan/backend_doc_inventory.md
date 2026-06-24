# Backend Career Agent / Career Content Documentation Inventory

Verdict: `present_primary_backend_handbook`

## Key Finding

fap-api already has a maintained backend career handbook at `backend/docs/career/README.md`. It covers public 1046 cohort authority, runtime projection, discoverability, sitemap/llms consumption, historical PR timeline, and 10k rollout boundaries. It is a backend runtime/authority handbook, not a replacement for fap-web `.agents/skills/career-content-asset-factory`, which owns modular content generation/operator state.

## Important Existing Backend Documents

- `backend/docs/career/README.md`
- `backend/docs/seo/career-10k-rollout-architecture-spec-01.md`
- `backend/docs/seo/generated/career-1046-internal-linking-authority-01.v1.json`
- `backend/docs/seo/career-search-channel-readiness-gate-01.md`
- `.github/workflows/career-content-production-dry-run.yml`
- `.github/workflows/career-content-production-import.yml`
- `backend/config/career_content_page_assembly_assets.php`
- `backend/config/career_ai_impact_assets.php`
- `backend/config/career_salary_assets.php`

## Gap

There is no single backend document named "career content agent enhancement plan". The backend has runtime/import/discoverability docs; fap-web has the content-agent skill and generated state. Enhancement work should produce a cross-repo handoff before adding runtime APIs.
