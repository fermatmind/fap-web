# Competitor URL Inventory Tracker Contract

Version: `competitor_url_inventory_tracker.v1`
Scope: `SEO-COMPETITOR-URL-00`
Status: `contract_design`

## 1. Purpose

The competitor URL inventory tracker is an external observation layer for SEO operations. It is intended to support competitor intelligence, URL gap analysis, issue queue inputs, and future CMS brief inputs.

It is not:

- FermatMind sitemap truth;
- CMS authority;
- search submission source;
- content generator;
- publish gate.

This PR defines a contract and sample schema only. It does not fetch live competitor sitemap data, generate a real competitor inventory, create a collector, connect search APIs, mutate CMS, create CMS drafts, publish content, submit search URLs, deploy code, or change runtime behavior.

## 2. Competitor Registry

The first contract version fixes these competitors:

| domain | display_name | market_focus | priority | known_content_families | sitemap_discovery_mode | notes |
| --- | --- | --- | --- | --- | --- | --- |
| `16personalities.com` | 16Personalities | global | P0 | tests, personality, articles, support | configured_or_standard | Observe type-library and test-entry coverage only; do not copy claims or deterministic identity framing. |
| `truity.com` | Truity | en | P0 | tests, career, articles, tools, support | configured_or_standard | Useful for test directory and career/personality commercial architecture. |
| `verywellmind.com` | Verywell Mind | en | P1 | articles, topics, support | configured_or_standard | Use as editorial/topic coverage signal only; sensitive claims require review. |
| `personalitymax.com` | Personality Max | en | P1 | tests, articles, tools | configured_or_standard | Observe test and result-education patterns. |
| `careerexplorer.com` | CareerExplorer | en | P0 | career, tools, articles | configured_or_standard | Observe career and occupation cluster coverage. |
| `123test.com` | 123test | global | P0 | tests, career, tools, support | configured_or_standard | Observe all-tests and category-directory patterns. |
| `iqtest.club` | IQTest Club | mixed | P2 | tests, tools | configured_or_standard | Observe IQ-test URL patterns with higher claim-risk caution. |
| `iqtest.com` | IQTest.com | en | P2 | tests, tools | configured_or_standard | Observe IQ-test entry architecture only; do not copy authority claims. |
| `brain-testing.org` | Brain Testing | mixed | P2 | tests, articles | configured_or_standard | Observe ability-test surface patterns with review-gated caution. |
| `enneagraminstitute.com` | The Enneagram Institute | en | P1 | tests, topics, articles | configured_or_standard | Observe Enneagram topic/test organization. |

Market focus values:

- `en`
- `zh`
- `global`
- `mixed`

Page family priority for analysis:

1. `tests`
2. `career`
3. `articles/topics`
4. `support/help`

## 3. Sitemap Discovery Rules

Discovery order:

1. Explicit configured sitemap URL.
2. `robots.txt` `Sitemap:` directives.
3. Standard `/sitemap.xml`.
4. Sitemap index expansion.
5. Gzip sitemap parsing.
6. Fail closed if sitemap is unavailable.

Rules:

- Do not run a full-site crawler in this contract.
- Do not bypass robots rules.
- Do not guess hidden sitemap URLs.
- Do not use authenticated, paid, private, or tokenized endpoints.
- Discovery failure is recorded as `unavailable`.
- Competitor discovery failure does not block FermatMind SEO, CMS publish, release, sitemap generation, or search submission workflows.

## 4. URL Normalization Rules

For every observed URL, retain `raw_url` and write a separate `normalized_url`.

Normalization policy:

- Remove query strings.
- Remove hash fragments.
- Remove tracking parameters such as `utm_*`, `gclid`, `fbclid`, `msclkid`, and similar analytics parameters.
- Normalize protocol to the configured canonical protocol, defaulting to `https`.
- Normalize host to the configured competitor host.
- Lowercase host.
- Apply the configured trailing slash rule.
- Preserve meaningful path case unless a competitor-specific policy later proves path case is non-semantic.
- Reject cross-domain URLs.
- Reject private, account, checkout, payment, result, token, or authenticated URLs as SEO opportunity targets.

The first contract version only defines these rules. It does not normalize live competitor data.

## 5. URL Family Taxonomy

| family | definition | common URL patterns | example paths | confidence rule | false-positive notes |
| --- | --- | --- | --- | --- | --- |
| `test_detail` | A page whose primary intent is taking, starting, or explaining one assessment/test. | `/test/`, `/tests/`, `/personality-test`, `/iq-test`, `/enneagram-test`, `/career-test` | `/test/example-personality-test`, `/tests/example-iq-test` | high when test noun and singular test intent both appear; medium when only category path appears | Article pages about tests can be misclassified; visible CTA/body evidence is needed in future generator. |
| `career_job` | A specific occupation/job profile page. | `/career/`, `/careers/`, `/jobs/`, `/occupation/`, `/career-profiles/` | `/careers/example-occupation`, `/jobs/example-role` | high when path indicates a specific occupation; medium for broad career category pages | Career advice articles are not job profiles. |
| `career_guide` | A career advice, guide, or decision-support page that is not a specific occupation. | `/career-advice/`, `/career-guide/`, `/careers/article/` | `/career-guide/example-topic`, `/career-advice/example-guide` | high when guide/advice term appears; medium when career path plus article format appears | Job listings and occupation pages must not be grouped here. |
| `article` | Editorial or educational article page. | `/article/`, `/articles/`, `/blog/`, `/learn/`, `/health/` | `/articles/example-topic`, `/blog/example-note` | high when article/blog path exists; medium when content hub path is broad | Tool landing pages and test pages often contain educational copy but are not articles. |
| `topic` | A glossary, hub, type, category, or conceptual topic page. | `/topics/`, `/types/`, `/personality-types/`, `/enneagram-types/`, `/category/` | `/topics/example-topic`, `/personality-types/example-type` | high when path is a stable topic/type hub; medium when category may be editorial | Topic hubs can overlap article lists; future HTML/title checks may refine. |
| `tool` | A calculator, quiz launcher, comparison tool, or utility that is not a core assessment detail page. | `/tool/`, `/tools/`, `/calculator/`, `/quiz/`, `/compare/` | `/tools/example-calculator`, `/compare/example` | high when utility term appears; medium when quiz may also be a test | Some tools are tests; prefer `test_detail` when assessment intent is primary. |
| `support` | Help, FAQ, contact, policy, about, or support content. | `/help/`, `/support/`, `/faq/`, `/about/`, `/contact/`, `/privacy`, `/terms` | `/help/example`, `/faq` | high for support/help/legal paths; medium for about/trust pages | Institutional trust pages may deserve separate future taxonomy. |
| `unknown` | URL cannot be safely classified from URL shape alone. | any unmatched path | `/example-path` | low | Unknown must stay unknown rather than forcing an opportunity. |

## 6. Locale Detection

Allowed locale values:

- `en`
- `zh`
- `mixed`
- `unknown`

Allowed detection methods:

- `path`
- `subdomain`
- `host`
- `html_lang`
- `hreflang`
- `unknown`

First contract version rules:

- Path, subdomain, and host patterns may be defined in config.
- `html_lang` and `hreflang` are future-observable fields only.
- This PR does not fetch HTML, so it must not pretend `html_lang` or `hreflang` has been observed.
- If locale evidence conflicts or is insufficient, use `mixed` or `unknown`.

## 7. Canonical / Hreflang Observation

Required fields:

- `canonical_observed`
- `canonical_url`
- `hreflang_observed`
- `hreflang_targets`
- `observation_source`
- `confidence`

First contract version rules:

- `canonical_observed` may be `unknown`.
- `hreflang_observed` may be `unknown`.
- `canonical_url` may be `null`.
- `hreflang_targets` may be an empty array.
- `observation_source` must state whether the value came from sitemap, HTML, HTTP header, or future adapter.
- This PR does not fetch HTML and therefore records no real canonical or hreflang observations.

## 8. Monthly Diff Schema

Each month compares the current contract-compatible inventory snapshot against the previous accepted snapshot.

Required diff buckets:

- `added_urls`
- `removed_urls`
- `persisted_urls`
- `reclassified_urls`
- `directory_delta`
- `family_delta`
- `locale_delta`
- `new_topic_clusters`
- `dropped_topic_clusters`

Diff rules:

- `added_urls` and `removed_urls` are keyed by `competitor_domain + normalized_url`.
- `reclassified_urls` records old and new `url_family`, confidence, and reason.
- `directory_delta` aggregates by first meaningful directory segment.
- `family_delta` aggregates by URL family.
- `locale_delta` aggregates by detected locale.
- Topic clusters are suggestions only and must not generate content automatically.

## 9. FermatMind URL Truth Alignment

Competitor inventory may read and compare against FermatMind `url_truth.inventory.v1` as a read-only baseline.

It may output:

- gap;
- opportunity;
- issue candidate;
- brief input candidate.

It must not:

- modify FermatMind URL truth;
- modify sitemap;
- modify `llms.txt` or `llms-full.txt`;
- create CMS content;
- create CMS draft;
- publish;
- submit search URLs.

Allowed opportunity types:

- `missing_test_family`
- `missing_career_cluster`
- `missing_article_topic`
- `missing_support_page`
- `thin_internal_coverage`
- `hreflang_gap`
- `locale_gap`
- `internal_link_gap`
- `schema_gap`
- `unknown`

Opportunity outputs are advisory. They must enter a human review workflow before any CMS draft, release checklist, or content brief is created.

## 10. Output Schema

JSON top-level fields:

- `version`
- `generated_at`
- `run_mode`
- `live_data_collected`
- `source`
- `competitors`
- `taxonomy`
- `normalization_policy`
- `discovery_policy`
- `records_sample`
- `monthly_diff_schema`
- `fermatmind_alignment`
- `risk_boundary`

CSV fields:

- `competitor_domain`
- `raw_url`
- `normalized_url`
- `url_family`
- `url_family_confidence`
- `locale`
- `locale_detection_method`
- `directory`
- `canonical_observed`
- `canonical_url`
- `hreflang_observed`
- `sitemap_source`
- `first_seen_month`
- `last_seen_month`
- `status`
- `notes`

## 11. Risk Boundary

This contract forbids:

- live scraping in this PR;
- runtime changes;
- CMS writes;
- CMS draft creation;
- publish actions;
- search submission;
- sitemap mutation;
- `llms.txt` or `llms-full.txt` mutation;
- automatic content generation;
- GSC, Baidu, GA4, DataForSEO, or Apify integration;
- production deploy.

Repository rule impact:

- FermatMind sitemap and URL truth remain backend/CMS/public-runtime authoritative.
- Competitor inventory is an external measurement surface only.
- SEO issue queue and brief inputs must remain sanitized, advisory, and human reviewed.
- No content surface, sitemap behavior, llms behavior, CMS workflow, runtime code, or deployment behavior changes in this PR.

## Recommended Follow-Up

Next suggested task: `SEO-COMPETITOR-URL-01` read-only generator.

The follow-up may implement an offline, rate-limited, fail-closed generator only after this contract is accepted. It must not run a crawler, mutate CMS, publish content, or submit search URLs without a later explicit contract and approval.
