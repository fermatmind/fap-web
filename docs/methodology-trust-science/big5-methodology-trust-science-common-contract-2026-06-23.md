# Big Five Methodology / Trust / Science Common Contract

Task id: `BIG5-METHODOLOGY-TRUST-SCIENCE-COMMON-CONTRACT-01`

Verdict: `READY_FOR_POLICY_HANDOFF`

This contract lets the `big_five_result_page` agent support future methodology, trust, and science planning as a boundary and evidence source. It does not generate public methodology pages, trust pages, science articles, CMS packages, title/meta copy, publishable article body, runtime code, analytics instrumentation, search submissions, provider calls, deployment, or private-result access.

## Agent Roles

| Role | Agent |
| --- | --- |
| Producing agent | `big_five_result_page` |
| Receiving agent | `methodology_trust_science_support` |
| Receiving agent | `seo_geo_control` |
| Receiving agent | `cms_draft_package` |
| Gate agent | `claim_privacy_safety_gate` |
| Optional observer | `analytics_gsc_opportunity` |

## Allowed Inputs

Allowed inputs are public, bounded, and source-classified: public OCEAN trait labels, public trait structure explanations, five-factor model summaries, public method-boundary copy, source-supported reliability or validity caveats, reflection framing, non-diagnostic / non-hiring / non-salary boundaries, backend-owned sanitized Big Five V2 evidence, sanitized share-safety evidence, locale, public route references, public test hub evidence, and public method/trust page candidates.

## Forbidden Inputs

Forbidden inputs include raw scores, score vectors, percentiles, selector traces, private attempt IDs, user IDs, report tokens, private URLs, private result payloads, private report body text, internal metadata, unsafe source refs, QA traces, editor notes, release/registry/content hashes, payment/order/benefit state, unreviewed CMS text as authority, frontend fallback copy as authority, generated artifacts without source classification, unsupported superiority claims, official 32-type claims, fixed-type mappings, and private result data used as public profile or methodology content.

## Safe Output Taxonomy

Allowed output types are planning candidates only: methodology boundary, reliability/validity explainer, assessment science explainer, common misconception, data privacy explainer, item-design notes, Big Five vs MBTI method comparison, Big Five vs RIASEC work-style distinction, six-hub method boundary support, internal-link candidate, CMS dry-run candidate, claim-gate request, and blocked science-claim report.

Forbidden outputs include clinical diagnosis, therapy or treatment claims, hiring or employment suitability claims, salary/performance/success predictions, fixed-type assignment, official 32-type claims, identity-proof claims, private-result-based public pages, raw-score-based science claims, unsupported psychometric superiority claims, competitor attacks, defamatory comparisons, publishable article body, and CMS payloads.

## Source Classification

| Classification | Use |
| --- | --- |
| `backend_authority` | May support source-backed planning when public-safe and cited by reference. |
| `cms_public_api_authority` | May own public methodology/trust/science body after CMS review. |
| `fap_web_consumer_contract` | Proves rendering or boundary behavior; not editorial authority. |
| `result_page_agent_evidence` | Supports public boundary planning only. |
| `runtime_qa_artifact` | Supports read-only QA assertions only. |
| `analytics_handoff_artifact` | Supports read-only quality-report vocabulary only. |
| `safety_gate_artifact` | Blocks unsafe claims and private fields only. |
| `generated_artifact` | Requires source classification before use. |
| `fixture` / `mock` | Excluded from production or public methodology interpretation. |
| `unknown` | Must remain Unknown. |
| `access_required` | Blocked because private-result access is not authorized. |

## HOLD Actions

The following remain held: CMS, publish, search submission, provider calls, deploy, runtime instrumentation, methodology/trust/science runtime mutation, generated pages, backend import, opportunity scoring, Search Channel mutation, raw private data, private result text, fixed-type claims, official 32-type claims, and diagnosis/therapy/treatment/hiring/salary/performance/success/relationship/life-outcome claims.

## Next Safe Outputs

The next safe PRs are:

- `BIG5-METHODOLOGY-SOURCE-AUTHORITY-PACKET-01`
- `BIG5-METHODOLOGY-CLAIM-PRIVACY-SAFETY-PACKET-01`

Both remain docs/contracts-only unless separately authorized.
