# Computer Use Protocol Summary

The skill allows Codex to use @computer use for GPT/Gemini sessions only after a prompt packet is created and checked for privacy safety.

## Enforced Rules

- Every model call starts from a prompt packet.
- Every model output is captured in a model-output ledger.
- Model output cannot be written directly to production seed files.
- Cookies, tokens, secrets, `.env`, private result payloads, user data, and paid report body copy are forbidden.
- Competitor content can inform gap review but cannot be copied.
- Academic claims require DOI/URL/access date/claim mapping.
- Unsourced model claims must be marked inference or removed.

## Session Roles

- GPT: draft structured content and bilingual independent copy.
- Gemini: competitor and SERP gap review.
- Codex: adjudication, validation, repo truth, PR decomposition, and gates.
