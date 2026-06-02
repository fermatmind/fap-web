# FermatMind Blog, Research, and Article Strategy

This document plans content operations without writing publishable article copy.

## Ordinary Evergreen SEO Articles

Purpose:

- Answer search queries that users ask before and after taking assessments.
- Connect tests, topic pages, career guides, and method boundaries.
- Provide safe decision-support education without stronger outcome or clinical authority.

Target query types:

- "What does this test mean?"
- "How do I compare two frameworks?"
- "How do I use this result at work?"
- "How do I prepare for a career decision?"
- "What are the limits of this assessment?"

Recommended template:

1. Search question.
2. Short answer.
3. Who this is for.
4. Key concepts.
5. How to use it safely.
6. Related test.
7. Related topic.
8. Related guide or method page.
9. Limits and next step.

Required CMS fields:

- Content family.
- Cluster.
- Category.
- Related tests.
- Related topics.
- Related articles.
- Related career guides.
- Author/editor.
- Review state.
- Meta title and description.
- Canonical.
- Sitemap/llms eligibility.
- Decay review date.

Schema recommendation:

- Article and BreadcrumbList when visible content supports it.
- CollectionPage for indexes.
- Do not add rating-style, product-style, or hidden FAQ structured data without visible authority.

Publish cadence:

- Start with 4-6 ordinary SEO articles per month.
- Refresh one older article for every 3-4 new articles once inventory passes 50.
- Do not publish sensitive acquisition content without manual review.

## First 30 Topic Briefs

These are content briefs, not final article titles.

| Topic brief | Search intent | Target cluster | Related test | Related topic page | Related method/boundary page | Funnel role | Priority |
|---|---|---|---|---|---|---|---|
| MBTI basics for first-time users | Understand the model | MBTI | MBTI | `/topics/mbti` | `/method-boundaries` | Pre-test education | P0 |
| MBTI type language limits | Avoid over-labeling | MBTI | MBTI | `/topics/mbti` | `/method-boundaries` | Safety boundary | P0 |
| Big Five basics | Understand trait model | Big Five | Big Five | future Big Five topic | `/method-boundaries` | Pre-test education | P0 |
| Big Five and MBTI comparison | Compare frameworks | MBTI/Big Five | MBTI, Big Five | `/topics/mbti` | `/method-boundaries` | Cross-test education | P0 |
| RIASEC basics | Understand career interest codes | RIASEC | RIASEC | future RIASEC topic | RIASEC technical note | Pre-test education | P0 |
| RIASEC for career exploration | Use interest signals safely | Career choice | RIASEC | future career topic | RIASEC technical note | Career funnel | P0 |
| Career choice decision checklist | Make a bounded decision | Career choice | RIASEC, Big Five | future career topic | `/method-boundaries` | Career funnel | P0 |
| Career library use guide | Navigate occupation pages | Career choice | RIASEC | future career topic | dataset method page | Career SEO support | P0 |
| Personality and workplace behavior | Understand work tendencies | Personality and work | Big Five | future work topic | `/method-boundaries` | Article-to-test | P1 |
| MBTI and communication style | Interpret interaction patterns | Relationships | MBTI | `/topics/mbti` | `/method-boundaries` | Article-to-topic | P1 |
| Big Five and teamwork | Explain work behavior | Big Five/work | Big Five | future work topic | `/method-boundaries` | Article-to-test | P1 |
| Enneagram basics | Understand motivation lens | Enneagram | Enneagram | future Enneagram topic | `/method-boundaries` | Pre-test education | P1 |
| EQ basics | Understand emotional skills | EQ | EQ | future EQ topic | `/method-boundaries` | Pre-test education | P1 |
| How to combine test results | Multi-test interpretation | Guides | MBTI, Big Five, RIASEC | `/topics/mbti` | `/method-boundaries` | Guide funnel | P1 |
| What assessment scores cannot decide | Boundary education | Methods | all tests | `/topics/mbti` | `/method-boundaries` | Trust surface | P1 |
| Choosing between career options | Decision workflow | Career choice | RIASEC, Big Five | future career topic | dataset method page | Career funnel | P1 |
| Switching careers with evidence | Career transition | Career choice | RIASEC | future career topic | dataset method page | Guide support | P1 |
| Personality at work without labels | Workplace self-understanding | Personality/work | Big Five, MBTI | future work topic | `/method-boundaries` | Safety boundary | P1 |
| Relationship communication patterns | Communication education | Relationships | MBTI | future relationships topic | `/method-boundaries` | Article-to-test | P2 |
| Conflict style and personality | User education | Relationships | MBTI, Big Five | future relationships topic | `/method-boundaries` | Article-to-topic | P2 |
| Study choices and interests | Education/career bridge | Career choice | RIASEC | future career topic | `/method-boundaries` | Youth funnel | P2 |
| AI-era career reflection | Market context | Career choice | RIASEC, Big Five | future career topic | dataset method page | Journal/analysis | P2 |
| Assessment mistakes | User education | Methods | all tests | `/topics/mbti` | `/method-boundaries` | Trust surface | P2 |
| Reading a result page carefully | Post-test guidance | Guides | all tests | relevant topic | `/method-boundaries` | Post-test retention | P2 |
| Personality and habit design | Self-reflection | Big Five | Big Five | future Big Five topic | `/method-boundaries` | Article-to-test | P2 |
| Career interests vs skills | Career education | Career choice | RIASEC | future career topic | dataset method page | Career funnel | P2 |
| MBTI scenes and daily decisions | Practical interpretation | MBTI | MBTI | `/topics/mbti` | `/method-boundaries` | Content depth | P2 |
| Big Five facets explanation | Trait education | Big Five | Big Five | future Big Five topic | `/method-boundaries` | Content depth | P2 |
| IQ-sensitive interpretation boundaries | Ability-sensitive education | IQ | IQ | future method topic | `/method-boundaries` | Review-gated only | P3 |
| Clinical-sensitive assessment boundary | Risk boundary education | Sensitive tests | none for acquisition | future method topic | `/method-boundaries` | Review-gated only | Blocked |

## Blog / Journal Strategy

Decision:

- `/blog` should not exist now as a standalone route.
- Blog-style content should initially live under `/articles` with `content_family = journal_note`.

Recommended categories:

- Product notes.
- Career observations.
- Personality in real life.
- Relationships and communication.
- AI and self-understanding.
- Testing mistakes.
- User education.
- Editorial commentary.

Editorial tone:

- Practical, restrained, product-aware.
- Observational rather than authoritative.
- No personal diary format unless clearly separated from brand editorial content.
- No sensitive-topic acquisition.
- No ability-score authority expansion.

Content types:

- Release notes that explain user-facing context.
- Short editorial observations.
- Misuse-prevention notes.
- Reading lists around existing test/topic pages.
- Product education for interpreting results.

Publish cadence:

- 1-2 posts per month while the article inventory is still small.
- Do not let journal posts outnumber evergreen SEO articles during early scale.

Homepage eligibility:

- Eligible only when public, reviewed, indexable, and useful to the homepage audience.
- Not eligible for thin updates.

Footer eligibility:

- Not eligible until a real `/blog` index exists and has enough bilingual inventory.

What should not be published as blog:

- Clinical-sensitive acquisition content.
- Ability-sensitive authority claims.
- Employer-screening framing.
- Payment/report value promises.
- Internal ops updates with no user value.
- Thin announcements without durable search value.

## Monthly Research-Style Professional Article Strategy

Decision:

- Use `/articles/[slug]` now.
- Use a future `/research` route only after a bilingual index, inventory, and review model exist.
- Use labels such as research note, monthly insight, method note, theme report, data-informed observation, or analysis depending on evidence level.

Required CMS fields:

- `content_family = monthly_insight` or `method_note`.
- Evidence level.
- Reviewer.
- Review completion timestamp.
- Citation list.
- Data source note.
- Data privacy note.
- Claim boundary note.
- Related tests.
- Related articles.
- Related topics.
- Related methods.
- llms and llms-full eligibility.

Allowed data sources:

- Publicly documented product data only after privacy approval.
- Aggregated, non-identifying internal data only after product/legal approval.
- Public external sources that can be cited and reviewed.
- Existing backend/CMS method authority.

What cannot be claimed:

- Deterministic education, career, income, medical, psychological, or employment outcomes.
- Formal scientific status unless the evidence and review model support it.
- External oversight, legal status, or affiliation that is not documented.
- Hidden schema, sitemap, or llms exposure as proof of evidentiary strength.

Monthly longform template:

1. Question.
2. Why it matters.
3. Source/data boundary.
4. Method note.
5. Observation.
6. Interpretation.
7. Limits.
8. Related tests.
9. Related articles.
10. References when available.

## 12-Month Longform Calendar

These are planning prompts, not article titles.

| Month | Working theme | Evidence requirement | Route now | Review gate | Related surfaces |
|---|---|---|---|---|---|
| 1 | Why assessment boundaries matter | Existing method-boundary authority | `/articles` | Product/SEO | `/method-boundaries`, `/tests` |
| 2 | MBTI as language, not identity lock | Existing MBTI topic/test authority | `/articles` | Product/SEO | `/topics/mbti`, MBTI test |
| 3 | Big Five trait interpretation in work contexts | Big Five test authority | `/articles` | Product/SEO | Big Five test, future topic |
| 4 | RIASEC interest signals and career exploration | RIASEC authority + career guides | `/articles` | Career/content | RIASEC test, career hub |
| 5 | Occupation dataset scope and limits | Dataset method API | `/articles` or method page after alignment | Data/product | dataset method page |
| 6 | Multi-test interpretation workflow | Test authority + method boundaries | `/articles` | Product/SEO | MBTI, Big Five, RIASEC |
| 7 | Personality and communication patterns | Article/topic evidence | `/articles` | Content | future relationships topic |
| 8 | Career transition decisions | Career guide authority | `/articles` | Career/content | `/career/guides` |
| 9 | Reading result pages responsibly | Result boundary review | `/articles` | Product/legal if needed | tests and method boundaries |
| 10 | AI-era self-understanding | Editorial analysis only unless data exists | `/articles` | Product/SEO | career/topic pages |
| 11 | Assessment misuse prevention | Method and policy authority | `/articles` | Product/legal | `/method-boundaries` |
| 12 | Annual content and method review | Internal ops summary if approved | `/articles` | Product/SEO | topics and guides |

## Route Decision

| Question | Answer |
|---|---|
| Should `/blog` exist now? | No. It redirects to `/articles` and has no separate public authority. |
| Should blog-style content initially live under `/articles`? | Yes. Use a content family field. |
| Should `/research` exist now? | No. There is no public bilingual index route. |
| Should research-style longform initially live under `/articles`? | Yes, with evidence and review fields. |
| Should `/topics` remain the main cluster hub? | Yes. It is the strongest current cluster surface. |
| Do article category pages need real routes before footer expansion? | Yes. Query strings that canonicalize to `/articles` are not footer destinations. |
| Should `/career/guides` be used as footer-safe career content library? | Only after EN inventory/llms parity is handled or footer rendering gates the link by locale/inventory. |
