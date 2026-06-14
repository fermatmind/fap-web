# Trust Audit Rules

Trust audit runs after evidence audit and before estimate generation.

The purpose is to block evidence ledgers that are structurally valid but not publishable as long-term salary content assets.

Blocking patterns:

- Generated China salary text, including templated phrases such as `本轮仅记录招聘市场观察边界`, `相关岗位常见月薪区间约`, or `观察区间约￥`.
- China numeric salary ranges that are not backed by concrete visible source text, a visible sample count, a distribution line, a job posting salary line, or a report number.
- JobUI or other recruitment search URLs used as if they were verified salary evidence without captured visible snippets.
- O*NET wage fallback text that is generated from model or proxy logic rather than source-captured wage text.
- O*NET search URLs (`/find/quick`) used as wage evidence.
- Seed SOC null plus reviewed override without a concrete SOC/profile URL and explanation.
- Generic UK adjacent profiles used as broad placeholders, such as `administrator`, `office-manager`, `customer-service-assistant`, or `maintenance-fitter`.

Repair-required patterns:

- Single-source China evidence for a high-traffic or broad occupation.
- China ranges without visible sample count, unless a specific posting or report number is captured.
- O*NET as the only US wage source when BLS OEWS, BLS OOH, CareerOneStop, or My Next Move should be checked first.
- Non-generic UK adjacent profile where direct UK National Careers profile was not documented as unavailable.

PASS requires:

- No blocked rows.
- No repair-required rows.
- Control rows are unchanged from the trusted baseline when a control baseline is supplied.
- New rows have source-captured evidence text rather than generated boundary text.

If trust audit is not PASS, stop the pipeline. Do not compute estimates, generate assets, promote, freeze, import, or publish.
