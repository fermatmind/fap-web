# Career Work Activities Quality Gates

Work activities are the evidence base for fit, skills, risk, adjacent comparison, and page assembly. This block must be concrete enough to support other blocks.

## PASS Requirements

- Every occupation has task/workflow evidence from official or credible role sources.
- Core responsibilities are grouped into occupation-specific task clusters.
- Tools, systems, materials, stakeholders, settings, schedule/rhythm, and environment are separated when evidence supports them.
- Generic phrases such as "communicates with stakeholders", "maintains records", or "uses technology" fail unless tied to a specific workflow.
- Adjacent source usage is labeled and does not become direct occupation evidence.
- `zh-CN` reads as mainland career guidance and not a literal O*NET translation.
- `en` reads for US/UK/EU career users and not as translated Chinese text.
- Repeated phrase and structural skeleton reuse are below threshold.
- Direct military O*NET profiles may use the narrow `55-*` military profile exception only when the direct profile has a duties paragraph, at least 6 occupation-specific duty/workflow items, and a military boundary.
- Salary/wage/income leakage checks must use word-boundary matching and must not flag `sewage` or `sewer` as wage/salary claims.

## Evidence Reopen Triggers

- broad-family fallback with no occupation-specific task
- tool claims without source support
- environment or physical-demand claims without source support
- role prose that can apply to most office, trade, or service jobs

## Military Policy Review Trigger

If a military `55-*` direct profile has fewer than the normal task count but satisfies the military duties exception, do not force fabricated task items. Classify remaining gate mismatch as `gate_policy_review_needed`.

## Final QA Focus

Final independent QA must sample technician, operator, manager, specialist, medical, aviation, education, creative, and physical-service roles because these are most vulnerable to template work descriptions.
