# CAREER-1046-FRONTEND-DISCOVERY-UX-01

## Summary

This PR keeps the public Career jobs discovery surface aligned to backend runtime authority after the 1046 occupation rollout.

The frontend changes are limited to rendering and contract coverage:

- the jobs index now disables local static occupation fallback for this public discovery page;
- dataset-only rows that are not public and are not present in the backend detail-ready job index are filtered out;
- the page renders a compact visible result summary for the current filter/search view;
- directory rows and backend-confirmed detail links expose stable test ids for contract coverage.

## Authority Boundary

Career occupation content, publication state, indexability, sitemap eligibility, and llms eligibility remain backend-authoritative. This PR does not add career copy, job facts, local JSON datasets, CMS fallback content, Search Channel work, URL submission, or production deploy steps.

## Expected Runtime Behavior

- `/en/career/jobs` and `/zh/career/jobs` render the backend-published cohort.
- The 1046 public detail cohort can be rendered as 1046 detail-ready rows when backend dataset and job index authority agree.
- Excluded slugs such as `software-developers`, `digital-forensics-analysts`, and `computer-occupations-all-other` are not surfaced as discovery cards unless backend authority later makes them public detail-ready.
- If backend authority is unavailable, the jobs page renders an empty/error state instead of local static occupation cards.

## Repository Rule Impact

This is a frontend rendering and contract PR. It reinforces the existing rule that career jobs, publication state, and public SEO/discoverability authority come from backend public APIs, not frontend fallback data.
