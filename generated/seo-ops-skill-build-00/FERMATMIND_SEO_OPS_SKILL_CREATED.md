# FermatMind SEO Ops Skill Created

## 1. Created files

- `.agents/skills/fermatmind-seo-ops/SKILL.md`
- `.agents/skills/fermatmind-seo-ops/references/gsc_review_playbook.md`
- `.agents/skills/fermatmind-seo-ops/references/baidu_analytics_playbook.md`
- `.agents/skills/fermatmind-seo-ops/references/cms_content_package_qa.md`
- `.agents/skills/fermatmind-seo-ops/references/cms_seo_article_publish_runner.md`
- `.agents/skills/fermatmind-seo-ops/references/chinese_overwrite_diff_runner.md`
- `.agents/skills/fermatmind-seo-ops/references/cms_field_mapping_qa.md`
- `.agents/skills/fermatmind-seo-ops/references/preview_qa.md`
- `.agents/skills/fermatmind-seo-ops/references/operator_publish_gate.md`
- `.agents/skills/fermatmind-seo-ops/references/seo_middle_office_audit.md`
- `.agents/skills/fermatmind-seo-ops/references/post_publish_smoke_test.md`
- `.agents/skills/fermatmind-seo-ops/references/canary_observation_rules.md`
- `.agents/skills/fermatmind-seo-ops/references/search_channel_queue_playbook.md`
- `.agents/skills/fermatmind-seo-ops/references/url_truth_and_drift_playbook.md`
- `.agents/skills/fermatmind-seo-ops/references/claim_gate_playbook.md`
- `.agents/skills/fermatmind-seo-ops/references/private_url_guard_playbook.md`
- `.agents/skills/fermatmind-seo-ops/references/metabase_dashboard_playbook.md`
- `.agents/skills/fermatmind-seo-ops/references/ops_portal_seo_playbook.md`
- `.agents/skills/fermatmind-seo-ops/references/revalidation_cache_playbook.md`
- `.agents/skills/fermatmind-seo-ops/assets/daily_seo_signal_report_template.md`
- `.agents/skills/fermatmind-seo-ops/assets/weekly_article_review_template.md`
- `.agents/skills/fermatmind-seo-ops/assets/seo_issue_queue_template.md`
- `.agents/skills/fermatmind-seo-ops/assets/content_package_integrity_report_template.md`
- `.agents/skills/fermatmind-seo-ops/assets/cms_import_ready_report_template.md`
- `.agents/skills/fermatmind-seo-ops/assets/cms_field_mapping_report_template.md`
- `.agents/skills/fermatmind-seo-ops/assets/chinese_actual_diff_preview_template.md`
- `.agents/skills/fermatmind-seo-ops/assets/preview_checklist_template.md`
- `.agents/skills/fermatmind-seo-ops/assets/operator_publish_review_template.md`
- `.agents/skills/fermatmind-seo-ops/assets/post_publish_smoke_template.md`
- `.agents/skills/fermatmind-seo-ops/assets/canary_observation_template.md`
- `.agents/skills/fermatmind-seo-ops/assets/search_channel_queue_report_template.md`
- `.agents/skills/fermatmind-seo-ops/assets/url_truth_drift_report_template.md`
- `.agents/skills/fermatmind-seo-ops/assets/cms_publish_gate_checklist.md`
- `.agents/skills/fermatmind-seo-ops/assets/revalidation_smoke_template.md`
- `.agents/skills/fermatmind-seo-ops/assets/claim_gate_report_template.md`

## 2. Workflow list

- `daily_seo_review`
- `weekly_article_review`
- `cms_content_package_qa`
- `cms_seo_article_publish_runner`
- `chinese_overwrite_diff_runner`
- `cms_field_mapping_qa`
- `preview_qa`
- `operator_publish_gate`
- `post_publish_smoke`
- `search_channel_queue_audit`
- `canary_observation`
- `url_truth_drift_review`
- `claim_gate_audit`
- `private_url_guard_audit`
- `seo_middle_office_audit`

## 3. Workflow trigger examples

- `Use fermatmind-seo-ops daily_seo_review with these GSC and Metabase exports.`
- `Use fermatmind-seo-ops cms_content_package_qa for this MBTI Holland package.`
- `Use fermatmind-seo-ops cms_seo_article_publish_runner up to operator publish gate only.`
- `Use fermatmind-seo-ops post_publish_smoke for this already published URL.`
- `Use fermatmind-seo-ops search_channel_queue_audit with this queue export.`

## 4. Read-only workflows

- `daily_seo_review`
- `weekly_article_review`
- `seo_middle_office_audit`
- `search_channel_queue_audit`
- `canary_observation`
- `url_truth_drift_review`
- `claim_gate_audit`
- `private_url_guard_audit`
- `metabase_dashboard_playbook`
- `ops_portal_seo_playbook`

## 5. Human-gated workflows

- `cms_seo_article_publish_runner`
- `chinese_overwrite_diff_runner`
- `operator_publish_gate`
- `post_publish_smoke` when it depends on revalidation/search submission evidence.
- `revalidation_cache_playbook`.

## 6. Always-human-authorized actions

- CMS mutation.
- CMS import.
- Article publish.
- make indexable.
- sitemap eligible.
- llms eligible.
- schema enablement.
- hreflang enablement.
- Search Channel enqueue or submit.
- GSC/Baidu/IndexNow/360/Sogou/Shenma calls.
- ISR revalidation.
- Collector/scheduler enablement.
- Metabase exposure or configuration changes.
- Production DB writes.

## 7. How to dry run this skill with the MBTI Holland content package

1. Provide the MBTI Holland content package path.
2. Invoke `cms_content_package_qa` first.
3. Produce `CONTENT_PACKAGE_INTEGRITY_REPORT.md`, `CODEX_QA_<slug>.md`, and `CMS_IMPORT_READY_REPORT.md`.
4. If the package is Chinese legacy overwrite, run `chinese_overwrite_diff_runner` with operator-provided current CMS body.
5. Run `cms_field_mapping_qa`.
6. Prepare `preview_qa` only when preview evidence exists.
7. Stop at `operator_publish_gate`.
8. Do not import, publish, submit search, or revalidate.

## 8. Next recommended task

`SEO-OPS-SKILL-DRY-RUN-00 using MBTI Holland content package`

## 9. Known limitations

- The skill is report/template infrastructure only.
- It does not include executable scripts.
- It depends on operator-provided exports for private Metabase, GSC, Baidu, CMS, and Search Channel production state.
- It does not prove current production row counts or live dashboard state.
- It cannot authorize publish, revalidation, or search submission.
