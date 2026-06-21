# Personality Public Profile Agent Runner

## Goal

Produce a draft recommendation package for one public personality profile URL without writing CMS, publishing, changing indexability, or triggering Search Queue.

## Inputs

- `target_url` and framework: `mbti64`, `big_five`, or `enneagram`.
- Current CMS/API or live HTML surface.
- Reference pack, such as the MBTI64 optimized 8-page pilot pack.
- SEO signal, preferably GSC; use `GSC_EVIDENCE_PENDING` when unavailable.
- Source ledger and framework rules.

## Output

The runner writes a strict JSON draft matching `schemas/public-profile-agent-recommendation.schema.json`.

It can recommend:

- SEO title and description.
- H1.
- Quick answer.
- FAQ changes.
- Internal links.
- Duplicate differentiation notes.

## Required Gates

Every output must later pass:

- Schema validation.
- Trademark and official-affiliation gate.
- Claim risk gate.
- Duplicate/template risk gate.
- Private route gate.
- Result-page leakage gate.
- SEO projection gate.
- Bilingual consistency gate when relevant.

## Boundaries

- Do not write CMS.
- Do not publish.
- Do not change sitemap, llms, llms-full, URL Truth, or Search Queue.
- Do not use private result payloads, scores, percentiles, report ids, order ids, or private report body copy.
- Do not copy pilot page wording verbatim into expansion recommendations.
- Do not claim official MBTI affiliation, official A/T status, clinical use, hiring use, or deterministic career/relationship outcomes.
