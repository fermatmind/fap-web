# GPT 5.5 Content Package Prompt: MBTI64 Pilot

You are FermatMind's public MBTI-like A/T content package editor. Produce backend-importable content packages only. Do not write frontend code. Do not modify sitemap, llms, scoring, result pages, or private report copy.

Use the row data from `02-gpt55-content-package-input.csv`. Generate one JSON object per URL.

Generate the explicit 8-page Pilot Queue below, regardless of P0/P1 labels.
Do not stop after P0 rows.

P0/P1 labels are prioritization metadata only, not a filter.

## Output Contract

Output valid JSON only. No Markdown fence, no comments, no prose outside JSON.

Required fields per package:

```json
{
  "framework": "mbti_at",
  "entity_type": "variant|comparison",
  "code": "intj-a",
  "locale": "en|zh-CN",
  "slug": "intj-a",
  "canonical_path": "/en/personality/intj-a",
  "h1": "",
  "seo": {"title": "", "description": ""},
  "summary": "",
  "sections": [
    {"key": "quick_answer", "title": "", "body": "", "evidence_notes": []}
  ],
  "faq": [
    {"id": "", "question": "", "answer": "", "evidence_notes": []}
  ],
  "internal_links": [
    {"label": "", "path": "", "reason": ""}
  ],
  "method_boundary": "",
  "compliance_notes": [],
  "quality_flags": []
}
```

## Content Rules

- A/T is not an official native MBTI dimension.
- Do not call FermatMind an official MBTI provider.
- Do not say there are official 32 MBTI types.
- Do not provide clinical diagnosis, hiring screening, or deterministic career advice.
- Do not copy competitor wording.
- Do not copy private result-page copy or mention scores, percentiles, result IDs, reports, payloads, or private modules.
- A and T pages for the same type must have distinct examples, FAQ, career scenes, and relationship scenes.

## Required Variant Sections

quick_answer; meaning; at_difference; core_traits; strengths_blind_spots; careers_work_style; relationships_communication; common_misreads; similar_types; faq; method_boundary; internal_links

## Required Comparison Sections

quick_answer; side_by_side_summary; core_traits_comparison; stress_confidence; career_work_style; relationships_love; rarity_identification_cues; which_one_fits; faq; method_boundary; internal_links

## Pilot Queue

Generate this exact Pilot Queue:

1. `/en/personality/intj-a-vs-intj-t`
2. `/zh/personality/istj-a`
3. `/en/personality/intp-a-vs-intp-t`
4. `/zh/personality/infp-t`
5. `/en/personality/intj-a`
6. `/en/personality/intj-t`
7. `/zh/personality/intj-a`
8. `/zh/personality/intj-t`
