# PRIVACY-FAQ-PACKAGE-01

```yaml
asset_id: PRIVACY-FAQ-PACKAGE-01
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

解释费马测试如何处理测试数据、统计数据、结果链接、订单支持信息和删除请求，降低用户对结果和订单泄露的担忧。

## 2. Target User Problem

用户担心自己的测试结果、订单信息、浏览记录或支付状态会被公开、被搜索引擎收录，或被用于不透明的用途。

## 3. CMS Fields to Fill

```json
{
  "data_categories": "required",
  "analytics_usage": "required",
  "private_url_policy": "required",
  "deletion_request_path": "required",
  "account_deletion_path": "required",
  "support_channel": "email",
  "policy_version": "required",
  "reviewer": "required",
  "updated_at": "required",
  "schema_enabled": "conditional",
  "robots": "index_after_review"
}
```

## 4. Suggested Slug

```text
zh: /zh/help/privacy-data
en: /en/help/privacy-data
```

## 5. Draft Title

```text
zh-CN: 测试数据与隐私说明
en: Test data and privacy help
```

## 6. Draft Summary

### zh-CN

费马测试会区分公开页面、测试结果、订单支持信息和统计数据。测试结果和订单相关链接不应进入公开搜索、社交平台或统计展示。你也可以申请删除数据或注销账号。

### en

FermatMind separates public pages, test results, order support information, and analytics data. Result and order-related links should not appear in public search, social platforms, or public analytics surfaces. You may also request data deletion or account deletion.

## 7. Visible Body Draft

### zh-CN

费马测试会将公开页面、测试结果、订单支持信息和统计数据区分处理。

公开页面包括首页、测试介绍页、文章页、职业页、帮助页等。它们可以用于搜索引擎和公开访问。

测试结果、历史页面、订单查询、支付状态和个人相关链接不应作为公开页面处理。请不要把完整结果链接、订单查询链接、历史页面链接或带有私密参数的截图发布到公开平台。

我们可能使用统计工具观察公开页面的访问情况，例如页面浏览、测试入口点击和公开页面流量。统计数据不应作为购买事实。购买、解锁和报告交付状态应以后端记录为准。

如果你希望删除相关数据或注销账号，可以通过支持邮箱提交请求。处理前，我们可能需要通过邮箱确认请求人与数据之间的关系。

### en

FermatMind separates public pages, test results, order support information, and analytics data.

Public pages include the homepage, test introduction pages, article pages, career pages, and Help pages. These pages may be publicly accessible and searchable.

Test results, history pages, order lookup pages, payment status pages, and personal access links should not be treated as public pages. Do not post full result links, order lookup links, history links, or screenshots containing private URLs on public platforms.

We may use analytics tools to understand public page traffic, such as page views, test-entry clicks, and public landing traffic. Analytics data should not be treated as purchase truth. Payment, unlock, and report delivery status should be based on backend records.

If you want to request data deletion or account deletion, contact support by email. Before processing the request, we may need to verify that the requesting email is associated with the relevant data.

## 8. FAQ Draft Items

### Q1
- zh Q: 我的测试结果会被公开吗？
- zh A: 测试结果不是公开搜索页面。请不要将完整结果链接或历史页面链接发布到公开平台。
- en Q: Will my test result be public?
- en A: Test results are not public search pages. Do not post full result or history links on public platforms.

### Q2
- zh Q: 费马测试会使用统计工具吗？
- zh A: 可能会使用统计工具观察公开页面流量和测试入口行为，但统计数据不作为购买或解锁的最终事实来源。
- en Q: Does FermatMind use analytics tools?
- en A: Analytics tools may be used to observe public page traffic and test-entry behavior, but analytics data is not the final source for payment or unlock status.

### Q3
- zh Q: 我可以申请删除数据吗？
- zh A: 可以。你可以通过支持邮箱提交删除请求。处理前可能需要验证请求邮箱与相关数据之间的关系。
- en Q: Can I request data deletion?
- en A: Yes. You can contact support by email. We may need to verify that the requesting email is associated with the relevant data.

### Q4
- zh Q: 订单或结果链接可以发给别人吗？
- zh A: 不建议发送完整订单、结果或历史链接。它们可能包含只适合你本人访问的信息。
- en Q: Can I share order or result links with others?
- en A: Do not share full order, result, or history links. They may contain information intended only for personal access.


## 9. Schema Eligibility

FAQPage conditional: no private URLs; no raw identifiers; visible FAQ equals schema; operator privacy review complete.

## 10. Support Fields Required

- support_intent=privacy_question,data_deletion,account_deletion
- support_channel=email
- identity_policy=email_verification

## 11. Forbidden Claims Checklist

- no analytics used if analytics exists
- purchase truth based on GA4 or Baidu
- full privacy guarantee
- private URL examples

## 12. Privacy / PII Notes

- Public Help pages must not request or display full order numbers, full payment identifiers, full result URLs, or full history URLs.
- Support should use email-first identity matching.
- Optional order identifiers should be masked, such as the last 6 characters or a masked order code.
- Do not include private URL examples in body, FAQ, schema, screenshots, or examples.

## 13. Internal Links

Allowed internal links:

- `/zh/help/data-deletion`
- `/zh/help/result-recovery`
- `/zh/help/unlock-failure`
- `/en/help/data-deletion`
- `/en/help/result-recovery`
- `/en/help/unlock-failure`

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

- Operator confirms analytics wording
- Backend/source-of-truth wording reviewed
- Data deletion workflow confirmed
- No private URLs in content
- Privacy policy cross-link confirmed

## 15. Operator Review Checklist

- [ ] 是否准确说明 GA4 / 百度统计或其他统计工具
- [ ] 是否明确统计不等于购买事实
- [ ] 数据删除路径是否可执行
- [ ] 账号注销路径是否可执行
- [ ] 是否避免私密链接示例
