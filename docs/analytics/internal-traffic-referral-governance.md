# Internal Traffic and Referral Governance

Scope: ANALYTICS-SEO-P0-03. This document records the engineering guardrails and dashboard configuration needed to keep production analytics clean.

Do not commit team IP addresses, personal emails, cookies, tokens, or analytics account screenshots containing private identifiers.

## Engineering Guardrails

Production browser analytics are allowed only when all of these are true:

- `NEXT_PUBLIC_ANALYTICS_ENABLED=true`
- deployment environment resolves to `production`
- browser hostname is in the allowed host list
- browser hostname is not local development
- route is not an admin, dashboard, internal, or analytics-dashboard surface
- referrer is not a known analytics dashboard host such as `tongji.baidu.com`
- analytics consent is granted

Default allowed hosts:

- `fermatmind.com`
- `www.fermatmind.com`

Optional environment override:

```env
NEXT_PUBLIC_ANALYTICS_ALLOWED_HOSTS=fermatmind.com,www.fermatmind.com
```

This override is for deployment host governance only. It must not contain team IP addresses.

## Dashboard Configuration Required

GA4:

- Add internal traffic rules and Data Filters for team and agency traffic.
- Use IP-based filters in GA4 Admin rather than frontend code.
- Add referral exclusions or unwanted referrals for analytics dashboards that can appear as acquisition sources.
- Confirm `tongji.baidu.com` does not appear as a user acquisition source after the filter window has enough data.

Baidu Tongji:

- Configure IP exclusion or internal visit filtering in the Baidu Tongji dashboard when available.
- Do not use frontend hardcoded team IP lists.
- Verify admin/dashboard visits are absent or clearly excluded from conversion goal reporting.

Operations:

- Use non-production measurement IDs for local, preview, staging, and QA environments.
- Keep production IDs out of local `.env` files unless a controlled production QA session is explicitly approved.
- If a production QA session is necessary, tag it with a QA UTM and document it outside the repository.

## QA Checklist

1. Localhost with analytics env enabled must not load `gtag/js` or `hm.baidu.com/hm.js`.
2. Preview/staging hostnames must not load production analytics scripts.
3. `/admin`, `/dashboard`, `/internal`, and localized equivalents must not dispatch browser analytics.
4. A browser session entered from `https://tongji.baidu.com/...` must not dispatch production browser analytics.
5. Public production pages on `fermatmind.com` may load analytics only after consent.
6. No raw team IP list exists in frontend source.

## Deferred Backend or Dashboard Work

The frontend can block obvious runtime pollution, but these items remain dashboard or infrastructure work:

- GA4 Data Filters for team IPs.
- Baidu Tongji internal visit exclusions.
- Referral exclusion policy for analytics dashboards.
- Separate production, preview, staging, and local analytics properties when operators need live QA.
