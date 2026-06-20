# Autonomous Allowed Actions

Operator mode may perform or propose these actions when all prerequisites are satisfied:

- inspect generated state and frozen baseline reports
- create a next-batch manifest
- run evidence collection only for the authorized batch
- run schema/trust/editorial gates
- repair rows identified by the current gate
- rerun gates for the same batch
- freeze a baseline after PASS gates
- generate reports, manifests, SHA manifests, and next-goal prompts

Autonomous repair must be scoped to failing rows and the current batch. It must not modify frozen baselines in place.

Default repair-loop limit is `2` for operator mode unless a user explicitly sets another value. After the limit is reached, the operator stops with a repair prompt.
