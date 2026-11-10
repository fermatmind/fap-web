import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { EntertainmentDisplayAd } from "@/components/entertainment/EntertainmentDisplayAd";
import { AD_PLACEMENT_HEADER } from "@/lib/entertainment/adPlacement";
import ExploreIntro, { generateMetadata as exploreIntroMetadata } from "@/app/(localized)/[locale]/tests/explore/[slug]/page";
import ExploreTake, { generateMetadata as exploreTakeMetadata } from "@/app/(localized)/[locale]/tests/explore/[slug]/take/page";
import StoryIntro, { generateMetadata as storyIntroMetadata } from "@/app/(localized)/[locale]/tests/play/[slug]/page";
import StoryTake, { generateMetadata as storyTakeMetadata } from "@/app/(localized)/[locale]/tests/play/[slug]/take/page";
import HistoryIntro, { generateMetadata as historyIntroMetadata } from "@/app/(localized)/[locale]/tests/play/global-history-quiz/page";
import HistoryTake, { generateMetadata as historyTakeMetadata } from "@/app/(localized)/[locale]/tests/play/global-history-quiz/take/page";
import FriendshipDesignLayout from "@/app/(localized)/[locale]/tests/play/friendship-quiz/layout";
import FriendshipIntro, { generateMetadata as friendshipIntroMetadata } from "@/app/(localized)/[locale]/tests/play/friendship-quiz/page";
import FriendshipTake, { generateMetadata as friendshipTakeMetadata } from "@/app/(localized)/[locale]/tests/play/friendship-quiz/take/page";
import TraditionalPage, { generateMetadata as traditionalMetadata } from "@/app/(traditional)/zh-TW/[...path]/page";

type Props = {
  params: Promise<{ locale: string; surface: string[] }>;
};

async function selectPage({ params }: Props) {
  const { locale, surface } = await params;
  const request = await headers();
  const mode = request.get(AD_PLACEMENT_HEADER);
  if (mode !== "enabled" && mode !== "preview") notFound();

  const [collection, slug, stage] = surface;
  const props = { params: Promise.resolve({ locale, slug }) };
  const take = stage === "take";
  const placement = { take, consentPreview: mode === "preview", nonce: request.get("x-nonce") };
  if (locale === "zh-TW") {
    const traditional = { params: Promise.resolve({ path: ["tests", ...surface] }) };
    return { locale, placement, render: () => TraditionalPage(traditional), metadata: () => traditionalMetadata(traditional) };
  }
  const [renderPage, buildMetadata] = collection === "explore"
    ? (take ? [ExploreTake, exploreTakeMetadata] as const : [ExploreIntro, exploreIntroMetadata] as const)
    : slug === "global-history-quiz"
      ? (take ? [HistoryTake, historyTakeMetadata] as const : [HistoryIntro, historyIntroMetadata] as const)
      : slug === "friendship-quiz"
        ? (take ? [FriendshipTake, friendshipTakeMetadata] as const : [FriendshipIntro, friendshipIntroMetadata] as const)
        : (take ? [StoryTake, storyTakeMetadata] as const : [StoryIntro, storyIntroMetadata] as const);
  return {
    locale,
    placement,
    render: async () => {
      const page = await renderPage(props);
      return slug === "friendship-quiz" ? <FriendshipDesignLayout>{page}</FriendshipDesignLayout> : page;
    },
    metadata: () => buildMetadata(props),
  };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  return (await selectPage(props)).metadata();
}

export default async function Page(props: Props) {
  const { locale, placement, render } = await selectPage(props);
  const { nonce } = placement;
  const content = await render();
  if (!nonce) return content;
  return (
    <EntertainmentDisplayAd
      label={locale === "en" ? "Advertisements" : locale === "zh-TW" ? "廣告" : "广告"}
      nonce={nonce}
      take={placement.take}
      consentPreview={placement.consentPreview}
    >
      {content}
    </EntertainmentDisplayAd>
  );
}
