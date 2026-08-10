# G03 governed review

Status: `PASS_GOVERNED_CANDIDATES_NOT_AUTHORITY_NOT_PUBLISHED`.

The review covers all 422 owner rows and all 4,805 observed candidate edges. Every row has a deterministic governance state and basis. No row is activated or publication-authorized.

Owner results:

- 376 `GOVERNED_OWNER_ACCEPTED`;
- 26 `GOVERNED_OWNER_ACCEPTED_PRIVATE_NEXT_STEP_EXCLUDED`;
- 14 `HOLD_OWNER_CANONICAL_UNRESOLVED`;
- 2 `HOLD_NEXT_STEP_UNRESOLVED`;
- 4 `BLOCKED_WAITING_ON_C06`.

Edge results:

- 3,268 `APPROVED_FOR_BACKEND_CANDIDATE`;
- 708 `HOLD_SOURCE_OWNER_UNGOVERNED`;
- 165 `HOLD_TARGET_OWNER_UNGOVERNED`;
- 382 `HOLD_SELF_OR_DUPLICATE_EDGE`;
- 282 `BLOCKED_WAITING_ON_C06`.

Approval requires both current public canonicals to be HTTP 200, rendered, indexable-observed backend-sitemap members; an allowlisted relation; a unique non-self identity; a nonempty formula-safe label; governed owner or structural-neutral alignment; and no private route. Same-locale edges pass directly. Exactly 102 otherwise eligible edges involving the locale-neutral global homepage receive an explicit neutral-home cross-locale approval; no other cross-locale exception exists.

Window5 M01 is joined only by the 22 exact article-owner keys. The actionable `大五人格测试` conflict preserves the proposed test landing as owner; missing exact source rows remain explained and do not become zero. No fuzzy owner mapping is used.

Every Career source or target remains `BLOCKED_WAITING_ON_C06`, `proposed_active_state=false` and `publication_allowed=false`. Every non-Career row also keeps activation and publication false because G03 approval means only “eligible backend modeling candidate.” It is not CMS authority, runtime state, import permission or publication permission.

Machine summary: [g03_governed_review.json](g03_governed_review.json). Governed rows: [query_owner_parent_next_step.csv](query_owner_parent_next_step.csv) and [public_edge_registry.csv](public_edge_registry.csv).
