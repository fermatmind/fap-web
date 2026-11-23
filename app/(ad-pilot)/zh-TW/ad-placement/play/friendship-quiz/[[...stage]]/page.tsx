import Intro, { generateMetadata as introMetadata } from "@/app/(traditional)/zh-TW/tests/play/friendship-quiz/page";
import { createEntertainmentAdPage } from "@/lib/entertainment/adPage";

const ad = createEntertainmentAdPage({
  locale: "zh-TW",
  slug: "friendship-quiz",
  intro: { render: Intro, metadata: introMetadata },
});

export const generateMetadata = ad.generateMetadata;
export default ad.Page;
