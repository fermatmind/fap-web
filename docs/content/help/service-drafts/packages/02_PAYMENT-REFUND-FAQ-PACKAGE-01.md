# PAYMENT-REFUND-FAQ-PACKAGE-01

```yaml
asset_id: PAYMENT-REFUND-FAQ-PACKAGE-01
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

说明费马测试的付费边界、退款条件、退款窗口和支持路径，降低用户在付款前的不确定性。

## 2. Target User Problem

用户想知道哪些内容免费、什么时候需要付款、付款后能得到什么、什么情况下能退款、退款需要怎么申请。

## 3. CMS Fields to Fill

```json
{
  "payment_region": "zh/en same policy",
  "currency": "CNY where paid product applies",
  "price": "1.99 CNY for selected high-value report unlock",
  "refund_allowed": true,
  "refund_window_days": 7,
  "refund_condition": "unable_to_receive_full_report",
  "refund_exclusions": "operator_review_required",
  "refund_request_channel": "email",
  "refund_handling_time": "operator_review_required",
  "policy_version": "required",
  "effective_date": "required",
  "reviewer": "required",
  "updated_at": "required",
  "schema_enabled": "conditional",
  "robots": "index_after_review"
}
```

## 4. Suggested Slug

```text
zh: /zh/help/payment-refund
en: /en/help/payment-refund
```

## 5. Draft Title

```text
zh-CN: 支付与退款说明
en: Payment and refund help
```

## 6. Draft Summary

### zh-CN

费马测试的基础测评和部分结果可以免费使用。部分高阶报告模块可能需要付费解锁。若你付款后无法获得完整报告，并且在 7 天内联系支持邮箱，可以申请退款处理。

### en

FermatMind provides free tests and selected free result views. Some advanced report modules may require paid unlock. If you paid but cannot access the full report, you may contact support within 7 days for refund review.

## 7. Visible Body Draft

### zh-CN

费马测试的基础测评可以免费开始。部分测试会提供免费的基础结果；某些高阶报告模块可能需要付费解锁。

在付款前，你应该能清楚看到：

- 当前解锁对应的测试或报告；
- 价格和币种；
- 解锁后预计可以查看的内容范围；
- 支付失败或未解锁时的支持路径；
- 退款条件和申请窗口。

如果你已经付款，但无法获得完整报告，可以在付款后 7 天内通过支持邮箱联系我们。我们会根据购买邮箱、测试名称、付款时间和问题描述进行核查。

退款适用于确认无法获得完整报告的情况。退款不应用于已经正常获得完整报告后的主观不满意，除非后续政策另有说明并经过运营审核。

请不要在公开页面、社交平台或截图中展示完整订单编号、支付流水号、完整结果链接或历史页面链接。

### en

FermatMind tests can be started for free. Some tests provide a free basic result view, while selected advanced report modules may require paid unlock.

Before payment, users should be able to see:

- which test or report the unlock applies to;
- the price and currency;
- what the unlocked report is expected to include;
- where to get support if payment or unlock fails;
- the refund window and eligibility conditions.

If you paid but cannot access the full report, contact support by email within 7 days. We will review the case using your purchase email, test name, approximate payment time, and issue description.

Refund review applies when we confirm that you cannot access the full report you purchased. It is not intended for cases where the full report was delivered normally and the user simply disagrees with the interpretation, unless a later reviewed policy states otherwise.

Do not post full order numbers, payment identifiers, full result links, or history links on public pages, social platforms, or screenshots.

## 8. FAQ Draft Items

### Q1
- zh Q: 哪些内容是免费的？
- zh A: 基础测评可以免费开始，部分基础结果也可以免费查看。某些高阶报告模块可能需要单独付费解锁。
- en Q: What is free?
- en A: You can start the tests for free, and selected basic result views may also be free. Some advanced report modules may require paid unlock.

### Q2
- zh Q: 什么情况下可以申请退款？
- zh A: 如果你付款后无法获得完整报告，并且在付款后 7 天内联系支持邮箱，可以申请退款处理。
- en Q: When can I request a refund?
- en A: If you paid but cannot access the full report, you may contact support within 7 days for refund review.

### Q3
- zh Q: 如果我已经看到了完整报告，还可以退款吗？
- zh A: 如果完整报告已经正常交付，退款通常不适用于单纯主观不满意的情况。具体情况仍需由支持团队审核。
- en Q: Can I get a refund after viewing the full report?
- en A: If the full report was delivered normally, refund review usually does not apply to subjective dissatisfaction alone. Support will review any exceptional case.

### Q4
- zh Q: 申请退款需要提供什么？
- zh A: 请提供购买邮箱、测试名称、付款的大致时间和问题描述。公开页面不要求提供完整订单编号。
- en Q: What information is needed for a refund request?
- en A: Provide the purchase email, test name, approximate payment time, and a short issue description. Public Help pages do not require a full order number.


## 9. Schema Eligibility

FAQPage conditional: refund policy reviewed by operator; no overpromise; no private identifiers; visible FAQ equals schema.

## 10. Support Fields Required

- support_intent=payment_refund
- refund_window_days=7
- refund_condition=unable_to_receive_full_report
- support_channel=email
- operator_review_required=true

## 11. Forbidden Claims Checklist

- instant refund
- unconditional refund
- guaranteed satisfaction
- legal guarantee beyond approved policy
- raw order or payment identifiers

## 12. Privacy / PII Notes

- Public Help pages must not request or display full order numbers, full payment identifiers, full result URLs, or full history URLs.
- Support should use email-first identity matching.
- Optional order identifiers should be masked, such as the last 6 characters or a masked order code.
- Do not include private URL examples in body, FAQ, schema, screenshots, or examples.

## 13. Internal Links

Allowed internal links:

- `/zh/help/unlock-failure`
- `/zh/help/result-recovery`
- `/zh/help/privacy-data`
- `/zh/help/contact-support`
- `/en/help/unlock-failure`
- `/en/help/result-recovery`
- `/en/help/privacy-data`
- `/en/help/contact-support`

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

- Operator confirms refund exclusions
- Operator confirms refund handling time
- Support email confirmed
- CMS draft exists
- Legal/service review completed
- Schema matches visible FAQ

## 15. Operator Review Checklist

- [ ] 退款条件“无法获得完整报告”是否准确
- [ ] 7 天窗口是否最终确认
- [ ] 是否需要增加退款处理时限
- [ ] 是否需要列出不可退款场景
- [ ] 是否确认中英文政策一致
