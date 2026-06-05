# DATA-DELETION-REQUEST-FAQ-01

```yaml
asset_id: DATA-DELETION-REQUEST-FAQ-01
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

说明用户如何申请删除测试数据、相关记录或注销账号，以及哪些记录可能因支付、退款或合规处理需要保留一段时间。

## 2. Target User Problem

用户希望删除自己的测试记录、结果记录、账号信息，或希望知道删除后是否还能恢复结果。

## 3. CMS Fields to Fill

```json
{
  "data_deletion_allowed": true,
  "account_deletion_allowed": true,
  "support_channel": "email",
  "identity_verification": "email_based",
  "handling_time": "operator_review_required",
  "retained_data_exceptions": "operator_review_required",
  "result_recovery_after_deletion": "not_available_after_completed_deletion",
  "policy_version": "required",
  "reviewer": "required",
  "updated_at": "required",
  "schema_enabled": "conditional",
  "robots": "index_after_review"
}
```

## 4. Suggested Slug

```text
zh: /zh/help/data-deletion
en: /en/help/data-deletion
```

## 5. Draft Title

```text
zh-CN: 如何申请删除数据或注销账号
en: How to request data deletion or account deletion
```

## 6. Draft Summary

### zh-CN

你可以通过支持邮箱申请删除相关数据或注销账号。为了保护数据安全，我们可能需要通过邮箱确认请求人与相关记录的关系。删除完成后，相关结果可能无法再找回。

### en

You can request data deletion or account deletion by contacting support by email. To protect your data, we may need to verify that the requesting email is associated with the relevant records. After deletion is completed, related results may no longer be recoverable.

## 7. Visible Body Draft

### zh-CN

如果你希望删除测试数据、相关记录或注销账号，可以通过支持邮箱提交请求。

为了保护数据安全，我们通常需要确认请求邮箱与相关记录之间的关系。你可以提供：

- 账号或测试时使用的邮箱；
- 请求类型，例如删除测试数据、删除结果记录或注销账号；
- 涉及的测试名称；
- 大致完成测试或购买的时间。

请不要在公开页面、评论区或社交平台发送完整订单编号、完整结果链接、支付流水号或历史页面链接。

删除完成后，相关结果可能无法再找回。如果你的请求涉及付款、退款或服务履约记录，部分记录可能需要根据服务处理、退款核查或合规要求保留一段时间。具体处理范围需要由支持团队确认。

### en

If you want to delete test data, related records, or your account, contact support by email.

To protect your data, we usually need to verify that the requesting email is associated with the relevant records. You may provide:

- the email used for the account or test;
- the request type, such as deleting test data, deleting result records, or deleting an account;
- the test name involved;
- the approximate test completion or purchase time.

Do not post full order numbers, full result links, payment identifiers, or history links on public pages, comment areas, or social platforms.

After deletion is completed, related results may no longer be recoverable. If your request involves payment, refund, or service records, some records may need to be retained for service processing, refund review, or compliance reasons. Support will confirm the applicable scope.

## 8. FAQ Draft Items

### Q1
- zh Q: 我可以申请删除测试数据吗？
- zh A: 可以。你可以通过支持邮箱提交删除请求。处理前可能需要确认请求邮箱与相关记录的关系。
- en Q: Can I request deletion of test data?
- en A: Yes. Contact support by email. We may need to verify that the requesting email is associated with the relevant records.

### Q2
- zh Q: 我可以注销账号吗？
- zh A: 可以申请注销账号。账号相关处理范围需要根据你的记录状态和服务情况确认。
- en Q: Can I request account deletion?
- en A: Yes. You can request account deletion. The scope depends on your record status and service context.

### Q3
- zh Q: 删除后还能找回结果吗？
- zh A: 删除完成后，相关结果可能无法再找回。
- en Q: Can I recover results after deletion?
- en A: After deletion is completed, related results may no longer be recoverable.

### Q4
- zh Q: 哪些数据可能不能立即删除？
- zh A: 如果记录涉及付款、退款或服务履约，部分记录可能需要为服务处理、退款核查或合规原因保留一段时间。
- en Q: What data may not be deleted immediately?
- en A: If records involve payment, refund, or service fulfillment, some data may need to be retained for service processing, refund review, or compliance reasons.


## 9. Schema Eligibility

FAQPage conditional: operator confirms deletion policy; retained data exceptions reviewed; no private identifiers; visible FAQ equals schema.

## 10. Support Fields Required

- support_intent=data_deletion,account_deletion
- required_user_info=account_or_test_email,request_type,test_name_if_relevant,approximate_completion_or_purchase_time

## 11. Forbidden Claims Checklist

- instant deletion guarantee
- deletion of third-party payment provider records if not controlled
- full recovery after deletion
- public submission of private identifiers

## 12. Privacy / PII Notes

- Public Help pages must not request or display full order numbers, full payment identifiers, full result URLs, or full history URLs.
- Support should use email-first identity matching.
- Optional order identifiers should be masked, such as the last 6 characters or a masked order code.
- Do not include private URL examples in body, FAQ, schema, screenshots, or examples.

## 13. Internal Links

Allowed internal links:

- `/zh/help/privacy-data`
- `/zh/help/result-recovery`
- `/zh/help/contact-support`
- `/en/help/privacy-data`
- `/en/help/result-recovery`
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

- Operator confirms deletion handling time
- Operator confirms retention exceptions
- Support email confirmed
- CMS draft reviewed
- Privacy policy cross-link confirmed
- No unsupported deletion promise

## 15. Operator Review Checklist

- [ ] 删除请求处理时限是否确定
- [ ] 支付/退款记录保留例外是否确定
- [ ] 账号注销和数据删除是否同一流程
- [ ] 删除后结果不可恢复的表述是否准确
- [ ] 中英文政策一致
