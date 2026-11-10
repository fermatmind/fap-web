import FriendshipDesignLayout from "@/app/(localized)/[locale]/tests/play/friendship-quiz/layout";
import Intro, { generateMetadata as introMetadata } from "@/app/(localized)/[locale]/tests/play/friendship-quiz/page";
import Take, { generateMetadata as takeMetadata } from "@/app/(localized)/[locale]/tests/play/friendship-quiz/take/page";
import { createEntertainmentAdPage } from "@/lib/entertainment/adPage";

const ad = createEntertainmentAdPage({
  slug: "friendship-quiz",
  intro: { render: async props => <FriendshipDesignLayout>{await Intro(props)}</FriendshipDesignLayout>, metadata: introMetadata },
  take: { render: async props => <FriendshipDesignLayout>{await Take(props)}</FriendshipDesignLayout>, metadata: takeMetadata },
});

export const generateMetadata = ad.generateMetadata;
export default ad.Page;
