# GSC Review Playbook

Use for daily or canary GSC evidence review from operator-provided exports only.

Inputs:

- GSC export or screenshot.
- Time range.
- Target URLs or article slugs.
- Known publish/canary date.

Steps:

1. Confirm source and time range.
2. Record clicks, impressions, CTR, average position.
3. List top pages and top queries.
4. Identify new pages with impressions.
5. Flag high-impression low-CTR pages.
6. Flag position 8-30 opportunities.
7. Check if any private URL appears.
8. Separate live GSC evidence from readiness-only docs.

Output: use `assets/daily_seo_signal_report_template.md` or `assets/canary_observation_template.md`.

No-go:

- Do not call GSC API.
- Do not submit URLs.
- Do not inspect private user data.
- Do not infer missing GSC data.
