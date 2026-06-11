# CMS Publish Gate Checklist

- package:
- slug:
- locale:
- reviewer:
- result: READY_FOR_OPERATOR_REVIEW / NO_GO_FOR_PUBLISH

| Gate | Required status | Actual status | Evidence | Pass? |
|---|---|---|---|---|
| package integrity | pass |  |  |  |
| CMS field mapping | pass |  |  |  |
| body hash | exact |  |  |  |
| headings | pass |  |  |  |
| claim gate | safe or acknowledged warning |  |  |  |
| private URL guard | safe |  |  |  |
| references | present |  |  |  |
| FAQ | present and safe |  |  |  |
| CTA | present and safe |  |  |  |
| canonical | correct |  |  |  |
| preview | safe |  |  |  |
| schema | held or approved |  |  |  |
| hreflang | held or approved |  |  |  |
| indexability | operator-approved only |  |  |  |
| sitemap | operator-approved only |  |  |  |
| llms | operator-approved only |  |  |  |

## Final state

- publish_allowed:
- operator_approval_required: yes
