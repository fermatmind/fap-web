# Career Content Agent Orchestrator Design Report

## Verdict

design_pr_ready = true
content_generated = false
runtime_modified = false
production_imported = false
staging_created = false
state_schemas_created = true
orchestration_scripts_created = true

## Why This Is Not A Universal Writing Agent

The orchestrator does not write career facts. It coordinates state, dependencies, manifests, gates, baselines, staging/import readiness, and release boundaries. Block-specific factories remain responsible for source rules, evidence, trust audits, synthesis, reader assets, and quality gates.

## Orchestrator Authority

The existing `.agents/skills/career-content-asset-factory/` is the shared authority. No duplicate top-level wrapper skill was created.

## Proposed Agents

- Identity block
- Work activities block
- Salary block
- Risk/future block
- Fit block
- Skills/entry block
- Adjacent comparison block
- Page assembly block
- Personality/test result agents
- Career-personality bridge agent
- SEO/GEO release agent
- Release guard

## Lessons Incorporated

Salary proved evidence-first, trust audit, estimate/asset separation, staging, exact-SHA production import, and post-import SEO safety. AI Impact v5 proved micro-family gates, competitive editorial QA, search projection quarantine, final repair, staging preview, approved transition, production import, and live page/SEO QA.

## CMS/Backend Import Boundary

The design encodes dry-run, staging_preview, editorial_review, approved, production_imported, exact-SHA approval, authority gates, reader-safe projection, rollback planning, and post-import live QA.

## SEO Runtime Leakage Prevention

Search projection and SEO/schema candidates stay quarantined outside reader assets and outside runtime SEO. Sitemap, llms, canonical, noindex, robots, and JSON-LD changes require a separate SEO/runtime release gate.

## Personality/Test Interfaces

Personality and test-result agents remain separate authorities. Career bridge assets can consume PASS personality/test assets but cannot diagnose, guarantee fit, or infer personal outcomes from a career title.

## Why Work Activities Is Next

Work activities are the evidence base for identity refinement, fit, skills/entry, risk/future, adjacent comparisons, and page assembly. It is the next best pilot after the orchestrator design PR is reviewed and merged.

## Out Of Scope

No content generation, no batch 001, no evidence/synthesis/asset ledger creation, no runtime code, no CMS writes, no staging import, no production import, no SEO runtime behavior changes.
