# Lexical False-Positive Policy

Operator and block gates must avoid substring-only matches for sensitive claims.

## Sensitive Claim Detection

Salary, wage, income, job-loss, and career-outcome claim detection must use word-boundary and context-aware matching. The gate must catch real claims while avoiding unrelated words that contain a sensitive substring.

Flag these examples:

- `wage`
- `wages`
- `salary`
- `salaries`
- `income`
- `income prediction`
- `pay prediction`
- `job loss`
- `career disappearance`

Do not flag these examples by substring alone:

- `sewage system`
- `stormwater and sewer drawings`
- `sewer inspection route`
- `wage` inside a longer unrelated token

## Required Behavior

- Do not suppress true salary, wage, pay, or income claims.
- Do not suppress true employment-outcome claims such as job loss, unemployment, career disappearance, or guaranteed safety.
- Do not flag `sewage` because it contains `wage`.
- Do not flag `sewer` because it resembles `wage` or salary concepts.
- When the match is ambiguous, report a `lexical_context_review` finding rather than silently passing or failing.

The purpose is to reduce false positives in work-activities and other non-salary blocks without weakening the salary/income boundary.
