# /goal SEO-OPPORTUNITY-QUEUE-CONTRACT-01

Status: READY_AFTER_CONTROL_PACKET

Proceed only after control packet dependency and manifest/state authorization are explicit.

## Mission

Define the SEO opportunity queue contract before implementing any queue read model or action recommender.

## Allowed Future Scope

- `docs/seo/agent/**`
- `backend/docs/seo/**`
- `backend/tests/Feature/SeoIntel/**` if contract tests are added
- PR-train manifest/state only if explicitly authorized

## Forbidden

- Queue execution, CMS mutation, Search Channel enqueue/approval/submission, provider calls, and dashboard display.
- Treating mock, fixture, stale, or unknown data as action-driving evidence.

## Required Steps

1. Define allowed evidence sources and required source classifications.
2. Define scoring inputs and blocked-action semantics.
3. Define output shape: opportunity id, URL, source state, evidence ids, confidence, rationale, and next safe lane.
4. Define gates for read-only implementation, CMS draft package, and Search Channel readiness.
5. Add docs/tests only.

## Required Checks

- JSON/YAML parse for any added schema or manifest entries.
- Repository-specific contract tests if added.
- `git diff --check`

## Stop Conditions

Stop if the contract implies CMS writes, provider submissions, action execution, or mock/fixture-driven decisions.

