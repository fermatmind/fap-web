# SEO-BRIEF-00 SERP Content Brief Generator Contract

## Purpose

The SERP content brief generator is an offline planning contract for SEO
operations. It turns already sanitized URL Truth, competitor URL inventory, SEO
issue queue, internal-link graph, CMS status samples, and manually captured SERP
samples into advisory content brief inputs.

It does not create publishable content. It does not create CMS drafts. It does
not write CMS data, submit search URLs, call live SERP providers, or deploy
runtime behavior.

## Authority Boundary

FermatMind backend CMS remains the authority for article content, article SEO,
publication state, author and reviewer state, canonical, sitemap eligibility,
and `llms.txt` eligibility.

The content brief artifact is:

- an operator planning artifact
- sample-only in this PR
- read-only relative to URL Truth, sitemap, issue queue, CMS, and search
  platforms
- advisory until a separate backend handoff contract defines whether any brief
  field can become CMS metadata

It is not:

- CMS content authority
- a CMS draft creator
- a publish gate
- a search submission source
- a live SERP collector
- a final article title, H1, FAQ, CTA, or body generator

## Inputs

Allowed inputs for this contract are:

- `url_truth`: checked-in FermatMind URL Truth / sitemap inventory artifact.
- `competitor_url_inventory`: checked-in read-only competitor URL inventory
  artifact.
- `seo_issue_queue`: checked-in sanitized issue queue artifact.
- `internal_link_graph`: checked-in internal-link graph artifact.
- `cms_status_sample`: mock or manually supplied CMS draft/release status
  samples.
- `manual_serp_sample`: manually captured and sanitized SERP samples.

No live external provider may be called in `SEO-BRIEF-00`.

## Output Fields

Each brief record must include:

- `brief_id`
- `target_keyword`
- `locale`
- `intent`
- `target_page_family`
- `target_url_or_path`
- `source_issue_ids`
- `competitor_source_domains`
- `serp_sample_source`
- `table_stakes`
- `value_add_opportunities`
- `internal_link_suggestions`
- `schema_hints`
- `risk_flags`
- `editorial_review_required`
- `sample_only`

The artifact may include Markdown export planning, but Markdown must stay a
brief outline and must not contain final article body copy.

## SERP Sample Rules

Manual SERP samples must be sanitized before entering the artifact.

Allowed sample fields:

- result rank
- result URL domain
- normalized result path
- result type
- observed heading theme
- snippet theme
- visible schema signal

Forbidden sample fields:

- raw cookies
- raw headers
- account-specific URLs
- raw private URLs
- unredacted personal data
- ad click identifiers
- copied article body text
- final title or H1 copy to publish

## Risk Flags

Brief records must flag:

- `claim_safety_review`
- `psychology_or_assessment_boundary`
- `medical_or_clinical_boundary`
- `pii_or_consent_boundary`
- `youth_or_sensitive_audience`
- `ability_or_iq_sensitive`
- `cms_authority_required`
- `locale_parity_required`

Any brief with a sensitive risk flag must remain blocked for CMS draft influence
until a human editor and backend-owned CMS handoff contract approve the path.

## Non-Mutation Guarantees

The generator contract forbids:

- CMS writes
- CMS draft creation
- publish, unpublish, or rollback actions
- revalidation execution
- sitemap mutation
- `llms.txt` mutation
- search platform submission
- live SERP API calls
- GSC, Baidu, GA4, DataForSEO, or Apify integration
- production deployment
- env, cookie, token, or secret reads
- final article body generation

## Recommended Next Step

After this contract is merged, `SEO-BRIEF-01` may add a read-only offline
generator that consumes existing artifacts and mock or manual SERP samples to
produce `docs/seo/generated/seo-content-briefs.v1.json` and optional Markdown
brief output.

`SEO-BRIEF-01` must remain offline by default and must not write CMS, call live
SERP APIs, generate final article copy, submit search URLs, or deploy.

## SEO-BRIEF-01 Read-Only Generator

`SEO-BRIEF-01` implements the offline generator as a local operator artifact
tool:

```bash
node scripts/seo/generate-seo-content-briefs.mjs \
  --output docs/seo/generated/seo-content-briefs.v1.json \
  --markdown docs/seo/generated/seo-content-briefs.v1.md \
  --pretty
```

The generator reads only checked-in URL Truth, competitor URL inventory, SEO
issue queue, internal-link graph, and embedded sanitized mock SERP samples. The
checked-in output remains `sample_only`, `read_only`, and advisory. Markdown is
an outline export only and is not publishable article copy.

Future live SERP, CMS handoff, CMS draft influence, or editorial workflow
automation must be approved in separate backend/CMS-owned PRs.
