# answer_surface_v1 Extension Proposal

Status: future P1/P2 proposal
This PR does not change the backend contract.
Existing `answer_surface_v1` remains valid.

## 1. Purpose

PR-12 made article detail pages visibly render existing `answer_surface_v1`. PR-13 made `/llms-full.txt` summarize existing answer surfaces. The next step is not to create a second frontend content owner. The next step is to extend the backend-owned answer surface so each page can expose richer Evidence Container blocks in a stable, CMS/API-authoritative way.

This document proposes a future shape only. It is not an implementation.

## 2. Current Compatible Fields

Existing `answer_surface_v1` fields that remain valid:

- `summary_blocks`
- `faq_blocks`
- `next_step_blocks`
- `evidence_refs`
- metadata fields such as scope, fingerprint, and surface refs where present

Any future extension must be backward compatible with current consumers.

## 3. Proposed Future Shape

```json
{
  "version": "answer.surface.v1",
  "summary_blocks": [],
  "definition_blocks": [],
  "comparison_blocks": [],
  "how_to_blocks": [],
  "evidence_blocks": [],
  "caveat_blocks": [],
  "faq_blocks": [],
  "next_step_blocks": [],
  "evidence_refs": [],
  "review": {
    "last_reviewed_at": null,
    "reviewer_name": null,
    "reviewer_role": null
  }
}
```

## 4. Proposed Block Semantics

### summary_blocks

Current behavior stays unchanged. These are short answer-first statements.

### definition_blocks

Suggested fields:
- `key`
- `term`
- `definition`
- `scope_note`
- `related_terms`

Use for MBTI, Big Five, RIASEC, Growth ID, personality types, and core career terms.

### comparison_blocks

Suggested fields:
- `key`
- `title`
- `items`
- `dimensions`
- `decision_note`

Use for comparisons such as MBTI vs Big Five or screening vs diagnosis.

### how_to_blocks

Suggested fields:
- `key`
- `title`
- `steps`
- `completion_signal`

Use for career decisions, interpretation workflows, and result follow-up.

### evidence_blocks

Suggested fields:
- `key`
- `claim`
- `fact`
- `number`
- `source_ref`
- `as_of`

Use only for facts already supported by product data, CMS review, or cited sources. Do not invent statistics.

### caveat_blocks

Suggested fields:
- `key`
- `topic`
- `boundary`
- `when_to_escalate`

Required for mental-health pages and recommended for personality/career pages.

### faq_blocks

Keep existing shape. FAQ must match visible HTML when rendered or included in JSON-LD.

### next_step_blocks

Keep existing shape. Links must be canonical public final URLs. No private flows.

### evidence_refs

Future evidence refs should identify sources without requiring full raw JSON in page output or `/llms-full.txt`.

## 5. Migration Principles

- Backend/CMS remains the owner.
- Frontend renders known block types and omits unknown block types.
- Do not create frontend fallback content for missing blocks.
- Do not hide FAQ or evidence only in JSON-LD.
- Add one entity family per PR.
- Add contract tests for visible HTML and `/llms-full.txt` summarization.

## 6. Page-family Rollout Order

1. Article detail, because PR-12 already renders `answer_surface_v1`.
2. Topic detail, because concept hubs benefit from definitions and comparisons.
3. Test detail, because flagship tests need caveats and decision steps.
4. Personality detail, because type pages need boundary wording and next steps.
5. Career guides, because they are naturally procedural.
6. Career job detail, only after career gates pass.

## 7. Non-goals

- No Product or SoftwareApplication schema.
- No markdown mirror.
- No external AI calls.
- No CMS migration in PR-14.
- No second content owner.
- No generated content.
