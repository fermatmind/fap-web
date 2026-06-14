# Privacy And Secret Boundary

## Never Upload Or Paste

- `.env` files or values.
- API keys, tokens, cookies, session IDs, SSH keys.
- User private data.
- Private result payloads.
- Paid report body copy.
- Score, percentile, close-call, or diagnostic internals.

## Allowed

- Public URLs.
- Public competitor page summaries.
- Repo path references without secrets.
- Redacted API shapes.
- Academic citation metadata.

## If Secret Exposure Happens

Stop immediately, report the exposure class without repeating the secret, and do not continue production in the same run.
