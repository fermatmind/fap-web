import Result, { generateMetadata as resultMetadata } from "@/app/(traditional)/zh-TW/tests/explore/gta-6-character-quiz/results/[profile]/page";
import Take, { metadata as takeMetadata } from "@/app/(traditional)/zh-TW/tests/explore/gta-6-character-quiz/take/page";
import Intro, { generateMetadata as introMetadata } from "@/app/(traditional)/zh-TW/tests/explore/gta-6-character-quiz/page";
import { createEntertainmentAdPage } from "@/lib/entertainment/adPage";

const ad = createEntertainmentAdPage({
  locale: "zh-TW",
  slug: "gta-6-character-quiz",
  take: { render: Take, metadata: async () => takeMetadata },
  result: { render: Result, metadata: resultMetadata },
  intro: { render: Intro, metadata: introMetadata },
});

export const generateMetadata = ad.generateMetadata;
export default ad.Page;
