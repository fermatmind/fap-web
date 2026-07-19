# llms.txt content-page partial LKG repair

## Problem

The public content-page detail fan-out previously converted each transient per-slug failure to `null`. Any surviving non-empty subset then satisfied the collection LKG usability check and could replace the prior complete snapshot. `llms.txt` also treated a locale-level content-page timeout as an empty array while its public cache policy considered only personality authority availability.

Read-only Stage 131 evidence observed the resulting production sequence as `0/7 -> 6/7 -> 7/7`, while sitemap and `llms-full.txt` remained at the stable seven-page authority set. That observation proved transient self-recovery, not a durable resolution.

## Repair

- Every key in `DISCOVERABLE_CONTENT_PAGE_KEYS` must reach a terminal authority result before a fresh collection snapshot is accepted.
- HTTP `404`/`422`, private, and noindex results are terminal exclusions. Network and other request failures are transient.
- A transiently incomplete refresh reuses only a non-empty, complete, public/indexable collection LKG. Without one, the collection fails closed.
- A partial subset is never written to the collection LKG.
- Complete collection snapshots use a versioned LKG key, so a partial subset written by the former implementation cannot be reused after this repair.
- If a terminal exclusion conflicts with membership in an older LKG during a mixed transient failure, the conflicting collection LKG is cleared and the request fails closed. This prevents an authoritatively private/noindex/absent page from being resurrected.
- A complete authoritative empty collection is accepted as fresh revocation state, but it is not eligible to make `llms.txt` publicly cacheable.
- `llms.txt` now requires non-empty content-page authority results for both `en` and `zh`, in addition to the existing personality authority gates, before returning the public shared-cache policy. A locale timeout, transient failure without LKG, or empty cohort returns `private, no-store, max-age=0`.

## Authority and claim boundary

CMS/public API remains the only content-page authority. The frontend adds no editorial copy, local enumeration fallback, publication inference, or indexability override. This change only hardens collection completeness, stale-membership revocation, and response cache behavior.

Repository rule impact: existing CMS/backend authority, frontend no-fallback, and sitemap/LLMS enumeration rules are preserved; no new content surface or ownership model is introduced.

## Validation

The focused contracts cover complete snapshot seeding, transient single-key recovery from complete LKG, no-LKG fail-closed behavior, mixed noindex/transient revocation, complete noindex refresh, and the two-locale `llms.txt` cache gate. No production, CMS, database, search, cache, media, publish, or deploy mutation is part of this repair.
