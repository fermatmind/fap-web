# English Content Parity Control Bootstrap

Control ID: `EN-PARITY-CONTROL-BOOTSTRAP-01`

This document establishes the single control window for sitewide zh-CN/en content parity. It is an orchestration contract only. It does not generate reader copy, change runtime behavior, write CMS data, publish content, or change sitemap, `llms.txt`, canonical, noindex, robots, JSON-LD, or search submission behavior.

## Authority and ownership

- Backend CMS/public APIs remain the authority for articles, career guides, personality profiles, assessment result content, career jobs, publication state, and public enumeration.
- Frontend remains a renderer, interaction layer, and API adapter. Missing backend content must fail closed; it must not be replaced with frontend editorial fallback copy.
- The only master manifest is `docs/seo/generated/en-content-parity-control-master.v1.json`.
- Only the control window may update the master manifest. Producer and QA windows return a `master_manifest_patch.candidate.json`; the control window validates and applies it in a later scoped change.
- Existing career orchestration state under `generated/fermatmind-content-agent-state/` is referenced in place. It must not be copied, reset, or replaced by this control.

## State machine

The ordered path is:

`not_started → inventory_frozen → package_in_progress → package_frozen → qa_pass → dry_run_ready → draft_imported → editorial_approved → published → live_qa_pass`

Any stage may enter `blocked`. Skipping a state is forbidden. A file existing is not evidence that a gate passed. Each transition requires its gate report and exact SHA lineage.

The master stores current state and must remain valid after accepted transitions; the validator does not pin lanes to their bootstrap values. Entering `blocked` records the prior gate in `blocked_from_status`. A recovery candidate may return only to that retained state, uses external recovery evidence, and clears `blocked_from_status`; it cannot skip forward from `blocked`. For lanes without subscopes, `lane.status` is the transition source. W1 and W3 store state, package SHA, QA reference, blockers, and recovery position independently on each registered subscope. A split lane's status is the least-progressed subscope status (or `blocked` when any subscope is blocked).

`draft_imported` does not mean public release. Promotion, public release, indexability, sitemap, LLMS, schema, media, cache, and search actions remain independent gates.

## Lane map and launch order

| Lane | Owner | Wave | Initial status | Work boundary |
| --- | --- | ---: | --- | --- |
| W1 | MBTI | 1 | `inventory_frozen` | Seven cross-type comparisons and 46 result-content families as separate packages |
| W2 | Big Five | 1 | `not_started` | Preserve 52/52 public controls; verify 50 drafts and private result surfaces |
| W3 | Editorial CMS | 1 | `inventory_frozen` | 17 Articles first, then 20 Career Guides as separate packages |
| W4 | RIASEC | 2 | `not_started` | Fourteen deep result groups and safe variants |
| W5 | Enneagram | 2 | `not_started` | Preserve 58/58 public controls; result registry only |
| W6 | IQ | 2 | `not_started` | Result/report content, CMS media authority, answer-key safety |
| W7 | EQ | 3 | `not_started` | Result/report/share content and claim boundaries |
| W8 | CareerJob | 3 | `not_started` | 1046/1046 identity, projection, and language-quality audit |
| W9 | Independent QA | on demand | `not_started` | Starts after the first producer reaches `package_frozen` |

At most three producer lanes run concurrently. W1, W2, and W3 may start only after this bootstrap PR is merged and the control window re-reads the new `main` SHA. Only one full heavy validation suite may run on the local 8-core/16-GB machine at a time.

W8 must use `control_<previous> + new_50`. The existing 1046×2 frozen career baselines and current 1046/1046 public index counts are inputs, not generation targets. Count parity does not prove English quality.

## Producer handoff contract

Every producer package must contain:

1. `scope_manifest.json`
2. `assets.jsonl`
3. `translation_map.json`
4. `source_ledger.json`
5. `claim_boundary_report.json`
6. `editorial_review.json`
7. `dry_run_readiness.json`
8. `sha256_manifest.json`
9. `master_manifest_patch.candidate.json`
10. `handoff.md`

Large local packages live under the lane directory in `generated/en-content-parity/` and are not committed by default. The control manifest records reviewed package SHAs and durable artifact references.

`sha256_manifest.json` covers the eight immutable payload files (all required handoff files except the SHA manifest itself and the candidate control envelope). Its deterministic aggregate SHA is computed from the ordered `path:sha256` entries. The candidate must name the real SHA manifest, copy that aggregate SHA, and match its lane and package ID. The validator reads every covered file and rejects missing, changed, reordered, or mismatched payloads.

The candidate patch may propose only the next valid state for its lane or registered `subscope_id`. It must include transition evidence with an explicit evidence owner. Producer packages and their candidate/SHA files must physically reside in the exact registered lane or subscope output directory; declaring the correct path from another directory is rejected. Producer-owned evidence before freeze must be covered by the verified package SHA manifest and use the transition-specific report: `source_ledger.json` for inventory/package start, `editorial_review.json` with a `PASS` verdict for `package_frozen`, or `claim_boundary_report.json` with a `BLOCKED` verdict for an early blocker. The embedded `scope_manifest.json` is independently checked against the shared Schema and complete lane-package invariants; hashing an incomplete scope does not make it acceptable. Every candidate asset ID must exactly equal the registered target set. Inventory counts become immutable at `inventory_frozen`; `package_frozen` fixes the complete asset set and aggregate package SHA; every later candidate must reuse that exact package and keep `scope_manifest.json` at `package_frozen`. Post-QA transitions use separately hashed external gate reports and append evidence to `gate_lineage`; they do not rewrite the frozen payload. `draft_imported` and `published` additionally require a `fermatmind.en_content_parity_controlled_transition_approval.v1` artifact owned by the human operator, stored under the registered `generated/en-content-parity/CONTROL-approvals/` authority directory, with an approval reference and exact frozen package SHA. An `inventory_frozen` proposal additionally requires all registered target cohorts, reconciled non-null counts, a non-`inventory_required` parity state, and a row count matching the expected inventory. The validator parses the hashed `assets.jsonl` and `source_ledger.json`; their exact asset objects, unique source rows, per-cohort counts, lane, subscope, and package identity must match the candidate. It must keep these values false:

- CMS write
- staging write
- production import
- public release
- SEO runtime release
- search submission
- master manifest write

Use `node scripts/seo/validate-en-content-parity-control.mjs --artifact <path>` to validate a lane `scope_manifest.json`, `master_manifest_patch.candidate.json`, or W9 independent QA report against the shared Schema. Use `--manifest <path>` to validate a proposed progressed master before replacing the authoritative file. Progressed master counts must reconcile with its registered asset cohorts.

## W1 and W3 split rules

W1 has two independently frozen packages:

1. `W1-MBTI-COMPARISONS` owns only `ENPARITY-W1-MBTI-CROSS-COMPARISONS`.
2. `W1-MBTI-RESULT-CONTENT` owns only `ENPARITY-W1-MBTI-RESULT-CONTENT`.

They must not share a package SHA, W9 report, import receipt, approval, publication/activation gate, or PR. Advancing comparison content never advances private result content.

W3 is one operator window with two sequential scopes:

1. `W3-ARTICLES` produces and freezes the 17-Article package only under `generated/en-content-parity/W3-editorial-cms/articles/`.
2. `W3-CAREER-GUIDES` starts only after the Article package is frozen and produces the separate 20-guide package only under `generated/en-content-parity/W3-editorial-cms/career-guides/`.

Each scope has its own `subscope_id`, state-machine position, package SHA, QA reference, and blockers. Advancing `W3-ARTICLES` never advances `W3-CAREER-GUIDES`; both can therefore traverse `package_in_progress → package_frozen → qa_pass` independently. The W3 lane root is not itself a valid package directory. The two scopes must never share a PR, import package, SHA manifest, candidate patch, or approval. This preserves the repository rule that one PR equals one scope.

## Independent QA gate

A producer cannot self-declare `qa_pass`. That transition requires an external W9 report physically stored under the registered `generated/en-content-parity/W9-independent-qa/` authority with Schema version `fermatmind.en_content_parity_independent_qa_report.v1`, exact producer lane/subscope/package SHA, the complete registered target asset set and row count, and verdict `PASS`. A producer-co-located file cannot masquerade as W9 merely by declaring W9 fields. Subset QA cannot advance the lane. The report must record PASS for language naturalness, Chinese leakage, claim boundary, asset duplication, field leakage, and page/API alignment. Its real file path and SHA are verified independently and it must not be embedded as producer-owned package evidence.

## Control-window patch acceptance

Before accepting a producer candidate patch, the control window verifies:

- the patch targets the current master manifest SHA;
- the lane ID and output directory match the registry;
- all eight immutable payload files exist and match `sha256_manifest.json`, and the candidate package SHA matches its deterministic aggregate;
- asset IDs and translation groups are unique;
- expected, current, and remaining counts reconcile when all are known;
- protected lane, asset type, translation group, locale pair, and authority-source fields did not drift;
- `inventory_frozen` includes complete target inventory evidence, semantically matches the hashed asset/ledger payloads, and cannot retain unknown counts or `inventory_required` cohorts;
- `package_frozen` and every later state retain one immutable package SHA and a gap-free gate lineage;
- `qa_pass` is backed by an independent W9 PASS verdict covering the full target and tied to the exact producer package SHA;
- `blocked` retains its prior state and can recover only to that exact gate with external recovery evidence;
- `draft_imported` and `published` carry separately hashed human-operator approvals for the exact frozen package SHA;
- later dry-run, import, editorial, publication, and live-QA gates use external exact-SHA reports without rebuilding the W9-reviewed package;
- all permissions remain false unless a separately controlled exact-SHA approval exists.

Producer PASS does not authorize CMS import or public release. Production import always requires explicit human approval naming the exact final artifact SHA and write mode.

## First-wave prompts

The exact W1, W2, and W3 prompts are stored in `docs/seo/generated/en-content-parity-first-wave-prompts.v1.json`. They are immutable bootstrap inputs. A later prompt change requires a scoped control-manifest update.

## Repository rule impact

- Repository workflow rule changed: yes. `AGENTS.md` now freezes the unique master, candidate-only leaf handoff, W3 split, immutable post-freeze SHA, full-target W9 gate, and independent release gates.
- Runtime behavior changed: no.
- Content authority changed: no.
- Public exposure changed: no.
- Frontend editorial fallback added: no.
- CMS, staging, production, deploy, or Search Channel action performed: no.
- Existing PR train manifest/state changed: no.
