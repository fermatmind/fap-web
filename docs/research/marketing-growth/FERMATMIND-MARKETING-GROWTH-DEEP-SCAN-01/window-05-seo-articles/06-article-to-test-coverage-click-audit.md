# Article → test coverage and click audit

Acceptance revalidated at: 2026-08-10

- CMS/public API CTA present: 129/129 (100.0%).
- Current live article HTTP 200: 129/129 (100.0%).
- CTA target pathname observed in server HTML: 129/129 (100.0%), after normalizing relative and absolute href forms.
- Target observed as public sitemap canonical: 127/129 (98.4%).
- Source contract VERIFIED: article detail uses `SeoTrackedCtaLink` and emits `article_to_test_click`.
- Historical GA4: 3 aggregate events / URL attribution UNKNOWN.
- Production network click was not triggered because doing so would mutate analytics; actual delivery by article/device remains UNKNOWN.
- click→start, start→complete, result-ready and qualified complete by article remain UNKNOWN pending M04/M06 and backend reconciliation.

The two sitemap mismatches are authority/enumeration observations, not evidence that the live CTA is absent. No CTA target in the generated package uses result/order/share/payment/history/private/token/session or user-specific paths. See [article_to_test_coverage.csv](article_to_test_coverage.csv).
