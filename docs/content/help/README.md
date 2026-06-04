# FermatMind Help Content Packages — 2026-06-04

This folder contains six **draft-input-only** Help / FAQ content asset packages.

These are not publishable page copy. They are structured factual inputs for GPT-5.5 Pro and CMS/backend implementation.

## Included Packages

1. `01_UNLOCK-FAILURE-HELP-CARD-01.md`
2. `02_PAYMENT-REFUND-FAQ-PACKAGE-01.md`
3. `03_RESULT-RECOVERY-FAQ-01.md`
4. `04_PRIVACY-FAQ-PACKAGE-01.md`
5. `05_NONDIAGNOSTIC-HELP-COPY-01.md`
6. `06_DATA-DELETION-REQUEST-FAQ-01.md`

Each package also includes a `.yaml` machine-readable companion.

## Operator Policy Captured

- Refund allowed within 7 days when user cannot obtain the complete purchased report.
- Unlock failure handled within 24 hours.
- Support channel: email.
- Result retention: two years.
- Result recovery: email.
- Data deletion and account deletion requests are allowed.
- Chinese and English policy: same.
- Public Help pages should not request raw `orderNo`.
- Public examples must not include private result/order/payment/history URLs.

## Next Steps

1. Let `HELP-CONTENT-INVENTORY-01` finish and merge.
2. Use these packages as the policy input for GPT-5.5 Pro draft generation.
3. Run Operator legal/service review.
4. Add CMS-backed draft pages only after `HELP-CMS-AUTHORITY-01` confirms fields.
5. Add FAQPage schema only after visible FAQ content is approved and exactly matches CMS content.
