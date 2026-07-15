# Human Approval Boundaries

Human approval is required for irreversible, public, or authority-changing steps.

## Always Requires Explicit Approval

- Production import.
- Exact artifact SHA used for production import.
- Promotion or public release of an imported working/draft revision.
- Changing score/numeric facts outside an approved reopen flow.
- Changing source URLs or source IDs in a frozen baseline.
- Changing sitemap, llms, canonical, noindex, robots, or JSON-LD behavior.
- Expanding batch size beyond the approved policy.
- Moving from design to generation for a new block.

## Does Not Imply Approval

- PASS audit.
- Frozen baseline.
- Staging preview PASS.
- Editorial review PASS.
- Design PR merge.

These states prepare the next gate; they do not authorize production import or SEO release by themselves.

A production import authorization is limited to the named write mode. If the
authorized mode creates only primary drafts or working revisions, it does not
also authorize promotion, public release, indexability, sitemap, LLMS, media,
cache, or search actions.
