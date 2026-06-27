# Personality Agent Opportunity Ranker Automation

Generated at: 2026-06-27T05:49:58.321Z

## Decision

- Status: pass
- Final decision: PASS_PERSONALITY_OPPORTUNITY_RANKER_AUTOMATION_READY

## Summary

- Total records: 156
- Framework counts: {"big_five":34,"enneagram":26,"mbti64":96}
- Priority buckets: {"P1_QA_PASS_RECOMMENDATION_REFRESH_READY":60,"P2_DISCOVERY_BACKLOG_NEEDS_GSC_SIGNAL":73,"P2_OBSERVE_RECENTLY_PROMOTED":6,"P2_OBSERVE_OPTIMIZED_PILOT":8,"HOLD_QUERY_EVIDENCE_REQUIRED":9}
- Selected for auto-runner: 6
- Recently processed next-batch-6 URLs excluded: 6

## Selected For Auto Runner

- /en/personality/big-five/agreeableness (big_five, P1_QA_PASS_RECOMMENDATION_REFRESH_READY)
- /en/personality/big-five (big_five, P1_QA_PASS_RECOMMENDATION_REFRESH_READY)
- /en/personality/big-five/conscientiousness (big_five, P1_QA_PASS_RECOMMENDATION_REFRESH_READY)
- /en/personality/big-five/emotional-stability (big_five, P1_QA_PASS_RECOMMENDATION_REFRESH_READY)
- /en/personality/big-five/extraversion (big_five, P1_QA_PASS_RECOMMENDATION_REFRESH_READY)
- /en/personality/big-five/facets (big_five, P1_QA_PASS_RECOMMENDATION_REFRESH_READY)

## Safety Boundary

- This artifact ranks opportunities only.
- It does not generate recommendation body copy.
- It does not write CMS, approval queue, sitemap/llms, Search Queue, or production runtime state.

## Blockers

- none
