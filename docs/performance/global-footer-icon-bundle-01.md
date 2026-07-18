# GLOBAL-FOOTER-ICON-BUNDLE-01 build evidence

Date: 2026-07-18 UTC

## Method

- Built the unmodified dependency baseline and the PR candidate with Next.js 16.1.2 using `NEXT_PUBLIC_SITE_URL=https://fermatmind.com NEXT_PUBLIC_API_URL=https://api.fermatmind.com pnpm build`.
- Identified the footer/simple-icons client chunk by the footer export guard and icon symbols, then confirmed its presence in localized page client-reference manifests, including `/[locale]` and `/[locale]/career/jobs`.
- Measured raw bytes with `wc -c` and compressed bytes with `gzip -9 -c | wc -c`.
- Compared builds from the same `origin/main` base; no dependency, footer item, link, label, QR, tracking, or interaction change was included.

## Result

| Measurement | Namespace baseline | Explicit-import candidate | Change |
| --- | ---: | ---: | ---: |
| Associated client chunk | `a14bb80685f4c3bc.js` | `d4979d6f3f5bb1db.js` | — |
| Raw bytes | 5,247,799 | 39,453 | -5,208,346 (-99.25%) |
| Gzip-9 bytes | 2,140,750 | 14,419 | -2,126,331 (-99.33%) |
| SHA-256 | `1082feb98a35a53d0cbf0b42e7f72b96ecbee2cc2bd53c0f6429215045e15970` | `c8350ecdac48e08fcbb998a2efdd77cb45c384522f1faa34bfb26429cd6985eb` | — |

The baseline chunk contained the runtime `Missing simple-icons export` guard and the full package namespace. The candidate chunk contains the 10 explicitly imported icons used by the 11 footer items; Douyin and TikTok intentionally share `siTiktok`.

After the candidate build:

- no static client chunk contains the namespace export guard or control symbols from unrelated package-tail icons such as `Zigbee2MQTT`/`siZulip`;
- no static JavaScript chunk exceeds 1 MB raw (the largest is 387,125 bytes);
- localized client-reference manifests still reference the small footer chunk, so the footer remains available while the full simple-icons namespace no longer enters the global localized shell.

The production build completed all 206/206 static pages. This evidence is build-only and did not trigger a deploy or any production write.
