# Career Content Artifact Root Persistence QA

Final conclusion: `ARTIFACT_ROOT_PERSISTENCE_PASS`.

## Summary

- Server host: `fap-api-prod`
- Persistent artifact root: `/var/www/career-content-artifacts`
- Baseline packages verified: `6/6`
- Restore preflight: `BASELINE_ARTIFACT_RESTORE_READY`
- Verify-only restore: `6/6` passed

## Verified Baselines

| Block | Package SHA | Restore verify |
| --- | --- | --- |
| `career-adjacent-comparison` | `84cb88d04c6eb4d90ec6ece2f56a0ab65b954d6bb57e121302550ee53218791c` | `BASELINE_RESTORE_VERIFY_PASS` |
| `career-fit` | `f3246a7ba7843444e61e6f4a51b618907d042894fe1fdcd2794a97da01a22629` | `BASELINE_RESTORE_VERIFY_PASS` |
| `career-identity` | `c72d1eb979e83b872d4405b6f581aed7f79c945461b5e4af34b7d2d1eaab934d` | `BASELINE_RESTORE_VERIFY_PASS` |
| `career-page-assembly` | `eb490ece69d0643fdeb03780f28b68dad84766041cd4b0305e6e448acaa35677` | `BASELINE_RESTORE_VERIFY_PASS` |
| `career-skills-entry` | `edcba095466d89f5ae5c1d67cfe573f9aa637071455fe120690e996196e27190` | `BASELINE_RESTORE_VERIFY_PASS` |
| `career-work-activities` | `04f9bce6dbd6b2a28a8bba504b4fde14563637cc4083e5774b889659ee63be77` | `BASELINE_RESTORE_VERIFY_PASS` |

## Safety Boundary

- No career content was generated.
- No evidence, synthesis, reader asset, or search projection files were created.
- No runtime, SEO, CMS, staging, or production import surface was modified.
- Artifact tarballs remain outside git; this report only records persistence verification.

## Next Use

If a local generated baseline directory is missing, the career content operator should restore the package from `CAREER_CONTENT_ARTIFACT_ROOT` before considering regeneration.
