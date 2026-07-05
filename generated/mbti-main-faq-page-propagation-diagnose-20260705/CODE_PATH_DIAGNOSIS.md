# Code Path Diagnosis

Target route:

`app/(localized)/[locale]/tests/[slug]/page.tsx`

## Production API Read Path

The test detail page fetches:

`/api/v0.3/scales/lookup?slug={slug}&locale={locale}`

The lookup response is mapped into `content_i18n_json`, then page rendering reads:

```ts
const langNode = toRecord(toRecord(lookup?.content_i18n_json)[locale]);
const faqItems = parseFaq(langNode.faq);
```

For zh MBTI, `locale` resolves to `zh`, matching the production API payload key `content_i18n_json.zh`.

## Visible FAQ And JSON-LD Parity

The same `mergedFaq` array drives both surfaces:

- visible FAQ: `<FAQAccordion items={mergedFaq} />`
- FAQPage JSON-LD: `buildFAQPageJsonLd(mergedFaq.map(...))`

Therefore a visible FAQ count / JSON-LD count mismatch is unlikely unless this shared rendering path changes.

## Fallback Behavior

The file contains local fallback FAQ builders for compatibility, but current runtime does not need them when `content_i18n_json.zh.faq` is present.

The cache-bust production request rendered the 8 API questions, proving the current runtime path can consume the API FAQ payload.

## CMS Landing Surface

The page also reads CMS landing surface metadata:

`test_detail_mbti_personality_test_16_personality_types`

Observed CMS landing surface payload keys did not include FAQ and `page_blocks` count was 0. This surface does not explain the old 4-entry FAQ.
