import { StoryEditorialPage } from "@/components/entertainment/StoryEditorialPage";
import { additionalStoryEditorials } from "@/components/entertainment/AdditionalStoryEditorials";
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
import { CloudDriftPage } from "@/components/entertainment/CloudDriftPage";
import { CityWandererPage } from "@/components/entertainment/CityWandererPage";
import { ChoosingTogetherPage } from "@/components/entertainment/ChoosingTogetherPage";
import { CelebrationPlannerPage } from "@/components/entertainment/CelebrationPlannerPage";
import { CelebratingFriendPage } from "@/components/entertainment/CelebratingFriendPage";
import { CampfireStorytellerPage } from "@/components/entertainment/CampfireStorytellerPage";
import { CameraRollPage } from "@/components/entertainment/CameraRollPage";
import { BrowserTabsPage } from "@/components/entertainment/BrowserTabsPage";
import { BorrowedBookPage } from "@/components/entertainment/BorrowedBookPage";
import { BoardGameTablePage } from "@/components/entertainment/BoardGameTablePage";
import { BirdwatchingPage } from "@/components/entertainment/BirdwatchingPage";
import { BeachcomberPage } from "@/components/entertainment/BeachcomberPage";
import { ExploreTestShell } from "@/components/tests/ExploreTestShell";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { StoryTakeEntry } from "@/components/entertainment/StoryTakeEntry";
import { JsonLd } from "@/components/seo/JsonLd";
import catalog from "@/lib/entertainment/catalog.json";
import { globalHistoryPath } from "@/lib/entertainment/global-history/config";
import { CHANGAN_SLUG, firstChoiceRule } from "@/lib/entertainment/changan";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/generateSchema";
import {
  contentImagePath,
  relatedFunQuizzes,
  resultPath,
} from "@/lib/entertainment/guides";

import nativeCatalog from "@/lib/questionnaires/catalog.json";

const isNative = (slug: string) =>
  nativeCatalog.some(
    (quiz) => quiz.slug === slug && quiz.collection === "play",
  );

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: input, slug } = await params;
  if (isNative(slug)) {
    const { generateMetadata: questionnaireMetadata } = await import("@/components/questionnaires/QuestionnairePage");
    return questionnaireMetadata({
      params: Promise.resolve({ locale: input, slug }),
    });
  }
  const locale = resolveLocale(input);
  const quiz = await loadFunQuiz(slug);
  if (!quiz)
    return {
      title: "Quiz unavailable",
      robots: { index: false, follow: false },
    };
  return buildPageMetadata({
    locale,
    pathname: `/${locale}/tests/play/${slug}`,
    title: quiz.seo.title[locale],
    description: quiz.seo.description[locale],
    imagePath: contentImagePath(quiz, locale),
    alternatesByLocale: {
      en: `/en/tests/play/${slug}`,
      zh: `/zh/tests/play/${slug}`,
      xDefault: `/en/tests/play/${slug}`,
    },
  });
}

async function FunQuizContent({ params }: Props) {
  const { locale: input, slug } = await params;
  if (isNative(slug)) {
    const { default: QuestionnairePage } = await import("@/components/questionnaires/QuestionnairePage");
    return QuestionnairePage({
      params: Promise.resolve({ locale: input, slug }),
    });
  }
  const locale = resolveLocale(input);
  const quiz = await loadFunQuiz(slug);
  if (!quiz) notFound();
  if (additionalStoryEditorials[slug]) return <StoryEditorialPage quiz={quiz} locale={locale} />;
  if (slug === "harbor-light") return <HarborLightPage quiz={quiz} locale={locale} />;
  if (slug === "group-chat-role") return <GroupChatRolePage quiz={quiz} locale={locale} />;
  if (slug === "gift-note") return <GiftNotePage quiz={quiz} locale={locale} />;
  if (slug === "garden-season") return <GardenSeasonPage quiz={quiz} locale={locale} />;
  if (slug === "game-night-reset") return <GameNightResetPage quiz={quiz} locale={locale} />;
  if (slug === "friendship-invitation") return <FriendshipInvitationPage quiz={quiz} locale={locale} />;
  if (slug === "forest-soundtrack") return <ForestSoundtrackPage quiz={quiz} locale={locale} />;
  if (slug === "festival-mask") return <FestivalMaskPage quiz={quiz} locale={locale} />;
  if (slug === "floating-house") return <FloatingHousePage quiz={quiz} locale={locale} />;
  if (slug === "firefly-evening") return <FireflyEveningPage quiz={quiz} locale={locale} />;
  if (slug === "fictional-cafe") return <FictionalCafePage quiz={quiz} locale={locale} />;
  if (slug === "festival-companion") return <FestivalCompanionPage quiz={quiz} locale={locale} />;
  if (slug === "fantasy-party-role") return <FantasyPartyRolePage quiz={quiz} locale={locale} />;
  if (slug === "escape-room-role") return <EscapeRoomRolePage quiz={quiz} locale={locale} />;
  if (slug === "enchanted-library") return <EnchantedLibraryPage quiz={quiz} locale={locale} />;
  if (slug === "dream-train") return <DreamTrainPage quiz={quiz} locale={locale} />;
  if (slug === "dragon-housemate") return <DragonHousematePage quiz={quiz} locale={locale} />;
  if (slug === "dinner-host") return <DinnerHostPage quiz={quiz} locale={locale} />;
  if (slug === "desk-reset") return <DeskResetPage quiz={quiz} locale={locale} />;
  if (slug === "desert-oasis") return <DesertOasisPage quiz={quiz} locale={locale} />;
  if (slug === "date-plan-detour") return <DatePlanDetourPage quiz={quiz} locale={locale} />;
  if (slug === "creative-spark") return <CreativeSparkPage quiz={quiz} locale={locale} />;
  if (slug === "cozy-object") return <CozyObjectPage quiz={quiz} locale={locale} />;
  if (slug === "compliment-style") return <ComplimentStylePage quiz={quiz} locale={locale} />;
  if (slug === "community-fair") return <CommunityFairPage quiz={quiz} locale={locale} />;
  if (slug === "comfort-offer") return <ComfortOfferPage quiz={quiz} locale={locale} />;
  if (slug === "coffee-break") return <CoffeeBreakPage quiz={quiz} locale={locale} />;
  if (slug === "cloud-drift") return <CloudDriftPage quiz={quiz} locale={locale} />;
  if (slug === "city-wanderer") return <CityWandererPage quiz={quiz} locale={locale} />;
  if (slug === "choosing-together") return <ChoosingTogetherPage quiz={quiz} locale={locale} />;
  if (slug === "celebration-planner") return <CelebrationPlannerPage quiz={quiz} locale={locale} />;
  if (slug === "celebrating-a-friend") return <CelebratingFriendPage quiz={quiz} locale={locale} />;
  if (slug === "campfire-storyteller") return <CampfireStorytellerPage quiz={quiz} locale={locale} />;
  if (slug === "camera-roll") return <CameraRollPage quiz={quiz} locale={locale} />;
  if (slug === "browser-tabs") return <BrowserTabsPage quiz={quiz} locale={locale} />;
  if (slug === "borrowed-book") return <BorrowedBookPage quiz={quiz} locale={locale} />;
  if (slug === "board-game-table") return <BoardGameTablePage quiz={quiz} locale={locale} />;
  if (slug === "birdwatching-companion") return <BirdwatchingPage quiz={quiz} locale={locale} />;
  if (slug === "beachcomber") return <BeachcomberPage quiz={quiz} locale={locale} />;
  const zh = locale === "zh";
  const changan = slug === CHANGAN_SLUG;
  const card = catalog.find((item) => item.slug === slug)!;
  const questionCount =
    card.minQuestionCount === card.questionCount
      ? `${card.questionCount}`
      : `${card.minQuestionCount}–${card.questionCount}`;
  const path = `/${locale}/tests/play/${slug}`;
  return (
    <main className="bg-slate-50 py-10 text-slate-950">
      <Container className="max-w-3xl">
        <JsonLd
          id={`fun-breadcrumb-${slug}`}
          data={buildBreadcrumbJsonLd([
            { name: "FermatMind", path: `/${locale}` },
            { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` },
            { name: quiz.title[locale], path },
          ])}
        />
        <JsonLd
          id={`fun-page-${slug}`}
          data={buildWebPageJsonLd({
            path,
            title: quiz.title[locale],
            description: quiz.seo.description[locale],
            locale,
          })}
        />
        <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm">
          <Link
            prefetch={false}
            className="underline"
            href={`/${locale}/tests#more-tests`}
          >
            {zh ? "全部测试 · 更多测试" : "All tests · More Tests"}
          </Link>
        </nav>
        <p className="text-sm font-semibold text-violet-800">
          {zh
            ? "原创 · 轻娱乐 · 完整结果免费"
            : "Original · Just for fun · Full results free"}
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight [overflow-wrap:anywhere]">
          {quiz.title[locale]}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">
          {quiz.seo.description[locale]}
        </p>
        <p className="mt-3 text-sm text-slate-600">
          {zh
            ? `${questionCount} 题 · 约 ${quiz.minutes} 分钟 · 无需注册或先做其他测试`
            : `${questionCount} questions · about ${quiz.minutes} minutes · no signup or prerequisite test`}
        </p>
        <StoryTakeEntry quiz={quiz} locale={locale} landingInstructions={changan ? quiz.introduction : undefined} />
        {changan && <Link prefetch={false} href={globalHistoryPath(locale)} className="text-sm font-semibold underline">
          {zh ? "想遇见更多人物？去玩全球卷" : "Want to meet more figures? Try the World Edition"}
        </Link>}
        <section
          className="my-8 space-y-4 leading-8"
          aria-labelledby="about-quiz"
        >
          <h2 id="about-quiz" className="text-2xl font-semibold">
            {zh ? "这次探索什么？" : "What does this quiz explore?"}
          </h2>
          {!changan && <p>{quiz.introduction[locale]}</p>}
          <p>{quiz.focus[locale]}</p>
        </section>
        <section
          className="my-8 space-y-4 leading-8"
          aria-labelledby="quiz-method"
        >
          <h2 id="quiz-method" className="text-2xl font-semibold">
            {zh ? "结果怎样产生？" : "How is your result decided?"}
          </h2>
          <p>
            {changan ? firstChoiceRule[locale] : quiz.mechanism === "tally"
              ? zh
                ? "每个选项给对应画像累计分数。最高分画像成为本次结果；同分时会完整展示所有并列画像，按事先设定的顺序排列，不随机抽取。这些分数只服务于本测试，不是心理量尺或人群排名。"
                : "Each option adds its declared points to a portrait. The highest total leads; ties show every leading portrait in the authored order. No result is drawn at random. Points belong only to this quiz, not a psychological scale or population ranking."
              : zh
                ? "每次选择沿明确的故事分支前进，最终抵达写好的结局。修改前面的选择会清除后续分支答案；相同选择路径得到相同结局，不随机抽取。"
                : "Each choice follows an explicit story branch to an authored ending. Changing an earlier choice clears later branch answers. The same path gives the same ending, without a random draw."}
          </p>
          <p>
            {changan ? (zh ? "作答在浏览器内计分。完成后会出现一位人物，可以下载 PNG 人物卡。图片只含公开的人物内容。" : "Your browser scores your choices. Finish to get one character and download a PNG card with public portrait content.") : zh
              ? "所有题目、完整画像、生活例子与小行动均免费。答案在浏览器内计算，不发送至服务器，也不写入网址。只有你主动勾选后，本标签页才临时保存进度；24小时后失效，题目版本变更后不再恢复；完成、退出清除或重测会删除。浏览器禁止存储时，仍可在当前页面完成。"
              : "Every question, full portrait, example, and small experiment is free. Answers are evaluated in your browser, never sent to a server or put in the URL. Tab-session saving is optional, expires after 24 hours, and is not reused after a quiz-version change. It clears on completion, exit-and-clear, or retake. You can still finish on this page if storage is unavailable."}
          </p>
        </section>
        <section className="my-8" aria-labelledby="possible-results">
          <h2 id="possible-results" className="mb-4 text-2xl font-semibold">
            {zh ? "认识不同结果画像" : "Meet the possible portraits"}
          </h2>
          <p className="mb-4 leading-7 text-slate-600">
            {zh
              ? "这是公开的画像介绍，不是任何人的个人作答结果。没有哪种更优秀，你也可能在不同情境里认出不同的一面。"
              : "These are public portrait introductions, not anyone’s personal answers or result. No portrait is superior; different situations may bring out different sides."}
          </p>
          <div className="space-y-4">
            {quiz.results.map((result) => (
              <article
                className="rounded-lg border border-slate-200 bg-white p-5"
                key={result.id}
              >
                <h3 className="text-lg font-semibold">
                  {result.title[locale]}
                </h3>
                <p className="mt-3 leading-8 text-slate-700">
                  {result.summary[locale]}
                </p>
                <Link
                  prefetch={false}
                  className="mt-3 inline-block min-h-11 py-2 underline"
                  href={resultPath(locale, slug, result.id)}
                >
                  {zh
                    ? `阅读「${result.title.zh}」完整指南`
                    : `Explore the full ${result.title.en} guide`}
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section
          className="my-8 space-y-5 leading-8"
          aria-labelledby="quiz-faq"
        >
          <h2 id="quiz-faq" className="text-2xl font-semibold">
            {zh ? "关于这项测试的常见问题" : "Questions about this quiz"}
          </h2>
          <h3 className="text-lg font-semibold">
            {quiz.seo.faq.question[locale]}
          </h3>
          <p>{quiz.seo.faq.answer[locale]}</p>
          <h3 className="text-lg font-semibold">
            {zh
              ? "有几种结果，怎样阅读？"
              : "How many results are there, and how should I read them?"}
          </h3>
          <p>
            {changan ? (zh ? "六位历史人物各有一张动漫人物卡和一份公开指南。每次作答显示一位人物。" : "Each of the six historical figures has an illustrated card and a public guide. Each play ends with one figure.") : zh
              ? `本测试有${quiz.results.length}种原创画像或结局。上方简介可进入每种完整公开指南；指南不是任何人的私人成绩。${quiz.mechanism === "tally" ? "最高计数并列时，会完整呈现全部领先画像，不随机抽取。" : "相同故事路径抵达相同写好结局，改答会清除旧分支。"}`
              : `There are ${quiz.results.length} original portraits or endings. Each introduction links to its complete public guide, not anyone’s personal result. ${quiz.mechanism === "tally" ? "Tied highest totals show every leading portrait, without a random pick." : "The same story path reaches the same authored ending; editing clears the abandoned branch."}`}
          </p>
        </section>
        <section className="my-8" aria-labelledby="related-quizzes">
          <h2 id="related-quizzes" className="text-2xl font-semibold">
            {zh ? "继续探索相关主题" : "Explore related themes"}
          </h2>
          <ul className="mt-4 space-y-3">
            {relatedFunQuizzes(catalog, quiz).map((other) => (
              <li key={other.slug}>
                <Link
                  prefetch={false}
                  className="inline-block min-h-11 py-2 underline"
                  href={`/${locale}/tests/play/${other.slug}`}
                >
                  {other.title[locale]}
                </Link>
                <p className="text-sm leading-7 text-slate-600">
                  {other.description[locale]}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <p className="mt-8 text-sm text-slate-600">
          {zh ? "内容与规则版本" : "Content and rules version"} {quiz.version} ·{" "}
          {zh ? "实质更新" : "Substantive update"}{" "}
          <time dateTime={quiz.updated}>{quiz.updated}</time>
        </p>
      </Container>
    </main>
  );
}

export default async function FunQuizPage(props: Props) {
  const { slug } = await props.params;
  const category =
    nativeCatalog.find((item) => item.slug === slug)?.category ??
    catalog.find((item) => item.slug === slug)?.category;
  return (
    <ExploreTestShell slug={slug} category={category}>
      {await FunQuizContent(props)}
    </ExploreTestShell>
  );
}
