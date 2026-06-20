# Operator State Transition Table

| Current state | Gate verdict | Next autonomous action | Stop condition |
| --- | --- | --- | --- |
| frozen baseline exists, no next manifest | PASS | create next manifest | if manifest creation would modify schema |
| manifest ready, no evidence | PASS | generate evidence | if required source access is blocked |
| evidence gate | PASS | generate synthesis | if trust gate missing |
| evidence gate | REPAIR_REQUIRED | repair failed evidence rows only | after max repair loops |
| evidence gate | REJECT/BLOCKED | stop | always |
| synthesis validation | PASS | generate reader asset | if asset schema changed |
| synthesis validation | REPAIR_REQUIRED | repair synthesis rows only | after max repair loops |
| asset gate | PASS | freeze baseline | if freeze inputs incomplete |
| asset gate | REPAIR_REQUIRED | repair reader-facing asset rows only | after max repair loops |
| final independent QA | PASS | staging preview design | human approval required before staging |
| staging/import/production | any | stop | human approval required |

Autonomous continuation is limited to the content-production lane. Any runtime, SEO, CMS, staging, approved, or production transition becomes `HUMAN_APPROVAL_REQUIRED`.
