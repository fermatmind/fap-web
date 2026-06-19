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
