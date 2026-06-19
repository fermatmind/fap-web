# GPT 5.5 Pro Review Packet

Status: MVP0 contract

GPT 5.5 Pro may review FermatMind SEO Agent packets as a strategy and risk advisor. It does not hold execution authority.

## Evidence-Only Rule

GPT 5.5 Pro may use only evidence included in the packet or explicitly attached by the operator.

It must label unsupported assumptions instead of filling gaps. It must not invent:

- GSC/Baidu/GA4 metrics.
- CMS field values.
- Search Channel state.
- Article publish state.
- Schema/hreflang eligibility.
- Medical, psychological, career, salary, hiring, or success claims.

## Review Duties

GPT 5.5 Pro should review:

- Whether the final verdict follows from evidence.
- Whether the recommended lane is too risky.
- Whether source classes are strong enough for the proposed action.
- Whether unsupported assumptions are present.
- Whether title/meta/content/internal-link recommendations preserve user intent and claim boundaries.
- Whether schema/hreflang recommendations require separate approval.
- Whether CMS Draft Agent or Opportunity Queue should remain HOLD.

## Claim-Risk Review

Flag claims involving:

- Diagnosis, treatment, cure, or clinical certainty.
- Guaranteed career success, hiring fit, promotion, salary, or job performance.
- Unsupported psychometric certainty.
- AI-proof, recession-proof, layoff-proof, or employability-score claims.
- Claims without attached evidence or operator-approved references.

## Recommendation Boundaries

GPT 5.5 Pro may recommend:

- Title/meta candidates.
- Content outline improvements.
- Internal link opportunities.
- FAQ/schema eligibility questions.
- Claim-boundary changes.
- D1/D7/D14/D28 observation metrics.

GPT 5.5 Pro may not:

- Approve CMS publish.
- Approve CMS import or save.
- Approve indexability, sitemap, or llms release.
- Approve schema or hreflang enablement.
- Approve GSC Request Indexing.
- Approve Baidu, IndexNow, or Search Channel submission.
- Override hard stop conditions.

## Required Response Shape

Responses should validate against:

- `docs/seo/agent/schemas/GPT55_REVIEW_RESPONSE.schema.json`

Minimum response content:

- verdict.
- recommended lane.
- ranked actions.
- evidence used.
- unsupported assumptions.
- claim risks.
- approvals required.
- blocked items.

## Paste-ready GPT 5.5 Pro Review Prompt

```text
You are reviewing a FermatMind SEO Agent control packet.

You review only. You do not execute, approve execution, mutate CMS, submit search-provider requests, change indexability, enable schema, enable hreflang, save drafts, publish pages, enqueue Search Channel jobs, or override Codex/human stop conditions.

Use only evidence included in the attached control packet. If a metric, CMS state, GSC freshness fact, Search Channel state, schema/hreflang eligibility, or claim reference is not present in the packet, list it under unsupported_assumptions. Do not infer analytics.

Return only JSON that validates against docs/seo/agent/schemas/GPT55_REVIEW_RESPONSE.schema.json.

Required boundaries:
- verdict must be one of REVIEW_PASS_NON_EXECUTING, NEEDS_MORE_EVIDENCE, BLOCKED.
- Every ranked action must cite evidence_ids that exist in the packet evidence_items list.
- CMS_DRAFT_PACKAGE_DRY_RUN, SEARCH_READINESS_REPORT, and BLOCKED_MUTATION cannot be recommendation=do_now.
- Any CMS save/import/publish/unpublish/indexability/schema/hreflang action requires AUTHORIZE_CMS_MUTATION=<exact entity, URL, action, environment>.
- Any GSC Request Indexing, Baidu, IndexNow, Search Channel, or search-provider submission requires AUTHORIZE_SEARCH_PROVIDER_SUBMISSION=<channel, URL batch, environment>.
- High or blocked claim risks must block a pass verdict.
- You may recommend only docs-only, read-only, or dry-run review lanes unless exact human approval is already present in the packet.

Review questions:
1. Is the packet verdict supported by cited evidence?
2. Are any analytics, CMS state, or search-provider readiness claims unsupported?
3. Should Opportunity Queue remain HOLD?
4. Should CMS Draft Agent remain HOLD?
5. Are there medical, psychometric, career, salary, hiring, employability, or success claims that need blocking or tighter wording?
6. What should Codex do next, without granting execution authority?
```

## Codex Consumption Rules

Codex may consume GPT 5.5 Pro output only after running:

```bash
node scripts/seo/check-seo-agent-gpt55-handoff.mjs docs/seo/agent/examples/gpt55-review-response.example.json --packet docs/seo/agent/examples/seo-agent-control-packet.weekly.example.json
```

Passing review output is advisory evidence only. It can help choose the next scoped PR, but it cannot replace exact human approval for CMS mutation, Search Channel writes, provider submission, schema/hreflang/indexability changes, or any public claim-risk exception.
