# NONDIAGNOSTIC-HELP-COPY-01

```yaml
asset_id: NONDIAGNOSTIC-HELP-COPY-01
publish_allowed: false
requires_operator_review: true
cms_draft_created: false
content_status: draft_only
support_email: support@fermatmind.com
content_owner: GPT-5.5 Pro
final_authority: CMS/backend
runtime_changed: false
search_submission: false
ad_copy_generated: false
social_copy_generated: false
private_url_examples_included: false
```

## 1. Page Purpose

说明费马测试的测评结果适合用于自我理解、职业探索和决策辅助，不适合作为疾病判断、治疗建议、招聘筛选或职业结果承诺。

## 2. Target User Problem

用户不确定人格测试、职业兴趣测试、大五人格结果应该如何理解，担心结果是否代表“结论”、是否可以直接决定职业选择。

## 3. CMS Fields to Fill

```json
{
  "boundary_type": "assessment_use_boundary",
  "applicable_surfaces": [
    "test_landing",
    "result_page",
    "help",
    "article",
    "career"
  ],
  "policy_version": "required",
  "reviewer": "required",
  "updated_at": "required",
  "schema_enabled": "conditional",
  "robots": "index_after_review"
}
```

## 4. Suggested Slug

```text
zh: /zh/help/use-boundaries
en: /en/help/use-boundaries
```

## 5. Draft Title

```text
zh-CN: 如何正确理解测评结果
en: How to interpret assessment results
```

## 6. Draft Summary

### zh-CN

费马测试的结果用于帮助你整理性格偏好、职业兴趣和行为倾向。它们适合做自我理解和决策辅助，不应被当作疾病判断、治疗建议、招聘筛选或职业结果承诺。

### en

FermatMind results are designed to support self-understanding, career-interest exploration, and reflection on behavioral tendencies. They should not be used as disease evaluation, treatment advice, hiring decisions, or career outcome promises.

## 7. Visible Body Draft

### zh-CN

费马测试提供的人格、职业兴趣和行为倾向结果，适合用于自我理解、职业探索、沟通反思和决策辅助。

这些结果不应被理解为固定标签，也不应被当作人生选择的唯一依据。人格、兴趣和行为倾向会受到教育、经验、工作环境、压力状态和长期目标的影响。

在职业决策中，测评结果可以帮助你提出更好的问题，例如：

- 我更偏好什么样的工作环境？
- 我在压力、协作和任务执行中有哪些稳定倾向？
- 我应该优先探索哪些职业方向？
- 哪些选择需要结合真实经历、技能、行业信息和外部反馈继续验证？

测评不能替代专业服务、实际经验、技能训练或长期职业规划。它更适合作为结构化参考，而不是最终结论。

### en

FermatMind assessment results are designed to support self-understanding, career-interest exploration, communication reflection, and decision support.

They should not be treated as fixed labels or as the only basis for major life decisions. Personality, interests, and behavioral tendencies can be shaped by education, experience, work environment, stress, and long-term goals.

In career decisions, assessment results can help you ask better questions, such as:

- What kind of work environment do I tend to prefer?
- What patterns appear in my stress response, collaboration, and task execution?
- Which career directions should I explore first?
- Which choices still require real experience, skill evidence, industry research, and external feedback?

Assessments do not replace professional services, lived experience, skill development, or long-term career planning. They are structured references, not final conclusions.

## 8. FAQ Draft Items

### Q1
- zh Q: 测评结果是不是固定标签？
- zh A: 不是。测评结果更适合作为自我理解和决策辅助，不应被当作固定标签。
- en Q: Are assessment results fixed labels?
- en A: No. They are better treated as structured references for self-understanding and decision support.

### Q2
- zh Q: 我可以直接根据测评结果选职业吗？
- zh A: 不建议只根据测评结果做职业决定。你还需要结合技能、经验、行业信息和真实反馈。
- en Q: Can I choose a career based only on the result?
- en A: No. Career decisions should also consider skills, experience, industry information, and real-world feedback.

### Q3
- zh Q: 这些测试适合解决什么问题？
- zh A: 它们适合帮助你整理偏好、兴趣、行为倾向和职业探索方向。
- en Q: What are these tests useful for?
- en A: They can help organize preferences, interests, behavioral tendencies, and career exploration directions.

### Q4
- zh Q: 结果可以用于招聘或筛选别人吗？
- zh A: 不建议将个人测评结果作为招聘筛选或评价他人的唯一依据。
- en Q: Can results be used for hiring or screening others?
- en A: No. Individual assessment results should not be used as the sole basis for hiring or evaluating another person.


## 9. Schema Eligibility

FAQPage conditional: reviewed by operator; no overclaim; no disease/treatment framing; visible FAQ equals schema.

## 10. Support Fields Required

- support_intent=result_interpretation
- policy_version=required
- reviewer=required
- claim_boundary_reference=required

## 11. Forbidden Claims Checklist

- fixed destiny
- guaranteed career match
- disease evaluation
- treatment advice
- hiring decision tool
- official personality certification
- salary guarantee

## 12. Privacy / PII Notes

- Public Help pages must not request or display full order numbers, full payment identifiers, full result URLs, or full history URLs.
- Support should use email-first identity matching.
- Optional order identifiers should be masked, such as the last 6 characters or a masked order code.
- Do not include private URL examples in body, FAQ, schema, screenshots, or examples.

## 13. Internal Links

Allowed internal links:

- `/zh/help/privacy-data`
- `/zh/help/result-recovery`
- `/zh/tests/mbti-personality-test-16-personality-types`
- `/zh/tests/holland-career-interest-test-riasec`
- `/zh/tests/big-five-personality-test-ocean-model`
- `/en/help/privacy-data`
- `/en/help/result-recovery`
- `/en/tests/mbti-personality-test-16-personality-types`
- `/en/tests/holland-career-interest-test-riasec`
- `/en/tests/big-five-personality-test-ocean-model`

Forbidden link families:

```text
/result/**
/orders/**
/share/**
/pay/**
/payment/**
/history/**
tokenized URLs
user-specific URLs
```

## 14. Publish Prerequisites

- Claim boundary review
- Test landing pages use compatible language
- Result pages link only if public-safe
- FAQ schema reviewed
- No unsupported strong claim

## 15. Operator Review Checklist

- [ ] 是否避免把结果说成最终结论
- [ ] 是否避免招聘筛选用途
- [ ] 是否避免职业保证
- [ ] 是否适用于 MBTI、RIASEC、Big Five、九型、EQ、IQ
- [ ] 中英文是否一致
