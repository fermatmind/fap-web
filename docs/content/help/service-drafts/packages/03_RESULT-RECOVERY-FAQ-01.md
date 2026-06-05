# RESULT-RECOVERY-FAQ-01

```yaml
asset_id: RESULT-RECOVERY-FAQ-01
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

说明测试结果保存时间、邮箱找回方式、无法找回的边界，以及用户应如何保护结果链接。

## 2. Target User Problem

用户关闭页面、更换设备、清理浏览器记录后，想找回自己的测试结果或完整报告。

## 3. CMS Fields to Fill

```json
{
  "retention_period": "2 years",
  "recovery_method": "email",
  "support_channel": "email",
  "result_lookup_policy": "email_first",
  "private_url_warning": "required",
  "data_deletion_interaction": "required",
  "policy_version": "required",
  "reviewer": "required",
  "updated_at": "required",
  "schema_enabled": "conditional",
  "robots": "index_after_review"
}
```

## 4. Suggested Slug

```text
zh: /zh/help/result-recovery
en: /en/help/result-recovery
```

## 5. Draft Title

```text
zh-CN: 如何找回测试结果？
en: How to recover your test result
```

## 6. Draft Summary

### zh-CN

费马测试的结果记录默认保存 2 年。你可以使用购买或测试时关联的邮箱联系支持团队找回结果。请不要在公开页面或社交平台发布完整结果链接、历史链接或截图中的私密地址。

### en

FermatMind result records are retained for 2 years by default. You can contact support using the email associated with your test or purchase to recover a result. Do not post full result links, history links, or private URLs from screenshots on public pages or social platforms.

## 7. Visible Body Draft

### zh-CN

如果你关闭了结果页、换了设备，或稍后想重新查看测试结果，可以通过邮箱联系支持团队申请找回。

费马测试的结果记录默认保存 2 年。找回时，我们通常会优先使用你测试或购买时关联的邮箱来定位记录。为了提高处理效率，你也可以提供测试名称、语言版本和大致完成时间。

如果你没有留下邮箱，或者无法提供足够信息，我们可能无法确认结果归属，也可能无法找回对应记录。

请不要在公开页面、社交平台、评论区或未遮挡截图中发布完整结果链接、历史页面链接或带有私密参数的地址。结果链接通常只适合你本人查看，不应作为公开分享链接使用。

如果你申请删除数据，删除完成后，对应结果可能无法再恢复。

### en

If you closed the result page, changed devices, or want to view your result later, you can contact support by email to request recovery.

FermatMind result records are retained for 2 years by default. Recovery usually starts from the email associated with the test or purchase. You may also include the test name, language version, and approximate completion time.

If no email was provided, or if there is not enough information to verify ownership, we may not be able to locate or recover the result.

Do not post full result links, history links, or private URLs from screenshots on public pages, social platforms, or comment areas. Result links are generally intended for personal access, not public sharing.

If you request data deletion and the deletion is completed, the corresponding result may no longer be recoverable.

## 8. FAQ Draft Items

### Q1
- zh Q: 测试结果会保存多久？
- zh A: 结果记录默认保存 2 年，除非你申请删除相关数据或后续政策另有说明。
- en Q: How long are results retained?
- en A: Result records are retained for 2 years by default, unless you request deletion or a later reviewed policy states otherwise.

### Q2
- zh Q: 如何找回结果？
- zh A: 请通过支持邮箱联系我们，并提供测试或购买时关联的邮箱、测试名称、语言版本和大致完成时间。
- en Q: How can I recover a result?
- en A: Contact support by email with the email associated with your test or purchase, the test name, language version, and approximate completion time.

### Q3
- zh Q: 没有邮箱还能找回吗？
- zh A: 如果没有邮箱或足够信息，我们可能无法确认结果归属，也可能无法找回对应记录。
- en Q: Can I recover a result without an email?
- en A: If no email or sufficient information is available, we may not be able to verify ownership or recover the result.

### Q4
- zh Q: 我可以公开分享结果链接吗？
- zh A: 不建议公开分享完整结果链接或历史链接。它们可能包含只适合你本人访问的信息。
- en Q: Can I publicly share my result link?
- en A: No. Do not publicly share full result or history links, because they may contain information intended only for personal access.


## 9. Schema Eligibility

FAQPage conditional: no private URL examples; no tokenized link examples; visible FAQ matches JSON-LD; operator confirms retention period.

## 10. Support Fields Required

- support_intent=result_recovery
- result_retention=2_years
- recovery_method=email
- required_user_info=associated_email,test_name,locale,approximate_completion_time

## 11. Forbidden Claims Checklist

- guaranteed recovery
- public result URL examples
- private history URL examples
- exposing result identifiers

## 12. Privacy / PII Notes

- Public Help pages must not request or display full order numbers, full payment identifiers, full result URLs, or full history URLs.
- Support should use email-first identity matching.
- Optional order identifiers should be masked, such as the last 6 characters or a masked order code.
- Do not include private URL examples in body, FAQ, schema, screenshots, or examples.

## 13. Internal Links

Allowed internal links:

- `/zh/help/privacy-data`
- `/zh/help/data-deletion`
- `/zh/help/contact-support`
- `/en/help/privacy-data`
- `/en/help/data-deletion`
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

- Operator confirms 2-year retention
- Support email confirmed
- Data deletion interaction confirmed
- No private URL examples
- CMS draft and preview checked

## 15. Operator Review Checklist

- [ ] 2 年保存政策已确认
- [ ] 邮箱找回是否适用于所有测试
- [ ] 没有邮箱时是否可找回
- [ ] 数据删除后不可恢复的表述是否准确
- [ ] 中英文政策一致
