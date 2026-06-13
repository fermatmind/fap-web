# NEXT_DAILY_IMAGE_BUNDLE_TEMPLATE

Use this template when asking GPT/Mode C to generate the image portion of a daily SEO content package.

## Required File Tree

```text
media/
  IMAGE_ASSET_MANIFEST.json
  cover_source_1600x900.png
  IMAGE_PROMPTS.md
```

Add these only when needed:

```text
media/
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
      "source_file": "cover_source_1600x900.png",
      "alt_text": "<descriptive alt text, <=255 chars>",
      "locale_strategy": "shared_for_zh_cn_and_en",
      "intended_usage": ["cover", "hero", "card", "thumbnail", "og", "twitter"],
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
    "recent_article_card_duplicate_check": true
  }
}
```

## Prompt Provenance Requirements

`IMAGE_PROMPTS.md` must include:

- article topic.
- visual concept.
- negative prompt: no competitor style mimicry, no logos, no screenshots, no private UI.
- intended crop safety for 16:9 and 1200x630.
- confirmation that the image is generated for FermatMind.
