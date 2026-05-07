# Metadata Surface Ownership Inventory

Scope: PR-SEOF-01, SEO Foundation Authority Convergence.

This is a read-only governance inventory. It does not change runtime metadata,
canonical rendering, JSON-LD rendering, sitemap output, llms output, public URLs,
or page content.

## Purpose

The inventory records every App Router `generateMetadata` and direct `metadata`
export, then classifies the current ownership posture for each page family.

## Classification

- `backend_owned`: SEO truth is supplied by backend authority such as
  `seo.surface.v1`, backend sitemap-source, or backend structured data bundles.
- `cms_backed`: SEO truth is derived from CMS/public API content and rendered
  deterministically by the frontend.
- `product_code_only`: deterministic product-code metadata for non-CMS
  operational surfaces.
- `private_noindex`: private, transactional, result, order, payment, share,
  history, take, workspace, compare, or relationship surfaces that must remain
  excluded from public discoverability.
- `migration_required`: fallback authority that can affect public SEO/GEO
  output and must be migrated or explicitly gated before expansion.
- `watchlist`: currently acceptable CMS-backed deterministic rendering that can
  become authority drift if expanded before backend/CMS ownership is complete.
- `safe_static`: static or shell metadata with no immediate SEO expansion role.

## Current Summary

The generated report lives at:

- `docs/seo/generated/metadata-surface-inventory.v1.json`
- `docs/seo/generated/metadata-surface-inventory.v1.csv`

The current inventory intentionally flags these expansion blockers:

- Article detail JSON-LD fallback is `migration_required`.
- llms topic fallback governance must be explicit before Topic Graph expansion.
- Topic and career guide schema ownership are `watchlist` before broad SEO/GEO
  expansion.

## Runtime Policy

- No runtime metadata changes in this PR.
- No JSON-LD output changes in this PR.
- No sitemap or llms output changes in this PR.
- No fallback removal in this PR.
- No Topic Graph rollout in this PR.

## Repository Rule Impact

This PR adds a read-only SEO ownership inventory for existing metadata surfaces.
It does not introduce a new content surface and does not change content
authority. The inventory reinforces the existing rule that backend/CMS owns SEO
truth where backend/CMS surfaces exist, while frontend rendering remains
deterministic.
