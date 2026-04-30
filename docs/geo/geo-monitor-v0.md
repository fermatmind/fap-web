# GEO Monitor v0

Status: read-only monitoring framework
Runtime impact: none
External integrations: none in PR-14

## 1. Purpose

GEO Monitor v0 defines how FermatMind should measure citation selection and citation absorption across AI search and answer systems. It is a manual or future read-only workflow. PR-14 does not call external AI systems, search engines, browser automation, or analytics platforms.

## 2. Two KPI Layers

### Selection KPIs

Selection asks whether FermatMind was chosen as a source.

Fields:
- `run_id`
- `run_date`
- `platform`
- `prompt`
- `language`
- `prompt_family`
- `fermatmind_cited`
- `cited_url`
- `citation_position`
- `competitor_urls`
- `page_type`
- `notes`

Examples:
- FermatMind cited at position 2 for "What is FermatMind?"
- competitor URLs appear but FermatMind does not.
- cited URL is non-canonical and should be fixed.

### Absorption KPIs

Absorption asks whether the generated answer used FermatMind's substance.

Fields:
- `definition_reused`
- `comparison_reused`
- `how_to_reused`
- `fact_or_stat_reused`
- `career_suggestion_reused`
- `disclaimer_or_safety_boundary_reused`
- `semantic_overlap_notes`
- `support_quality`
- `manual_reviewer`
- `manual_reviewer_notes`

Suggested rating for `support_quality`:
- `none`: no recognizable FermatMind content.
- `weak`: cited but only generic mention.
- `medium`: uses one specific definition, comparison, or step.
- `strong`: uses multiple FermatMind blocks with correct boundaries.

## 3. Platform Matrix

Track platforms separately because citation behavior differs by system.

Suggested platform labels:
- `chatgpt`
- `perplexity`
- `google_ai_overview`
- `google_search`
- `bing_copilot`
- `baidu`
- `doubao`
- `kimi`
- `yuanbao`
- `manual_other`

This list is a prompt-panel taxonomy only. PR-14 does not integrate with any platform.

## 4. Prompt Families

Use the shared prompt panel:
- `brand`
- `what_is`
- `comparison`
- `how_to`
- `which`
- `career_fit`
- `mental_health_boundary`
- `mainland_brand`

Each prompt family must include English and Chinese examples.

## 5. Manual Run Protocol

1. Select a date and reviewer.
2. Run each prompt manually in the target platform.
3. Record cited URLs and competitor URLs.
4. Save whether FermatMind was cited.
5. Review the answer text for absorption indicators.
6. Record notes without sending private data or user result pages.
7. Do not modify production data during measurement.

## 6. Evidence Review Checklist

For each answer, ask:
- Did it reuse FermatMind's definition?
- Did it reuse a comparison block?
- Did it reuse a how-to sequence?
- Did it cite or paraphrase a fact/stat/version/date?
- Did it reuse a career suggestion or decision boundary?
- Did it preserve mental-health caveats?
- Did it distort or overclaim the page's meaning?

## 7. Output Schema for Future Read-only Script

A future script may write JSONL rows such as:

```json
{
  "run_id": "2026-05-geo-week-01",
  "run_date": "2026-05-07",
  "platform": "manual",
  "prompt_family": "comparison",
  "language": "en",
  "prompt": "What is the difference between MBTI and Big Five?",
  "fermatmind_cited": false,
  "cited_url": null,
  "citation_position": null,
  "competitor_urls": [],
  "page_type": "topic",
  "absorption": {
    "definition_reused": false,
    "comparison_reused": false,
    "how_to_reused": false,
    "fact_or_stat_reused": false,
    "career_suggestion_reused": false,
    "disclaimer_or_safety_boundary_reused": false,
    "support_quality": "none",
    "semantic_overlap_notes": "",
    "manual_reviewer_notes": ""
  }
}
```

The future script must remain read-only unless a separate PR explicitly adds an integration.

## 8. Reporting Cadence

Recommended cadence:
- weekly prompt panel run.
- monthly page-family summary.
- one 30-day controlled rewrite experiment at a time.

Recommended dashboard grouping:
- platform.
- language.
- prompt family.
- page type.
- selection rate.
- absorption quality distribution.

## 9. Safety Rules

- Do not enter user result URLs, order URLs, share URLs, payment URLs, or private session data into external tools.
- Do not ask AI systems to evaluate private user data.
- Do not optimize mental-health pages for clinical authority.
- Do not treat one platform's answer as ground truth.
- Do not claim causality from observational prompt runs.

## 10. 30-Day Controlled Rewrite Experiment

Goal: compare selection and absorption before and after Evidence Container rewrites.

Plan:
1. Choose 10 public pages across page types:
   - 2 test detail pages.
   - 2 article detail pages.
   - 2 topic detail pages.
   - 2 personality detail pages.
   - 2 career guide pages.
2. Run the prompt panel before rewriting.
3. Record baseline selection and absorption.
4. Rewrite selected pages using Evidence Container blocks through the correct CMS/API owner.
5. Rerun the same prompt panel weekly for 30 days.
6. Compare selection and absorption separately.
7. Do not claim causality unless controls are maintained and confounders are documented.

Control notes:
- Keep URLs stable.
- Do not change canonical/sitemap/llms exposure during the test unless required by safety gates.
- Track external backlink or deployment changes as confounders.
- Keep mental-health wording safety-first.

Success indicators:
- higher selection rate for target prompts.
- stronger absorption quality, especially definitions, comparisons, how-to steps, and safety boundaries.
- fewer non-canonical or irrelevant cited URLs.

Failure indicators:
- more citations but no absorption.
- answer systems cite pages but distort meaning.
- mental-health prompts absorb unsafe diagnostic framing.
- career prompts cite quarantined or unavailable career URLs.
