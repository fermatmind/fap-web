# Operator State Transition Table

| Current state | Gate verdict | Next autonomous action | Stop condition |
| --- | --- | --- | --- |
| frozen baseline exists, no next manifest | PASS | create next manifest | if manifest creation would modify schema |
| manifest ready, no evidence | PASS | generate evidence | if required source access is blocked |
| evidence gate | PASS | generate synthesis | if trust gate missing |
| evidence gate | REPAIR_REQUIRED | repair failed evidence rows only | after max repair loops |
| evidence gate | REJECT/BLOCKED | record machine-gate failure and repair scope | always |
| synthesis validation | PASS | generate reader asset | if asset schema changed |
| synthesis validation | REPAIR_REQUIRED | repair synthesis rows only | after max repair loops |
| asset gate | PASS | freeze baseline | if freeze inputs incomplete |
| asset gate | REPAIR_REQUIRED | repair reader-facing asset rows only | after max repair loops |
| final independent QA | PASS | trusted backend promotion dispatch | registered V2 exact package only |
| direct staging/import/production | any | reject direct action and route eligible V2 package to trusted dispatch | direct action remains blocked |

Autonomous continuation is limited to the content-production lane plus trusted V2 promotion dispatch. Any direct runtime, SEO, CMS, staging, or production transition remains blocked with an explicit classification, never an approval-only state.
