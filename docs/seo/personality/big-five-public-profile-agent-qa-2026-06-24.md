# Big Five Public Profile Agent QA

Generated: 2026-06-24T00:00:00.000Z
Decision: PASS_READY_FOR_APPROVAL_QUEUE

## Summary

- Rows evaluated: 34
- Rows passed: 34
- Rows failed: 0
- Failed rows blocked from next CMS draft path: true
- Pilot artifact sha256: 5ab10836c14eac4fc091290580621423bf5a97dab6e3b95b0bda61e466b97c84

## Sample Rows

| URL | Locale | Entity type | QA status | Failed gates |
| --- | --- | --- | --- | --- |
| /en/personality/big-five/agreeableness | en | domain | pass | 0 |
| /en/personality/big-five | en | hub | pass | 0 |
| /en/personality/big-five/conscientiousness | en | domain | pass | 0 |
| /en/personality/big-five/emotional-stability | en | polarity | pass | 0 |
| /en/personality/big-five/extraversion | en | domain | pass | 0 |
| /en/personality/big-five/facets | en | facet_hub | pass | 0 |
| /en/personality/big-five/high-agreeableness | en | polarity | pass | 0 |
| /en/personality/big-five/high-conscientiousness | en | polarity | pass | 0 |
| /en/personality/big-five/high-extraversion | en | polarity | pass | 0 |
| /en/personality/big-five/high-neuroticism | en | polarity | pass | 0 |
| /en/personality/big-five/high-openness | en | polarity | pass | 0 |
| /en/personality/big-five/low-agreeableness | en | polarity | pass | 0 |

## Boundary

- Artifact-only QA.
- No CMS write, frontend runtime change, publish, indexability change, sitemap/llms mutation, Search Queue action, or search submission.
- Failed rows must not enter the approval queue or later CMS draft path.

## Next Task

BIG-FIVE-AGENT-APPROVAL-QUEUE-INTEGRATION-01
