# GPT Daily SEO Image Generation Prompt Template

Use this template when the operator asks Codex to generate the daily prompt for
GPT to create the SEO article cover image and body visual before Stage 4 package
QA.

Purpose:

- Generate exactly two original image files for one daily bilingual SEO article:
  a cover image and a body visual.
- Make both images usable by the Mode C package and Media Library importer.
- Make the body visual a GEO answer asset, not decorative filler.

Do not use this template to publish, import into CMS, register Media Library
assets, submit search, enable schema/hreflang, or deploy.

## Paste-Ready GPT Prompt

```text
You are generating original image assets for one FermatMind bilingual SEO article.

Task:
Create exactly two downloadable image files:
1. cover image
2. body visual image

Do not return only prompts or descriptions. Return the actual image files.

Article identity:
- title direction: <TITLE_DIRECTION>
- slug: <SLUG>
- primary keyword: <PRIMARY_KEYWORD>
- secondary keywords: <SECONDARY_KEYWORDS>
- article positioning: <ARTICLE_POSITIONING>
- target reader scene: <TARGET_READER_SCENE>
- core reader question: <CORE_READER_QUESTION>
- primary CTA route: <PUBLIC_CTA_ROUTE>
- claim boundaries: <CLAIM_BOUNDARIES>

Output file requirements:
- cover file name: cover_source_1600x900.png
- body visual file name: body_visual_source_1600x900.png
- dimensions: 1600x900, landscape 16:9
- format: PNG preferred; JPG/WebP acceptable only if PNG cannot be produced
- no transparent-background dependent design
- no watermark
- no logo
- no competitor screenshot
- no private UI
- no fake FermatMind UI screenshot
- no copyrighted character, brand, school, employer, or platform interface
- no visible personal data
- no medical, hiring, admission, salary, or guaranteed-outcome implication

Cover image requirements:
- Role: cover_context
- Purpose: express the article's real reader scene and topic.
- Style: realistic editorial scene with light product-like overlays is acceptable.
- It must not look like generic stock photography.
- It must leave safe negative space for card/hero crops.
- Avoid dense readable text. Use simple icons, abstract cards, documents, and
  diagrams rather than text-heavy UI.
- The emotional tone should match the article: practical, calm, decision-focused,
  not panic marketing.

Body visual requirements:
- Role: answer_block_visual
- Must be one of:
  - checklist
  - flowchart
  - comparison table
  - decision tree
  - entity relationship map
- It must support this specific answer block or section:
  - answer_block_id: <ANSWER_BLOCK_ID>
  - body_anchor: <BODY_SECTION_ANCHOR>
  - answer block purpose: <ANSWER_BLOCK_PURPOSE>
- It should help a reader understand the article's framework without reading a
  long paragraph.
- Prefer icons, lanes, cards, arrows, and status states.
- Use minimal, generic labels only when needed. Avoid long text because this is
  a bilingual article and generated text often contains artifacts.

GEO/media alignment:
- entity_cluster:
  - <ENTITY_1>
  - <ENTITY_2>
  - <ENTITY_3>
- information_gain_role:
  - cover: sets the real reader scenario for the query
  - body visual: turns the core answer into a reusable checklist/flow/decision asset
- visual_not_decorative: true

Negative prompt:
- no competitor style mimicry
- no 16Personalities / Truity / 123test visual style
- no official government/admission-system implication
- no school/employer logo
- no exaggerated success outcome
- no money/salary guarantee visual
- no diagnosis/therapy visual
- no fake app screenshot
- no unreadable tiny text blocks
- no generic decorative abstract background as the main subject

Return:
1. cover_source_1600x900.png
2. body_visual_source_1600x900.png
3. A short note with suggested manifest fields:
   - cover alt_text as one string
   - body visual alt_text as one string
   - optional alt_text_i18n for zh-CN/en
   - geo_media_role
   - answer_block_id
   - entity_cluster
   - information_gain_role
   - body_anchor
   - visual_not_decorative=true

If you cannot generate both real image files, explicitly say:
BLOCKED_NEEDS_IMAGE_GENERATION_BEFORE_MEDIA_LIBRARY_IMPORT
```

## Codex Fill-In Rules

- Use the approved daily topic fields exactly.
- Choose `answer_block_id` from the article's planned first/core answer block.
- Keep `alt_text` as a single string. Use optional `alt_text_i18n` only as
  extra metadata.
- Prefer body visuals that will remain useful in public preview even if small
  generated labels are ignored.
- Do not ask GPT to invent Media Library URLs, asset IDs, CDN URLs, CMS IDs,
  article IDs, or publication state.
- Do not ask GPT to generate schema, hreflang, sitemap, llms, search, or deploy
  artifacts.

## Expected Follow-Up

After GPT returns the two files, Codex Stage 4 should place or map them into:

```text
media/
  cover/
    cover_source_1600x900.png
  body/
    body_visual_source_1600x900.png
```

Then normalize `media/IMAGE_ASSET_MANIFEST.json` using the GEO media contract
from `fermatmind-seo-ops/assets/next_daily_image_bundle_template.md`.
