# RIASEC Career Graph Claim Safety Packet

Task: `RIASEC-CAREER-GRAPH-CLAIM-SAFETY-PACKET-01`

Verdict: `READY_TO_BLOCK_UNSAFE_OUTPUTS`

Mode: fap-web docs/contracts only. This packet adds no recommendation logic, runtime code, CMS writes, generated pages, Career Graph runtime mutation, private result access, production import, search submission, provider call, or deploy.

Dependency: `RIASEC-CAREER-GRAPH-BRIDGE-COMMON-CONTRACT-01` is merged in PR #1378 with merge commit `46d968520d0e4cf612da04e3fc45696e126dc073`.

## Consumed Evidence

- `docs/result-page-agents/riasec-safety-gate-consumption-packet.v1.json`
- `docs/result-page-agents/riasec-runtime-qa-consumption-packet.v1.json`
- `docs/result-page-agents/riasec-analytics-consumption-packet.v1.json`
- `docs/career-graph/riasec-career-graph-bridge-common-contract.v1.json`
- `docs/career-graph/riasec-career-graph-source-authority-packet.v1.json`
- fap-api handoff by reference: `backend/docs/riasec/riasec-result-page-agent-runtime-career-analytics-handoff-2026-06-23.md`

## Examples-Only Assertions

- Occupation examples remain examples-only.
- Major examples remain examples-only.
- Work activity examples remain exploration prompts.
- The RIASEC Career Graph bridge remains a starting point, not a decision.

## Forbidden Claims

The bridge and downstream planning packets must block:

- deterministic career recommendation
- best career for you
- guaranteed fit
- you should choose
- you will succeed
- admissions prediction
- hiring suitability
- salary prediction
- performance prediction
- success prediction
- ability measurement
- job-fit score
- user ranking
- occupation ranking as objective truth
- raw-score-to-career recommendation

## Forbidden Bridge Or Analytics Inputs

Bridge and analytics planning must not consume raw scores, score vectors, percentiles, selector traces, source refs, QA traces, editor notes, private attempt IDs, user IDs, private result payloads, payment state, order state, or report-access state.

## Safety Gate Authority

Safety Gate can block unsafe bridge outputs. It cannot approve production, CMS writes, search submission, private data access, runtime recommendations, Career Graph runtime mutation, production import, generated pages, provider calls, opportunity scoring, Search Channel mutation, or deploy.

## Blocked Recommendation Report Schema

Required fields:

- `blocked_output_type`
- `violated_claim_boundary`
- `evidence_ref`
- `source_classification`
- `replacement_safe_language`
- `required_follow_up`
- `approval_state`

Example blocked report state: `deterministic_career_recommendation` is blocked; replacement safe language is `examples_to_explore`; approval state is `blocked`.

## HOLD Actions

Still held: recommendation logic, runtime code, CMS, generated pages, Career Graph runtime mutation, private result data, production import, deploy, search submission, provider calls, opportunity scoring, and Search Channel mutation.

Negative guarantees: recommendation logic added: no; runtime code changed: no; CMS writes: none; generated pages: none; Career Graph runtime mutation: none; private result data accessed: none.
