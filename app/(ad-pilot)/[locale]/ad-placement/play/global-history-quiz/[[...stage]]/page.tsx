import Result, { generateMetadata as resultMetadata } from "@/app/(localized)/[locale]/tests/play/global-history-quiz/results/[portrait]/page";
import Intro, { generateMetadata as introMetadata } from "@/app/(localized)/[locale]/tests/play/global-history-quiz/page";
import Take, { generateMetadata as takeMetadata } from "@/app/(localized)/[locale]/tests/play/global-history-quiz/take/page";
import { createEntertainmentAdPage } from "@/lib/entertainment/adPage";

const ad = createEntertainmentAdPage({
  slug: "global-history-quiz",
  result: { render: Result, metadata: resultMetadata },
  intro: { render: Intro, metadata: introMetadata },
  take: { render: Take, metadata: takeMetadata },
});

export const generateMetadata = ad.generateMetadata;
export default ad.Page;
