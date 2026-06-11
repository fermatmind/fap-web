# Revalidation Cache Playbook

Purpose: review cache and revalidation readiness without triggering ISR.

Inputs:

- Expected URL.
- Operator-provided release or revalidation evidence.
- Public page cache observations if available.

Checks:

- URL is public and allowlisted.
- Private paths are rejected.
- Revalidation token is not exposed.
- Cache state is known, unknown, or operator-confirmed.
- llms-full cache clear evidence is operator-provided if applicable.

Output: use `assets/revalidation_smoke_template.md`.

No-go:

- Do not call revalidation endpoint.
- Do not read or expose secrets.
- Do not revalidate private paths.
