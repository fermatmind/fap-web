# SEO Code Change Artifact

`seo:code-change-artifact` is a deterministic, non-Agent formatter for sanitized read-only SEO QA findings. It creates a stable change-plan artifact for later human or Codex interpretation; it does not edit repository files, invoke a model, create a branch or PR, deploy, write CMS or SEO data, or submit URLs to search providers.

```bash
pnpm seo:code-change-artifact -- \
  --request=docs/seo/agent/examples/seo-agent-fapweb-code-pr-request.example.json \
  --artifact-dir=/tmp/fap-web-seo-artifacts \
  --json
```

The historical `seo-agent:fapweb-code-pr-writer` package entrypoint is retired. Its old runner and contract remain repository evidence only and grant no authority.
