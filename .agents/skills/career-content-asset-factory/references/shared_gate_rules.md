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

## Repair Limits

Default maximum repair loops: 3.

After 3 loops, stop and produce:

- blocked report
- repair prompt
- source collection checklist
- exact failing fields

