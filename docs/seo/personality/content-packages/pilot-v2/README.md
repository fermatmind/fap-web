# MBTI64 Pilot V2 Content Package QA

This directory stores the extracted GPT-5.5 Pro V2 pilot content package for scan-only QA.

The original ZIP is not committed. Its SHA256 is recorded in:

- `../content-package-v2-qa-2026-06-18.json`
- `../content-package-v2-qa-2026-06-18.md`

Rerun the local QA scan from the repository root:

```bash
AUDIT_DATE=2026-06-18 \
INPUT_ZIP=/Users/rainie/Desktop/mbti64-content-package-pilot-v2-final.zip \
node scripts/seo/validate-mbti64-content-package-v2.mjs
```

This package is not imported into CMS, not published, and not used to change sitemap, `llms.txt`, `llms-full.txt`, frontend rendering, result pages, scoring, payment, account, or search submission behavior.
