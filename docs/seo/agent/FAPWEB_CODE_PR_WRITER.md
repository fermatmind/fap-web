# SEO Agent fap-web Code PR Writer

`SEO-AGENT-FAPWEB-CODE-PR-WRITER-01` defines the safe fap-web code lane for the FermatMind SEO Agent.

The lane is intentionally PR-only. It can package a sanitized SEO code-fix request into a reviewable PR plan, but the runner itself does not push branches, open GitHub PRs, merge, deploy, write CMS data, submit search URLs, or request indexing.

After a human-reviewed plan is accepted, Codex may use the artifact to create a scoped fap-web task branch, edit product code inside the approved target files, run the required checks, push the branch, and open a GitHub PR for review. Codex still must not direct-push `main`, auto-merge, auto-deploy, hand-edit generated SEO output, add frontend editorial fallback content, or bypass CMS/API authority.

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

## Codex PR Execution Boundary

Allowed after human review of the artifact:

- create a `codex/` task branch from latest `main`
- modify only approved fap-web product-code or test files
- run required local checks
- push the task branch
- open a scoped GitHub PR

Still forbidden:

- direct-push `main`
- auto-merge or auto-deploy
- create local editorial fallback content
- hand-edit generated SEO artifacts as a bug fix
- write CMS data
- submit Search Channel or indexing requests

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
