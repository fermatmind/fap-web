# Goal: Restore Missing Career Content PASS Baselines

Use `career-content-asset-factory`.

Run restore preflight before downstream block generation or graph candidate rebuild.

Input:

- `generated/fermatmind-content-agent-state/latest_pass_baselines.json`
- `generated/career-content-baseline-artifact-registry/baseline_artifact_registry.json`

Task:

1. Verify each referenced baseline directory exists and its SHA manifest is readable.
2. If a local baseline is missing, restore only from a verified artifact URI.
3. If no restorable artifact exists, stop with `MISSING_LOCAL_NO_RESTORABLE_ARTIFACT`.
4. Do not regenerate content unless a later goal explicitly authorizes regeneration.

Hard prohibitions:

- Do not generate evidence, synthesis, assets, or search projection.
- Do not modify runtime, SEO, CMS, staging, or production.
- Do not use page assembly or live related links as a replacement for missing block evidence.
