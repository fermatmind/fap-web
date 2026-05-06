# Career Family Authority Audit

Version: `url_truth.career_family_authority_audit.v1`

PR-UG-04 is a read-only audit and remediation plan. It does not change runtime routing, sitemap, llms, canonical, hreflang, metadata, JSON-LD, internal links, or career page exposure.

## Source

- Source report: `docs/seo/generated/duplicate-seo-entities.v1.json`
- Audit artifact: `docs/seo/generated/career-family-authority-audit.v1.json`
- Current finding count: 3 P1 career family authority clusters

## Findings

### business-and-financial

This is the highest-risk cluster because it has two backend-generated family hash variants in each locale plus the industry URL:

- `/en/career/family/business-and-financial-37ec69bd`
- `/en/career/family/business-and-financial-a0352070`
- `/en/career/industries/business-and-financial`
- `/zh/career/family/business-and-financial-37ec69bd`
- `/zh/career/family/business-and-financial-a0352070`
- `/zh/career/industries/business-and-financial`

Risk: canonical ownership is ambiguous. A later remediation must identify the backend source rows that produce the hash variants, select one canonical family entity id, and decide whether the industry route is a separate taxonomy page or a compatibility/supporting surface.

### computer-and-information-technology

The family and industry routes share the same slug in both locales:

- `/en/career/family/computer-and-information-technology`
- `/en/career/industries/computer-and-information-technology`
- `/zh/career/family/computer-and-information-technology`
- `/zh/career/industries/computer-and-information-technology`

Risk: this may be acceptable only if family hub and industry taxonomy pages have differentiated titles, descriptions, schema identity, visible content, and internal links.

### healthcare

The family and industry routes share the same slug in both locales:

- `/en/career/family/healthcare`
- `/en/career/industries/healthcare`
- `/zh/career/family/healthcare`
- `/zh/career/industries/healthcare`

Risk: this has the same family-vs-industry ambiguity as the computer-and-information-technology cluster.

## Remediation Plan

1. Audit backend career family ids, canonical slugs, locale mappings, and source rows.
2. Sample rendered title, description, canonical, hreflang, JSON-LD identity, and visible page intent for affected URLs.
3. Decide whether each pair is a differentiated entity pair or a compatibility duplicate.
4. Add migration gates for sitemap, llms, canonical, hreflang, JSON-LD, redirects, and internal links before any URL change.
5. Execute a later scoped remediation PR only after backend ownership and compatibility policy are approved.

## Do Not Change In This PR

- No runtime routing changes.
- No redirects.
- No canonical overrides.
- No sitemap or llms exposure changes.
- No frontend SEO fallback metadata.
- No career pSEO expansion.
- No Topic Graph rollout.

## Expansion Gate

These clusters do not block PR-UG-04 merge because this PR is audit-only. They should block broad Topic Graph, Career pSEO, and automated internal-link expansion until either resolved or explicitly governed.
