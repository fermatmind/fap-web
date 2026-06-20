# Direct Military O*NET Profile Evidence Policy

Military occupation profiles require a narrow evidence policy because O*NET explicitly states that it does not collect the same task/activity data for military occupations as it does for civilian occupations.

## Allowed Exception

A direct military profile may PASS work-activities evidence with fewer than the normal task-item count only when all conditions are met:

1. The occupation is a direct O*NET military profile with a `55-*` code.
2. The source is the direct occupation profile, not a civilian proxy.
3. The O*NET page includes a duties or profile paragraph that describes occupation-specific work.
4. The evidence ledger extracts at least `6` occupation-specific duty/workflow items from that direct profile and other allowed direct military sources when available.
5. The evidence ledger includes a clear military boundary stating that the data source is a military profile with limited direct task collection.
6. Reader-facing synthesis does not substitute civilian occupation tasks for military duties.

## Disallowed

- Do not use civilian proxy profiles as direct military evidence.
- Do not generalize this exception to non-military occupations.
- Do not pass generic phrases such as `operates equipment`, `maintains records`, or `supports missions` unless they are tied to a direct military duty/workflow.
- Do not use the military exception to bypass source traceability or occupation-specific workflow requirements.

## Gate Label

When this exception is used, audits should record:

- `military_direct_onet_profile_exception=true`
- `military_profile_duties_min_items>=6`
- `military_boundary_present=true`

If any condition is missing, classify the finding as `gate_policy_review_needed` or `evidence_insufficient` rather than forcing additional fabricated task items.
