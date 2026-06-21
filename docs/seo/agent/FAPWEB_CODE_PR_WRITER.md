# SEO Agent fap-web Code PR Writer

`SEO-AGENT-FAPWEB-CODE-PR-WRITER-01` defines the safe fap-web code lane for the FermatMind SEO Agent.

The lane is intentionally PR-only. It can package a sanitized SEO code-fix request into a reviewable PR plan, but it does not push branches, open GitHub PRs, merge, deploy, write CMS data, submit search URLs, or request indexing.

## Allowed Fix Types

- `structured_data`
- `canonical_hreflang`
- `sitemap_llms`
- `runtime_seo_rendering`

## Runner

```bash
pnpm seo-agent:fapweb-code-pr-writer -- \
  --request=docs/seo/agent/examples/seo-agent-fapweb-code-pr-request.example.json \
  --artifact-dir=/tmp/fermatmind-seo-agent-artifacts \
  --json
```

The runner emits `seo-agent-fapweb-code-pr-writer.v1`. The artifact is a PR plan for Codex review and execution, not an executor.

## Boundaries

- `direct_main_push_allowed=false`
- `auto_deploy_allowed=false`
- `github_pr_created_by_runner=false`
- `cms_write_allowed=false`
- `search_channel_submit_allowed=false`
- `indexing_request_allowed=false`
- `scheduler_activation_allowed=false`
- `production_env_change_allowed=false`

## Required PR Checks

- `pnpm typecheck`
- `NEXT_PUBLIC_API_URL=https://api.fermatmind.com pnpm build`
- `pnpm test:contract`
- `git diff --check`

## Repository Rule Impact

This PR adds an SEO Agent code-lane planning artifact. It does not move content authority to fap-web and does not add frontend editorial fallback content. CMS-backed content, sitemap, `llms.txt`, metadata, structured data, and canonical behavior remain backend/CMS/public API authoritative.
