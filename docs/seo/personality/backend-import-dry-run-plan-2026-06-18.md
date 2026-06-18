# MBTI64 Backend Import Dry-Run Plan

## Summary
- Artifact: MBTI64-BACKEND-IMPORT-DRY-RUN-PLAN-01
- Final status: conditional
- Source package: docs/seo/personality/content-packages/pilot-v2.1/mbti64-content-package-pilot-v2.1.json
- Source package SHA-256: 09acd30cfd7a8dd3eb0eacf8bef1ed10b54cfa0b89277e328faa6583fdf602a3
- Mode: dry-run plan only

This plan defines what a future backend import dry-run should simulate. It does not import CMS drafts, create CMS revisions, publish pages, change sitemap, change llms, change llms-full, change frontend rendering, change scoring/result/payment/account routes, or submit search URLs.

## Planned Operations
| existing_url | locale | page_type | operation | publish | sitemap | llms | search | rollback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /en/personality/intj-a-vs-intj-t | en | comparison | create_revision_draft_only | false | false | false | false | true |
| /zh/personality/istj-a | zh-CN | variant | create_revision_draft_only | false | false | false | false | true |
| /en/personality/intp-a-vs-intp-t | en | comparison | create_revision_draft_only | false | false | false | false | true |
| /zh/personality/infp-t | zh-CN | variant | create_revision_draft_only | false | false | false | false | true |
| /en/personality/intj-a | en | variant | create_revision_draft_only | false | false | false | false | true |
| /en/personality/intj-t | en | variant | create_revision_draft_only | false | false | false | false | true |
| /zh/personality/intj-a | zh-CN | variant | create_revision_draft_only | false | false | false | false | true |
| /zh/personality/intj-t | zh-CN | variant | create_revision_draft_only | false | false | false | false | true |

## Global Defaults
- operation: create_revision_draft_only
- production_url_changed: false
- canonical_changed: false
- publish_immediately: false
- sitemap_changed: false
- llms_changed: false
- search_submitted: false
- expected_revision_state: draft_for_operator_review
- rollback_required: true

## Blockers
- None

## Warnings
- Backend import path for this exact MBTI64 V2.1 package is unknown; future backend PR must implement dry-run/write support.
- Some V2.1 fields have uncertain first-class backend support and may need structured snapshot_json/payload_json storage.
- Carried from gates: Medium duplicate-risk signals are present but justified as non-blocking sibling/topic similarity.

## Recommended Next Task
MBTI64-BACKEND-IMPORT-DRY-RUN-01
