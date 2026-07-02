# NEXT_DAILY_IMAGE_BUNDLE_TEMPLATE

Use this template when asking GPT/Mode C to generate the image portion of a daily SEO content package.

For the separate daily request that asks GPT to generate only the two article
image files, use:

`fermatmind-wechat-seo-article-editor/assets/GPT_DAILY_SEO_IMAGE_GENERATION_PROMPT_TEMPLATE.md`

Then map the returned files into the package media tree below during Stage 4.

## Required File Tree

```text
media/
  IMAGE_ASSET_MANIFEST.json
  IMAGE_PROMPTS.md
  cover/
    cover_source_1600x900.png
```

Add these only when needed:

```text
media/
  body/
    body_visual_source_1600x900.png
  og_1200x630.png
```

## Manifest Skeleton

```json
{
  "schema_version": "image_asset_manifest_v1",
  "package_id": "<package-id>",
  "translation_group_id": "<translation-group-id>",
  "locale_scope": ["zh-CN", "en"],
  "assets": [
    {
      "asset_key": "article.<topic>.<role>.v1",
      "role": "cover",
      "source_file": "cover/cover_source_1600x900.png",
      "alt_text": "<descriptive alt text, <=255 chars>",
      "alt_text_i18n": {
        "zh-CN": "<optional localized alt text>",
        "en": "<optional localized alt text>"
      },
      "locale_strategy": "shared_for_zh_cn_and_en",
      "intended_usage": ["cover", "hero", "card", "thumbnail", "og", "twitter"],
      "geo_media_role": "cover_context",
      "answer_block_id": "<answer-block-id-or-null>",
      "entity_cluster": ["<primary-entity>", "<related-entity>"],
      "information_gain_role": "sets_reader_scene_for_article_topic",
      "body_anchor": null,
      "visual_not_decorative": true,
      "dimensions_expected": {
        "width": 1600,
        "height": 900,
        "exact": false
      },
      "format_allowed": ["image/jpeg", "image/png", "image/webp"],
      "max_bytes": 10485760,
      "fallback_allowed": false,
      "provenance": {
        "source": "gpt_generated_for_fermatmind",
        "prompt_file": "IMAGE_PROMPTS.md",
        "competitor_asset": false,
        "license_notes": "Generated for FermatMind daily SEO package; no competitor asset reuse."
      }
    }
  ],
  "qa_gates": {
    "file_exists": true,
    "dimensions": true,
    "format": true,
    "file_size": true,
    "alt_text": true,
    "no_competitor_image": true,
    "no_private_asset": true,
    "no_placeholder": true,
    "media_library_public": true,
    "cdn_200": true,
    "variants_present": true,
    "cms_payload_backfilled": true,
    "preview_rendered": true,
    "recent_article_card_duplicate_check": true,
    "recent_article_concept_duplicate_check": true,
    "geo_media_alignment": true,
    "body_visual_answer_block_anchor": true
  }
}
```

Rules:

- `alt_text` must remain a string for importer compatibility. Use optional
  `alt_text_i18n` for localized variants.
- Cover images must show the article's real reader scene or decision context,
  not generic decorative stock-like imagery.
- Body visuals, when present, must be checklist, flowchart, comparison table,
  decision tree, or entity map assets tied to a section or answer block.
- Do not mark `visual_not_decorative=true` unless the image directly supports
  the article's entity cluster or answer framework.

## Prompt Provenance Requirements

`IMAGE_PROMPTS.md` must include:

- article topic.
- visual concept.
- GEO media role and answer block supported by the visual.
- negative prompt: no competitor style mimicry, no logos, no screenshots, no private UI.
- intended crop safety for 16:9 and 1200x630.
- confirmation that the image is generated for FermatMind.
