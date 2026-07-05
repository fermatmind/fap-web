# CMS Landing Surface Readback

URL:

`https://api.fermatmind.com/api/v0.5/landing-surfaces/test_detail_mbti_personality_test_16_personality_types?locale=zh-CN&org_id=0`

Result:

- HTTP: 200
- `x-fastcgi-cache`: `BYPASS`
- `surface_key`: `test_detail_mbti_personality_test_16_personality_types`
- `locale`: `zh-CN`
- `status`: `published`
- `is_public`: true
- `page_blocks` count: 0
- payload contains FAQ: false

Payload keys:

- `hero_copy`
- `seo_title`
- `seo_description`
- `h1_or_hero_title`
- `primary_cta_label`
- `secondary_cta_path`
- `secondary_cta_label`
- `methodology_boundary_note`
- `approved_internal_link_targets`

Interpretation:

The CMS landing surface contributes metadata/hero/CTA/method-boundary content, not FAQ content. It is not the source of the stale 4-entry FAQ observed on the canonical production HTML.
