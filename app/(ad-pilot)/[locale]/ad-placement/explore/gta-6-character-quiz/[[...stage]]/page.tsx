import Result, { generateMetadata as resultMetadata } from "@/app/(localized)/[locale]/tests/explore/gta-6-character-quiz/results/[profile]/page";
import Take, { generateMetadata as takeMetadata } from "@/app/(localized)/[locale]/tests/explore/gta-6-character-quiz/take/page";
import Intro, { generateMetadata as introMetadata } from "@/app/(localized)/[locale]/tests/explore/gta-6-character-quiz/page";
import { createEntertainmentAdPage } from "@/lib/entertainment/adPage";

const ad = createEntertainmentAdPage({
  slug: "gta-6-character-quiz",
  take: { render: Take, metadata: takeMetadata },
  result: { render: Result, metadata: resultMetadata },
  intro: { render: Intro, metadata: introMetadata },
});

export const generateMetadata = ad.generateMetadata;
export default ad.Page;
