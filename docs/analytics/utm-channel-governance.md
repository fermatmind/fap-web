# UTM Channel Governance

Scope: `COMMERCIAL-CONTRACTS-FOUNDATION-01`

Mode: business dictionary and contract only. This document does not create publishing copy, social copy, ad copy, CMS content, search submissions, paid ads, or runtime UTM implementation changes.

## 1. Audit Conclusion

Status: revised and expanded.

The previous UTM governance contract established that owned links must use governed UTM params and must avoid unsafe source values such as raw `chatgpt.com` and standalone `qr`. This Day 1 commercial contract keeps that rule and expands it into a channel dictionary that can be consumed by future analytics, issue queue, and dashboard work.

## 2. Canonical Fields

| Field | Required? | Purpose | Rule |
| --- | --- | --- | --- |
| `utm_source` | required for external distribution | Platform, publisher, or owned source. | Must use approved source values. Do not use raw referral hostnames such as `chatgpt.com`. |
| `utm_medium` | required for external distribution | Distribution medium. | Must use approved medium values. |
| `utm_campaign` | required for external distribution | Campaign or operating initiative. | Must be stable and non-personal. |
| `utm_content` | optional | Creative or placement variant. | No user/order/result identifiers. |
| `utm_term` | optional | Paid search keyword or controlled test term. | No private identifiers. |
| `channel_group` | derived or explicit | Dashboard grouping. | Unknown remains Unknown. |
| `campaign_objective` | recommended | Objective such as awareness, test_start, checkout, or retention. | Must not imply purchase truth. |
| `target_locale` | recommended | Intended language/locale. | `en`, `zh`, `zh-CN`, or governed equivalents. |
| `target_test_slug` | recommended | Public test destination. | Must be a public canonical test slug. |
| `content_asset_id` | optional | CMS/backend content asset reference. | No article copy or private CMS draft content in UTM. |
| `distribution_asset_id` | optional | Non-copy asset tracking id. | No personal identifier. |
| `creative_variant` | optional | Safe variant id. | No publishable copy in the id. |
| `landing_route_family` | required for dashboard mapping | Public landing route family. | Private route families forbidden. |

## 3. Channel Taxonomy

Approved channel values:

| Channel | Default source | Default medium | Channel group | Notes |
| --- | --- | --- | --- | --- |
| Google organic | `google` | `organic` | `google_organic` | Observation only. |
| Google Ads | `google_ads` | `paid_search` | `google_ads` | Forbidden until paid ads preflight passes. |
| Baidu organic | `baidu` | `organic` | `baidu_organic` | Observation only. |
| Baidu Ads | `baidu_ads` | `paid_search` | `baidu_ads` | Forbidden until paid ads preflight passes. |
| WeChat | `wechat` | `social` | `wechat` | Manual/natural only unless separately approved. |
| Xiaohongshu | `xiaohongshu` | `social` | `xiaohongshu` | Manual/natural only unless separately approved. |
| Douyin | `douyin` | `short_video` | `douyin` | Manual/natural only unless separately approved. |
| Bilibili | `bilibili` | `video` | `bilibili` | Manual/natural only unless separately approved. |
| Zhihu | `zhihu` | `answer` | `zhihu` | No answer copy is authored here. |
| Facebook | `facebook` | `social` | `facebook` | Paid use requires paid ads preflight. |
| X | `x` | `social` | `x` | Paid use requires paid ads preflight. |
| LinkedIn | `linkedin` | `social` | `linkedin` | Paid use requires paid ads preflight. |
| Medium | `medium` | `article` | `medium` | No article copy is authored here. |
| YouTube Shorts | `youtube_shorts` | `short_video` | `youtube_shorts` | No video copy is authored here. |
| TikTok | `tiktok` | `short_video` | `tiktok` | No video copy is authored here. |
| Reddit | `reddit` | `community` | `reddit` | No post copy is authored here. |
| Direct manual | `direct_manual` | `manual` | `direct_manual` | Used for manually distributed public links. |
| Internal test | `internal_test` | `manual` | `internal_test` | Must be excluded from growth dashboards. |

## 4. Medium Taxonomy

Approved medium values:

- `organic`
- `paid_search`
- `paid_social`
- `social`
- `video`
- `short_video`
- `answer`
- `article`
- `referral`
- `private`
- `manual`
- `qr`
- `community`
- `email`

Rules:

- `private` medium is only for governed private share contexts; it is not a paid ads landing medium.
- `qr` is a medium, not a standalone source. QR links still need source, medium, and campaign.
- `paid_search` and `paid_social` remain blocked until paid ads preflight is green.

## 5. Canonical Landing Rules

All external distribution links must land on public canonical routes.

Allowed route families:

- home
- test hub
- public test detail
- public CMS article
- public topic/profile/career guide/job pages
- approved public content pages

Forbidden landing route families:

- result
- order
- orders
- share
- pay
- payment
- history
- private
- test-taking
- tokenized URL
- draft
- noindex URL
- non-canonical URL

Any external distribution link to a forbidden route is a P0 stop condition.

## 6. Identifier And Privacy Rules

UTM fields must never contain:

- user id
- order id
- `orderNo`
- result id
- attempt id
- payment id
- transaction id
- phone
- email
- token
- private URL
- raw cookie/session id

Use stable campaign and variant ids only. If source, medium, campaign, or route family cannot be proven, the dashboard value is `Unknown`. Do not guess.

## 7. Dashboard And Referral Rules

- Do not treat raw dashboard/referral hosts such as `chatgpt.com` as official campaign channels.
- Do not treat `Direct` or `Unassigned` growth as brand lift without issue queue review.
- High Direct/Unassigned share should create an analytics issue, not a success claim.
- Manual natural distribution still needs governed UTM if it is part of a measured campaign.
- Unknown channel must remain `Unknown`, not be reassigned by intuition.

## 8. Recommended Naming Table

This table defines ids only. It does not provide publishable copy.

| Use case | `utm_source` | `utm_medium` | `utm_campaign` pattern | Required extra fields |
| --- | --- | --- | --- | --- |
| Google organic monitoring | `google` | `organic` | `{surface}_{month}` | `landing_route_family`, `target_locale` |
| Baidu organic monitoring | `baidu` | `organic` | `{surface}_{month}` | `landing_route_family`, `target_locale` |
| WeChat manual share | `wechat` | `social` | `{surface}_{month}` | `distribution_asset_id`, `target_locale` |
| Xiaohongshu manual share | `xiaohongshu` | `social` | `{surface}_{month}` | `distribution_asset_id`, `target_locale` |
| Douyin short video | `douyin` | `short_video` | `{surface}_{month}` | `distribution_asset_id`, `creative_variant` |
| Bilibili video | `bilibili` | `video` | `{surface}_{month}` | `distribution_asset_id`, `creative_variant` |
| Zhihu answer | `zhihu` | `answer` | `{surface}_{month}` | `content_asset_id`, `target_locale` |
| Reddit community | `reddit` | `community` | `{surface}_{month}` | `distribution_asset_id`, `target_locale` |
| Direct manual QA | `direct_manual` | `manual` | `{surface}_qa_{month}` | `internal_test=true` downstream |
| QR offline/print | approved source | `qr` | `{surface}_{month}` | source cannot be `qr`; target route must be public canonical |

## 9. Stop Conditions

| Condition ID | Severity | Detection source | Stop action | Owner | Follow-up PR type |
| --- | --- | --- | --- | --- | --- |
| `utm_private_landing_route` | P0 | link review, dashboard landing route, logs | Stop distribution and paid ads. | Analytics/Ops | privacy repair |
| `utm_contains_private_identifier` | P0 | UTM scanner, dashboard, logs | Stop distribution and repair links. | Analytics/Ops | privacy repair |
| `utm_unknown_treated_as_success` | P0 | dashboard QA, issue queue | Stop commercial interpretation. | Analytics/Ops | dashboard contract |
| `utm_qr_without_source_campaign` | P1 | UTM scanner | Stop QR campaign measurement. | Analytics/Ops | UTM governance |
| `utm_raw_referral_promoted_to_channel` | P1 | dashboard review | Move to Unknown or referral issue queue. | Analytics/Ops | UTM governance |
| `paid_medium_before_preflight` | P0 | link review, campaign setup | Stop paid ads. | Growth/Ops | ads preflight |

## 10. Follow-up Engineering Input

`UTM-CHANNEL-GOVERNANCE-01` may later implement runtime helpers, scanners, or generated artifacts. This PR only defines the contract. Runtime changes require separate authorization.
