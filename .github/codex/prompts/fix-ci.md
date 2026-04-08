You are fixing a failing PR CI run for the fap-web repository.

Repository facts
- Main workflow name: CI
- PR checks exposed in GitHub UI: build, contracts
- Package manager: pnpm
- Workflow file to inspect first: .github/workflows/ci.yml

Primary goal
Make the current failed PR CI run pass with the smallest safe change.

Required reading order
1. Read .github/workflows/ci.yml first.
2. Read .github/codex-context/metadata.txt if present.
3. Read .github/codex-context/failed-run.log if present.
4. Read only the smallest set of source files needed to reproduce and fix the failure.

Execution rules
- Reproduce only the smallest relevant failing check.
- Prefer a targeted fix over refactors.
- Do not change unrelated product behavior.
- Do not change deployment, secrets, CI shape, package manager, or branch workflow unless required for the current failing check.
- Do not introduce compatibility wrappers, fallback bridges, or broad cleanup unrelated to the failing contract.
- Keep the patch minimal, reviewable, and safe to push back to the same PR branch.

Validation
- Re-run only the smallest relevant validation command or commands needed to verify the fix.
- If the failing area is build, validate the build-relevant contract.
- If the failing area is contracts, validate only that contract path first.

Final summary must include
1. root cause
2. files changed
3. commands run
4. why the patch is minimal
5. any remaining risk or follow-up
