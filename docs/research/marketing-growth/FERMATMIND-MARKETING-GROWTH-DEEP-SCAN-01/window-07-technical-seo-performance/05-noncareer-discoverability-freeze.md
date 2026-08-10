# Non-Career discoverability freeze

Captured at: 2026-08-10T04:50:00.000Z (Asia/Shanghai)

## Exact freeze

| Measure | Verified value |
| --- | --- |
| Whole live/backend sitemap locale-pages | 553 |
| Explicit Career exclusions | 28 |
| Non-Career locale-pages | 525 |
| Unique normalized identities | 306 |
| Locale counts | {"en":228,"neutral":1,"zh":296} |
| Surface counts | {"articles":113,"assessment_landing":12,"content_help_company":18,"homepage":2,"other_public_noncareer":17,"personality":357,"tests_hubs_categories":6} |
| Current llms non-Career members | 446 |
| Current llms-full non-Career members | 373 (artifact Mode: degraded) |
| Absolute URL-set SHA-256 | 2804a0f64a358ba27bd5e417989f573d5d684d0b601893dcea93d87675dae8ad |
| Normalized path-set SHA-256 | cb221673447dc66a197e77a8042ab9048af78a9dff50fcc5ee1185dda215aa79 |
| Identity-set SHA-256 | b1a79072fda69eaf73572f637fb7b50e399b61b5d5b7ed5016d77e52e7e8e679 |
| Backend source SHA-256 | f4871b7fb7f7e23a36fc1aae69ecba2107792e829d1f0ca362647f8be0c8e5de |

The full exact URL and identity arrays are stored in `noncareer_discoverability_manifest.json`; all 525 per-URL authority, locale, surface, eligibility, membership, HTTP, cache and canonical observations are in `noncareer_discoverability_cohort.csv`.

## Authority convergence

Live XML and backend sitemap-source contain the same normalized set. Their only raw textual difference is the homepage trailing slash. The backend authority payload is `backend_sitemap_generator` and the captured runtime revision is `38b5625dd917dceb6eeb3843259e7f7731cb66ce`.

## Mismatches

The four sitemap-included EN/ZH IQ and EQ assessment landing URLs return 200 but lack SSR canonical and `og:url`. The other 521 scanned URLs expose self canonical. This is a metadata projection defect, not an HTTP availability defect.

## Exclusions and update rule

Exactly 28 current `/en|zh/career...` URLs are excluded. Career growth or restoration cannot compensate for disappearance of a non-Career locale/surface.

The observed 553 whole-site count is descriptive only. Future releases compare exact sets, locale/surface cohorts and an explicit versioned authority/publication-change identity. Legitimate publication changes may update the freeze; silent shrink may not.
