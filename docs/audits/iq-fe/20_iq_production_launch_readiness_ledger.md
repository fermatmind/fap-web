# IQ Production Launch Readiness Ledger

Scope: `IQ-RELEASE-01`.

Release disposition: controlled launch ready; production deploy not executed.

## Gate evidence

| Train item | Repository evidence | Gate conclusion |
| --- | --- | --- |
| `IQ-NORM-01` | fap-api PR #1799, merged 2026-05-31T13:00:29Z, commit `9a4352eccb33bd81b50a8715adf42c8858fdaca7` | IQ norm calibration authority foundation exists in backend. |
| `IQ-NORM-02` | fap-api PR #1802, merged 2026-05-31T14:51:58Z, commit `833485039afba630257b634b8ecadd386ce96b76` | Norm importer supports dry-run validation without committing real user data. |
| `IQ-NORM-03` | fap-api PR #1810, merged 2026-05-31T15:13:21Z, commit `fa144c9207c062c38238afc709ebb7f1e45274ba` | IQ score claims are unlocked only through backend norm authority gates. |
| `IQ-PAID-REPORT-01` | fap-api PR #1812, merged 2026-05-31T15:48:58Z, commit `60eabe326f7e24e71a1bef555493dc9a1d6e6f13` | Paid report entitlement contract is backend-defined. |
| `IQ-PAID-REPORT-02` | fap-web PR #943, merged 2026-05-31T16:12:12Z, commit `48793784c1d5c55b0271fa85322fd1b190d306b2` | Frontend renders entitlement states without taking payment authority. |
| `IQ-CMS-MEDIA-01` | fap-api PR #1817, merged 2026-05-31T16:27:40Z, commit `1b65569a048dede8461c3574616364ac901ed807` | CMS media authority metadata is backend-owned. |
| `IQ-CMS-MEDIA-02` | fap-web PR #944, merged 2026-05-31T16:40:02Z, commit `f119b06f00de632e7f7bcf1b8eb6bc08a0410211` | Frontend renders CMS media references without public static fallback assets. |
| `IQ-SEO-RAMP-01` | fap-api PR #1821, merged 2026-05-31T17:05:10Z, commit `ccaadfe1a34f486775e21ef55e79f74bca6487a0` | Backend CMS SEO ramp authority exists and remains claim-safe. |
| `IQ-SEO-RAMP-02` | fap-web PR #946, merged 2026-05-31T17:23:03Z, commit `db312b74cf954c6b3f2bac4d9e9d024b10d230ce` | Sitemap, llms, and JSON-LD exposure stay gated by backend `iq_ramp_authority`, claim policy, norm authority, and media authority. |
| `IQ-LIVE-RAMP-01` | fap-web PR #947, merged 2026-05-31T17:32:31Z, commit `9767723ca43c9d949d7d6b775bcfcf6fde7ae675` | Live smoke supports plan-only default plus env-only authenticated operator fixtures. |
| `IQ-OBS-01` | fap-api PR #1823, merged 2026-05-31T17:59:09Z, commit `1e8a6ebb10a4e21a0e50b6764916f75cda9d385b` | Production observability guards cover completion, norm miss, entitlement miss, scoring anomaly, and version drift without logging private payloads. |

## Authority checklist

| Gate | Required production position | Status |
| --- | --- | --- |
| Norm authority | Norm authority remains backend-only. Frontend and CMS must not infer formal IQ estimates or population percentiles. | Satisfied by `IQ-NORM-01` through `IQ-NORM-03`. |
| Claim policy | Public IQ estimate and percentile claims require backend claim-eligible norm authority. | Satisfied; SEO expansion remains gated. |
| Question provenance | FermatMind original IQ item bank only. MyIQ.Science remains behind license verification gate before any use. | Satisfied; no third-party IQ question replication. |
| Paid report | Entitlement is backend-defined; frontend only renders locked/full states from API payloads. | Satisfied; no checkout or payment implementation added in release ledger. |
| CMS media | Mutable marketing/editorial media must come from CMS media metadata. | Satisfied; no public static media fallback. |
| SEO ramp | Sitemap, llms, llms-full, and JSON-LD exposure must not bypass backend `claim_policy`, `norm_authority`, or `iq_ramp_authority`. | Satisfied; full expansion remains controlled by backend flags. |
| Smoke safety | Authenticated live submit/result/report checks require operator-provided env variables. | Satisfied; CI/local default remains plan-only. |
| Observability safety | Events may contain aggregate guard status only. | Satisfied; no answer keys, answer text, tokens, real user data, or paid report private fields. |

## Deferred risks

| Risk | Owner surface | Required gate before wider exposure |
| --- | --- | --- |
| Real production norm data import | fap-api backend norm authority | Dry-run validation, locked source metadata, license verification, and sample-size gate. |
| Authenticated production smoke execution | Operator-run smoke script | `IQ_OPERATOR_FIXTURE_BEARER_TOKEN`, `IQ_OPERATOR_FIXTURE_ATTEMPT_ID`, optional submit payload, and explicit mutation approval must be supplied outside the repo. |
| SEO full expansion | Backend CMS SEO authority and frontend SEO gates | Backend `jsonld_eligible`, `sitemap_eligible`, `llms_eligible`, claim policy, media authority, and norm authority must all pass. |
| Paid report file generation | Backend report service and commerce entitlement | PDF/certificate generation must not expose answer keys or private paid fields and must remain entitlement-gated. |

## Release checklist

- All named IQ production train PRs from `IQ-NORM-01` through `IQ-OBS-01` are merged.
- `IQ-RELEASE-01` is documentation and train-ledger only; it does not change runtime behavior or deploy production.
- No frontend editorial fallback content is introduced.
- No public static media fallback asset is introduced.
- No third-party IQ question source is copied or approved for use.
- No real user data, bearer token, answer key, answer text, or paid report private field is committed.
- SEO launch remains gated by backend CMS authority, backend claim policy, backend norm authority, and backend media authority.

## Release command boundary

This ledger is not a production deployment approval by itself. Production deploy remains a separate operator action after required environment, smoke, and monitoring checks are reviewed.
