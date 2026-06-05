# UNLOCK-FAILURE-HELP-CARD-01

```yaml
asset_id: UNLOCK-FAILURE-HELP-CARD-01
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

为已经完成付款但没有看到完整报告的用户提供清晰、低焦虑、可执行的处理路径。

## 2. Target User Problem

用户已经付款，但页面没有解锁、报告没有显示、浏览器关闭后不知道如何恢复，或者不确定应该联系哪里。

## 3. CMS Fields to Fill

```json
{
  "support_intent": "unlock_failure",
  "handling_time": "24h",
  "required_user_info": [
    "purchase_email",
    "test_name",
    "locale",
    "approximate_payment_time",
    "issue_description"
  ],
  "optional_user_info": [
    "masked_order_code",
    "order_number_last_6_characters"
  ],
  "forbidden_user_info": [
    "full_order_number_on_public_page",
    "full_payment_id",
    "full_transaction_id",
    "full_result_url",
    "full_history_url",
    "screenshot_with_private_url"
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
zh: /zh/help/unlock-failure
en: /en/help/unlock-failure
```

## 5. Draft Title

```text
zh-CN: 付款后没有解锁报告怎么办？
en: What to do if your report does not unlock after payment
```

## 6. Draft Summary

### zh-CN

如果你已经完成付款，但完整报告没有正常解锁，请先不要重复付款。你可以通过支持邮箱提交购买邮箱、测试名称、语言版本、付款的大致时间和问题描述。我们会在 24 小时内处理解锁异常或给出下一步说明。

### en

If you completed payment but the full report did not unlock, do not pay again immediately. Contact support with your purchase email, test name, language, approximate payment time, and a short description of the issue. We will review unlock issues within 24 hours.

## 7. Visible Body Draft

### zh-CN

如果你已经付款，但没有看到完整报告，请先不要重复付款。

报告没有解锁通常可能发生在这些场景中：支付页面关闭过早、浏览器返回导致状态没有刷新、网络中断、支付渠道回调延迟，或你正在不同设备上查看结果。

请通过支持邮箱联系我们。为了帮助我们定位问题，请提供以下信息：

- 购买时使用的邮箱；
- 测试名称，例如 MBTI、霍兰德 / RIASEC 或大五人格；
- 页面语言版本；
- 付款的大致时间；
- 问题描述，例如“付款后仍显示未解锁”。

如果你愿意，也可以提供订单编号的后 6 位或脱敏订单码。请不要在公开评论、社交平台、截图说明或非私密页面中发送完整订单编号、支付流水号、完整结果链接或历史页面链接。

我们会在 24 小时内检查解锁状态。若确认你无法获得已购买的完整报告，将按退款政策进入处理流程。

### en

If you have paid but cannot see the full report, please do not pay again immediately.

An unlock issue may happen if the payment page was closed early, the browser did not refresh after returning from the payment provider, the network was interrupted, the payment callback was delayed, or you are trying to view the report on another device.

Please contact support by email. To help us locate the issue, include:

- the email used for purchase;
- the test name, such as MBTI, Holland / RIASEC, or Big Five;
- the language version;
- the approximate payment time;
- a short description of what happened.

You may optionally include the last 6 characters of your order code or a masked order code. Do not post a full order number, payment identifier, full result link, or history link in public comments, social platforms, screenshots, or non-private pages.

We will review unlock issues within 24 hours. If we confirm that you cannot access the full report you purchased, the case will move into the refund process.

## 8. FAQ Draft Items

### Q1
- zh Q: 付款后报告没有解锁，我应该重新付款吗？
- zh A: 不建议立即重复付款。请先联系支持邮箱，并提供购买邮箱、测试名称、语言版本、付款的大致时间和问题描述。
- en Q: Should I pay again if the report does not unlock?
- en A: No. Contact support first with your purchase email, test name, language version, approximate payment time, and a short issue description.

### Q2
- zh Q: 我需要提供完整订单编号吗？
- zh A: 公开帮助页面不要求你提供完整订单编号。支持邮箱排查时，一般优先使用购买邮箱，也可以使用订单编号后 6 位或脱敏订单码辅助定位。
- en Q: Do I need to provide the full order number?
- en A: Public Help pages do not require a full order number. Support usually starts from your purchase email and may use the last 6 characters of a masked order code if needed.

### Q3
- zh Q: 多久会处理解锁失败？
- zh A: 解锁异常会在 24 小时内处理或给出下一步说明。
- en Q: How long does unlock support take?
- en A: Unlock issues are reviewed within 24 hours, or we will provide the next step.

### Q4
- zh Q: 如果最后仍无法获得完整报告，可以退款吗？
- zh A: 如果确认你无法获得完整报告，并且符合 7 天退款条件，可以进入退款处理流程。
- en Q: Can I get a refund if I still cannot access the report?
- en A: If we confirm that you cannot access the full report and the request is within the 7-day refund window, the case can enter the refund process.


## 9. Schema Eligibility

FAQPage conditional: visible FAQ must match schema; no private URLs; no raw order/payment/result identifiers; operator-reviewed.

## 10. Support Fields Required

- support_intent=unlock_failure
- support_channel=email
- handling_time=24h
- identity_policy=email_first
- optional_identifier=masked_order_code_or_last_6

## 11. Forbidden Claims Checklist

- instant refund
- guaranteed unlock without verification
- full order number required in public page
- full payment identifier required
- private result link examples

## 12. Privacy / PII Notes

- Public Help pages must not request or display full order numbers, full payment identifiers, full result URLs, or full history URLs.
- Support should use email-first identity matching.
- Optional order identifiers should be masked, such as the last 6 characters or a masked order code.
- Do not include private URL examples in body, FAQ, schema, screenshots, or examples.

## 13. Internal Links

Allowed internal links:

- `/zh/help/payment-refund`
- `/zh/help/result-recovery`
- `/zh/help/privacy-data`
- `/zh/help/contact-support`
- `/en/help/payment-refund`
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

- Operator confirms support email
- Operator confirms 24h support window
- CMS draft exists
- FAQ schema matches visible FAQ
- No raw identifiers in page body
- No private URLs in body or schema
- Footer or Help hub can reach this page

## 15. Operator Review Checklist

- [ ] 支持邮箱已确认
- [ ] 24 小时处理承诺可执行
- [ ] 退款触发条件与退款政策一致
- [ ] 没有要求用户公开提交完整订单编号
- [ ] 没有私密链接示例
- [ ] 中英文政策一致
