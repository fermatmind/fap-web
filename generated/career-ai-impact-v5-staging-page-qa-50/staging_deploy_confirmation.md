# fap-web Staging Deploy Confirmation

Conclusion: `FAP_WEB_STAGING_DEPLOYED_FOR_AI_IMPACT_QA`

## Runtime

- Public staging host: `https://staging.fermatmind.com`
- Runtime service: `fap-web-staging.service`
- Runtime directory: `/var/www/fap-web-staging/current`
- Runtime commit: `4834a1112059505463f800aba67b8f1f0f5ea9dd`
- Requested baseline commit included: `cf7225e092e0cbc336433f216ebc758b200c4b44`

## Environment

- `NEXT_PUBLIC_API_URL=https://staging.fermatmind.com`
- `NEXT_PUBLIC_SITE_URL=https://staging.fermatmind.com`
- `FAP_CAREER_AI_IMPACT_ASSET_PREVIEW_ENABLED=true`
- `FAP_CAREER_SALARY_ASSET_PREVIEW_ENABLED=true`

## Verification

- Staging page sample: `https://staging.fermatmind.com/zh/career/jobs/actuaries?aiqa=4834`
- `career-ai-impact-preview`: present
- `career-salary-asset-preview`: present
- Full 50-slug page QA result: `STAGING_PAGE_QA_50_PASS`

## Boundaries

- No staging data write was performed by fap-web QA.
- No production import was performed.
- No sitemap, `llms.txt`, canonical, noindex, or JSON-LD behavior was changed.
