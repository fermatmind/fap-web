# UK Mapping Rules

Use UK National Careers direct profile first.

Fallback order:

1. Direct UK National Careers profile.
2. Adjacent UK National Careers profile with boundary.
3. Prospects or official professional body profile.
4. Specific unavailable boundary only after search is documented.

Rules:

- `typical_hours` must be string or null, never a number.
- Variable-pay profiles must not become fixed salary bands.
- Do not convert UK salary to CNY.
- Do not use EU data as UK salary.

Known mappings:

- Data scientists -> UK National Careers Data scientist.
- Animal caretakers -> Animal care worker.
- Administrative services managers -> Facilities manager.
- Aircraft mechanics -> Aircraft maintenance engineer / aircraft engineer.
- Project management specialists -> Project manager.
- Agricultural workers -> Farm worker.
- Surgical technologists -> Operating department practitioner or audited adjacent operating-room healthcare profile.
