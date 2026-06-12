# Content Feedback Queue

Use this workflow to turn SEO observations into future article-brief inputs.

## Inputs

- daily SEO report.
- weekly article review.
- D1/D7/D14 canary observations.
- Search Channel observation.
- post-publish smoke warnings.
- operator notes.

## Queue columns

| Column | Meaning |
|---|---|
| `source_task` | Report or observation that created the feedback. |
| `url` | Affected URL or topic seed. |
| `locale` | `zh`, `en`, or `pair`. |
| `finding` | Evidence-first finding. |
| `impact` | SEO, CTA, claim, runtime, search channel, or content quality. |
| `brief_instruction` | Concrete instruction for next Mode B brief. |
| `priority` | P0/P1/P2/P3. |
| `owner_system` | CMS, fap-web, fap-api, Search Channel, operator, or skill. |
| `human_authorization_required` | yes/no. |
| `do_not_do` | Explicit anti-pattern. |

## Outputs

Use `assets/content_feedback_queue_template.md`.

## Hard gates

Do not generate final article copy, mutate CMS, or create new briefs unless the task explicitly asks for brief generation.
