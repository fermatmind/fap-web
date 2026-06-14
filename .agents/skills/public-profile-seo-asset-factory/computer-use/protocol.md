# Computer Use Protocol

Codex may use @computer use to open GPT or Gemini sessions only when model-assisted production is requested by the user or by an approved run manifest.

## Required Steps

1. Generate a prompt packet.
2. Verify the prompt packet contains no secrets, cookies, tokens, `.env` values, user private data, or private result payloads.
3. Submit the packet to GPT or Gemini.
4. Capture the output in a model-output ledger.
5. Validate sources and claims before using the output.
6. Convert approved output into a structured package only after QA.

## Prohibitions

- Do not paste credentials, cookies, tokens, secrets, `.env`, private report payloads, user scores, or raw private result JSON.
- Do not ask a model to copy competitor content.
- Do not write model output directly to production seed files.
- Do not treat unsourced model claims as facts.

## Output Handling

Every external model output must have:

- model name
- session date
- prompt packet path
- output summary
- source claims
- unresolved claims
- QA status
- allowed next use
