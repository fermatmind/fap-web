# RIASEC Gaokao Major Cluster IA And Claim Boundary

Status: planning contract only.

This note defines the product and SEO boundary for a future RIASEC-to-major-cluster information architecture. It does not create routes, public copy, CMS records, sitemap entries, llms entries, JSON-LD, canonical changes, or runtime behavior.

## Scope

- Keep the current RIASEC flagship test detail page as the only public runtime surface in this PR: `/en/tests/holland-career-interest-test-riasec`.
- Define future IA requirements for major-cluster exploration pages before any implementation work starts.
- Preserve backend/CMS authority for publishable content and future indexability decisions.
- Prevent RIASEC copy from becoming a deterministic major, Gaokao, admission, or career-placement recommendation.

## Future IA Shape

Future major-cluster work should start from a small authority-backed graph rather than page generation at scale.

| Surface | Status | Purpose | Authority |
| --- | --- | --- | --- |
| RIASEC flagship landing | Existing runtime surface | Explain the Holland interest test and entry path to the assessment | Backend landing surface / public API |
| Major cluster index | Planned, not implemented | Let readers browse broad academic or training clusters through interest lenses | Backend CMS or major-cluster API |
| Major cluster detail | Planned, not implemented | Explain what a cluster usually involves and which interest patterns may make it worth exploring | Backend CMS or major-cluster API |
| Career bridge panel | Planned, not implemented | Connect a major cluster to representative career families, not individual guaranteed outcomes | Backend career authority API |
| Evidence and review ledger | Planned, not implemented | Show last reviewed, source coverage, and claim tier before indexability | Backend authority ledger |

## Cluster Model

Each future cluster should be modeled with conservative dimensions:

- `cluster_id`: stable machine id.
- `cluster_name`: display name from the backend authority layer.
- `riasec_primary_codes`: one or more broad interest signals, not a ranking.
- `riasec_secondary_codes`: optional supporting interest signals.
- `discipline_family`: broad academic, vocational, or training family.
- `learning_environment`: typical study or training environment, if evidence-backed.
- `work_activity_family`: broad work-activity type, if evidence-backed.
- `evidence_sources`: non-secret public sources or internal reviewed source ids.
- `review_status`: draft, reviewed, approved, deprecated.
- `claim_tier`: allowed, soft_allowed, needs_disclaimer, internal_only, or forbidden.
- `indexability_status`: noindex until enough reviewed evidence exists.

## Allowed Claims

RIASEC major-cluster copy may say:

- A RIASEC result can be used as an exploration lens for comparing broad major clusters.
- A cluster may be worth reviewing when its learning activities resemble a reader's interest pattern.
- The page can help readers ask better questions before consulting school, family, admissions, or career advisors.
- A cluster connection is a starting point for research, not a final recommendation.
- Career bridges should describe representative families and work activities, not guaranteed jobs.

## Forbidden Claims

RIASEC major-cluster copy must not say or imply:

- The system can pick the best major for a student.
- A RIASEC score predicts Gaokao score, admission probability, school fit, employment, salary, or long-term success.
- A cluster is objectively superior for a user because of a test result.
- A user should choose or avoid a major solely from RIASEC output.
- A page replaces counselor, teacher, admissions, parent, medical, legal, or financial guidance.
- A generated page is reviewed if the backend review ledger does not say it is reviewed.

## SEO Boundary

- Do not create programmatic major/personality/career pages until backend authority, evidence, and review gates exist.
- Do not add future cluster URLs to sitemap, llms, llms-full, robots, canonical maps, hreflang maps, or search submission flows in this PR.
- Do not index thin pages that only restate a RIASEC code and a major name.
- Prefer a small reviewed set of cluster pages over N x N expansion across majors, careers, cities, schools, or personality labels.
- Treat any alternatives, rankings, or "best major" wording as out of scope.

## Runtime Authority Boundary

- Frontend may render product UI, interaction states, and API projections.
- Frontend must not hardcode publishable major-cluster editorial copy, claim language, or local fallback content.
- Empty or missing backend authority should render a withheld, empty, or unavailable state rather than local editorial copy.
- Future CMS or API records must own copy, evidence, review status, indexability status, and last-reviewed timestamps.

## 50-Project MVP Implication

For the current 50-project MVP horizon, do not ship standalone Gaokao major-cluster pages. The acceptable near-term output is:

- A reviewed planning contract.
- A backend authority task that can define the cluster data model and dry-run validation.
- A later frontend renderer only after the backend authority layer exists.

## Deferred Work

- Backend major-cluster schema and review ledger.
- CMS dry-run package for sample clusters.
- Public API projection contract.
- Frontend renderer and contract tests.
- Indexability review for any future cluster URL.

## Negative Guarantees

This PR does not:

- Add or change runtime routes.
- Add or change public frontend copy.
- Add or change sitemap, llms, llms-full, robots, canonical, hreflang, or JSON-LD output.
- Publish CMS content.
- Submit search URLs.
- Call providers.
- Deploy production.
