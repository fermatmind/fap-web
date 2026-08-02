# V2 Exact Package Promotion

Use this path only for a registered, audit-compatible exact backend-authority package named by an end-to-end `/goal`.

1. Complete independent QA, including claim, source, locale, PII, SHA, and idempotency gates.
2. Invoke `operator_guard.py --action dispatch_exact_package_promotion`.
3. Let the trusted fap-api workflow perform dry-run import, draft import, readback, publication, and live QA in order.
4. Record the receipt prefix without replacing a verified later state with an older one.

`requires_human_approval` remains a legacy-compatible output/schema field. For this V2 path it is always `false`; failures must name the machine gate or independently controlled action that blocked progress.

The dispatch action is not a CMS import, production import, schema/runtime mutation, SEO mutation, deploy, migration, secret/permission change, irreversible delete, sitemap/LLMS action, or Search Channel submission. Those direct actions remain fail-closed.
