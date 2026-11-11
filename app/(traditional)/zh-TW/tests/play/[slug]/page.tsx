import { traditionalDirectionalRoute } from "@/lib/i18n/traditionalDirectionalPaths";
import type { Metadata } from "next";
import Link from "next/link";
import { BeachcomberPage } from "@/components/entertainment/BeachcomberPage";
import { BirdwatchingPage } from "@/components/entertainment/BirdwatchingPage";
import { CloudDriftPage } from "@/components/entertainment/CloudDriftPage";
import { HarborLightPage } from "@/components/entertainment/HarborLightPage";
import { GroupChatRolePage } from "@/components/entertainment/GroupChatRolePage";
import { GiftNotePage } from "@/components/entertainment/GiftNotePage";
import { GardenSeasonPage } from "@/components/entertainment/GardenSeasonPage";
import { GameNightResetPage } from "@/components/entertainment/GameNightResetPage";
import { FriendshipInvitationPage } from "@/components/entertainment/FriendshipInvitationPage";
import { ForestSoundtrackPage } from "@/components/entertainment/ForestSoundtrackPage";
import { FestivalMaskPage } from "@/components/entertainment/FestivalMaskPage";
import { FloatingHousePage } from "@/components/entertainment/FloatingHousePage";
import { FireflyEveningPage } from "@/components/entertainment/FireflyEveningPage";
import { FictionalCafePage } from "@/components/entertainment/FictionalCafePage";
import { FestivalCompanionPage } from "@/components/entertainment/FestivalCompanionPage";
import { FantasyPartyRolePage } from "@/components/entertainment/FantasyPartyRolePage";
import { EscapeRoomRolePage } from "@/components/entertainment/EscapeRoomRolePage";
import { EnchantedLibraryPage } from "@/components/entertainment/EnchantedLibraryPage";
import { DreamTrainPage } from "@/components/entertainment/DreamTrainPage";
import { DragonHousematePage } from "@/components/entertainment/DragonHousematePage";
import { DinnerHostPage } from "@/components/entertainment/DinnerHostPage";
import { DeskResetPage } from "@/components/entertainment/DeskResetPage";
import { DesertOasisPage } from "@/components/entertainment/DesertOasisPage";
import { DatePlanDetourPage } from "@/components/entertainment/DatePlanDetourPage";
import { CreativeSparkPage } from "@/components/entertainment/CreativeSparkPage";
import { CozyObjectPage } from "@/components/entertainment/CozyObjectPage";
import { ComplimentStylePage } from "@/components/entertainment/ComplimentStylePage";
import { CommunityFairPage } from "@/components/entertainment/CommunityFairPage";
import { ComfortOfferPage } from "@/components/entertainment/ComfortOfferPage";
import { CoffeeBreakPage } from "@/components/entertainment/CoffeeBreakPage";
import { CityWandererPage } from "@/components/entertainment/CityWandererPage";
import { ChoosingTogetherPage } from "@/components/entertainment/ChoosingTogetherPage";
import { CelebrationPlannerPage } from "@/components/entertainment/CelebrationPlannerPage";
import { CelebratingFriendPage } from "@/components/entertainment/CelebratingFriendPage";
import { CampfireStorytellerPage } from "@/components/entertainment/CampfireStorytellerPage";
import { CameraRollPage } from "@/components/entertainment/CameraRollPage";
import { BrowserTabsPage } from "@/components/entertainment/BrowserTabsPage";
import { BorrowedBookPage } from "@/components/entertainment/BorrowedBookPage";
import { BoardGameTablePage } from "@/components/entertainment/BoardGameTablePage";
import { StoryEditorialPage } from "@/components/entertainment/StoryEditorialPage";
import { contentImagePath, quizPath } from "@/lib/entertainment/guides";
import { requireTraditionalLegacyStory, requireTraditionalStoryQuiz } from "@/lib/i18n/zh-TW/legacyStoryReader";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

type Props = { params: Promise<{ slug: string }> };
const bespokePages = {
  beachcomber: BeachcomberPage,
  "birdwatching-companion": BirdwatchingPage,
  "cloud-drift": CloudDriftPage,
  "harbor-light": HarborLightPage,
  "group-chat-role": GroupChatRolePage,
  "gift-note": GiftNotePage,
  "garden-season": GardenSeasonPage,
  "game-night-reset": GameNightResetPage,
  "friendship-invitation": FriendshipInvitationPage,
  "forest-soundtrack": ForestSoundtrackPage,
  "festival-mask": FestivalMaskPage,
  "floating-house": FloatingHousePage,
  "firefly-evening": FireflyEveningPage,
  "fictional-cafe": FictionalCafePage,
  "festival-companion": FestivalCompanionPage,
  "fantasy-party-role": FantasyPartyRolePage,
  "escape-room-role": EscapeRoomRolePage,
  "enchanted-library": EnchantedLibraryPage,
  "dream-train": DreamTrainPage,
  "dragon-housemate": DragonHousematePage,
  "dinner-host": DinnerHostPage,
  "desk-reset": DeskResetPage,
  "desert-oasis": DesertOasisPage,
  "date-plan-detour": DatePlanDetourPage,
  "creative-spark": CreativeSparkPage,
  "cozy-object": CozyObjectPage,
  "compliment-style": ComplimentStylePage,
  "community-fair": CommunityFairPage,
  "comfort-offer": ComfortOfferPage,
  "coffee-break": CoffeeBreakPage,
  "city-wanderer": CityWandererPage,
  "choosing-together": ChoosingTogetherPage,
  "celebration-planner": CelebrationPlannerPage,
  "celebrating-a-friend": CelebratingFriendPage,
  "campfire-storyteller": CampfireStorytellerPage,
  "camera-roll": CameraRollPage,
  "browser-tabs": BrowserTabsPage,
  "borrowed-book": BorrowedBookPage,
  "board-game-table": BoardGameTablePage,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const directional = traditionalDirectionalRoute(`/tests/play/${(await params).slug}`);
  if (directional) {
    const { traditionalLikertMetadata } = await import("@/components/i18n/zh-TW/LikertQuestionnairePage");
    return traditionalLikertMetadata(directional);
  }
  const quiz = await requireTraditionalStoryQuiz((await params).slug);
  const url = quizPath("zh-TW", quiz.slug);
  const { title, description } = quiz.seo;
  return {
    title: title.zh,
    description: description.zh,
    alternates: { canonical: url },
    robots: { index: false, follow: true },
    openGraph: { title: title.zh, description: description.zh, locale: "zh_TW", url, images: [contentImagePath(quiz, "zh-TW")] },
  };
}

export default async function TraditionalStoryPage({ params }: Props) {
  const directional = traditionalDirectionalRoute(`/tests/play/${(await params).slug}`);
  if (directional) {
    const { LikertQuestionnairePage } = await import("@/components/i18n/zh-TW/LikertQuestionnairePage");
    return <LikertQuestionnairePage {...directional} />;
  }
  const { slug } = await params;
  const quiz = await requireTraditionalStoryQuiz(slug);
  const BespokePage = Object.hasOwn(bespokePages, slug) ? bespokePages[slug as keyof typeof bespokePages] : null;
  const shared = BespokePage ? null : await requireTraditionalLegacyStory(slug);
  const displayText = shared ? await loadTraditionalAssessmentText() : undefined;
  return <>
    <nav aria-label="測驗語言" className="flex flex-wrap gap-4 py-2 text-sm">
      <Link href="/zh-TW/tests/play" className="min-h-11 py-2 underline">故事測驗總覽</Link>
      <Link href={quizPath("zh", quiz.slug)} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href={quizPath("en", quiz.slug)} lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    {BespokePage ? <BespokePage quiz={quiz} locale="zh" displayLocale="zh-TW" /> :
      <StoryEditorialPage quiz={quiz} editorial={shared?.editorial} locale="zh" displayLocale="zh-TW" displayText={displayText} />}
  </>;
}
