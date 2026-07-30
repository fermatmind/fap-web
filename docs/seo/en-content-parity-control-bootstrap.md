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

`draft_imported` does not mean public release. Promotion, public release, indexability, sitemap, LLMS, schema, media, cache, and search actions remain independent gates.

## Lane map and launch order

| Lane | Owner | Wave | Initial status | Work boundary |
| --- | --- | ---: | --- | --- |
| W1 | MBTI | 1 | `not_started` | Seven cross-type comparison gaps plus private result surfaces |
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

The candidate patch may propose only the next valid state. It must keep these values false:

- CMS write
- staging write
- production import
- public release
- SEO runtime release
- search submission
- master manifest write

Use `node scripts/seo/validate-en-content-parity-control.mjs --artifact <path>` to validate a lane `scope_manifest.json` or `master_manifest_patch.candidate.json` against the shared Schema.

## W3 split rule

W3 is one operator window with two sequential scopes:

1. `W3-ARTICLES` produces and freezes the 17-Article package.
2. `W3-CAREER-GUIDES` starts only after the Article package is frozen and produces the separate 20-guide package.

The two scopes must never share a PR, import package, SHA manifest, candidate patch, or approval. This preserves the repository rule that one PR equals one scope.

## Control-window patch acceptance

Before accepting a producer candidate patch, the control window verifies:

- the patch targets the current master manifest SHA;
- the lane ID and output directory match the registry;
- every required file exists and matches `sha256_manifest.json`;
- asset IDs and translation groups are unique;
- expected, current, and remaining counts reconcile when all are known;
- protected source, identity, and revision fields did not drift;
- independent QA produced an accepted verdict for transitions at or after `qa_pass`;
- all permissions remain false unless a separately controlled exact-SHA approval exists.

Producer PASS does not authorize CMS import or public release. Production import always requires explicit human approval naming the exact final artifact SHA and write mode.

## First-wave prompts

The exact W1, W2, and W3 prompts are stored in `docs/seo/generated/en-content-parity-first-wave-prompts.v1.json`. They are immutable bootstrap inputs. A later prompt change requires a scoped control-manifest update.

## Repository rule impact

- Runtime behavior changed: no.
- Content authority changed: no.
- Public exposure changed: no.
- Frontend editorial fallback added: no.
- CMS, staging, production, deploy, or Search Channel action performed: no.
- Existing PR train manifest/state changed: no.
