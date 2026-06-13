# China Recruitment Evidence Rules

China salary evidence is recruitment-market reference only.

Allowed source paths:

- Exact Chinese title.
- Cleaned Chinese title.
- English title used in China recruiting pages.
- Close adjacent cluster with explicit boundary.
- Low-confidence adjacent only when exact/close evidence is unavailable and the boundary is explicit.

Each included evidence item must have:

- A source-specific URL: occupation page, query page, job posting, or report page.
- Concrete `raw_salary_text` with salary range, average, sample count, distribution, experience salary, job posting salary, or report number.
- Numeric observed values traceable to raw or visible distribution text.
- `sample_count_visible` only when the source page visibly shows the sample count.

Forbidden:

- Calling recruitment samples official Chinese occupational wages.
- Stating China official single-occupation median salary.
- Filling sample counts from model inference.
- Generic raw text such as "not captured", "market signal", or "salary varies by region".

When no usable CN path exists, stop at evidence repair. Do not continue to estimates or assets.
