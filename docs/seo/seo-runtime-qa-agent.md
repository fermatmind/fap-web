# SEO Runtime QA Agent

`SEO-RUNTIME-QA-AGENT-01` adds a read-only runtime evidence generator for public SEO checks.

## Command

```bash
pnpm --silent seo:runtime-qa -- --no-network
```

By default the command reads `docs/seo/agent/runtime-qa/default-samples.v1.json` and writes JSON to stdout. It writes files only when `--output` or `--markdown-output` is explicitly provided.

## Safety

- Public samples may be fetched only as read-only GET requests.
- Private/order/result/share/pay/take paths are deny-policy samples and are not fetched.
- The command does not submit URLs, request indexing, mutate CMS, mutate Search Channel Queue, revalidate pages, deploy, or write provider state.
- CI contract tests use `--no-network`; live public GET runs remain explicit operator actions.

## Evidence Shape

The JSON report includes:

- `mode`
- `site_url`
- sample counts
- pass/fail summary
- public URL status, redirect, canonical, robots, hreflang, JSON-LD type evidence
- deny-policy enforcement for private path samples

Runtime anomalies are evidence only. Remediation must be handled by later scoped PRs.
