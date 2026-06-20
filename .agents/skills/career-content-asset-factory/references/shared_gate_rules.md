# Shared Gate Rules

## Verdicts

- `PASS`: all required rows ready; no blocked or repair-required rows remain.
- `REPAIR_REQUIRED`: repairable issues remain, such as missing snippet text, weak wording, or language leakage.
- `REJECT`: structural failure, trust failure, unsupported source class, contaminated baseline, or unsafe generated facts.

## PASS Requirements

- Schema errors: 0.
- Duplicate slug-locale rows: 0.
- Unknown fields: 0 unless explicitly versioned.
- Control rows unchanged unless migration was explicitly authorized.
- All source IDs and derivation hashes resolve.
- Raw enum and internal lineage are absent from reader-facing output.
- No income, employment, admissions, licensing, immigration, or success guarantees.
- Block-specific editorial quality gate PASS. Schema/trust PASS alone is not public readiness.
- Template reuse, repeated phrase frequency, locale independence, role specificity, and reader usefulness findings are 0 or explicitly accepted in a review report.
- Candidate search/SEO/schema data is isolated from reader assets and reader APIs.

## Editorial Quality Gates

Each content block must define a competitive/editorial gate that tests whether the content is useful to a reader, not only whether it is safe.

At minimum, a block quality gate should check:

- role-specific detail instead of generic occupation wording
- repeated sentence and repeated structural skeleton risk
- market-specific `zh-CN` and `en` writing
- unsupported claims, raw enum leakage, audit/process leakage, and internal lineage leakage
- high-risk responsibility boundaries when the block touches safety, legal, clinical, education, aviation, military, finance, or regulated claims
- skill/action usefulness when the block gives preparation advice

Engineering gates can prove data shape. Editorial gates must prove public content quality.

## Repair Limits

Default maximum repair loops: 3.

After 3 loops, stop and produce:

- blocked report
- repair prompt
- source collection checklist
- exact failing fields
