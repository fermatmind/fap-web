# Production Performance Baseline 2026-07-12

PR train item: `PERF-BASELINE-01`

Runtime behavior changed: no.

This document freezes the evidence boundary, representative production baseline,
performance budgets, and acceptance rules for the July 2026 performance PR
train. It does not claim full-site field percentiles and does not authorize a
deploy, cache purge, CMS write, production import, or private-flow probe.

## Evidence Boundary

The source audit is `/tmp/fermatmind-production-performance-scan/` on the audit
machine. Its durable report is `final-performance-audit.md`; supporting evidence
includes `findings.json`, CSV/JSON summaries, HAR files, and screenshots.

Evidence classes must remain separate in later PR reports:

- **A - production observation:** low-frequency, read-only HTTP probes.
- **B - browser lab:** Playwright with local Chrome; useful for regression
  comparison, but not field Core Web Vitals.
- **C - repository evidence:** source and configuration inspection.
- **D - field data:** not acquired. No CrUX or RUM percentile is claimed.

The audit inventoried 2,674 backend-authoritative sitemap entries and 2,768
merged candidate URLs. Runtime sampling covered 140 URLs three times, 8 public
pages across 72 browser navigations, and 20 representative API URLs three
times. The decision was `PARTIAL`: the evidence is sufficient to prioritize
scoped repairs, but not to describe all-URL production p75 or field CWV.

## Frozen Baseline

| Surface | Baseline observation | Evidence |
| --- | --- | --- |
| Representative lightweight URLs | median of per-URL medians 284.3 ms; p75 321.5 ms | A |
| Sampled cold public pages | about 2.49 MB total transfer and 2.30 MB JavaScript | B |
| Warm desktop repeat views | about 26-28 KB transferred | B |
| Chinese mobile homepage | median LCP 3,320 ms; median wall time 11,907.6 ms | B |
| Career next-step API | 0/3 successful; timeout on every direct probe | A |
| EN personality cold misses | worst 7,894.6-12,971.7 ms on sampled pages | A |
| Personality detail API sample | median 738.5 ms; 540,250-byte body; private/no-cache | A |
| Published article APIs | about 525-535 ms; private/no-cache | A |
| Public career directory/detail | private/no-store; cold detail about 1.2-1.6 s | A |
| Backend sitemap source | median 2,506.5 ms; worst 6,740.2 ms despite cache hit | A |

These values are comparison anchors, not service-level objectives. A later PR
must use the same route family, locale, cache state, device profile, run count,
and percentile calculation when claiming an improvement.

## Performance Budgets

### Global regression budgets

- Public page correctness: sampled canonical public pages return successful
  HTML with no new private-flow exposure or authority fallback.
- L1/L2 protection: MBTI and Big Five required contracts remain green. No L3
  career/article work may regress their cache, rendering, or payload behavior.
- JavaScript: global-shell PRs must reduce cold shared JavaScript; they fail the
  performance goal if cold shared JS increases. Target: at least 20% reduction
  from the 2.30 MB browser-lab baseline after `GLOBAL-JS-02`.
- Browser LCP: no representative route-family median may regress by more than
  5% under the same lab profile. Chinese mobile home target: at or below 2,500
  ms after the global JavaScript work.
- Payload: no touched public API or HTML response may grow by more than 5%
  without documented, source-backed necessity.
- Errors: no new timeout, 5xx, protection page, or hydration error is accepted.

### Scope-specific budgets

| PR scope | Required acceptance signal |
| --- | --- |
| Career next-step backend | Valid representative slugs return within the endpoint's bounded timeout in focused tests; repeated reads prove slug/locale cache reuse; failures return a safe non-critical empty payload, not a 5xx. |
| Career next-step frontend | The non-critical rail has a short bounded wait and a graceful empty state; career detail rendering does not wait indefinitely for it. |
| Public API cache headers | Only anonymous published `org_id=0` GET responses become publicly cacheable/ETag-aware; result, order, payment, attempt, report, auth, and personalized responses remain `no-store`. |
| Career public caching | Unfiltered indexable directory/detail reads use bounded revalidation and tags; query, filter, private, and noindex states remain uncached. |
| Personality caching | A repeated public detail/SEO read reuses the stable read model; invalidation tests preserve publication authority. |
| Personality warmup/payload | Warmup is code/test only in the PR; representative public API payload decreases, with no field or content loss required by the public contract. |
| Article caching | Published detail/SEO use tagged revalidation and a request-shared loader; unpublished/private reads remain uncached. |
| Article fanout | Rendering no longer issues up to 24 article-detail calls for internal-link labels; focused tests cap the request pattern at one batch/precomputed read. |

## Measurement Protocol

For every runtime performance PR:

1. Capture the exact commit, route family, locale, cache state, device profile,
   run count, timeout, and concurrency.
2. Run focused deterministic tests before any production read-only comparison.
3. Use at least three serial samples for a representative endpoint or page;
   report median and worst observation. Do not label three samples as field p75.
4. Compare like with like: cold with cold, warm with warm, and identical request
   headers/query parameters.
5. Record response status, timing, transfer/body bytes, cache headers, ETag, and
   framework cache headers when present.
6. Treat private endpoint probing, production writes, CMS mutation, imports,
   cache purge, manual deploy, and production deploy as outside this train.

## PR Acceptance Matrix

Every PR must report:

- changed files and exact declared scope;
- focused local tests and required manifest checks;
- changed-file scope validation and `git diff --check`;
- before/after evidence when runtime performance changes;
- cache/privacy boundary tests when caching changes;
- deferred work and sidecar issues not introduced by the PR;
- repository rule impact, including CMS/backend authority and SEO/GEO impact;
- GitHub required checks, merge commit, branch cleanup, and post-merge
  revalidation when merged.

A PR stops when its scoped tests fail, required checks fail, scope drifts,
privacy/cache authority is ambiguous, or completion needs CMS writes, migration,
production import, manual approval, or deployment. Staging deployment status is
not a performance acceptance signal unless it is an explicit required check.

## Long-Term Operating Cadence

- Per PR: focused deterministic checks plus same-profile before/after evidence.
- Per release: read-only representative smoke for status, latency, payload, and
  cache headers; do not wait for staging deployment in this PR train.
- Weekly: representative route-family scan and slow page/API top-N comparison.
- Monthly: refresh the inventory and review budgets; preserve historical
  baselines instead of overwriting them.
- Quarterly: add field CWV/RUM evidence when an approved source exists. Until
  then, keep lab and production observations explicitly labeled.

## Repository Rule Impact

Content authority changed: no.

SEO/GEO enumeration changed: no.

Runtime behavior changed: no.

The backend/CMS remains authoritative for public content, metadata, sitemap,
`llms.txt`, personality, career, and article data. This baseline only defines
measurement and acceptance policy.
