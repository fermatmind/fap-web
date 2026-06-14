# GPT Session

## Default Status

GPT is optional and disabled by default for `codex_native_content_generation`. Do not use Chrome, ChatGPT web, or @computer use in Codex-only dry-runs.

## Use GPT For

- Bilingual independent drafting.
- Structured section copy.
- FAQ drafting.
- Method-boundary wording.
- Content package normalization.

## Required Prompt Packet

Use `prompts/gpt-content-package.md` or `prompts/gpt-bilingual-independent-draft.md`.

## Required Output

GPT must return strict JSON for content package runs, not runtime files. The output must identify claims that require source support. If GPT cannot provide a source for a factual claim, mark it as inference.

## Chrome / Computer Use Rules

- Codex may use @computer use or Chrome to open Google Chrome网页版 ChatGPT.
- Do not paste cookies, tokens, `.env` values, secrets, private result payloads, private user data, or raw report payloads.
- Do not upload private result files or browser/session artifacts.
- Generate a prompt packet before every call.
- Save every prompt and output into the model-output ledger.
- If ChatGPT output is not strict JSON, run at most one ChatGPT self-repair round.
- If the second output is still invalid JSON or still has critical canonical/indexability/schema violations, mark the run NO-GO for batch.
- ChatGPT output is never production truth; Codex must validate before any handoff.
