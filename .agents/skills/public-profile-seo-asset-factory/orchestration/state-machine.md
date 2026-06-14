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
10. `backend_import_ready`
11. `frontend_render_ready`
12. `publish_gate_ready`
13. `blocked`

## Transitions

- `preflight -> research_scan`: git status and secret boundary are clean.
- `research_scan -> asset_selection`: current framework state and authority layer are identified.
- `asset_selection -> prompt_packet_ready`: selected assets fit framework no-go rules.
- `prompt_packet_ready -> model_production`: user approved model-assisted production or local Codex production.
- `model_production -> model_output_logged`: every model output has a ledger record.
- `model_output_logged -> content_package_assembled`: content is traceable to sources and model ledgers.
- `content_package_assembled -> schema_validated`: all JSON schemas parse and package validates.
- `schema_validated -> qa_gates_passed`: evidence, parity, duplicate, private-result, framework, and indexability gates pass.
- `qa_gates_passed -> backend_import_ready`: package can be handed to fap-api import PR.
- `backend_import_ready -> frontend_render_ready`: backend import is merged and API smoke passes.
- `frontend_render_ready -> publish_gate_ready`: render smoke passes and explicit publish gate is requested.

## Stop Rules

Move to `blocked` when secrets are requested, evidence is missing, schemas fail, private result content appears, framework no-go is violated, or sitemap/llms/indexability changes appear in a non-publish scope.
