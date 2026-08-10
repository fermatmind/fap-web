# Top 10 CMS refresh package QA

Captured at: 2026-08-10T12:00:00+08:00

Pre-generation QA contract:

- Package count = 10 locale-pages: PASS.
- Existing article identity and revision: PASS.
- `content_package_only=true`, draft intended, operator review, no draft/publish/search submit: PASS.
- Slug/canonical preserved: PASS.
- Public canonical CTA only: PASS.
- Visible FAQ count equals expected FAQ schema count (4): PASS.
- Unknown review fields preserved: PASS.
- EN V2 control marked required and unfrozen: PASS as handoff, promotion blocked.
- CMS import/publication executed: NO (required boundary).

The independent validation script reruns these gates after generation.
