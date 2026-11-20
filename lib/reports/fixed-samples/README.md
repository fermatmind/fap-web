# Fixed report examples

Each family uses one fixed synthetic result for every visitor. IQ 30 and IQ 40 retain separate examples because the forms measure different item sets. Samples never read a visitor's answers or create a payment order.

The report JSON was generated locally through the existing assessment, scoring, report snapshot and test-payment paths in `fap-api`, using synthetic answers. EQ and Enneagram used locally published and activated copies of the existing canonical packages. No production answers, orders or entitlements were copied or changed. Purchase offers and top-level ownership fields are excluded.

MBTI uses ISFJ-T in both languages. Its simplified content snapshot came from the published public desktop-clone API. The English content is the existing ISFJ-T entry in `content_baselines/personality_clone/mbti_desktop_clone.en.json`; the public English desktop-clone endpoint returned 404 at preparation time. It is an existing repository candidate, not a verified copy of the currently authorized production English report. No report prose was newly authored. Traditional display uses the existing display conversion path.

All pages use the native full result components. These files are frozen display examples, not an editable authority for private result content or scoring. Future content refreshes should regenerate the examples from the authorized backend sources rather than editing report prose here.

The simplified Chinese Jung archetype example uses the fixed Sage score vector selected for the redesigned report. Its score fields and leader tiers are kept consistent across the snapshot. Report prose comes from the same current archetype assets as the real Chinese report; it is not authored in this frozen sample. The sample route does not expose the retired cognitive-functions assessment.
