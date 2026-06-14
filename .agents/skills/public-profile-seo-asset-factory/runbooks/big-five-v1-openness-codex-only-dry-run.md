# Big Five V1 Openness Codex-Only Dry Run

## Scope

Run one minimal dry-run for:

- framework: `big_five`
- entity_type: `domain`
- code: `openness`
- locales: `zh-CN`, `en`

This task does not call ChatGPT, Gemini, Chrome, or @computer use.

## Flow

1. Source ledger
   - Record academic, competitor/gap, and internal product sources.
   - Mark verification level explicitly.

2. Codex-native draft pass
   - Generate strict JSON at `model-outputs/codex-draft.raw.json`.
   - Preserve raw output before any repair.

3. Skeptical review pass
   - Review Codex output as untrusted model output.
   - Record contract, evidence, boundary, duplicate, and indexability violations.

4. Repair pass
   - Generate `model-outputs/codex-repaired.raw.json` only if review finds critical or major violations.
   - Do not hide raw-draft failures.

5. Final package pass
   - Write zh-CN and en final packages.
   - Run schema, evidence, duplicate, bilingual, private-result, framework, canonical/indexability, and publish-readiness QA.

## Boundaries

No backend seed write, CMS write, import PR, publish, sitemap, llms, indexability opening, runtime page changes, 32 OCEAN SEO pages, official Big Five 32 types, or private result text reuse.
