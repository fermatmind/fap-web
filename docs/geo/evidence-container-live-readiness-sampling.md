# Evidence Container Live Readiness Sampling

Version: `url_truth.evidence_container_live_readiness.v1`

Scope: PR-UG-08

This sampling layer extends the PR-DF-07 Evidence Container readiness gate into URL Truth & SEO Governance v1. It is read-only governance. It validates visible HTML samples and classifies page-family readiness without creating content, changing runtime rendering, expanding GEO pages, or widening sitemap/llms exposure.

No runtime behavior changes are introduced by this document or its fixture.

## Sampling Contract

Each sample records:

- public canonical URL
- route family
- expected readiness: `ready`, `partial`, or `not_ready`
- visible `data-evidence-container`
- visible `data-evidence-block` sequence
- public next-step links
- visible FAQ questions
- JSON-LD FAQ alignment when FAQ schema exists

The validator treats visible HTML as the truth surface. JSON-LD can confirm visible content, but it cannot make a thin or hidden page ready.

## Readiness States

`ready` means the sample has a visible Evidence Container, a primary answer block, enough non-FAQ evidence, required public next steps, and schema that matches visible text.

`partial` means the sample has visible evidence structure and no discoverability blocker, but it is missing one or more required blocks for its page family.

`not_ready` means the sample has a blocker such as no Evidence Container, hidden evidence, hidden FAQ/schema stuffing, private-flow links, FAQ-only content, or missing primary answer.

## Current Sampling Coverage

The PR-UG-08 fixture covers:

- article detail
- test detail
- topic detail
- personality detail
- career guide
- career job detail
- mental-health test

The purpose is not to assert that all production pages are ready. The purpose is to make readiness classification reproducible before Topic Graph or GEO expansion.

## Hard Failures

A sample must fail readiness if it includes:

- hidden evidence blocks through `display:none`, `visibility:hidden`, `hidden`, or `aria-hidden="true"`
- private next-step links to `/tests/*/take`, `/result/*`, `/orders/*`, `/share/*`, `/payment/*`, `/pay/*`, or `/history/*`
- FAQ JSON-LD questions not present in visible FAQ text
- FAQ-only content with no primary answer or non-FAQ evidence
- JSON-LD used as a substitute for visible content

## Non-Goals

This PR does not:

- generate new GEO content
- add hidden FAQ/schema
- change sitemap, llms, canonical, metadata, or JSON-LD runtime behavior
- introduce Topic Graph
- expand career pSEO
- redesign page UI
- change backend CMS models
