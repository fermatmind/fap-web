# MBTI Recommendation Copy Boundary

Scope: PR-SCB-03

Train: semantic-claim-boundary-enforcement-train

Runtime behavior changed: no

## Goal

PR-SCB-03 locks MBTI career recommendation language to bounded, snapshot-based direction support. It prevents MBTI recommendation copy from being described as a live personalized recommender, a precise career prediction, or a career success predictor.

This PR does not alter the MBTI recommendation runtime, career recommendation bundle, MBTI result shell copy, visible page copy, matched jobs, scoring, or explainability output.

## Required Boundary

MBTI recommendation status:

- `recommendation_eligible = next_step_only`
- `allowedUse = snapshot_based_career_direction_support`
- `notAllowedUse = live_personalized_recommender | career_success_predictor | precise_career_recommendation`

## Forbidden Phrases

- `live personalized recommender`
- `实时个性化职业推荐`
- `精准职业推荐`
- `精准匹配职业`
- `最佳职业预测`
- `最适合职业`
- `职业成功预测`
- `MBTI predicts career success`

## Allowed With Boundary

- `职业方向参考`
- `探索路径`
- `职业探索建议`
- `snapshot-based direction support`
- `基于当前公开快照的方向支持`
- `decision support`
- `next step`

## Soft-Boundary Inventory

The following terms are not remediated in this PR. They must remain bounded by surrounding context and future copy remediation:

- `career recommendation`
- `职业推荐`
- `recommendations`
- `match best`
- `高匹配方向`

Known soft-boundary evidence:

- `components/result/mbti/MbtiResultShell.tsx` contains “高匹配方向” and “match best” in result next-step copy.
- `app/(localized)/[locale]/career/recommendations/page.tsx` contains explicit direction-boundary copy: recommendations narrow the field and do not decide for the user.
- `lib/geo/evidenceContainer.ts` states that career recommendation is snapshot-based direction support and must not imply a live personalized recommender.

## Non-Runtime Guarantees

- MBTI recommendation runtime changed: no
- Career recommendation bundle changed: no
- MBTI result shell copy changed: no
- Matched jobs changed: no
- Scoring changed: no
- Explainability changed: no
