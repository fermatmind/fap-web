# Career Content Block Dependency Graph

Recommended order:

1. `career-identity-asset-factory`
2. `career-work-activities-asset-factory`
3. `career-fit-asset-factory`
4. `career-skills-entry-asset-factory`
5. `career-risk-future-asset-factory`
6. `career-adjacent-comparison-asset-factory`
7. `career-page-assembly-asset-factory`

`career-salary-asset-factory` remains an independent mature block and can be joined during page assembly.

## Dependencies

- Work activities depend on identity boundaries.
- Fit depends on identity plus work activities.
- Skills/entry depends on identity plus work activities.
- Risk/future depends on identity, work activities, and salary/market boundaries where relevant.
- Adjacent comparison depends on identity and work activities for both source and target occupations.
- Page assembly depends on all PASS block assets and must not invent missing block content.

If a dependency is not frozen and trusted, downstream blocks must mark dependent rows `BLOCKED`.

