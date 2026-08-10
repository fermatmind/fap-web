# Article → test coverage and click audit

Evidence closeout revalidated at: 2026-08-10T18:30:00+08:00

- CMS/public API CTA present: 129/129 (100.0%).
- Current live article HTTP 200: 129/129 (100.0%).
- CTA target pathname observed in server HTML: 129/129 (100.0%), after normalizing relative and absolute href forms.
- Target observed as public sitemap canonical: 127/129 (98.4%).
- Source contract VERIFIED: article detail uses `SeoTrackedCtaLink` and emits `article_to_test_click`.
- Current M04 aggregate GA4 observation: `article_to_test_click` = 3 events / 1 user; article URL attribution UNKNOWN.
- Production network click was not triggered because doing so would mutate analytics; actual delivery by article/device remains UNKNOWN.
- M04 backend truth is unavailable, and M06 is a proposed contract without an approved public topic-edge event. click→start, start→complete, result-ready and qualified complete by article therefore remain UNKNOWN.

The two sitemap mismatches are authority/enumeration observations, not evidence that the live CTA is absent. No CTA target in the generated package uses result/order/share/payment/history/private/token/session or user-specific paths. See [article_to_test_coverage.csv](article_to_test_coverage.csv).
