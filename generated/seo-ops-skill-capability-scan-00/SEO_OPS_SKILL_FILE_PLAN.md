# SEO Ops Skill File Plan

## 1. Recommended directory

`.agents/skills/fermatmind-seo-ops/`

This task only plans the directory. It does not create the skill.

## 2. Required files

| File | Required? | Purpose | Depends on existing system | Notes |
|---|---:|---|---|---|
| `SKILL.md` | Yes | Entry point, hard no-go rules, workflow router | All existing SEO middle-office/CMS/Ops systems | Must declare read-only default and human authorization gates |
| `references/seo_middle_office_audit.md` | Yes | Audit URL Truth, Issue Queue, collectors, Search Channel Queue, Metabase evidence | `seo_intel`, `/ops/seo`, Metabase | Core workflow |
| `references/cms_content_package_qa.md` | Yes | QA package before backend import | CMS editorial package import and controlled publish gate | Must not import or publish |
| `references/search_channel_queue_playbook.md` | Yes | Read-only queue review and submission readiness classification | Search Channel Queue runtime | Must not submit |
| `references/post_publish_smoke_test.md` | Yes | Post-publish checks for rendered article, metadata, FAQ, CTA, sitemap, llms | fap-web runtime and CMS article API | Must not trigger revalidation |
| `references/canary_observation_rules.md` | Yes | 7/14-day canary observation rules | GSC/Baidu/IndexNow/operator exports | Treat readiness vs live carefully |
| `references/url_truth_and_drift_playbook.md` | Yes | URL Truth, authority drift, sitemap/llms parity workflow | seo_intel + fap-web source/runtime | Important because sitemap source is mixed |
| `references/claim_gate_playbook.md` | Yes | Claim lint and claim-boundary review | `ChineseClaimLinter`, CMS publish/search gates | Include RIASEC/Big Five/career-claim boundaries |
| `references/private_url_guard_playbook.md` | Yes | Private URL noindex/sitemap/llms/analytics audit | fap-web policy and route handlers | High-risk SEO safety workflow |
| `references/metabase_dashboard_playbook.md` | Yes | How to interpret private Metabase evidence | Metabase runbooks/dashboard specs | Must require operator-provided screenshots/exports |
| `assets/daily_seo_signal_report_template.md` | Yes | Daily report output template | Metabase/Ops/exported data | One of the main skill deliverables |
| `assets/weekly_article_review_template.md` | Yes | Weekly content/growth review template | CMS articles, GSC/exported metrics | Needed for next SEO growth phase |
| `assets/cms_publish_gate_checklist.md` | Yes | Controlled Publish preflight checklist | `ArticlePublishControlled` | Must include no-go conditions |

## 3. Suggested files

| File | Priority | Purpose | Can be delayed? |
|---|---|---|---:|
| `references/gsc_review_playbook.md` | P1 | Daily GSC review from exported data | No |
| `references/baidu_analytics_playbook.md` | P1 | Baidu readiness/live distinction and review | No |
| `references/ops_portal_seo_playbook.md` | P1 | `/ops/seo` evidence collection without mutations | No |
| `references/revalidation_cache_playbook.md` | P1 | Review revalidation readiness and smoke plan | No |
| `assets/seo_issue_queue_template.md` | P1 | Issue Queue summary format | No |
| `assets/post_publish_smoke_template.md` | P1 | Article smoke output format | No |
| `assets/canary_observation_template.md` | P1 | 7/14-day canary report | No |
| `assets/search_channel_queue_report_template.md` | P1 | Queue read-only audit report | No |
| `assets/url_truth_drift_report_template.md` | P1 | URL Truth/drift report | No |
| `assets/revalidation_smoke_template.md` | P2 | Revalidation smoke evidence checklist | Yes |
| `assets/claim_gate_report_template.md` | P1 | Claim gate findings template | No |
| `assets/metabase_card_gap_template.md` | P2 | Backlog format for missing Metabase cards | Yes |
| `assets/human_authorization_phrase_template.md` | P2 | Safe format for operator approval text without executing | Yes |

## 4. Final proposed tree

```text
.agents/skills/fermatmind-seo-ops/
├── SKILL.md
├── references/
│   ├── gsc_review_playbook.md
│   ├── baidu_analytics_playbook.md
│   ├── cms_content_package_qa.md
│   ├── seo_middle_office_audit.md
│   ├── post_publish_smoke_test.md
│   ├── canary_observation_rules.md
│   ├── search_channel_queue_playbook.md
│   ├── url_truth_and_drift_playbook.md
│   ├── claim_gate_playbook.md
│   ├── private_url_guard_playbook.md
│   ├── metabase_dashboard_playbook.md
│   ├── ops_portal_seo_playbook.md
│   └── revalidation_cache_playbook.md
└── assets/
    ├── daily_seo_signal_report_template.md
    ├── weekly_article_review_template.md
    ├── seo_issue_queue_template.md
    ├── post_publish_smoke_template.md
    ├── canary_observation_template.md
    ├── search_channel_queue_report_template.md
    ├── url_truth_drift_report_template.md
    ├── cms_publish_gate_checklist.md
    ├── revalidation_smoke_template.md
    ├── claim_gate_report_template.md
    ├── metabase_card_gap_template.md
    └── human_authorization_phrase_template.md
```

Reasoning for keeping one skill: the current SEO Ops surface is integrated across CMS, Ops Portal, seo_intel, Metabase, Search Channel Queue, and fap-web runtime. Splitting too early would increase duplicate safety rules. After workflows stabilize, GSC/Baidu review, CMS publish QA, and Search Channel audit can be split into narrower skills.
