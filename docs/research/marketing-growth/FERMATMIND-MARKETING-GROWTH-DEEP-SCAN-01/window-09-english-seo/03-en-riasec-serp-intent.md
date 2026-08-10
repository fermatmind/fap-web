# EN RIASEC SERP and Intent

## Current authority

The canonical is `/en/tests/holland-career-interest-test-riasec`. Backend authority exposes one flagship RIASEC assessment with two forms: `riasec_60` (60 questions, about 8 minutes) and `riasec_140` (140 questions, about 18 minutes). The forms must not become parallel stacks.

## US, UK, global

- US results emphasize direct assessment tools and public-method evidence such as O*NET/CareerOneStop. The page should make form length, result scope, and interest-not-aptitude boundaries explicit.
- UK results more often sit beside careers, skills, course, and job-profile guidance. Those needs can be handled with vocabulary and supporting content on the same global English IA.
- Global test, definition, aptitude, personality, and career-interest queries are not one intent. `what is RIASEC` belongs primarily to the existing explainer; `career aptitude test` is not a clean RIASEC synonym.

## Audit decision

Use one global `/en/` canonical plus the existing supporting article. Candidate experiment: CMS-authoritative title/meta and first-fold wording that states “career interests, not aptitude or guaranteed fit,” presents 60Q/140Q choice, and makes the result boundary visible. No runtime change is made here.

## Surface audit

| Element | Evidence | Decision |
|---|---|---|
| Title/meta | Backend title is “Holland Career Interest Test (RIASEC)”; the sampled search title used “Free” and “Full Report” wording | VERIFY live HTML/search recrawl before a metadata experiment |
| H1 and first fold | Backend title plus frontend RIASEC form chooser are repository-verified | Keep one flagship identity; make the interest boundary visible |
| Questions/time | 60Q ≈ 8 minutes; 140Q ≈ 18 minutes | PROTECT exact form facts |
| Free scope | API says `paywall_mode=free_only`; summary, scores, and dimension explanations are free | State only the API-defined scope; do not imply guaranteed career matching |
| Result value | Six interest dimensions and Holland Code | Clarify that results support exploration, not selection or outcome prediction |
| Method boundary | Educational/non-diagnostic FAQ exists; completed B03 technical-manual evidence is UNKNOWN | NEED_EVIDENCE; no validation superlatives |
| CTA | Form-specific take URLs are repository-verified | Preserve explicit 60Q/140Q choice |
| Mobile/load/submit/result-ready | No full interaction trace was captured in this report | UNKNOWN; require focused product measurement before release |
| FAQ structured data | Shared route builds visible FAQ JSON-LD from page FAQ | Keep visible/schema parity; no hidden claims |
| Canonical/hreflang | Shared route uses localized canonical metadata | PROTECT `/en/`; do not create region routes |
| Internal links | Exact article/personality/Career edges and clicks were not fully exported | UNKNOWN; Career edges remain gated by C06/C07 |
| Social media | Backend currently returns a legacy MBTI share image URL for RIASEC | NEED_BACKEND_MEDIA_REVIEW in a separate authority scope |

## Gaps and hold conditions

Exact US/UK/device ranking is UNKNOWN. The API FAQ copy and the frontend form chooser should be reconciled in a future CMS-authoritative scope because retained API content emphasizes 60Q while the public product supports both forms.

Hold expansion if exact query ownership remains missing, the form facts diverge across API/rendered copy, claim or locale defects appear, or result-ready measurement is unavailable. Consider a small follow-up only after the same-page experiment has a stable baseline; no regional IA is justified.
