# FermatMind WeChat SEO Quality Scorecard

Score zh-CN SEO article drafts before CMS import.

| Area | Points | Check |
|---|---:|---|
| Search intent answer | 15 | First 150-220 Chinese characters answer the actual query. |
| Scene and conflict | 15 | Opens with a concrete reader scene and a real decision tension. |
| Core point | 10 | The article has one clear argument, not a list of loosely related advice. |
| Information gain | 20 | Includes useful examples, tables, checklists, scripts, or verification steps. |
| WeChat readability | 10 | Mobile-friendly paragraphs, natural zh-CN rhythm, low translation feel. |
| SEO and routes | 10 | Keywords, CTA, and internal links are natural and route-safe. |
| Claim safety | 15 | No prediction, guarantee, diagnosis, official-system implication, or fabricated data. |
| Package integrity | 5 | Identity, CMS fields, media state, and held lanes are preserved. |

Decisions:

- 85-100: `PASS_READY_FOR_MODE_C_QA`
- 70-84: `REPAIR_RECOMMENDED_BEFORE_MODE_C_QA`
- 0-69: `REWRITE_REQUIRED_BEFORE_CMS`
- Hard claim/private URL violation: `BLOCKED_CLAIM_OR_PRIVATE_URL_RISK`

Hard failures independent of score:

- active private/admin/preview URL introduced;
- publish/search/schema/hreflang hold weakened;
- article markdown and CMS body JSON diverge after repair;
- unsupported admission, employment, salary, success, or official-system claim introduced;
- title/meta promises a stronger outcome than the article can support.
