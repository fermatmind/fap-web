# Next PR Decision

## Candidate Repair PRs

### `MBTI-MAIN-FAQ-WEB-ADAPTER-PROPAGATION-REPAIR-01`

Decision: not recommended from current evidence.

Reason: cache-bust production HTML renders 8 visible FAQ entries from `content_i18n_json.zh.faq`.

### `MBTI-MAIN-FAQ-CACHE-REVALIDATION-REPAIR-01`

Decision: recommended if canonical URL continues serving stale 4-entry HTML.

Reason: canonical URL returned `x-proxy-cache: STALE` and 4 FAQ entries, while cache-bust URL returned `x-proxy-cache: MISS` and 8 FAQ entries.

Likely scope should stay around cache/revalidation/readback mechanics. Do not change FAQ content, schema renderer, sitemap, llms, CMS content, or Search Channel.

### `MBTI-MAIN-FAQ-RUNTIME-DATA-SOURCE-REPAIR-01`

Decision: not recommended from current evidence.

Reason: the current runtime data source can consume the scale lookup payload and render 8/8 when stale canonical HTML is bypassed.

## Readback Gate

After cache propagation or repair, run:

`MBTI-MAIN-FAQ-PRODUCTION-RUNTIME-READBACK-02`

Pass criteria:

- API FAQ = 8
- visible FAQ = 8
- FAQPage JSON-LD = 8
- visible questions == JSON-LD questions
- private URL boundary pass

Only after that should `MBTI-MAIN-FAQ-D0-OBSERVATION-BASELINE-01` start.
