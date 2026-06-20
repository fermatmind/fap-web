# Human Approval Boundaries

Human approval is required for irreversible, public, or authority-changing steps.

## Always Requires Explicit Approval

- Production import.
- Exact artifact SHA used for production import.
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
