# Homepage SEO Constraints

## Principle
Everything added for SEO must also be useful to users, visible in the normal experience, and truthfully represent the page.

## Allowed SEO Patterns
- SSR-rendered headline and section copy
- semantic heading structure
- visible internal links to real destination pages
- JSON-LD that reflects visible page content
- concise supporting copy for test families, trust, resources, and footer navigation
- accordion/disclosure content that users can expand in the interface

## Forbidden SEO Patterns
- hidden text or hidden links
- crawler-only DOM
- mobile-only content removal of core homepage sections
- keyword stuffing in headings, footers, or chips
- misleading structured data
- fake review, rating, partner, or media entities
- accordion content used as an SEO text warehouse without clear user value

## Mega Menu Rules
- Menu content must reflect real information scent and route availability.
- Group links by user task or content family.
- Keep headings and descriptions visible to users, not only in markup.
- Keyboard users must be able to open, move through, and close the menu.
- Mobile menu content must preserve the same core discoverability as desktop.

## Footer Rules
- Footer links must map to real, maintained routes.
- Anchor text must read like navigation, not search bait.
- Do not repeat the same destination under multiple near-duplicate keyword labels.
- Keep the number of links high enough to be useful, but low enough to remain curated.

## Accordion / Disclosure Rules
- Summary labels must stand on their own.
- Expanded content must be visible, selectable, and accessible to keyboard and assistive tech.
- Do not inject long repetitive paragraphs that are not valuable to users.
- Collapsed state must not hide critical legal meaning; legal semantics still live on source policy pages.

## Structured Data Rules
- Only annotate visible homepage entities.
- Safe candidates:
  - `WebPage`
  - `BreadcrumbList`
  - `ItemList` for visible quick-start or family lists
  - `Organization` only if claims are grounded in visible copy
- Do not use `Review`, `AggregateRating`, `FAQPage`, or `Product` unless the homepage visibly contains those exact entities.
- Structured data titles, descriptions, and URLs must match the rendered page.

## Mobile Content Equivalence Rules
- Desktop and mobile must present the same primary narrative:
  - hero value proposition
  - quick start
  - test families
  - results help
  - trust
  - resources
  - footer navigation
- Layout may change; meaning and major content cannot disappear.

## Internal Linking Rules
- Prioritize links that help users take the next real step.
- Link from homepage to tests, categories, articles, topics, career pages, help pages, and policies only when those routes already exist.
- Avoid duplicative links that differ only by wording.
- Keep internal links distributed across sections instead of clustering all SEO weight into the footer.

## Indexing Risk Checklist
Before shipping, verify:
- no hidden or visually clipped SEO text blocks
- no mismatch between visible content and JSON-LD
- no content missing on mobile that exists on desktop
- no footer keyword farm patterns
- no duplicated heading spam
- no noindex/canonical regressions
- no route or metadata breakage introduced by homepage changes
