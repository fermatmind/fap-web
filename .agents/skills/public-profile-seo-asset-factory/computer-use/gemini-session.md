# Gemini Session

## Default Status

Gemini is optional and disabled by default for `codex_native_content_generation`. Do not use Gemini in Codex-only dry-runs.

## ChatGPT-Only Workflow Status

Gemini is not used in `chatgpt_only_dry_run`. It is disabled for ChatGPT-only workflows and must not be referenced by ChatGPT-only runbooks or prompt packets.

## Use Gemini For

- Competitor gap review.
- SERP/search intent review.
- Weak-claim detection.
- Query-cluster sanity checks.

## Required Prompt Packet

Use `prompts/gemini-competitor-gap-review.md` or `prompts/gemini-serp-intent-review.md`.

## Boundary

Gemini output is advisory. It may not override repository authority, backend schema rules, or framework no-go rules.
