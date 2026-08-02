# State Machine

## States

1. `preflight`
2. `research_scan`
3. `asset_selection`
4. `prompt_packet_ready`
5. `model_production`
6. `model_output_logged`
7. `content_package_assembled`
8. `schema_validated`
9. `qa_gates_passed`
10. `fap_api_import_dry_run_ready`
11. `trusted_backend_promotion_ready`
12. `backend_import_ready`
13. `frontend_render_ready`
14. `sitemap_llms_gate_ready`
15. `publish_gate_ready`
16. `legacy_manual_approval_required`
17. `blocked`

## Transitions

- `preflight -> research_scan`: git status and secret boundary are clean.
- `research_scan -> asset_selection`: current framework state and authority layer are identified.
- `asset_selection -> prompt_packet_ready`: selected assets fit framework no-go rules.
- `prompt_packet_ready -> model_production`: user approved model-assisted production or local Codex production.
- `model_production -> model_output_logged`: every model output has a ledger record.
- `model_output_logged -> content_package_assembled`: content is traceable to sources and model ledgers.
- `content_package_assembled -> schema_validated`: all JSON schemas parse and package validates.
- `schema_validated -> qa_gates_passed`: evidence, parity, duplicate, private-result, framework, and indexability gates pass.
- `qa_gates_passed -> fap_api_import_dry_run_ready`: package can be handed to fap-api for dry-run import validation and schema/field mapping.
- `fap_api_import_dry_run_ready -> trusted_backend_promotion_ready`: independent W9/QA passes for a registered V2 exact package.
- `trusted_backend_promotion_ready -> backend_import_ready`: the trusted fap-api workflow completes ordered import, readback, publication, and live-QA receipts. A `BLOCKED` verdict is repaired in the same Producer PR.
- `backend_import_ready -> frontend_render_ready`: backend import is merged and API smoke passes.
- `frontend_render_ready -> sitemap_llms_gate_ready`: render smoke passes and a separately controlled sitemap/llms/indexability gate is requested.
- `sitemap_llms_gate_ready -> publish_gate_ready`: sitemap, llms, URL Truth, canonical, robots, duplicate, and live smoke gates pass.

`legacy_manual_approval_required` exists only to read historical V1/manual operation artifacts. It must not be entered by new V2 exact-package work and does not create a separate approval-only transition or PR.

## Stop Rules

Move to `blocked` when secrets are requested, evidence is missing, schemas fail, private result content appears, framework no-go is violated, or sitemap/llms/indexability changes appear in a non-publish scope.
