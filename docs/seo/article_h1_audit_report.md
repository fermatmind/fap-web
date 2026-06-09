# Article H1 Audit Report

Generated: 2026-06-09T06:32:37.741Z

## Scope

This report is observation-only. It audits public article detail pages from the live sitemap and does not change article rendering, CMS content, article titles, metadata, body, FAQ, CTA, or backend validation behavior.

## Inputs

- Sitemap: https://fermatmind.com/sitemap.xml
- Site: https://fermatmind.com
- Sitemap status: 200
- Live article detail URLs discovered: 32
- Runner: playwright-chromium-final-dom
- Sample strategy: seeded_random_from_live_sitemap_article_detail_urls
- Sample seed: ARTICLE-H1-03
- Requested sample size: 20
- Actual sample size: 20

## Summary

- Passed: false
- Audited pages: 20
- Passed pages: 13
- Failed pages: 7
- H1 count distribution: 1=13, 2=7
- Audit issue count: 1

## Audited Article Pages

| status | H1 count | URL | H1 text | issues |
| --- | ---: | --- | --- | --- |
| 200 | 1 | https://fermatmind.com/en/articles/big-five-personality-test-vs-mbti | Big Five Personality Test: Is It More Scientific Than MBTI—and What Can It Really Tell You? | none |
| 200 | 2 | https://fermatmind.com/zh/articles/are-infj-men-rare-or-socially-silenced | “INFJ 男性很少见”还是“高敏感男性更容易学会沉默”？ / “INFJ 男性很少见”还是“高敏感男性更容易学会沉默”？ | h1_count_not_one:h1_count=2 |
| 200 | 2 | https://fermatmind.com/zh/articles/childhood-dream-job-still-shapes-career-choice | 你小时候想做的工作，为什么还在影响你今天的职业判断？ / 你小时候想做的工作，为什么还在影响你今天的职业判断？ | h1_count_not_one:h1_count=2 |
| 200 | 2 | https://fermatmind.com/zh/articles/riasec-holland-career-interest-test-explained | RIASEC 是什么？用霍兰德职业兴趣看懂职业动力 / RIASEC 是什么？霍兰德职业兴趣测试如何辅助职业探索 | h1_count_not_one:h1_count=2 |
| 200 | 2 | https://fermatmind.com/zh/articles/which-love-script-fits-you-best | 你真正适合哪种亲密关系脚本？用七种爱情类型做一次更科学的匹配 / 你真正适合哪种亲密关系脚本？用七种爱情类型做一次更科学的匹配 | h1_count_not_one:h1_count=2 |
| 200 | 1 | https://fermatmind.com/zh/articles/mbti-narrative-portrait | MBTI 性格测试（16型人格）｜叙事画像版 | none |
| 200 | 2 | https://fermatmind.com/zh/articles/mbti-vs-holland-career-choice | MBTI和霍兰德哪个更适合选职业？ / MBTI和霍兰德哪个更适合选职业？ | h1_count_not_one:h1_count=2 |
| 200 | 1 | https://fermatmind.com/en/articles/are-infj-men-rare-or-socially-silenced | Are INFJ Men Rare, or Have Sensitive Men Learned to Stay Silent? | none |
| 200 | 2 | https://fermatmind.com/en/articles/mbti-vs-holland-code-career-choice | MBTI vs. Holland Code/RIASEC: Which Career Test Should You Take? / MBTI vs. Holland Code/RIASEC: Which Career Test Should You Take? | h1_count_not_one:h1_count=2 |
| 200 | 1 | https://fermatmind.com/zh/articles/holland-career-interest-test-can-and-cannot-tell-you | 霍兰德职业兴趣测试能告诉你什么，不能告诉你什么？ | none |
| 200 | 1 | https://fermatmind.com/zh/articles/big-five-narrative-portrait | 大五人格测试（OCEAN 模型）｜叙事画像版 | none |
| 200 | 1 | https://fermatmind.com/zh/articles/mbti-growth-guide | MBTI 性格测试（16型人格）｜成长引导版 | none |
| 200 | 1 | https://fermatmind.com/en/articles/which-love-script-fits-you-best | Which Relationship Script Fits You Best? Seven Types of Love, Explained | none |
| 200 | 2 | https://fermatmind.com/zh/articles/how-personality-shapes-attitude-toward-ai | 你的性格如何塑造你对人工智能的态度：从好奇、焦虑到算法信任 / 你的性格如何塑造你对人工智能的态度：从好奇、焦虑到算法信任 | h1_count_not_one:h1_count=2 |
| 200 | 1 | https://fermatmind.com/en/articles/mbti-personality-test-science-vs-pseudoscience | MBTI Personality Test: Scientific Tool or Cyber Fortune-Telling? | none |
| 200 | 1 | https://fermatmind.com/en/articles/how-16-personality-types-talk-to-an-ai-coach | How the 16 Personality Types Talk to an AI Coach | none |
| 200 | 1 | https://fermatmind.com/zh/articles/big-five-personality-test-vs-mbti | 大五人格测试：比 MBTI 更科学吗？五大特质能告诉你什么，不能告诉你什么？ | none |
| 200 | 1 | https://fermatmind.com/en/articles/childhood-dream-job-still-shapes-career-choice | Why Your Childhood Dream Job Still Shapes Your Career Decisions | none |
| 200 | 1 | https://fermatmind.com/en/articles/how-personality-shapes-attitude-toward-ai | How Personality Shapes Your Attitude Toward AI: Curiosity, Anxiety, and Algorithmic Trust | none |
| 200 | 1 | https://fermatmind.com/zh/articles/mbti-personality-test-science-vs-pseudoscience | MBTI 16 型人格测试：是科学工具，还是赛博算命？ | none |

## Acceptance Notes

- At least 20 public article detail pages are sampled when the live sitemap exposes at least 20 article detail URLs.
- Each audited page must finish with exactly one `<h1>` in the Playwright Chromium DOM.
- The default CLI mode is report-only; use `--assert-clean` when the same script should act as a failing gate.
- CMS body H1 prevention is owned by ARTICLE-H1-02; frontend DOM fallback is owned by ARTICLE-H1-01.
- ARTICLE-H1-03 does not mutate CMS data and does not deploy.
