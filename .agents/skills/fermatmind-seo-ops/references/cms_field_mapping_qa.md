# CMS Field Mapping QA

Purpose: verify that package fields map to CMS fields before import or preview work.

Fields to check:

- title.
- slug.
- locale.
- translation_group_id.
- meta_title.
- meta_description.
- canonical_url.
- body.
- faq.
- cta.
- status.
- publish_allowed.
- is_indexable.
- sitemap_eligible.
- llms_eligible.
- claim_gate_status.
- science_review_required.
- legal_review_required.
- operator_review_required.

Output: `CMS_FIELD_MAPPING_REPORT.md` using `assets/cms_field_mapping_report_template.md`.

Decision:

- `FIELD_MAPPING_READY` when all required fields exist and unsafe defaults are not set.
- `FIELD_MAPPING_BLOCKED` when required fields are missing, unsafe, or ambiguous.

No-go: do not write mapped values to CMS.
