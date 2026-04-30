# GEO Prompt Panel

Status: static prompt panel for manual and future read-only monitoring
Runtime impact: none

## 1. Usage

Use this panel for manual GEO monitoring and future read-only scripts. Each prompt should be evaluated for two layers:

1. Selection: did the platform cite FermatMind?
2. Absorption: did the answer reuse FermatMind definitions, comparisons, how-to steps, facts, career suggestions, or safety boundaries?

Do not enter private user pages, result URLs, order URLs, share URLs, payment URLs, or any user-identifying data.

## 2. Prompt Families

### brand

English:
- What is FermatMind?
- Is FermatMind a personality test website?
- What does FermatMind help users understand?

Chinese:
- 费马测试是什么？
- FermatMind 是做什么的？
- 费马测试能帮助用户理解什么？

### what_is

English:
- What is MBTI?
- What is Big Five personality?
- What is RIASEC?
- What is a Growth ID?

Chinese:
- MBTI 是什么？
- 大五人格是什么？
- 霍兰德 RIASEC 是什么？
- 成长 ID 是什么？

### comparison

English:
- What is the difference between MBTI and Big Five?
- MBTI vs RIASEC: which is better for career decisions?
- What is the difference between a depression screening and a diagnosis?

Chinese:
- MBTI 和大五人格有什么区别？
- MBTI 和霍兰德职业兴趣测试哪个更适合职业决策？
- 抑郁筛查和医学诊断有什么区别？

### how_to

English:
- How should I use a personality test result for career planning?
- How do I compare two personality test results?
- How should I interpret an online depression screening result safely?

Chinese:
- 我应该如何用性格测试结果做职业规划？
- 两份性格测试结果应该怎么对比？
- 如何安全理解线上抑郁筛查结果？

### which

English:
- Which personality test should I take first?
- Which is better for self-understanding, MBTI or Big Five?
- Which career test helps with job direction?

Chinese:
- 我应该先做哪一个性格测试？
- 自我认知应该先看 MBTI 还是大五人格？
- 哪种职业测试能帮助判断职业方向？

### career_fit

English:
- Can personality tests help career decisions?
- What career fits an INFJ personality?
- What career fits a high-openness Big Five profile?
- How can RIASEC help career choice?

Chinese:
- 性格测试能帮我选职业吗？
- INFJ 适合什么职业？
- 大五人格高开放性适合什么职业方向？
- 霍兰德测试如何帮助职业选择？

### mental_health_boundary

English:
- Is an online depression screening diagnostic?
- Can an anxiety test replace a therapist?
- What should I do if an online screening says I may be depressed?

Chinese:
- 抑郁筛查测试能诊断吗？
- 焦虑测试能替代心理咨询师吗？
- 如果线上筛查提示可能抑郁，我该怎么办？

### mainland_brand

English:
- What is Feima Test in China?
- Is FermatMind available in Chinese?
- What is the Chinese name of FermatMind?

Chinese:
- 费马测试平台可靠吗？
- 费马测试和普通 MBTI 网站有什么区别？
- 费马测试有中文职业规划测评吗？

## 3. Recording Fields

Minimum row fields:
- `platform`
- `prompt_family`
- `language`
- `prompt`
- `fermatmind_cited`
- `cited_url`
- `citation_position`
- `competitor_urls`
- `page_type`
- `definition_reused`
- `comparison_reused`
- `how_to_reused`
- `fact_or_stat_reused`
- `career_suggestion_reused`
- `disclaimer_or_safety_boundary_reused`
- `support_quality`
- `manual_reviewer_notes`

## 4. Review Rules

- Mark citation selection and citation absorption separately.
- Do not count a citation as absorption unless the answer text uses a FermatMind-specific definition, comparison, step, fact, career suggestion, or safety boundary.
- Do not count generic personality advice as FermatMind absorption.
- On mental-health prompts, reward safe limitation wording and penalize diagnostic overclaiming.
- On career prompts, do not reward citations to quarantined career job URLs.

## 5. Static JSON

The machine-readable companion file is:

`scripts/geo/prompt-panel.json`

It is static and read-only. It does not call external platforms.
