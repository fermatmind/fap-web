# Page Assembly No-New-Fact Contract

Page assembly composes PASS block assets. It is not a fact-generation layer.

## Allowed

- Section ordering.
- CTA ordering.
- Source/boundary disclosure compression.
- FAQ derived from PASS block assets.
- Empty or hidden sections when a block is missing.

## Forbidden

- New occupational facts.
- Local fallback paragraphs.
- New salary, AI, skill, fit, or adjacent-career claims.
- Hidden JSON-LD or SEO text not approved by the SEO release gate.

## Required Checks

Every page assembly asset must list its source blocks. If a displayed section has no source block, fail the gate.
