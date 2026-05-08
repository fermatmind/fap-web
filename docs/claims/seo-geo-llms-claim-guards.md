# SEO / GEO / llms Claim Guards

Scope: PR-SCB-05

Train: semantic-claim-boundary-enforcement-train

Runtime behavior changed: no

## Goal

PR-SCB-05 prevents SEO/GEO surfaces from overstating sitemap, llms, JSON-LD, FAQ, or Evidence Container authority.

This PR is contract guard only. It does not change sitemap output, llms.txt, llms-full.txt, JSON-LD output, Evidence rendering, metadata output, or SEO/GEO exposure.

## Forbidden Claims

- `sitemap equals graph`
- `llms equals graph`
- `JSON-LD proves graph`
- `FAQ-only is evidence-ready`
- `hidden schema is evidence`
- `AI answerability equals AI planning`
- `llms-full proves strong citation`
- `schema guarantees AI citation`

## Allowed With Boundary

- sitemap = discoverability surface
- llms = AI/GEO entry surface
- llms-full = enriched readable context only when evidence-gated
- JSON-LD = structured data, not graph proof
- FAQ = visible answer block only if grounded
- Evidence Container = visible content + source/evidence alignment

## Required Assertions

- FAQ-only is not Evidence-ready.
- Hidden schema is not Evidence-ready.
- llms-full eligibility requires visible evidence + claim boundary + source authority.
- SEO/GEO guard does not widen exposure.

## Non-Runtime Guarantees

- Sitemap output changed: no
- llms output changed: no
- llms-full output changed: no
- JSON-LD output changed: no
- Evidence rendering changed: no
- Hidden schema added: no
- SEO/GEO exposure widened: no
