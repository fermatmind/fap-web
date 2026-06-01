# PR-FDN-SOCIAL-LINK-DISPLAY-REVIEW-01 Report

## Executive Summary

This read-only fap-web review confirms that Foundation Daily Giving pages are live, but manual social post URLs are not yet displayed by the frontend.

The backend MVP stores manual social URLs in existing Daily Giving fields. The current fap-web adapter does not normalize those fields into the `DailyGivingRecord` model, and the record card does not render any social-link block.

## Dependency State

- `PR-FDN-02B` is merged in fap-web at `63198640ff1132e6bea46a128ea5ede5bea08075`.
- `PR-FDN-SOCIAL-SYNC-MVP-01` is merged in fap-api at `74b2639141dc9e1e7f40a15718913d7447e37f93`.
- The production Daily Giving frontend route returns `200` for both English and Chinese index pages.

## Production Runtime Observation

- `https://fermatmind.com/en/foundation/daily-giving`: `200`
- `https://fermatmind.com/zh/foundation/daily-giving`: `200`
- `https://fermatmind.com/api/v0.5/foundation/giving-records?locale=en&limit=5`: `200`, with `items=[]` at review time.

Because the public API returned no records during the review, no production social-link sample could be observed. This does not block the code-level display gap finding.

## Frontend Display Gap

Current fap-web state:

- `lib/foundation/dailyGiving.ts` normalizes donation record identity, amount, recipient, evidence, and status fields.
- It does not normalize `social_x_url`, `social_linkedin_url`, `social_weibo_url`, `social_xiaohongshu_url`, or `social_other_links`.
- `components/foundation/DailyGivingLedgerPage.tsx` renders date, recipient, and evidence, but no social link section.

## Safety Boundary

This review did not add frontend fallback content, local editorial records, CMS mutation, deploy steps, Search Channel action, URL submission, external social API calls, credential handling, or automatic posting.

## Recommendation

Proceed with a scoped fap-web implementation PR:

`PR-FDN-SOCIAL-LINK-DISPLAY-IMPLEMENTATION-01`

Recommended scope:

- Extend `DailyGivingRecord` with a backend-authoritative `socialLinks` array.
- Normalize only existing backend fields.
- Render a compact social links row inside each Daily Giving record card when links are present.
- Keep empty social links hidden.
- Preserve noindex and no sitemap/llms/footer/Search Channel exposure changes.

## Final Decision

`pr_fdn_social_link_display_review_completed_with_display_gap`

## Next Task

`PR-FDN-SOCIAL-LINK-DISPLAY-IMPLEMENTATION-01`
