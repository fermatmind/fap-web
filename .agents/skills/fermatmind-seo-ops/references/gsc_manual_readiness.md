# GSC Manual Readiness

Use for Google Search Console inspection readiness and, when explicitly
preauthorized, manual Request Indexing for exact target canonical URLs.

## Rules

- Inspect only.
- GSC Live Test / URL Inspection is inspection evidence.
- Request Indexing is an external action.
- A successful Live Test does not authorize Request Indexing.
- Do not click Request Indexing unless a separate exact authorization names the URL or the current full-chain Authorization Profile lists the exact target canonical URL.
- GSC Request Indexing is not part of Search Channel bounded executors and must not be mixed with IndexNow or Baidu.
- Stored crawl reports may be stale; report live test state and stored crawl state separately.
- Record status, warnings, and screenshots when available.
- Do not make API calls unless explicitly authorized.
- Stop on CAPTCHA, login failure, missing property access, or ambiguous account context.

## Evidence

Record URL, property/account context, live test timestamp/result, stored crawl/index status, stale crawl warnings, indexing status if visible, whether indexing was already requested, page availability warnings, screenshot identifiers, and whether Request Indexing was untouched or separately authorized.
