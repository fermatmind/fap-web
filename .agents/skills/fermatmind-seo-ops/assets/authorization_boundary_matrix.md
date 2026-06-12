# Authorization Boundary Matrix

| Action | Default status | Pre-authorizable | Requires exact approval | Must stop |
| --- | --- | --- | --- | --- |
| Content package QA | Allowed | No | No | No |
| Deterministic route autofix | Held | Yes | No | Unknown route |
| Social image default asset selection | Held | Yes | No | Missing real asset |
| Field length deterministic meta-title fix | Held | Yes | No | Cannot preserve primary keyword |
| Production draft dry-run | Allowed | No | No | Command unavailable |
| Production draft import | Held | Yes | No | No rollback proof after failure |
| Authenticated preview QA | Held | Yes | No | Login/CAPTCHA failure |
| Publish metadata autofill | Held | Yes | No | CMS authority unavailable |
| Publish rehearsal | Held | Yes | No | Dry-run errors |
| Controlled publish | Held | Yes | Maybe, if command demands | Article ID mismatch |
| Make indexable | Held | Yes | No | Claim/private guard failure |
| Sitemap/llms release | Held | Yes | No | Private URL exposure |
| llms-full generation/convergence | Held | Yes | No | Degraded mode persists |
| URL Truth refresh | Held | Yes | No | Authority mismatch |
| Search Channel Queue enqueue | Held | Yes | No | Channel ambiguity |
| IndexNow bounded submission | Held | Yes | Yes, if executor demands | Dry-run issues |
| GSC manual inspection | Held | Yes | No | CAPTCHA/login failure |
| GSC Request Indexing | Hard stop | No | Yes | Always stop unless exact approval |
| Baidu readiness | Held | Yes | No | Platform-side blocker |
| Baidu live push | Hard stop | No | Yes | Site init fail or live gate disabled |
| Scoped PR merge | Held | Yes | No | Checks failed |
| Scoped backend deploy | Held | Yes | Yes, if exact SHA required | Migration/env/secret/auth/payment/security risk |
| Scoped frontend deploy | Held | Yes | Yes, if exact SHA required | Target SHA ambiguous |
| Schema enablement | Hard stop | No | Yes | Implicit request |
| Hreflang enablement | Hard stop | No | Yes | Implicit request |
