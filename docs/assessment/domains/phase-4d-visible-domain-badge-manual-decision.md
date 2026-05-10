# Phase 4D Visible Domain Badge Manual Decision

Scope: `PR-4D-00`

Train: `domain-runtime-metadata-integration-phase-4d-train`

Runtime behavior changed: no.

## Purpose

This artifact locks the human-approved scope for the Phase 4D visible domain badge. It defines exactly what is allowed, what is forbidden, and what must not be expanded without further human approval.

This is a decision-lock artifact only. It does not add any UI, runtime behavior, visible copy, CTA, SEO/GEO change, recommendation trigger, profile write, or freemium behavior.

## Approved Scope

### Domain

Only `self_understanding` may receive a visible domain badge.

### Surfaces

Only these result/report surfaces may display the badge:

- MBTI result/report shell
- Big Five result/report shell
- Enneagram result/report shell

### Badge Text

| Locale | Text |
|---|---|
| zh-CN | 自我认知 |
| en | Self-understanding |

No variants, translations, or localized synonyms are allowed beyond these two strings.

### Badge Type

`non_interactive_domain_label` — a plain visible label only.

## Explicitly Forbidden

### Forbidden Surfaces

- Career Decision surfaces
- Workstyle surfaces
- RIASEC surfaces
- Career pages (`/career/*`)
- Topic pages (`/topics/[slug]`)
- Article pages (`/articles/[slug]`)
- Test detail pages (`/tests/[slug]`)
- Personality pages (`/personality/[type]`)
- Home page
- Orders (`/orders/*`)
- Pay (`/pay/*`)
- Share (`/share/*`)
- Take (`/tests/*/take`)
- Private flows
- Domain hub
- Public decision routes

### Forbidden Copy

Any text other than the two approved strings above, including but not limited to:

- 自我诊断, 人格诊断, 人格分析, 人格分析报告
- 了解真正的你, 你的性格答案, 自我探索
- Self-discovery, Personality insight, Personal diagnosis
- Self analysis, Personality diagnosis

### Forbidden Interactions

- Link
- Button
- CTA
- Tooltip
- Modal
- Popover
- Dropdown
- Hover explanation
- Tracked interaction
- Click handler
- Any form of user interaction

### Forbidden SEO/GEO

- SEO metadata (title, description, canonical)
- JSON-LD, FAQPage, Schema
- Sitemap, llms, llms-full
- Hidden SEO copy
- Any metadata injection

### Forbidden CTA

- 查看自我认知报告, 继续探索自我, 保存到档案
- 开始职业决策, 解锁报告, 了解更多
- 查看建议, 开始下一步
- Any CTA language

### Forbidden Recommendation

- Career recommendation trigger
- Next test recommendation
- Content recommendation
- Profile-aware recommendation
- Frontend local ranking

### Forbidden Profile/Memory

- Profile write
- Memory write
- Saved careers promotion
- Long-term personality profile
- Domain memory

### Forbidden Freemium/Paywall

- New paywall
- New offer
- New SKU logic
- New report entitlement
- Domain bundle
- Checkout change
- Unlock flow change

## Career / Workstyle Boundaries

Career Decision remains blocked:
- No precise recommender
- No best-career prediction
- No success/placement guarantee
- No Big Five/RIASEC career matcher
- No AI planning claim
- No snapshot = personalized recommender

Workstyle remains blocked:
- No employment suitability
- No workplace performance prediction
- No HR screening claim
- No Big Five career matching

## Phase 4D Execution Gate

Any visible domain runtime beyond this badge scope requires explicit human approval. This includes but is not limited to: domain copy, domain CTA, SEO/GEO integration, freemium bundles, domain hubs, Career Decision unblocking, Workstyle unblocking, and public decision routes.

## No Runtime Change Statement

This PR is a decision-lock artifact only. It does not modify any runtime code, add any UI, add any visible copy, change any CTA, expand any SEO/GEO, trigger any recommendation, write any profile, or change any freemium behavior.
