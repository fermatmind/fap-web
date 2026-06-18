# Personality SEO Audit Artifacts

This directory stores read-only personality SEO/indexation audit artifacts.

## Re-run

```bash
AUDIT_DATE=2026-06-18 node scripts/seo/audit-personality-indexation.mjs
```

The script reads public production pages and public production exposure files:

- `https://fermatmind.com/sitemap.xml`
- `https://fermatmind.com/llms.txt`
- `https://fermatmind.com/llms-full.txt`
- MBTI A/T personality variant and A-vs-T comparison pages

It does not read private routes, use GSC credentials, submit URLs, import CMS content, or modify runtime behavior.

GSC metric fields are recorded as `Unknown` when credentials are unavailable. `Unknown` is not a pass or fail state.
