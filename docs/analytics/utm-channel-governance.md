# UTM Channel Governance

Scope: ANALYTICS-SEO-P0-05. This document records the shared frontend UTM taxonomy for owned external propagation links.

## Canonical Rules

Owned links must use the shared helper in `lib/tracking/utmGovernance.ts` instead of ad hoc query strings.

Required fields:

- `utm_source`
- `utm_medium`
- `utm_campaign`

Reserved unsafe source values:

- `chatgpt.com`
- `qr`

## Channel Taxonomy

| Channel | Source | Medium | Campaign |
| --- | --- | --- | --- |
| WeChat private share | `wechat` | `private` | `mbti` |
| Xiaohongshu social | `xiaohongshu` | `social` | `career_test` |
| Zhihu answer | `zhihu` | `answer` | `mbti_holland` |
| ChatGPT referral | `chatgpt` | `referral` | `seo_review` |
| Bilibili video | `bilibili` | `video` | `career_test` |
| Douyin social | `douyin` | `social` | `career_test` |
| YouTube video | `youtube` | `video` | `career_test` |
| TikTok social | `tiktok` | `social` | `career_test` |
| Weibo social | `weibo` | `social` | `career_test` |
| X social | `x` | `social` | `career_test` |
| Facebook social | `facebook` | `social` | `career_test` |
| Instagram social | `instagram` | `social` | `career_test` |
| Reddit community | `reddit` | `community` | `career_test` |
| Website result share | `website` | `share` | `result_share` |

## Current Frontend Application

- Footer social links use governed UTM params and preserve non-UTM platform params such as `igsh`, `spm_id_from`, and `modal_id`.
- Existing SEO CTA attribution continues to preserve inbound UTM params.
- Result/share URL generators should use the `website_share` channel when their owning PR scope allows touching result components.

## Deferred

This PR does not rewrite CMS-authored article bodies or backend content. CMS/operator content should use the same taxonomy when links are authored outside the frontend codebase.
