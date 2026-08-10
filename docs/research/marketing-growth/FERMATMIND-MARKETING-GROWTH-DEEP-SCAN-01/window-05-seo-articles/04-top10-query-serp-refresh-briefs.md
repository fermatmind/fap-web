# Top 10 query × SERP refresh briefs

Evidence closeout revalidated at: 2026-08-10T18:30:00+08:00

Selection unit: locale-page. Cohort: 9 ZH + 1 EN. The original strategy-locked cohort is unchanged because M01 still has no query×page rows from which to justify replacement. Execution order is recalculated with current M01 page metrics and the controlled Brave Search snapshot. [article_serp_results.csv](article_serp_results.csv) has exactly 100 rows: ranks 1–10 for each query. This is a complete Top 10 for that provider capture, not a Google/GSC, city, personalized or future-rank guarantee.

| Priority | Refresh | Article | Current28 page clicks/impressions, position | Controlled SERP | Tier |
|---:|---|---|---|---|---|
| 1 | 04 | gaokao-major-adjustment-unacceptable-major-checklist | 1/1085, 6.58 | not observed Top 10 | P1 |
| 2 | 03 | enneagram-personality-test-explained | 4/620, 7.31 | rank 2 | P1 |
| 3 | 10 | what-is-riasec-holland-code-career-interest-test | 3/1637, 24.58 | not observed Top 10 | P1 |
| 4 | 08 | mbti-basics | 1/600, 16.73 | not observed Top 10 | P2 |
| 5 | 05 | riasec-holland-career-interest-test-explained | 0/207, 6.86 | rank 1 | P2 |
| 6 | 01 | big-five-tool-guide | 11/676, 7.91 | not observed Top 10 | P2 |
| 7 | 07 | major-career-mismatch-job-search-skills-plan | 0/211, 9.68 | rank 4 | P2 |
| 8 | 06 | iq-test-score-and-limits-explained | 0/118, 6.03 | rank 1 | P3 |
| 9 | 09 | big-five-emotional-stability-stress-recovery-communication | 0/146, 12.71 | rank 1 | P3 |
| 10 | 02 | are-infj-men-rare-or-socially-silenced | 6/209, 8.30 | not observed Top 10 | P3 |

Priority score = `impressions × max(0, 1 - CTR / position-bucket target CTR) / position + 10` when FermatMind is not observed in the controlled provider Top 10. Target CTRs are 5% for positions 1–3, 2% for 4–10, 1% for 11–20 and 0.5% for 21+. This is an operational ordering heuristic, not a ranking or conversion forecast. Query-level GSC fields stay Unknown; prior query signals are retained only as historical context inside each package.

Current title, meta, H1, observed snippet status, outline and internal links are preserved in [article_top10_current_state.json](article_top10_current_state.json) and attached to every package. Exact body, source, CTA, FAQ, claim boundary, unresolved Unknown and 7/14/28-day fields are in the aggregate package JSON and ten individual package files. Competitor pages were used only to identify answer gaps; no competitor copy or distinctive structure was reused.
