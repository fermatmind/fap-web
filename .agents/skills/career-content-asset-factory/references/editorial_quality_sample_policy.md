# Editorial Quality Sample Policy

Editorial quality can be sampled before running the full 1046-row audit. Sampling is for quality discovery only; it cannot prove full readiness.

## Minimum Sample

The sample must include at least 50 slugs and both `zh-CN` and `en` locales.

## Required Coverage

Select from:

- first 10 canonical seed slugs
- dirty or machine-like title cases
- missing or override authority cases
- medical and clinical roles
- military, command, aviation, and transportation safety roles
- skilled trades, operators, and service roles
- professional and managerial roles
- education and counseling roles
- creative and performance roles
- final-batch examples near seed ordinal 1001-1046
- fit/personality boundary risk cases
- adjacent-comparison transfer-risk cases

## Sampling Rules

- Preserve seed order when possible.
- Do not exclude rows because they are likely to fail.
- Do not modify baselines during sampling.
- A sample audit may produce findings; that means content repair should be planned later, not that the tooling PR failed.
