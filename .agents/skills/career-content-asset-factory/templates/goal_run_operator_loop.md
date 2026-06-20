# Goal: Run Career Content Operator Loop

Use `career-content-asset-factory`.

Run operator loop in dry-run mode until the next human-approval boundary or hard stop. Do not perform content generation unless the user explicitly authorizes non-dry-run operation and the selected action is autonomous-allowed.

Stop on schema change, runtime/SEO/CMS, staging, approved transition, production import, `REJECT`, `BLOCKED`, or exhausted repair loops.
