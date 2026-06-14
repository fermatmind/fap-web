---
name: public-profile-seo-asset-factory
description: Automated FermatMind public personality profile SEO asset factory for MBTI, Big Five, and Enneagram content packages, evidence ledgers, QA gates, and PR handoffs. Use when producing or auditing public profile content assets without directly publishing pages.
---

# Public Profile SEO Asset Factory

## Purpose

Run an automated public profile SEO content production factory for FermatMind personality assets. The skill coordinates research, GPT/Gemini/Codex model work, content package generation, evidence ledgers, schema validation, QA gates, import handoff, render smoke, and publish readiness packets.

This skill is not a page generator, not a direct publisher, and not a result-page tool.

## Automation Levels

- L1 research: scan repo truth, existing reports, backend contracts, current route/indexability state, and competitor/source inputs.
- L2 content production: create structured content package drafts through model prompt packets and ledgers.
- L3 QA/import PR: validate schemas, evidence, bilingual parity, framework rules, and prepare backend import PR handoff.
- L4 publish PR: allowed only after explicit publish/indexability gate approval; never implicit.

## When To Use

- Auditing MBTI, Big Five, or Enneagram public profile content assets.
- Preparing public profile content packages for backend CMS/API import.
- Coordinating GPT/Gemini/Codex content production with source and model-output ledgers.
- Planning noindex render, runtime smoke, or publish-readiness PRs.
- Checking indexability, sitemap, llms, duplicate, and private-result boundaries.

## When Not To Use

- Result pages, private reports, scoring, PDF generation, payment, entitlement, or report-engine work.
- Direct frontend editorial fallback content.
- Direct sitemap/llms/indexability publication without explicit gate approval.
- Big Five official 32 type generation, Enneagram 54 wing x instinct, or Tritype content.

## Required Preflight

1. Run `git status` in fap-web and fap-api.
2. Read current research under `docs/research/personality/`.
3. Confirm current backend authority in fap-api before producing packages.
4. Confirm fap-web renderer, sitemap, llms, and noindex posture.
5. Confirm PR-train scope if implementation is requested.
6. Refuse to read, copy, upload, or paste `.env`, tokens, cookies, secrets, or private user payloads.

## Supported Frameworks

- MBTI: existing indexable estate enhancement only.
- Big Five: content package generation for 5 domains, 10 poles, and 30 facets.
- Enneagram: placeholder upgrade for 3 centers and 9 core types first; 18 wings and 27 instinctual subtypes later.

## Framework-Specific Modes

- `mbti.existing_asset_enhancement`: audit or improve existing CMS-backed 64 A/T pages and comparison pages. Do not regenerate the estate.
- `big_five.content_package_generation`: create schema-valid packages for 5-10-30 dimensional assets. Do not create official 32 OCEAN SEO pages.
- `enneagram.placeholder_upgrade`: upgrade V1 placeholder assets for hub, centers, and core types. Do not create 54 combination pages or Tritype.

## Computer Use Protocol

Codex may use @computer use to open GPT or Gemini sessions when the user explicitly asks for model-assisted production. Each external model call must start from a prompt packet in `prompts/` or a run-specific prompt packet, and each output must be recorded in a model-output ledger before it can influence a content package.

Never paste cookies, tokens, secrets, `.env` values, private result payloads, user-specific scores, or private report body copy into GPT/Gemini. Competitor content may be summarized for gap review only and must not be copied. Academic claims require DOI/URL, access date, and claim mapping. Unsourced model output must be marked as inference or removed.

## GPT / Gemini / Codex Division Of Labor

- GPT: structured content drafts, bilingual independent writing, FAQ, section copy, method-boundary wording.
- Gemini: competitor gap review, SERP/search intent review, weak-claim detection.
- Codex: repo truth, schema validation, import mapping, PR decomposition, QA gates, render smoke, sitemap/llms/indexability checks.

Model output is never production truth until Codex validates it against schemas, source ledgers, framework rules, and repository boundaries.

## Research Source Rules

- Use peer-reviewed or official sources for academic claims when available.
- Record source title, author/source, year, DOI/URL, access date, claim, and limitations.
- Mark competitor evidence separately from academic evidence.
- Mark internal product evidence with repo path, report path, or API endpoint.
- Mark unsupported reasoning as inference.

## Content Package Contract

All packages must include framework, entity_type, code, locale, slug, title, summary, seo, canonical, hreflang, robots, launch_state, index_eligible, sitemap_eligible, llms_eligible, sections, faq, media, schema, method_boundary, evidence_notes, internal_links, source_ledger_refs, model_output_refs, and last_reviewed_at.

## Private Result Boundary

Result pages may inspire taxonomy, structure, or neutral phrasing only. Do not copy private report body text, user-specific scores, percentiles, close-call diagnostics, report engine internals, or any public copy that says "your result this time" / "你这次结果".

## QA Gates

Required gates:

- schema validation
- source/evidence validation
- bilingual parity and independence
- duplicate/template risk
- private result boundary
- framework-specific no-go
- publish/indexability

## Publish / Indexability Gates

No asset may enter sitemap, llms, or indexable public launch unless a separate explicit PR verifies `launch_state=published`, `index_eligible=true`, `robots=index,follow`, canonical/hreflang, duplicate risk, live smoke, and backend authority.

## PR Decomposition

Use narrow PRs:

1. audit/report
2. content package generation
3. backend import
4. frontend noindex render
5. runtime smoke
6. publish/indexability

## Repository Handoff

fap-api is the schema/import/API/content authority. fap-web consumes public API output, renders UI, and controls SEO/sitemap/llms gates. Do not create frontend static editorial content for CMS-backed surfaces.

## Failure Modes

Stop when source evidence is missing, schemas fail, bilingual parity fails, private result leakage is detected, framework no-go rules are violated, indexability changes appear in a noindex scope, or model output cannot be traced to a ledger.

## Final Output Format

Return:

1. changed files
2. framework coverage summary
3. model sessions used
4. source ledger status
5. schema validation result
6. QA gate result
7. indexability result
8. recommended next PR
9. blockers
10. local checks result
