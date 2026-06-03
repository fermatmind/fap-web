# Commercial Readiness Sprint Ledger

Date: 2026-06-03

Scope: `COMMERCIAL-READINESS-TRAIN-00`

This document registers the June 1 to July 1 Commercial Readiness Sprint. The sprint goal is a small-budget, auditable commercial ignition path, not large-budget multi-channel paid growth.

## Operating Boundary

- Codex does not write article, ad, social, public-benefit, or marketing content assets.
- GPT-5.5 Pro is the owner for approved content assets.
- CMS/backend remains the publish authority for CMS-backed content, SEO metadata, article state, and public discoverability state.
- This sprint starts with read-only scans and docs-only ledger work before any repair PR.
- No CMS draft, publish, unpublish, search submission, production write API, deployment, or secret read is authorized by this ledger entry.

## Day 1 Scan Train

| PR id | Repo | Purpose | Initial status |
| --- | --- | --- | --- |
| `PRIVACY-ORDER-RESULT-SAFETY-SCAN-01` | `fap-web` | Scan private route, order, result, share, payment, history, canonical, sitemap, llms, and analytics leakage risk. | planned |
| `ANALYTICS-COMMERCIAL-EVENTS-SCAN-01` | `fap-web` | Scan commercial event taxonomy, GA4/Baidu alignment, first-party `/api/track`, privacy, dedupe, and attribution gaps. | planned |
| `FREEMIUM-LOCALE-POLICY-SCAN-01` | `fap-api` | Scan EN free-full and ZH partial-plus-unlock freemium readiness across backend/frontend evidence. | planned |
| `DAILY-GIVING-OPS-READINESS-SCAN-01` | `fap-api` | Scan Daily Giving model, resource, API, storage, proof, noindex, claim, and public amplification readiness. | planned |

## P0 Follow-Up Placeholders

The following placeholders are registered for later authorization only. They are not executed by `COMMERCIAL-READINESS-TRAIN-00`.

- `PRIVACY-ORDER-RESULT-SAFETY-01`
- `ANALYTICS-COMMERCIAL-EVENTS-01`
- `UTM-CHANNEL-GOVERNANCE-01`
- `FREEMIUM-LOCALE-POLICY-01`
- `CHECKOUT-UNLOCK-FUNNEL-SMOKE-01`
- `ADS-ATTRIBUTION-PREFLIGHT-01`
- `CLAIM-BOUNDARY-ADS-GATE-01`
- `DAILY-GIVING-OPS-READINESS-01`
- `COMMERCIAL-READINESS-REVIEW-01`
- `ADS-PILOT-GO-NOGO-01`

## Stop Conditions

If a scan finds `private_url_seen=Yes`, freeze the following until a dedicated repair PR and revalidation pass:

- CMS publish or unpublish work
- GSC, Baidu, IndexNow, or sitemap submission
- paid ads
- public amplification of the affected surface
- Search Channel queue creation

Daily Giving records and proof must not be publicly amplified until the Daily Giving readiness scan verifies a safe model/resource/API/storage/proof/noindex/claim path.

## Day 1 Output Rule

Each scan PR should produce a docs-only report with a GO/NO-GO decision, the highest P0 blocker, and the exact next repair PR scope. Repair PRs require separate user authorization after Day 1.
