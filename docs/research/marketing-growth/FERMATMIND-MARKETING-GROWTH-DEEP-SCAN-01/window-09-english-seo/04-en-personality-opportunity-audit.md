# EN Personality page-level opportunity audit

Status: `EN_PERSONALITY_PAGE_LEVEL_AUDIT_COMPLETE_CANDIDATES_NOT_APPLIED`

Captured at: `2026-08-10T07:44:29Z`

This E03 audit replaces the incomplete 11-row family/page mixture with 175 unique, existing, backend-authoritative EN detail pages. It consumes and preserves the Window 4 query-owner contract; Window 9 adds exact M01 market/device evidence and candidate decisions but does not reassign owners.

No CMS, runtime, metadata, internal-link, canonical, hreflang, schema, sitemap, llms, noindex, indexability, or deployment change is applied.

## In-scope public cohort

| Framework | Existing detail-page types | Pages | Live public API revalidation |
|---|---|---:|---|
| MBTI | 16 base types, 32 A/T variants, 16 existing A/T comparisons, 7 existing held cross-type comparisons | 71 | All observed public; the 7 cross-type pages remain noindex, outside sitemap/llms, and non-search owners |
| Big Five | 5 domains, 15 poles, 30 facets | 50 | 52 assets observed; hub and facet hub excluded |
| Enneagram | 9 core types, 18 wings, 27 instinctual subtypes | 54 | 58 assets observed; hub and 3 centers excluded |
| Total | Existing detail pages only | 175 | All included canonicals map to the Window 4 owner contract and backend public authority |

The cohort intentionally excludes hubs/centers and every prohibited expansion: no new MBTI type×type, type×career, type×problem, Big Five “official 32 types,” Big Five combinations, Enneagram 54 wing×instinct matrix, Tritype, cross-framework combination, or Personality×Career recommendation route. The seven already-existing cross-type comparisons are retained only as held, public/noindex rows; this audit does not release or expand them.

Live API evidence is a read-only public projection. The complete canonical/title/meta/H1/authority mapping remains the SHA-bound Window 4 inventory.

## Exact data method

Sole GSC source: M01 `gsc_query_page_country_device.csv`, SHA-256 `9b7c470aa39aff0e6062c41fe5d71e2e8164159747953d42bd032046cc10f691`.

Windows:

- `current28`: `2026-07-13/2026-08-09`
- `prev28`: `2026-06-15/2026-07-12`
- `day90`: `2026-05-12/2026-08-09`

For every page, `en_personality_opportunities.csv` records:

- canonical, entity, framework/type, backend authority, public/robots/sitemap state, and URL-level indexing limitation;
- current title, meta description, H1, visible word count, differentiation, claim boundary, and editorial-review status;
- the Window 4 owned-query cluster and ownership decision;
- exact returned current28 query evidence and competing/cannibalizing pages without changing the upstream intended owner;
- `US`, `UK`, `OTHER`, and independent `GLOBAL` metrics crossed with `ALL`, desktop, mobile, and tablet for all three windows;
- clicks, impressions, CTR, impression-weighted position, and source-row count for each returned market/device cell;
- inventory inbound/outbound counts, assessment owner, G03 article-edge candidate counts, Career dependency, decision, and candidate contract.

`UNKNOWN` means M01 did not return a safe top-row aggregate for that cell. It never means zero. Country is not language, and route locale is used only to select the EN authority cohort. `GLOBAL` is an independent full-row view and is not summed into the mutually exclusive `US`/`UK`/`OTHER` group.

## Page-level evidence result

| Window | Pages with returned evidence | Impressions | Clicks |
|---|---:|---:|---:|
| current28 | 63 | 1,704 | 4 |
| prev28 | 24 | 333 | 0 |
| day90 | 67 | 2,082 | 4 |

Current28 by framework:

| Framework | Total pages | Pages returned | Impressions | Clicks |
|---|---:|---:|---:|---:|
| MBTI | 71 | 13 | 1,080 | 3 |
| Big Five | 50 | 17 | 168 | 0 |
| Enneagram | 54 | 33 | 456 | 1 |

The remaining 108 pages are backend-authoritative existing or explicitly held owners with no returned M01 row in any of the three windows. Their search performance is `INSUFFICIENT_DATA`, not zero and not ownerless. The seven held cross-type pages remain `HELD_NOT_SEARCH_OWNER` regardless of missing GSC rows.

Decision distribution:

| Decision | Pages | Meaning |
|---|---:|---|
| `METADATA_EXPERIMENT` | 5 | One-page CMS-authority candidate, not applied |
| `INTERNAL_LINK_REPAIR` | 1 | Governed same-locale edge candidate, not applied |
| `PROTECT` | 2 | Returned clicks; preserve owner and monitor |
| `HOLD` | 59 | Returned evidence but too sparse for a change decision |
| `INSUFFICIENT_DATA` | 108 | No safe row returned across the three windows; includes seven held non-search owners |

## Candidate contract

Every candidate below has `applied=false`. A future implementation would require one separately scoped backend CMS/link-authority PR, one surface-level change, exact prior revision capture, and post-change owner/claim guardrails.

### Metadata candidates

| Exact page/current owner | Exact current28 query evidence | Current snippet gap | Proposed direction | Claim risk |
|---|---|---|---|---|
| `/en/personality/intp-a` | `intp-a`: 421 impressions, 0 clicks, position 8.2233; `intp a`: 264/1/9.0189; `intp-a meaning`: 142/1/10.5775 | 965 page impressions, 2 clicks, position 9.0788; entity intent is concentrated in three exact variants | Align entity-first title/meta/H1 with meaning intent while keeping A/T a non-diagnostic pattern modifier | No diagnostic, fixed-identity, ability, hiring, or outcome claim |
| `/en/personality/enneagram/wings/3w2` | `3w2`: 83/0/8.6506; `3w2 enneagram`: 12/0/15.2500; `enneagram 3w2`: 7/0/9.7143 | 117 page impressions, 0 clicks, position 9.9060 | Lead with a concise meaning; Type Three stays primary and Two is a wing hypothesis | No certainty, diagnosis, fixed identity, or prediction |
| `/en/personality/enneagram/wings/5w4` | `5w4`: 21/0/12.7143; `5w4 meaning`: 9/0/11.5556; `enneagram 5w4`: 9/0/13.8889 | 61 page impressions, 0 clicks, position 13.9836 | Lead with a concise meaning; Type Five stays primary and Four is a wing hypothesis | No certainty, diagnosis, fixed identity, or prediction |
| `/en/personality/big-five/facets/dutifulness` | `dutifulness`: 26/0/5.0000; `dutifulness meaning`: 16/0/8.7500; `dutiful personality definition`: 5/0/10.6000 | 47 page impressions, 0 clicks, position 6.8723 | Clarify this as a Big Five facet and observable tendency | No morality, ability, virtue, or fixed verdict |
| `/en/personality/big-five/neuroticism-low` | `low neuroticism`: 22/0/14.8182; `low neuroticism meaning`: 11/0/8.5455; `what is low neuroticism`: 5/0/10.0000 | 42 page impressions, 0 clicks, position 12.0952 | Clarify the low-Neuroticism polarity on the current canonical | Do not revive `emotional-stability` or historical `high-*`/`low-*` aliases as canonical owners; no diagnosis |

Required authority: the exact `fap-api` personality profile/variant or personality-content-asset CMS owner named in the CSV. Frontend copy or local fallback is not permitted.

Expected measurement: exact query×page clicks, impressions, CTR, and position by `US`/`UK`/`OTHER` and device at T+7/T+14/T+28, with Window 4 intended-owner share preserved. Sparse volume must be reported as insufficient data rather than success.

Rollback: restore the exact prior CMS metadata revision if the claim boundary drifts, current owner cannibalization worsens, routing/rendering regresses, or comparable qualified search/funnel signals materially decline.

### Internal-link candidate

Exact page/current owner: `/en/personality/esfj`.

Exact current28 evidence: 35 impressions, 0 clicks, position 40.5143. Leading returned queries are `esfj` (11 impressions), `esfj personality` (7), and `esfj personlighed` (3). Window 4 records 0 inbound and 0 outbound inventory links for this published canonical.

Candidate direction: add governed, same-locale contextual inbound edges from existing personality owners using the established ESFJ meaning/personality owner intent. Do not create a route, add a Career recommendation, or treat a G03 candidate edge as runtime authority.

Required authority: backend CMS/public link authority plus the Window 4 owner contract. G03 governed candidate rows are supporting evidence only.

Expected measurement: re-crawl the exact governed edge, verify locale/owner/anchor identity, and compare exact ESFJ owner-query GSC metrics by market/device at T+7/T+14/T+28. Do not rely on the not-yet-deployed G03 click-event contract.

Rollback: remove only the exact new governed edge and restore the prior CMS/link revision if owner mismatch, locale drift, claim risk, or navigation regression appears.

## Editorial and edge limitations

The 168 indexable-detail rows retain exact current title/meta/H1 from Window 4 authority. The seven held cross-type rows use the current public API SEO title, description, and reader title/H1 projection captured in E03. Targeted metadata/H1 readability was reviewed only for the six candidates; full native-English body review and translationese risk remain `UNKNOWN` for the broader cohort. This audit does not convert a metadata review into content-quality proof.

Window 4 inbound/outbound counts are inventory evidence, not typed runtime-edge proof. G03 article/personality and Career-related rows are governed candidates; the CSV reports their counts and blockers but never marks them live. Career edges remain dependency-gated and cannot become recommendations.

Assessment CTAs retain the Window 4 framework-specific test owner. No per-page conversion claim is made because trusted page-level CTA conversion evidence was not supplied in this scope.

## Expansion and implementation decision

- `STOP_EXPANSION` for every prohibited new pSEO family listed above.
- `HOLD` implementation until a candidate receives a separate exact backend-authority scope.
- `applied=false` for all 175 rows and all six candidates.
- No owner reassignment, CMS/runtime write, new route, Career recommendation, or unsupported psychometric claim.

## Repository rule impact

None. This PR completes a read-only audit and records unapplied candidates. It does not change content ownership, backend CMS models, public API contracts, publishing SOP, frontend fallback behavior, or SEO discoverability surfaces.
