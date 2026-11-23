import Intro, { generateMetadata as introMetadata } from "@/app/(traditional)/zh-TW/tests/play/[slug]/page";
import Changan, { generateMetadata as changanMetadata } from "@/app/(traditional)/zh-TW/tests/play/changan-history-quiz/page";
import Take, { generateMetadata as takeMetadata } from "@/app/(traditional)/zh-TW/tests/play/[slug]/take/page";
import Result, { generateMetadata as resultMetadata } from "@/app/(traditional)/zh-TW/tests/play/[slug]/results/[portrait]/page";
import { createEntertainmentAdPage } from "@/lib/entertainment/adPage";

const ad = createEntertainmentAdPage({
  locale: "zh-TW",
  intro: {
    render: async props => (await props.params).slug === "changan-history-quiz" ? Changan() : Intro(props),
    metadata: async props => (await props.params).slug === "changan-history-quiz" ? changanMetadata() : introMetadata(props),
  },
  take: { render: Take, metadata: takeMetadata },
  result: { render: Result, metadata: resultMetadata },
});

export const generateMetadata = ad.generateMetadata;
export default ad.Page;
