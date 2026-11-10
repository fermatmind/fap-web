import Intro, { generateMetadata as introMetadata } from "@/app/(localized)/[locale]/tests/explore/[slug]/page";
import Take, { generateMetadata as takeMetadata } from "@/app/(localized)/[locale]/tests/explore/[slug]/take/page";
import { createEntertainmentAdPage } from "@/lib/entertainment/adPage";

const ad = createEntertainmentAdPage({
  intro: { render: Intro, metadata: introMetadata },
  take: { render: Take, metadata: takeMetadata },
});

export const generateMetadata = ad.generateMetadata;
export default ad.Page;
