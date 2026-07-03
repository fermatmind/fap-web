# Career KG Agent Optimization Runbook

This runbook covers the workflow after the operator has already reviewed GSC
and confirmed a small batch of career occupations. It does not ask the agent to
scan GSC, score opportunities, or choose the batch.

## Workflow

1. Operator provides a confirmed batch file that validates against
   `career_kg_confirmed_batch.schema.json`.
2. The career content agent generates a dry-run package for each occupation.
3. The package validator checks identity, source traceability, required content
   blocks, claim boundaries, and dry-run-only release flags.
4. Search projection candidates are kept in a separate candidate file and
   validated by quarantine gates.
5. The PR train generator may produce manifest/state patch artifacts.
6. The operator explicitly authorizes manifest/state updates.
7. Codex executes one occupation per PR.

## Confirmed Batch Boundary

The confirmed batch contains only operator-selected rows:

```json
{
  "schema_version": "fermatmind.career_kg.confirmed_batch.v1",
  "batch_id": "career-kg-2026-07-03",
  "source": "operator_confirmed",
  "cms_write_authorized": false,
  "production_import_authorized": false,
  "seo_runtime_release_authorized": false,
  "items": [
    {
      "pr_id": "PR-CAREER-KG-18",
      "priority": "P0",
      "slug": "graphic-designers",
      "locale": "zh-CN",
      "focus": ["title_meta_ctr", "faq", "adjacent_careers"],
      "gsc_summary": {
        "impressions": 485,
        "clicks": 0,
        "avg_position": 9.3
      }
    }
  ]
}
```

`gsc_summary` is an opportunity signal only. It is not an occupational fact
source and must not be cited as reader-facing evidence.

## Package Boundary

The career KG package is dry-run-only. It may contain content assets, QA
reports, smoke reports, and SHA manifests. It must not perform CMS writes,
staging writes, production import, sitemap/llms changes, canonical/noindex
changes, JSON-LD release, or search-provider submission.

## Agent Boundaries

- Career content agent: asset package, source traceability, claim boundaries,
  dry-run importer evidence.
- SEO agent: candidate-only title/meta/FAQ/internal-link search projections and
  release gate review.
- PR train agent: branch, local checks, GitHub checks, merge, cleanup, and
  ledger discipline.

The frontend remains a renderer and contract-test consumer. It must not become the authority for CMS-backed career content.
