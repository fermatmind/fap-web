import Intro, { generateMetadata as introMetadata } from "@/app/(traditional)/zh-TW/tests/explore/gta-6-character-quiz/page";
import { createEntertainmentAdPage } from "@/lib/entertainment/adPage";

const ad = createEntertainmentAdPage({
  locale: "zh-TW",
  slug: "gta-6-character-quiz",
  intro: { render: Intro, metadata: introMetadata },
});

export const generateMetadata = ad.generateMetadata;
export default ad.Page;
