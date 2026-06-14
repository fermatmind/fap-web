# Schema Validation

## Expected Validation

All JSON files under `.agents/skills/public-profile-seo-asset-factory/` must parse as valid JSON.

## Covered Schemas

- run manifest
- source ledger
- evidence source card
- model output ledger
- public profile content package
- indexability gate
- framework asset map
- content QA report

## Local Result

PASS on 2026-06-14.

Validated with local JSON parsing for every `*.json` file under `.agents/skills/public-profile-seo-asset-factory/`, plus `docs/codex/pr-train-state.json`. Parsed `docs/codex/pr-train.yaml` with Ruby YAML loader. `git diff --check` also passed.
