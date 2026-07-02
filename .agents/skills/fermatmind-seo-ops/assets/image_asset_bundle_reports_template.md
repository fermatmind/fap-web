# IMAGE_ASSET_BUNDLE_REPORTS

## IMAGE_ASSET_BUNDLE_PREFLIGHT_REPORT.md

| Check | Expected | Actual | Status | Evidence |
| --- | --- | --- | --- | --- |
| `media/IMAGE_ASSET_MANIFEST.json` | present when required |  |  |  |
| schema version | `image_asset_manifest_v1` |  |  |  |
| translation group | matches package |  |  |  |
| required source files | exist |  |  |  |
| MIME / extension | jpg/jpeg/png/webp only |  |  |  |
| SVG / animated image | absent |  |  |  |
| file size | <= 10 MB |  |  |  |
| alt text | present as string, <= 255 chars |  |  |  |
| localized alt text | optional `alt_text_i18n`, not a replacement for string `alt_text` |  |  |  |
| provenance | FermatMind/operator owned |  |  |  |
| competitor asset | false |  |  |  |
| placeholders | absent from active surfaces |  |  |  |
| GEO media role | present for daily article assets |  |  |  |
| entity cluster | matches article topic and answer blocks |  |  |  |
| information gain role | describes why image is useful |  |  |  |
| decorative-only visual | false |  |  |  |
| body visual anchor | body visual maps to section/answer block when required |  |  |  |

## MEDIA_LIBRARY_IMPORT_REPORT.md

| Asset key | Role | Dry-run status | Import status | Public/CDN status | Notes |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## IMAGE_VARIANT_QA_REPORT.md

| Asset key | original | hero | card | thumbnail | og | preload | CDN 200 |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |

## CMS_IMAGE_FIELD_BACKFILL_REPORT.md

| CMS field | Required | Resolved value | Status |
| --- | --- | --- | --- |
| `cover_media_asset_key` | yes |  |  |
| `cover_image_url` | yes |  |  |
| `cover_image_alt` | yes |  |  |
| `cover_image_width` | yes |  |  |
| `cover_image_height` | yes |  |  |
| `cover_image_variants` | yes |  |  |
| `og_image_url` | yes |  |  |
| `twitter_image_url` | yes |  |  |
| `social_image_metadata` | yes |  |  |
| `body_visual_asset_key` | conditional |  |  |
| `body_visual_image_url` | conditional |  |  |
| `body_visual_fallback_authorized` | conditional |  |  |

## PREVIEW_IMAGE_RENDER_QA_REPORT.md

| Preview surface | Expected | Actual | Status | Evidence |
| --- | --- | --- | --- | --- |
| hero image | renders |  |  |  |
| card/list image | renders if surface available |  |  |  |
| OG image | public URL |  |  |  |
| Twitter image | public URL or OG reuse |  |  |  |
| body visual | renders if referenced |  |  |  |
| body visual answer anchor | renders near intended section/answer block when declared |  |  |  |
| answer-block support | visual supports a checklist/flow/table/decision/entity answer asset |  |  |  |
| placeholder/fake/private image | absent |  |  |  |

## RECENT_ARTICLE_IMAGE_DUPLICATE_CHECK.md

| Topical lane | Candidate asset key | Recent article window | Duplicate count | Policy | Decision |
| --- | --- | --- | ---: | --- | --- |
|  |  | last 5 |  | warn/block |  |

## GEO_MEDIA_ALIGNMENT_REPORT.md

| Asset key | GEO media role | Answer block / section anchor | Entity cluster | Information gain role | Decorative-only risk | Status |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  | low/medium/high |  |

Required conclusions:

- cover image supports the article's reader scene and topic.
- body visual, when required, is a checklist, flowchart, comparison table,
  decision tree, or entity map tied to a visible section or answer block.
- media alt/caption intent matches the article entity map.
- recent same-lane image concept duplication is checked, not only asset-key
  duplication.
- `GEO_READY_OBSERVATION_PENDING` may be reported only after public preview or
  public smoke confirms the relevant media and answer blocks are visible.
