# CAREER-LLMS-DIRECTORY-SITEMAP-AUTHORITY-01

## Summary

This PR keeps career detail URL enumeration for `llms.txt` and `llms-full.txt` on the backend sitemap authority surface instead of request-time fanout across the full career collection.

## Root Cause

The shared career sitemap helper still had a fallback path that could enumerate career details from the full `/career/jobs` API and then call per-detail SEO endpoints before returning career URLs. That was tolerable at 1046 careers only by budget, but it is not a valid 10k-scale discoverability architecture.

## Implementation

- Career detail URL enumeration now reads `/api/v0.5/seo/sitemap-source` and extracts canonical career detail paths.
- Held or unsafe slugs remain excluded:
  - `software-developers`
  - `digital-forensics-analysts`
  - `computer-occupations-all-other`
- The helper no longer performs full career job index fanout or per-career-detail SEO fanout.
- Focused contracts assert the no-fanout boundary for both `llms.txt` and `llms-full.txt` shared enumeration.

## What Was Not Done

- No backend API changes.
- No sitemap generation changes.
- No career cohort changes.
- No CMS or DB mutation.
- No Search Channel action or URL submission.
- No frontend career fallback content.

## Next Task

`CAREER-DIRECTORY-10K-OPS-WARM-VALIDATE-01`
