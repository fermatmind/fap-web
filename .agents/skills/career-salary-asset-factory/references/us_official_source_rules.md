# US Official Source Rules

Prefer programmatic or source-backed extraction. Do not model-fill official facts.

Wage source labels must be one of:

- BLS OOH
- BLS OEWS
- CareerOneStop
- My Next Move
- O*NET

Outlook/openings may use:

- BLS Employment Projections
- BLS OOH
- CareerOneStop
- O*NET

Do not put `BLS Employment Projections` in `wage_sources.source_name`.

Requirements:

- Exact SOC uses seed SOC unless a reviewed override is documented.
- Seed SOC null plus supplied SOC requires `reviewed_soc_override`, mapping URL, and reason.
- Missing p25/p75 must have a specific null reason: OOH does not provide percentiles, OEWS percentile table not captured, CareerOneStop not captured, suppressed, top-coded, or not separately reported.
- Military-only occupations must not borrow civilian wage rows.
