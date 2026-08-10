# Article → test coverage and click audit

Evidence closeout revalidated at: 2026-08-10T17:22:06+08:00

- CMS/public API CTA present: 129/129 (100.0%).
- Current live article HTTP 200: 129/129 (100.0%).
- CTA target pathname observed in server HTML: 129/129 (100.0%), after normalizing relative and absolute href forms.
- Target observed as public sitemap canonical: 127/129 (98.4%).
- Source contract VERIFIED: article detail uses `SeoTrackedCtaLink` and emits `article_to_test_click`.
- Current M04 aggregate GA4 observation: `article_to_test_click` = 3 events / 1 user; article URL attribution UNKNOWN.
- Production network click was not triggered because doing so would mutate analytics; actual delivery by article/device remains UNKNOWN.
- M04 production read-only acceptance covered 2026-07-13 through 2026-08-09. Exact ID/slug/locale/canonical locks passed for 112 articles, and the available backend aggregate recorded zero CTA clicks, zero starts and zero completes for each; zero is valid only for these returned rows.
- Seventeen requested articles were not returned by the public/indexable exporter and remain Unknown. No reason is inferred from absence.
- click→start and start→complete remain Unknown because every safe denominator is zero. No non-monotonic aggregate warning was observed, and the counts are not presented as a causal funnel.
- The M06 measurement/read-model contract is merged, the public topic-edge click runtime callsite is implemented without deployment proof, and M07 emits backend-authoritative `result_ready`. The deployed revision observed by M04 predates #3593/#3596. `result_ready` has no article identity in its aggregate dimensions, so all 129 rows remain Unknown; `view_result_count` was not substituted. Qualified completes also retain their existing Unknown contract boundary.

The two sitemap mismatches are authority/enumeration observations, not evidence that the live CTA is absent. No CTA target in the generated package uses result/order/share/payment/history/private/token/session or user-specific paths. See [article_to_test_coverage.csv](article_to_test_coverage.csv).
