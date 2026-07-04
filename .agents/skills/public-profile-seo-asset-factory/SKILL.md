---
name: public-profile-seo-asset-factory
description: Automated FermatMind public personality profile SEO asset factory for MBTI, Big Five, and Enneagram content packages, evidence ledgers, QA gates, and PR handoffs. Use when producing or auditing public profile content assets without directly publishing pages.
---

# Public Profile SEO Asset Factory

## Purpose

Run an automated public profile SEO content production factory for FermatMind personality assets. The default automation mode is `codex_native_content_generation`: Codex builds the source ledger, drafts content, performs skeptical self-review, repairs when needed, validates QA gates, and prepares handoff previews without requiring external browser model calls.

This skill is not a page generator, not a direct publisher, and not a result-page tool.

## Automation Levels

- L1 research: scan repo truth, existing reports, backend contracts, current route/indexability state, and competitor/source inputs.
- L2 content production: create structured content package drafts through model prompt packets and ledgers.
- L2 default `codex_native_content_generation`: Codex-native draft, skeptical self-review, repair pass when needed, final package, QA gates, and handoff preview.
- L3 QA/import PR: validate schemas, evidence, bilingual parity, framework rules, and prepare backend import PR handoff.
- L4 publish PR: allowed only after explicit publish/indexability gate approval; never implicit.

## When To Use

- Auditing MBTI, Big Five, or Enneagram public profile content assets.
- Preparing public profile content packages for backend CMS/API import.
- Coordinating Codex-native content production with source and model-output ledgers.
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

## Public Profile Agent Matrix

The public profile factory is split into framework-specific agents plus shared QA and release guards:

- Content Orchestrator Agent: routes work to framework agents, records inputs/outputs, and prevents scope mixing.
- MBTI64 Public Personality Agent: audits and improves the existing 64 A/T variant pages and A-vs-T comparison pages.
- MBTI Hot Cross-Type Comparison Agent: prioritizes and packages high-opportunity cross-type comparison assets, such as INTJ/INTP, ENTJ/INTJ, INFJ/INFP, and ISTJ/ISFJ, without creating frontend fallback copy.
- Big Five Public Personality Agent: produces or QA-checks 5-domain, 10-pole, and 30-facet dimensional content packages.
- Enneagram Public Personality Agent: upgrades hub, 3 centers, and 9 core types before wings or instinctual subtypes.
- SEO Projection QA Agent: checks search-intent, title/description, internal-link, llms, sitemap, and Search Queue readiness artifacts.
- Editorial Claim QA Agent: checks trademark, method-boundary, duplicate-risk, private-result-boundary, and deterministic-claim rules.
- Release Guard Agent: separates draft/package, backend import, frontend render, publish/indexability, sitemap/llms, and search-release gates.

These agents are coordination contracts, not autonomous publishers. They must not write production CMS, mutate sitemap or llms output, enqueue Search Queue items, submit search providers, or change result pages without a separate explicit gate.

## Agent Runner Contract

Use `schemas/public-profile-agent-recommendation.schema.json` and `runbooks/personality-public-profile-agent-runner.md` when a framework agent needs to turn a target public personality URL into a draft recommendation package.

Runner inputs are target URL, framework, current CMS/API or live surface, optimized reference pack, SEO/GSC signal, source ledger, and framework rules. Runner outputs are draft recommendations for title, description, H1, quick answer, FAQ, internal links, and duplicate differentiation notes. Runner output is not CMS truth and must pass the QA gates before any backend draft revision handoff.

## Framework-Specific Modes

- `mbti.existing_asset_enhancement`: audit or improve existing CMS-backed 64 A/T pages and comparison pages. Do not regenerate the estate.
- `big_five.content_package_generation`: create schema-valid packages for 5-10-30 dimensional assets. Do not create official 32 OCEAN SEO pages.
- `enneagram.placeholder_upgrade`: upgrade V1 placeholder assets for hub, centers, and core types. Do not create 54 combination pages or Tritype.

## MBTI Asset Pipeline

For MBTI public profile work, use this executable sequence:

1. GSC evidence: ingest existing sanitized page and query exports, or mark `GSC_EVIDENCE_PENDING`; do not call Search Console or mutate GSC state in this skill.
2. Content package: select only approved existing MBTI profile, A/T comparison, or hot cross-type comparison slugs, then prepare backend-authoritative draft packets.
3. QA: run schema, trademark/method boundary, duplicate/template risk, private-result leakage, SERP intent, internal-link, and GEO answer-surface gates.
4. fap-api import dry-run: hand off a dry-run import packet and schema/field-mapping expectations to fap-api; this skill does not write CMS or backend data.
5. Approval: require explicit operator approval before any import, promotion, Search Queue, sitemap, llms, or indexability action.
6. Promotion: after approved backend import and API smoke, let the rendering/release PR consume the API output without local editorial fallback content.
7. sitemap/llms gate: only a separate indexability PR may expand sitemap, llms, llms-full, canonical, robots, or Search Queue coverage after live authority and duplicate gates pass.

## Default Codex-Native Workflow

For non-MBTI or narrow draft-only work, the default content production flow is:

1. source ledger
2. Codex native draft
3. Codex skeptical self-review
4. Codex repaired draft if needed
5. final package
6. QA gates
7. handoff preview

Codex output cannot be written directly to production seed or production CMS. Codex-generated content must be treated as an untrusted draft until schema, evidence, duplicate, private-result-boundary, framework, and indexability QA all pass.

Do not write CMS from this skill. Backend imports require the separate fap-api dry-run, approval, and promotion gates above.

## External Model Protocol

ChatGPT web, Gemini, Chrome, and @computer use are optional only and are not required for content generation. Do not use browser automation unless explicitly requested by the current task. Each external model call must start from a prompt packet and be recorded in a model-output ledger.

Never paste cookies, tokens, secrets, `.env` values, private result payloads, user-specific scores, or private report body copy into ChatGPT, Gemini, or any external model. Competitor content may be summarized for gap review only and must not be copied. Academic claims require DOI/URL, access date, and claim mapping. Unsourced model output must be marked as inference or removed.

Model output is never production truth until Codex validates it against schemas, source ledgers, framework rules, and repository boundaries. External model output must not be written directly to backend seed or production CMS.

## Codex-Only Dry-Run Workflow

- `codex_native_draft`: Codex generates strict JSON from the source ledger and repo contracts.
- `codex_skeptical_self_review`: Codex reviews its own draft as if it came from an external model and records critical, major, and minor violations.
- `codex_repair`: if needed, Codex repairs the draft while preserving the raw draft audit.
- `codex_adjudication`: Codex assembles final dry-run packages and QA reports.

GO for a batch only if the raw or repaired Codex draft has zero critical contract violations and final packages pass QA. Codex self-repair must not hide generator failure.

## Research Source Rules

- Use peer-reviewed or official sources for academic claims when available.
- Record source title, author/source, year, DOI/URL, access date, claim, and limitations.
- Mark competitor evidence separately from academic evidence.
- Mark internal product evidence with repo path, report path, or API endpoint.
- Mark unsupported reasoning as inference.

## Content Package Contract

All packages must include framework, entity_type, code, locale, slug, title, summary, seo, canonical, hreflang, robots, launch_state, index_eligible, sitemap_eligible, llms_eligible, sections, faq, media, schema, method_boundary, evidence_notes, internal_links, source_ledger_refs, model_output_refs, and last_reviewed_at. For strict package drafts, `sections` must be an array and `faq` must be lowercase.

## Private Result Boundary

Result pages may inspire taxonomy, structure, or neutral phrasing only. Do not copy private report body text, user-specific scores, percentiles, close-call diagnostics, report engine internals, or any public copy that says "your result this time" / "你这次结果".

## QA Gates

Required gates:

- schema validation
- raw ChatGPT or raw Codex contract audit
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

For batch readiness, Codex auto-repair must not hide generator failure. GO for a batch only if raw or repaired generator output has zero critical contract violations and final Codex packages pass all QA gates.

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
