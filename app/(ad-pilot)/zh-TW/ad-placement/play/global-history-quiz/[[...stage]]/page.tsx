import Intro, { generateMetadata as introMetadata } from "@/app/(traditional)/zh-TW/tests/play/global-history-quiz/page";
import Take, { generateMetadata as takeMetadata } from "@/app/(traditional)/zh-TW/tests/play/global-history-quiz/take/page";
import Result, { generateMetadata as resultMetadata } from "@/app/(traditional)/zh-TW/tests/play/global-history-quiz/results/[portrait]/page";
import { createEntertainmentAdPage } from "@/lib/entertainment/adPage";

const ad = createEntertainmentAdPage({
  locale: "zh-TW",
  slug: "global-history-quiz",
  intro: { render: Intro, metadata: introMetadata },
  take: { render: Take, metadata: takeMetadata },
  result: { render: Result, metadata: resultMetadata },
});

export const generateMetadata = ad.generateMetadata;
export default ad.Page;
