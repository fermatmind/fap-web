# Career Content Agent Technical Summary - 2026-06-25

This document is the fap-web technical closeout for the FermatMind career content
agent line. It records what is complete, what remains candidate-only, and what a
future task scan should pick up next.

## Current Verdict

The career content agent mainline is complete for the 1046 career-job cohort.

Completion here means:

- modular career block generation reached 1046 careers;
- page assembly and AI Impact assets were approved and production imported;
- post-import live page and SEO safety QA passed;
- baseline artifact registry is ready;
- the six completed block baselines are restorable from the persistent artifact
  root.

It does not mean every enhancement idea is released to runtime. SEO/GEO intent
optimization and adjacent career graph improvements remain separate candidate
lanes.

## Completed Mainline

The completed production line is:

`seed -> evidence -> synthesis -> asset -> freeze -> final QA -> page assembly -> integrated QA -> staging preview -> editorial review -> approved transition -> exact-SHA production import -> post-import live QA/SEO safety -> artifact root persistence QA`

Tracked state:

- `generated/fermatmind-content-agent-state/global_content_state.json`
- `generated/fermatmind-content-agent-state/import_state.json`
- `generated/fermatmind-content-agent-state/latest_pass_baselines.json`
- `generated/fermatmind-content-agent-state/next_goal_recommendation.md`

Mainline closeout evidence:

- `generated/career-content-1046-post-import-live-page-seo-qa/post_2391_final_live_qa_closeout.json`
- `generated/career-content-artifact-root-persistence-qa/artifact_root_persistence_report.json`
- `generated/career-content-artifact-root-persistence-qa/server_restore_preflight_report.json`
- `generated/career-content-artifact-root-persistence-qa/restore_verify_summary.json`

Current state labels:

- `career_content_production_imported_post_import_qa_safe`
- `CAREER_CONTENT_1046_POST_IMPORT_LIVE_QA_SEO_SAFE`
- `BASELINE_ARTIFACT_REGISTRY_READY`
- `ARTIFACT_ROOT_PERSISTENCE_PASS`

## Completed Baseline Blocks

The following blocks are treated as completed baseline inputs for future
candidate work. Each block has 1046 slugs and 2092 zh-CN/en rows where
applicable.

| Block | Status | Artifact / SHA authority |
| --- | --- | --- |
| `career-identity` | complete | `c72d1eb979e83b872d4405b6f581aed7f79c945461b5e4af34b7d2d1eaab934d` |
| `career-work-activities` | complete | `04f9bce6dbd6b2a28a8bba504b4fde14563637cc4083e5774b889659ee63be77` |
| `career-skills-entry` | complete | `edcba095466d89f5ae5c1d67cfe573f9aa637071455fe120690e996196e27190` |
| `career-fit` | complete | `f3246a7ba7843444e61e6f4a51b618907d042894fe1fdcd2794a97da01a22629` |
| `career-adjacent-comparison` | complete | `84cb88d04c6eb4d90ec6ece2f56a0ab65b954d6bb57e121302550ee53218791c` |
| `career-page-assembly` | complete | artifact package `eb490ece69d0643fdeb03780f28b68dad84766041cd4b0305e6e448acaa35677`; production page assembly SHA `148f35732bdf4c08df64ac6aad02946417c5b63420c3a2f67a9cfb13c735650e` |
| `career-risk-future-ai-impact` | complete | production AI Impact SHA `f22e0266f9b8aa904b00466c9cf751efa72835aebcee41c959d454ffacf96a92` |

The six non-AI page-assembly baselines are restorable from:

`CAREER_CONTENT_ARTIFACT_ROOT=/var/www/career-content-artifacts`

Do not regenerate a missing local baseline before trying artifact restore.

## Agent Capability Boundary

The career content agent can:

- create controlled `control_<previous> + new_50` manifests;
- generate and audit block evidence, synthesis, and reader-facing assets;
- run repair loops under block-specific gates;
- freeze PASS baselines and register SHA manifests;
- export, upload, and restore frozen baselines;
- prepare staging/import/readiness packages;
- produce candidate-only SEO/GEO or graph artifacts.

The career content agent must not autonomously:

- modify runtime page code;
- write CMS or production data;
- modify sitemap, `llms.txt`, canonical, noindex, robots, JSON-LD, or schema;
- activate candidate search projections;
- production import without exact-SHA human approval;
- use frontend fallback copy as content authority.

## Enhancement Lanes

These are not unfinished mainline tasks. They are next-stage enhancement lanes
that require candidate-first workflows and separate release gates.

### 1. SEO/GEO Query Intent Candidate Layer

Status: candidate layer exists; 50-slug preview exists; not runtime.

Evidence:

- `generated/career-seo-geo-query-intent-audit/`
- `generated/career-query-intent-projection-candidates/`
- `generated/career-seo-geo-release-gate/`
- `generated/career-seo-geo-query-intent-release-review/`

Current conclusion:

- `SEO_GEO_RELEASE_REVIEW_PREVIEW_COHORT_READY`
- `candidate_rows = 2092`
- `preview_cohort_slug_count = 50`
- `runtime_approved_count = 0`

Next task:

1. Continue 50-slug candidate editorial rewrite/release review.
2. Decide which candidate fields can enter an explicit CMS/API preview contract.
3. Do not change title, meta, canonical, noindex, sitemap, `llms.txt`, JSON-LD,
   or schema without a separate SEO/GEO release PR.

### 2. Adjacent/Internal Link Graph Candidate

Status: current candidate is repair-required; not runtime.

Evidence:

- `generated/career-adjacent-link-graph-candidate/graph_candidate_gate.json`

Current conclusion:

- `CAREER_ADJACENT_LINK_GRAPH_CANDIDATE_REPAIR_REQUIRED`
- `candidate_rows = 2092`
- `ready_rows = 0`
- `repair_required_rows = 2092`
- `rows_needing_family_route_resolution = 2092`
- `runtime_approved_count = 0`

Next task:

1. Restore the completed adjacent baseline from artifact root if the local
   directory is missing.
2. Rebuild `career-adjacent-link-graph-candidate-v2` from the adjacent PASS
   baseline, not from live related links or title similarity.
3. Keep the graph candidate-only until family hub authority and graph QA pass.
4. Do not start fap-api projection or fap-web rendering PRs until the candidate
   gate is ready.

### 3. Manual Editorial Upgrades

Status: optional enhancement.

Recommended scope:

- high-value careers;
- high-risk clinical, legal, aviation, education, military, engineering, and
  regulated occupations;
- pages with SEO/GEO opportunity or conversion priority.

Rules:

- Use the frozen block baselines as authority.
- Prefer repair batches and editorial QA over ad hoc page edits.
- Do not create frontend fallback content.

## How Future Tasks Should Start

1. Read this document and `generated/fermatmind-content-agent-state/`.
2. If a baseline directory is missing, run restore preflight against
   `CAREER_CONTENT_ARTIFACT_ROOT` before regeneration.
3. Treat SEO/GEO and adjacent graph work as candidate-only until explicitly
   approved for runtime.
4. Keep production import and SEO runtime changes behind exact-SHA human
   approval.

## Closeout Statement

If the scope is "career block agent generation, launch, QA, and safety closeout",
the line is complete.

If the scope is "zero-maintenance long-term optimization", the remaining work is
enhancement and operations hardening:

- continue SEO/GEO candidate release review;
- rebuild adjacent/internal link graph candidate v2;
- periodically verify artifact root restore from a clean worktree.
