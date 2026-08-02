# Goal Production Import

Goal: Dispatch V2 exact-package promotion for an independently QA-passed block.

Use only `dispatch_exact_package_promotion`; do not call direct `cms_import` or `production_import`. The trusted backend workflow runs dry-run import, import/readback, publish, and live QA. Report remaining machine gates and actual blockers. The exact SHA is integrity, idempotency, audit, and rollback evidence, not a human-approval phrase. Do not modify SEO runtime unless separately controlled.
