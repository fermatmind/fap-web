# GSC US, UK, Global and Device Split

## Available evidence

The closure snapshot for 2026-07-10/2026-08-06 reports global 213 clicks, 30.3k impressions, 0.70% CTR, and position 10.8. US contributes 24 clicks and 9,711 impressions at 0.25% CTR and position 12.05. Mobile reports 107/9,296, desktop 101/20,701, and tablet 5/328.

The later 2026-07-13/2026-08-09 workspace baseline records 226 clicks and 30,400 impressions globally; these are different capture windows and must not be merged row-by-row.

## Missing split

UK and OTHER are **UNKNOWN**, not zero. The retained files do not allow country to be crossed with canonical `/en/` pages, query, and device. Therefore US share is an all-site signal, not an English-user or English-page share.

## Operational decision

Use the current data only to prioritize exact export recovery and narrow page-level experiments. Do not make a regional route decision. The mutual-exclusion contract is encoded in `en_market_segment_spec.json`, and auditable rows are in `en_gsc_country_device.csv`.
