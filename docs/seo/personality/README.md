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

## Exposure matching

Sitemap exposure is based on exact normalized `<loc>` URL membership. `llms.txt` and `llms-full.txt` exposure are based on exact normalized URL sets parsed from those files.

Substring matches are not used for the main exposure fields. For example, `/en/personality/intj-a` must not be counted as exposed only because `/en/personality/intj-a-vs-intj-t` appears. Fuzzy diagnostic fields may be emitted for investigation, but they do not affect the main `in_sitemap`, `in_llms`, or `in_llms_full` values.
