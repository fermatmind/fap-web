# MBTI64 V2.1 HTML Completeness Repair

## Summary

This PR repairs frontend consumption of already-promoted MBTI64 V2.1 personality content. It does not add local editorial content, does not import CMS data, and does not change sitemap, llms, search queue, result, order, payment, share, account, or private-report behavior.

## Runtime Finding

Post-promotion smoke found that the public API exposed promoted MBTI64 V2.1 content, but live HTML did not fully expose every expected visible field:

- Variant pages rendered promoted title, H1, quick answer, FAQ, and some body text.
- Variant pages still missed promoted section H2 values because the renderer replaced CMS-authored titles with generic local heading labels.
- Variant pages missed some payload-only section bodies because promoted details were stored in `payload_json.raw` arrays such as `items`, `strengths`, `blind_spots`, `watchouts`, `best_fit_environments`, and `communication_tips`.
- Comparison pages rendered promoted title, H1, blocks, and FAQ, but did not expose a distinct quick-answer block above the comparison body.

## Repair Boundary

The frontend remains a CMS/API consumer. The repair renders fields already returned by fap-api:

- `sections[]` for promoted variant section titles and bodies.
- `answer_surface_v1.summary_blocks[]` for comparison quick answer.
- `comparison_public_projection_v1.comparison_blocks[]` for comparison body blocks.

## Deferred Sidecar

Whole-page HTML still includes `/results/lookup` from the global account header and a Facebook `/share/...` URL from the global footer. These are not MBTI64 V2.1 body links, but they still affect strict full-HTML private-route scans.

Recommended sidecar: `MBTI64-GLOBAL-HEADER-PRIVATE-ROUTE-HYGIENE-01`.
