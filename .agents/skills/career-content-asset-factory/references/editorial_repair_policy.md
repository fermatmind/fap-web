# Editorial Repair Policy

Editorial quality findings produce repair plans; they do not authorize rewriting content automatically.

## Allowed In A Later Repair Goal

Only with an explicit repair goal, Codex may propose or apply bounded repairs to selected reader-facing fields. Repairs must preserve source traceability and must not add new facts.

Allowed repair scopes can include:

- tightening generic phrasing
- improving occupation-specific wording using existing block evidence
- removing repeated boilerplate
- improving locale naturalness
- making CTA language clearer and safer
- reducing overlong boundary text

## Prohibited Without Separate Approval

- changing source URLs, source IDs, evidence IDs, row hashes, source years, official codes, seed identity, or canonical slugs
- creating new occupational facts
- changing salary, AI impact scores, credential rules, licensing claims, regulatory claims, or personality/fit interpretation facts
- moving search_projection or SEO candidates into reader assets
- modifying runtime pages, CMS, sitemap, `llms.txt`, canonical, noindex, robots, JSON-LD, staging, or production import

## Repair Plan Requirements

Every repair plan row must include:

- affected slug and locale
- block and field paths
- finding IDs
- maximum allowed repair scope
- fields that must be preserved
- source references to use
- whether human review is required

## Human Review Required

Human review is required when a finding touches legal, clinical, aviation, military, education, regulated credentials, salary, AI impact scoring, or public SEO/runtime behavior.
