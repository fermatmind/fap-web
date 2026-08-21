# Career public projection renderer contract

## Authority and shape

The only reader-content input is the published fap-api Career public
projection. Reject missing, draft, malformed, wrong-locale, wrong-slug, or
unsupported-version payloads. Never substitute Desktop files, local datasets,
generated candidates, templates, sidecars, or synthesized related pages.

The Current Chinese projection order is exact and contains 26 unique entries:

1. `breadcrumb`
2. `hero`
3. `fermat_decision_card`
4. `primary_cta`
5. `career_snapshot_primary_locale`
6. `career_snapshot_secondary_locale`
7. `fit_decision_checklist`
8. `riasec_fit_block`
9. `personality_fit_block`
10. `definition_block`
11. `career_ai_description_block`
12. `responsibilities_block`
13. `work_context_block`
14. `market_signal_card`
15. `adjacent_career_comparison_table`
16. `ai_impact_table`
17. `career_risk_cards`
18. `career_path_block`
19. `contract_project_risk_block`
20. `next_steps_block`
21. `faq_block`
22. `related_next_pages`
23. `source_card`
24. `review_validity_card`
25. `boundary_notice`
26. `final_cta`

Validate required fields recursively. Preserve scalar values, FAQ questions and
answers, tables, source labels and URLs, link targets, array order, array
cardinality, and CTA attribution. Escaping unsafe markup is allowed; silently
dropping valid published fields is not.

## Fail-closed behavior

- Reject an unknown, missing, duplicated, reordered, or incomplete component
  list.
- Reject an invalid required component instead of assembling local replacement
  content.
- Return a real not-found or bounded error state when public authority is
  unavailable. Do not return a contentless HTTP 200.
- Derived claim permissions may suppress only the derived/risky presentation
  they govern; they must not erase valid canonical published content.

## Page contract

- Emit canonical, hreflang, and locale metadata from the resolved public
  identity.
- Keep CTA query attribution tied to the rendered career slug, locale, entry
  surface, source page type, target action, and test slug.
- Keep tables, long links, and unbroken text inside the viewport. Verify mobile
  and desktop layouts, keyboard order, headings, labels, and screen-reader
  semantics.
- Bind rendered HTML to the active frontend release when its shape can change.
  Do not reuse an earlier release's HTML under a newer renderer.
- Cache backend fetches only within their explicit data freshness contract.
  Rendered-page caching must separately account for frontend release identity,
  locale, slug, and projection version.

## Focused verification anchors

- `tests/contracts/career-display-surface.contract.test.tsx`
- `tests/contracts/career-job-backend-bundle.contract.test.ts`
- `tests/contracts/career-job-seo-authority.contract.test.tsx`
- `tests/contracts/career-conversion-attribution.contract.test.tsx`
- `tests/contracts/career-detail-cache-budget-repair-01.contract.test.ts`
- `tests/contracts/career-public-projection-renderer-skill.contract.test.ts`
