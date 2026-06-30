# MBTI64 ZH32 V8.3 GPT Content Production Brief

## Role
You are writing FermatMind public personality profile content assets for zh-CN MBTI64 A/T variant pages. You are not writing private result pages, paid reports, diagnosis pages, hiring screens, or frontend code.

## Goal
Generate original V8.3 content for the 30 remaining Chinese MBTI A/T variant pages. INTJ-A and INTJ-T are provided as golden samples and are not part of the 30 pages you need to generate. Your output must be a single JSON package that Codex can validate later.

## Golden Samples
Use these two JSON files only as quality and structure references:

- `INTJ-A-V8_3-GOLDEN-SAMPLE.json`: long-range systems, stable self-confirmation, independent standards.
- `INTJ-T-V8_3-GOLDEN-SAMPLE.json`: long-range systems, pressure calibration, risk scanning, feedback sensitivity.

Do not copy, translate, paraphrase, or lightly rewrite their paragraphs. Learn the structure, depth, third-person voice, site integration, source-ledger style, and safety boundaries.

## Target Pages
Generate exactly these 30 zh-CN pages:

- `/zh/personality/intp-a`
- `/zh/personality/intp-t`
- `/zh/personality/entj-a`
- `/zh/personality/entj-t`
- `/zh/personality/entp-a`
- `/zh/personality/entp-t`
- `/zh/personality/infj-a`
- `/zh/personality/infj-t`
- `/zh/personality/infp-a`
- `/zh/personality/infp-t`
- `/zh/personality/enfj-a`
- `/zh/personality/enfj-t`
- `/zh/personality/enfp-a`
- `/zh/personality/enfp-t`
- `/zh/personality/istj-a`
- `/zh/personality/istj-t`
- `/zh/personality/isfj-a`
- `/zh/personality/isfj-t`
- `/zh/personality/estj-a`
- `/zh/personality/estj-t`
- `/zh/personality/esfj-a`
- `/zh/personality/esfj-t`
- `/zh/personality/istp-a`
- `/zh/personality/istp-t`
- `/zh/personality/isfp-a`
- `/zh/personality/isfp-t`
- `/zh/personality/estp-a`
- `/zh/personality/estp-t`
- `/zh/personality/esfp-a`
- `/zh/personality/esfp-t`

Do not generate English pages. Do not generate A-vs-T comparison pages. Do not regenerate INTJ-A or INTJ-T unless explicitly requested later.

## Required Voice
- Third-person narrative voice, readable like a high-quality personality article.
- FermatMind original framing: personality operating manual + scenario decision page.
- The prose should feel empathetic and specific, not mechanical, not list-only, and not generic template replacement.
- Each type must have its own core tension. Do not reuse the INTJ-A / INTJ-T tension unless the target type logically shares it.

## Required Page Structure
Each page must contain 10 modules in this exact order and with these exact IDs:

1. `core-reading` — 先理解这个类型
2. `rational-standard` — 理性 / 证据 / 判断风格
3. `independence-control` — 独立性 / 掌控 / 决策方式
4. `willpower-ambition` — 意志 / 高标准 / 长期主义
5. `curiosity-revision` — 好奇心 / 修正能力
6. `emotional-blindspot` — 情绪盲区 / 压力反馈
7. `social-friction` — 社交摩擦 / 反馈关系
8. `career-workflow` — 工作与职业场景
9. `relationships` — 关系与亲密
10. `faq-boundary` — FAQ 与使用边界

Each module must contain 4-7 continuous narrative paragraphs. The page must include at least three concrete scenarios: work, relationship, and stress/growth.

## Required Per-Page Fields
Each page object must include:

- `path`
- `locale` = `zh`
- `type_code`
- `variant` = `a` or `t`
- `seo` with title, description, primary keywords, search intents, GEO answer targets
- `geo_summary` with direct answer, answer entities, site path, citation boundary
- `modules` with the 10 modules above
- `faq` with 10-12 questions and answers
- `internal_links`
- `source_ledger`
- `qa_self_check`
- `forbidden_claims_absent`

## Depth Requirements
- Target 9000-13000 Chinese characters per page.
- Do not pad. Increase depth through mechanism, scene, tradeoff, boundary, and next-step explanation.
- Every type needs a unique core tension. Examples:
  - ISTJ-A: responsibility, reliable execution, stable standards.
  - ISTJ-T: responsibility plus error sensitivity and pressure review.
  - ENFP-A: possibility, social energy, stable optimism.
  - ENFP-T: possibility plus feedback sensitivity and direction anxiety.

## FermatMind Site Integration
Every page should connect MBTI to the broader FermatMind system:

- MBTI explains information-processing and preference language.
- Big Five is a cross-check for trait dimensions such as emotional stability, conscientiousness, extraversion, agreeableness, and openness.
- RIASEC is a cross-check for career interest, not a replacement for MBTI.
- Career exploration pages handle real-world tasks, skills, work environment, salary, and future risk.

Required internal links:

- `/zh/tests/mbti-personality-test-16-personality-types`
- `/zh/tests/big-five-personality-test-ocean-model`
- `/zh/articles/riasec-holland-career-interest-test-explained`
- `/zh/careers`
- `/zh/personality/{type}-a-vs-{type}-t`
- paired counterpart page, such as `/zh/personality/istj-t` for `/zh/personality/istj-a`

## Academic and Method Boundary
You may cite academic or method-boundary sources to constrain claims, not to overclaim MBTI validity. Suggested source ledger entries can include:

- McCrae & Costa, 1989, on interpreting MBTI through broader trait dimensions.
- Pittenger, 1993, on caution around MBTI reliability/validity claims.
- Roberts, Walton & Viechtbauer, 2006, on trait stability and change across adulthood.

Do not claim MBTI is a clinical diagnostic system, a hiring screen, a career destiny predictor, an IQ measure, or an official Myers-Briggs product owned by FermatMind.

## Competitor Boundary
16Personalities, Truity, 123test, Crystal, and PersonalityJunkie may be used only as depth and user-intent benchmarks. Do not copy, translate, paraphrase, or imitate their wording. Do not reproduce their proprietary labels, examples, or section prose.

## Output Format
Return JSON only. Do not return Markdown prose, HTML, PDF, commentary, or explanations outside JSON.

The JSON top-level object must follow `MBTI64-ZH32-V8_3-OUTPUT-CONTRACT.json`.

## Final Self-Check Before Output
Set `forbidden_claims_absent` only if all are true:

- No official MBTI / Myers-Briggs affiliation claim.
- No clinical diagnosis or mental-health screening claim.
- No hiring, recruiting, admissions, or screening claim.
- No IQ, destiny, perfect career, perfect partner, guaranteed success, or deterministic relationship claim.
- No copied or lightly rewritten competitor wording.
- No private result/order/payment/account/history/share routes.
- No CMS write, approval queue write, publish, sitemap/llms mutation, search queue mutation, or IndexNow submit instruction.
