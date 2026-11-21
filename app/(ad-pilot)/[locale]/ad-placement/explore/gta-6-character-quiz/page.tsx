import Intro, { generateMetadata as introMetadata } from "@/app/(localized)/[locale]/tests/explore/gta-6-character-quiz/page";
import { createEntertainmentAdPage } from "@/lib/entertainment/adPage";

const ad = createEntertainmentAdPage({
  slug: "gta-6-character-quiz",
  intro: { render: Intro, metadata: introMetadata },
});

export const generateMetadata = ad.generateMetadata;
export default ad.Page;
