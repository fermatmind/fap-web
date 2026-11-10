import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Compass,
  SearchCheck,
  Target,
} from "lucide-react";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { CAREER_TRACKING_EVENTS } from "@/lib/career/attribution";
import { careerPlanningExample } from "@/lib/career/planningExample";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCareerGuideFromCmsBySlug, listCareerGuidesFromCms, type CareerGuideListItem } from "@/lib/cms/career-guides";
import { resolveLocale } from "@/lib/i18n/getDict";
import { canonicalUrl, isConfiguredStagingSiteUrl } from "@/lib/site";
import { localizedPath, type DisplayLocale } from "@/lib/i18n/locales";
import {
  buildBreadcrumbJsonLd,
  buildFAQPageJsonLd,
  buildItemListJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";
import styles from "./career-paths.module.css";

export const revalidate = 300;

const PAGE_UPDATED_AT = "2026-10-22";

type GuideGroup = {
  key: string;
  title: Record<DisplayLocale, string>;
  summary: Record<DisplayLocale, string>;
  slugs: string[];
  fallbackCategories: string[];
};

const GUIDE_GROUPS: GuideGroup[] = [
  {
    key: "career-choice",
    title: { en: "Choose a direction", zh: "确定目标方向", "zh-TW": "確定目標方向" },
    summary: {
      en: "Build a shortlist, compare paths, and avoid one-dimensional salary decisions.",
      zh: "建立候选方向、比较路径，避免只用薪资做决定。", "zh-TW": "建立候選方向、比較路徑，避免只用薪資做決定。",
    },
    slugs: [
      "how-to-find-right-career-direction",
      "how-to-choose-college-major",
      "annual-career-review-system",
      "build-five-year-career-roadmap",
      "leader-track-vs-expert-track",
    ],
    fallbackCategories: ["career-planning", "education-decision"],
  },
  {
    key: "career-transition",
    title: { en: "Validate a transition", zh: "验证职业转型", "zh-TW": "驗證職涯轉型" },
    summary: {
      en: "Test a move, reduce switching cost, and turn adjacent experience into evidence.",
      zh: "验证转型方向、降低切换成本，把相邻经验转成证据。", "zh-TW": "驗證轉型方向、降低切換成本，把相鄰經驗轉成證據。",
    },
    slugs: [
      "career-transition-playbook",
      "cross-industry-move-strategy",
      "build-portfolio-for-career-switch",
      "first-90-days-in-new-role",
    ],
    fallbackCategories: ["career-transition", "onboarding"],
  },
  {
    key: "capability-building",
    title: { en: "Close skill gaps", zh: "补齐技能差距", "zh-TW": "補足技能差距" },
    summary: {
      en: "Turn vague growth goals into role-specific skills, projects, and job-search evidence.",
      zh: "把模糊成长目标拆成岗位技能、实战项目和求职证据。", "zh-TW": "把模糊成長目標拆成職位技能、實戰專案和求職證據。",
    },
    slugs: [
      "improve-workplace-competitiveness",
      "interview-strategy-by-role",
      "salary-negotiation-framework",
      "networking-that-actually-works",
      "personal-brand-for-professionals",
      "career-growth-with-manager",
    ],
    fallbackCategories: ["skill-growth", "job-search", "workplace-communication"],
  },
  {
    key: "personality-fit",
    title: { en: "Use assessment signals", zh: "使用测评线索", "zh-TW": "使用測評線索" },
    summary: {
      en: "Use MBTI, Big Five, IQ, and EQ as decision inputs without turning them into labels.",
      zh: "先用霍兰德／RIASEC 整理任务兴趣，再用人格线索观察工作方式；能力要看实际产出与反馈。", "zh-TW": "先用霍蘭德／RIASEC 整理任務興趣，再用人格線索觀察工作方式；能力要看實際產出與回饋。",
    },
    slugs: [
      "from-mbti-to-job-fit",
      "big5-for-career-decisions",
      "iq-eq-balance-at-work",
      "prevent-burnout-while-growing",
    ],
    fallbackCategories: ["assessment-usage", "wellbeing"],
  },
  {
    key: "market-risk",
    title: { en: "Read market change", zh: "判断市场变化", "zh-TW": "判斷市場變化" },
    summary: {
      en: "Read AI exposure, industry shifts, and career resilience without overreacting.",
      zh: "理解 AI 暴露度、行业变化和职业韧性，避免过度反应。", "zh-TW": "理解 AI 暴露度、產業變化和職業韌性，避免過度反應。",
    },
    slugs: ["career-risk-management"],
    fallbackCategories: ["career-planning"],
  },
];

const FEATURED_GUIDE_SLUGS = [
  "career-transition-playbook",
  "improve-workplace-competitiveness",
  "build-portfolio-for-career-switch",
  "interview-strategy-by-role",
  "how-to-find-right-career-direction",
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (localeParam === "zh-TW") {
    return {
      title: "職涯規劃：找方向、比較職業與行動回顧",
      description: "從沒有方向、已有候選或已有目標開始，比較實際任務、核對門檻，用低成本驗證和工作表更新職涯計畫。",
      alternates: { canonical: canonicalUrl("/zh-TW/career/guides") },
      robots: { index: false, follow: !isConfiguredStagingSiteUrl() },
    };
  }
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/career/guides" : "/en/career/guides",
    title: locale === "zh" ? "职业规划：找方向、比较职业与行动复盘" : "Career Planning: Compare, Test, and Review",
    description:
      locale === "zh"
        ? "从没有方向、已有候选或已有目标开始，比较真实任务、核对门槛，用低成本验证和工作表更新职业计划。"
        : "Start without a direction, with a shortlist, or with a target role. Compare real tasks, check entry barriers, and plan a low-cost test and review.",
    alternatesByLocale: {
      en: "/en/career/guides",
      zh: "/zh/career/guides",
      xDefault: "/",
    },
  });
}

function pickLocale<T>(locale: DisplayLocale, value: Record<DisplayLocale, T>): T {
  return value[locale];
}

function orderBySlugs(guides: CareerGuideListItem[], slugs: string[]): CareerGuideListItem[] {
  const bySlug = new Map(guides.map((guide) => [guide.slug, guide]));
  return slugs.map((slug) => bySlug.get(slug)).filter((guide): guide is CareerGuideListItem => Boolean(guide));
}

function groupGuides(guides: CareerGuideListItem[]) {
  const used = new Set<string>();
  const explicitlyGroupedSlugs = new Set(GUIDE_GROUPS.flatMap((group) => group.slugs));

  return GUIDE_GROUPS.map((group) => {
    const bySlug = orderBySlugs(guides, group.slugs);
    for (const guide of bySlug) {
      used.add(guide.slug);
    }

    const fallback = guides.filter(
      (guide) =>
        !used.has(guide.slug) &&
        (!explicitlyGroupedSlugs.has(guide.slug) || group.slugs.includes(guide.slug)) &&
        group.fallbackCategories.includes(guide.categorySlug || guide.category)
    );
    for (const guide of fallback) {
      used.add(guide.slug);
    }

    return {
      ...group,
      guides: [...bySlug, ...fallback],
    };
  });
}

export default async function CareerGuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";
  const traditional = localeParam === "zh-TW";
  const displayLocale = traditional ? "zh-TW" : locale;
  const t = (zh: string, en: string, zhTw: string) => traditional ? zhTw : isZh ? zh : en;
  const canonicalPath = `/${displayLocale}/career/guides`;
  const PageRoot = traditional ? "div" : "main";
  const pageTitle = t("职业规划，从你的起点开始", "Career planning, from your starting point", "職涯規劃，從你的起點開始");
  const pageDescription = t("没有方向、已有候选、已有目标：先比较真实工作，再做一次小验证，带着证据调整下一步。", "No direction, a shortlist, or a target: compare real work, try one small task, and use the evidence to choose your next step.", "沒有方向、已有候選、已有目標：先比較真實工作，再做一次小驗證，帶著證據調整下一步。");
  const jobsPath = localizedPath("/career", locale);
  const testsPath = localizedPath("/career/tests", locale);
  const directionPath = `${canonicalPath}/how-to-find-right-career-direction`;
  const transitionPath = `${canonicalPath}/career-transition-playbook`;
  const worksheetPath = localizedPath("/holland-test/pdf-download", locale);
  const [listRead, exampleRead, traditionalRead] = await Promise.allSettled([
    listCareerGuidesFromCms(displayLocale, { fresh: true, throwOnUnavailable: true }),
    getCareerGuideFromCmsBySlug("how-to-find-right-career-direction", displayLocale),
    traditional ? Promise.resolve([]) : listCareerGuidesFromCms("zh-TW", { perPage: 1 }),
  ]);
  const guides = listRead.status === "fulfilled" ? listRead.value : [];
  const traditionalAvailable = traditionalRead.status === "fulfilled" && traditionalRead.value.length > 0;
  const example = exampleRead.status === "fulfilled" && exampleRead.value
    ? careerPlanningExample(exampleRead.value.bodyMd, displayLocale) : null;
  const exampleUnavailable = exampleRead.status === "rejected";
  const planningLink = (href: string, action: string, label: string, className?: string) => {
    if (traditional && href.startsWith(`${canonicalPath}/`) && !guides.some(guide => guide.href === href)) return null;
    return <TrackedCareerLink href={href} className={className} eventName={CAREER_TRACKING_EVENTS.supportLinkClick}
      eventPayload={{ locale, entrySurface: "career_guides", sourcePageType: "landing",
        targetAction: action, landingPath: canonicalPath, routeFamily: "landing" }}>{label}<ArrowRight aria-hidden="true" /></TrackedCareerLink>;
  };
  const groupedGuides = groupGuides(guides);
  const featuredGuides = orderBySlugs(guides, FEATURED_GUIDE_SLUGS);
  const faqItems = traditional ? [
    {
      question: "如何判斷一個轉職方向是否值得嘗試？",
      answer: "先核對目標職位的實際任務與門檻，再盤點可轉移的能力，透過小專案、訪談或短期協作來驗證，避免一開始就做不可逆的決定。",
    },
    {
      question: "技能差距應該一次補足嗎？",
      answer: "不用。先補足入門與作品證明需要的核心技能，再依目標職位的回饋調整學習計畫。",
    },
    {
      question: "職涯路徑能保證轉型成功嗎？",
      answer: "不能。職涯路徑用來整理資訊與行動，結果仍受個人能力、市場機會、教育經驗與執行品質影響。",
    },
  ] : isZh
    ? [
        {
          question: "如何判断一个转行方向是否值得尝试？",
          answer: "先核对目标岗位的真实任务和门槛，再盘点可迁移能力，通过小项目、访谈或短期协作验证，而不是先做不可逆的决定。",
        },
        {
          question: "技能差距应该一次全部补齐吗？",
          answer: "不需要。优先补齐影响入门和作品证明的核心技能，再根据目标岗位反馈迭代学习计划。",
        },
        {
          question: "职业路径会替我保证转型成功吗？",
          answer: "不会。职业路径用于组织信息和行动，结果仍受个人能力、市场机会、教育经验和执行质量影响。",
        },
      ]
    : [
        {
          question: "How do I decide whether a career transition is worth testing?",
          answer: "Check the target role's real tasks and entry requirements, map transferable strengths, and validate the direction through a small project, conversation, or short collaboration before making an irreversible move.",
        },
        {
          question: "Should I close every skill gap at once?",
          answer: "No. Prioritize the skills needed for entry and credible work samples, then update the learning plan using feedback from target roles.",
        },
        {
          question: "Does a career path guarantee a successful transition?",
          answer: "No. A path organizes evidence and action, while outcomes still depend on capability, opportunity, education, experience, and execution.",
        },
      ];
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: pageTitle,
    description: pageDescription,
    locale: displayLocale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: t("首页", "Home", "首頁"), path: t("/zh", "/en", "/zh-TW") },
    { name: t("职业", "Career", "職業"), path: t("/zh/career", "/en/career", "/zh/career") },
    { name: t("职业规划", "Career planning", "職涯規劃"), path: canonicalPath },
  ]);
  const faqJsonLd = buildFAQPageJsonLd(faqItems);
  const itemListJsonLd = buildItemListJsonLd({
    path: canonicalPath,
    title: t("职业路径指南", "Career path guides", "職涯路徑指南"),
    description: t("来自 CMS 的公开职业路径指南。", "Public career path guides supplied by the CMS.", "來自 CMS 的公開職涯路徑指南。"),
    locale,
    items: guides.map((guide) => ({
      name: guide.title,
      path: guide.href,
      description: guide.summary,
    })),
  });

  const pathSteps = [
    {
      number: "01",
      icon: Target,
      title: t("确定目标方向", "Choose a target", "確定目標方向"),
      description: t("先核对真实工作内容，再建立少量候选方向。", "Check real work first, then build a small shortlist.", "先核對真實工作內容，再建立少量候選方向。"),
      href: "#explore-work",
    },
    {
      number: "02",
      icon: ClipboardList,
      title: t("盘点技能差距", "Map skill gaps", "盤點技能差距"),
      description: t("区分可迁移能力、入门技能与长期能力。", "Separate transferable strengths, entry skills, and long-term capabilities.", "區分可遷移能力、入門技能與長期能力。"),
      href: "#capability-building",
    },
    {
      number: "03",
      icon: SearchCheck,
      title: t("完成低成本验证", "Run a low-cost test", "完成低成本驗證"),
      description: t("用项目、访谈或短期协作验证日常工作。", "Use a project, conversation, or short collaboration to test the work.", "用專案、訪談或短期協作驗證日常工作。"),
      href: "#worked-example",
    },
    {
      number: "04",
      icon: BookOpenCheck,
      title: t("准备求职证据", "Prepare job-search evidence", "準備求職證據"),
      description: t("整理作品、案例和目标岗位清单，再开始投递。", "Prepare work samples, cases, and a target-role list before applying.", "整理作品、案例和目標職位清單，再開始投遞履歷。"),
      href: "#target-plan",
    },
  ];

  return (
    <PageRoot className={styles.page}>
      <JsonLd id="career-path-webpage" data={webPageJsonLd} />
      <JsonLd id="career-path-breadcrumb" data={breadcrumbJsonLd} />
      <JsonLd id="career-path-faq" data={faqJsonLd} />
      {guides.length > 0 ? <JsonLd id="career-path-item-list" data={traditional ? { ...itemListJsonLd, inLanguage: displayLocale } : itemListJsonLd} /> : null}

      <section className={styles.hero}>
        <div className={styles.heroArtwork} aria-hidden="true">
          <Image
            src="/images/career/career-compass.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className={styles.heroArtworkImage}
          />
        </div>
        <Container as="div" className={styles.heroInner}>
          <Breadcrumb
            items={[
              { label: t("首页", "Home", "首頁"), href: traditional ? "/zh-TW" : localizedPath("/", locale) },
              { label: t("职业", "Career", "職業"), href: jobsPath },
              { label: t("职业规划", "Career planning", "職涯規劃") },
            ]}
          />
          {traditional ? <nav aria-label="頁面語言" className="flex flex-wrap gap-4 text-sm">
            <Link href="/zh/career/guides" lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
            <Link href="/en/career/guides" lang="en" className="min-h-11 py-2 underline">English</Link>
          </nav> : traditionalAvailable ? (
            <Link href="/zh-TW/career/guides" lang="zh-TW" className="inline-flex min-h-11 items-center underline">繁體中文</Link>
          ) : null}
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{t("职业规划 · CAREER PLANNING", "CAREER PLANNING", "職涯規劃 · CAREER PLANNING")}</p>
            <h1>{pageTitle}</h1>
            <p>{pageDescription}</p>
          </div>
          <nav className={styles.heroStarts} aria-label={t("选择你的起点", "Choose your starting point", "選擇你的起點")}>
            {planningLink("#explore-work", "select_start_no_direction", t("没有明确方向", "No clear direction", "沒有明確方向"), styles.startOption)}
            {planningLink("#worked-example", "select_start_candidates", t("已有候选职业", "Have a shortlist", "已有候選職業"), styles.startOption)}
            {planningLink("#target-plan", "select_start_target", t("已有目标职业", "Have a target role", "已有目標職業"), styles.startOption)}
          </nav>
        </Container>
      </section>

      <Container as="div" className={styles.content}>
        <nav className={styles.contentsNav} aria-label={t("本页目录", "On this page", "本頁目錄")}>
          <a href="#explore-work">{t("01 找方向", "01 Explore", "01 找方向")}</a>
          <a href="#worked-example">{t("02 比较与验证示例", "02 Compare and test", "02 比較與驗證示例")}</a>
          <a href="#target-plan">{t("03 行动与复盘", "03 Act and review", "03 行動與回顧")}</a>
          <a href="#guides">{t("04 全部指南", "04 All guides", "04 全部指南")}</a>
        </nav>
        <section id="explore-work" className={styles.exploreSection} aria-labelledby="career-explore-title">
          <p className={styles.sectionKicker}>{t("没有方向，也能开始", "You can start without a direction", "沒有方向，也能開始")}</p>
          <h2 id="career-explore-title">{t("先找愿意重复的活动", "Start with activities you would repeat", "先找願意重複的活動")}</h2>
          <p>{t("写下最近一次愿意投入、做出产出和不想重复的活动。把兴趣感受、能力证据和现实条件分开，再找两个职业核对日常任务。你可以不做测试。", "Write down an activity you wanted to repeat, one with a concrete output, and one you disliked. Separate interest, capability evidence and practical constraints, then investigate two roles. A test is optional.", "寫下最近一次願意投入、做出產出和不想重複的活動。把興趣感受、能力證據和現實條件分開，再找兩個職業核對日常任務。你可以不做測試。")}</p>
          <div className={styles.actionRow}>
            {planningLink(testsPath, "choose_exploration_tool", t("选择职业探索工具", "Choose an exploration tool", "選擇職業探索工具"), styles.outlineAction)}
            {planningLink("#worked-example", "explore_without_test", t("不做测试，直接调查工作活动", "Explore work without taking a test", "不做測試，直接調查工作活動"), styles.outlineAction)}
            {planningLink(directionPath, "continue_from_results", t("已有结果：填写候选比较表", "Have results? Build a comparison record", "已有結果：填寫候選比較表"), styles.outlineAction)}
          </div>
        </section>

        <section id="worked-example" className={styles.exampleSection} aria-labelledby="career-example-title">
          <p className={styles.sectionKicker}>{t("完整教学示例", "A complete teaching example", "完整教學示例")}</p>
          <h2 id="career-example-title">{t("演员与电影视频编辑：比较、验证、复盘", "Actors and video editors: compare, test, review", "演員與電影影片編輯：比較、驗證、回顧")}</h2>
          <p className={styles.sourceNote}>{t("以下为合成教学案例。正文复用已发布的找方向指南，职业任务参考链接档案及美国 O*NET；2026-10-22 核对。美国资料不能替代中国或其他地区的目标岗位、训练和资格核实。", "A synthetic teaching case from the published direction guide. Role facts refer to the linked dossiers and U.S. O*NET, checked on 22 October 2026; local entry conditions require separate verification.", "以下為合成教學案例。正文複用已發布的找方向指南，職業任務參考連結檔案及美國 O*NET；2026-10-22 核對。美國資料不能替代中國或其他地區的目標職位、訓練和資格核實。")}</p>
          {example ? <div className={styles.exampleBody}>{renderSimpleMarkdown(example, { locale, minimumHeadingLevel: 3, headingIdPrefix: "career-hub-example", scrollableTables: true, ...(traditional ? { scrollableTableLabel: "可橫向捲動的表格" } : {}) })}</div> : <p role="status">{exampleUnavailable
            ? (t("示例服务暂不可用。可稍后重试，或先查看工作表和下方行动步骤。", "The example is temporarily unavailable. Try again later, or use the worksheet and action steps below.", "示例服務暫不可用。可稍後重試，或先檢視工作表和下方行動步驟。"))
            : (t("当前没有已发布的完整示例，请使用找方向指南的比较表。", "No complete example is currently published. Use the direction guide's comparison record.", "目前沒有已發布的完整示例，請使用找方向指南的比較表。"))}</p>}
          <div className={styles.actionRow}>
            {planningLink(directionPath, "open_direction_guide", t("打开指南与可复制比较表", "Open the guide and copyable record", "開啟指南與可複製比較表"), styles.outlineAction)}
            {planningLink(worksheetPath, "open_planning_worksheet", t("使用现有 PDF 工作表", "Use the existing PDF worksheet", "使用現有 PDF 工作表"), styles.outlineAction)}
          </div>
        </section>

        <section id="target-plan" className={styles.exploreSection} aria-labelledby="career-target-title">
          <p className={styles.sectionKicker}>{t("已有目标，落实下一步", "Have a target? Make the next step concrete", "已有目標，落實下一步")}</p>
          <h2 id="career-target-title">{t("核门槛，做验证，定复盘日期", "Check the barrier, test, set a review date", "核門檻，做驗證，定回顧日期")}</h2>
          <ol className={styles.targetSteps}>
            <li>{t("写清目标职业、地区与岗位层级，读目标岗位要求；把必备资格、可迁移证据和待补技能分开，注明来源和日期。", "Name the role, region and level. Read target requirements; separate required eligibility, transferable evidence and skill gaps. Record a source and date.", "寫清目標職業、地區與職位層級，讀目標職位要求；把必備資格、可遷移證據和待補技能分開，註明來源和日期。")}</li>
            <li>{t("选择一个最影响决定的未知，写下试做输入、时间与成本上限、完成条件和产出。点击示例或下载不代表完成了验证。", "Choose one uncertainty that matters to the decision. Specify inputs, time and cost limits, a completion condition and an output. Opening an example or downloading a file does not complete a test.", "選擇一個最影響決定的未知，寫下試做輸入、時間與成本上限、完成條件和產出。點選示例或下載不代表完成了驗證。")}</li>
            <li>{t("约定复盘日期，记录实际产出、反馈来源与约束变化，再决定继续、调整或暂缓，以及下一次行动。记录留在你的笔记或工作表中。", "Set a review date. Record the output, feedback source and changed constraints, then decide to continue, adjust or pause and name the next action. Keep the record in your own notes or worksheet.", "約定回顧日期，記錄實際產出、回饋來源與約束變化，再決定繼續、調整或暫緩，以及下一次行動。記錄留在你的筆記或工作表中。")}</li>
          </ol>
          <div className={styles.actionRow}>
            {planningLink(transitionPath, "plan_target_validation", t("阅读转型手册，填写继续或暂停条件", "Plan a test and continue or pause conditions", "閱讀轉型手冊，填寫繼續或暫停條件"), styles.outlineAction)}
            {planningLink(worksheetPath, "open_action_worksheet", t("用工作表记录行动与复盘", "Record your action and review", "用工作表記錄行動與回顧"), styles.outlineAction)}
          </div>
        </section>

        <section className={styles.pathWorkspace} aria-labelledby="career-path-map-title">
          <article className={styles.timelineCard}>
            <div className={styles.cardHeading}>
              <p className={styles.sectionKicker}>{t("通用行动框架", "General action framework", "通用行動框架")}</p>
              <h2 id="career-path-map-title">{t("四步职业路径", "A four-step career path", "四步職涯路徑")}</h2>
              <p>{t("每一步都连接到现有工具或 CMS 指南，先验证，再投入。", "Each step links to an existing tool or CMS guide so you can validate before investing.", "每一步都連線到現有工具或 CMS 指南，先驗證，再投入。")}</p>
            </div>
            <ol className={styles.timeline}>
              {pathSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.number}>
                    <Link href={step.href} className={styles.timelineLink}>
                      <span className={styles.stepNumber}>{step.number}</span>
                      <span className={styles.stepIcon}><Icon aria-hidden="true" /></span>
                      <strong>{step.title}</strong>
                      <small>{step.description}</small>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </article>

          <aside className={styles.gapCard} aria-labelledby="career-gap-title">
            <p className={styles.sectionKicker}>{t("技能差距工作单", "Skill-gap worksheet", "技能差距工作表")}</p>
            <h2 id="career-gap-title">{t("先分三类，不急着报课", "Sort the gap before choosing a course", "先分三類，不急著報課")}</h2>
            <ul>
              <li><CheckCircle2 aria-hidden="true" /><span><strong>{t("可以迁移", "Transferable", "可以遷移")}</strong><small>{t("已有经验、方法和协作能力", "Existing experience, methods, and collaboration", "已有經驗、方法和協作能力")}</small></span></li>
              <li><Compass aria-hidden="true" /><span><strong>{t("优先补齐", "Priority gaps", "優先補足")}</strong><small>{t("进入岗位必须掌握的核心技能", "Core skills required to enter the role", "進入職位必須掌握的核心技能")}</small></span></li>
              <li><BookOpenCheck aria-hidden="true" /><span><strong>{t("用项目证明", "Prove through a project", "用專案證明")}</strong><small>{t("可以被作品或案例验证的能力", "Capabilities visible in work samples or cases", "可以被作品或案例驗證的能力")}</small></span></li>
            </ul>
            <Link href="#capability-building" className={styles.outlineAction}>{t("查看技能差距指南", "View skill-gap guides", "檢視技能差距指南")}<ArrowRight aria-hidden="true" /></Link>
          </aside>
        </section>

        {featuredGuides.length > 0 ? (
          <section className={styles.featuredSection} aria-labelledby="featured-career-paths-title">
            <div className={styles.listHeading}>
              <div>
                <p className={styles.sectionKicker}>{t("优先阅读", "Start here", "優先閱讀")}</p>
                <h2 id="featured-career-paths-title">{t("把方向变成下一步", "Turn direction into a next step", "把方向變成下一步")}</h2>
              </div>
              <p>{t("精选内容完全来自已发布 CMS 指南。", "Featured content comes entirely from published CMS guides.", "精選內容完全來自已發布 CMS 指南。")}</p>
            </div>
            <div className={styles.featuredGrid}>
              {featuredGuides.slice(0, 3).map((guide, index) => (
                <GuideLinkCard key={guide.slug} guide={guide} locale={displayLocale} index={index + 1} prominent />
              ))}
            </div>
          </section>
        ) : null}

        <section id="guides" className={styles.guideDirectory} aria-labelledby="career-path-guides-title">
          <div className={styles.listHeading}>
            <div>
              <p className={styles.sectionKicker}>{t("按任务查找", "Browse by task", "按任務查詢")}</p>
              <h2 id="career-path-guides-title">{t("职业路径指南", "Career path guides", "職涯路徑指南")}</h2>
            </div>
            <p>{t("职业库负责解释“这个职业是什么”；这里专注“怎样走到那里”。", "The occupation library explains the role; this page focuses on how to move toward it.", "職業庫負責解釋“這個職業是什麼”；這裡專注“怎樣走到那裡”。")}</p>
          </div>
          {guides.length === 0 ? <p role="status">{listRead.status === "rejected"
            ? (t("指南列表暂不可用，请稍后重试。", "The guide list is temporarily unavailable. Please try again later.", "指南列表暫不可用，請稍後重試。"))
            : (t("当前没有已发布指南。", "No guides are currently published.", "目前沒有已發布指南。"))}</p> : null}
          <div className={styles.groupList}>
            {groupedGuides
              .filter((group) => group.guides.length > 0)
              .map((group, groupIndex) => (
                <section key={group.key} id={group.key} className={styles.guideGroup}>
                  <div className={styles.groupHeading}>
                    <span>{String(groupIndex + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{pickLocale(displayLocale, group.title)}</h3>
                      <p>{pickLocale(displayLocale, group.summary)}</p>
                    </div>
                  </div>
                  <div className={styles.guideGrid}>
                    {isZh && group.key === "personality-fit" ? (
                      <Link href={`/${displayLocale}/articles/riasec-holland-career-interest-test-explained`} className={styles.guideCard}>
                        <span className={styles.guideIndex}>01</span>
                        <p>{traditional ? "職業興趣" : "职业兴趣"}</p>
                        <h3>{traditional ? "霍蘭德／RIASEC：從興趣到實際任務" : "霍兰德／RIASEC：从兴趣到真实任务"}</h3>
                        <small>{traditional ? "讀懂六個興趣向度，再參考文中的演員、電影影片編輯檔案與完整填寫示例，安排一次低成本試做。" : "读懂六维兴趣线索，再沿文章中的演员、电影视频编辑档案与完整填写示例，安排一次低成本试做。"}</small>
                        <strong>{traditional ? "理解興趣並開始驗證" : "理解兴趣并开始验证"}<ArrowRight aria-hidden="true" /></strong>
                      </Link>
                    ) : null}
                    {group.guides.map((guide, index) => (
                      <GuideLinkCard key={guide.slug} guide={guide} locale={displayLocale} index={index + (isZh && group.key === "personality-fit" ? 2 : 1)} />
                    ))}
                  </div>
                </section>
              ))}
          </div>
        </section>

        <section className={styles.faqSection} id="faq" aria-labelledby="career-path-faq-title">
          <div className={styles.faqIntro}>
            <p className={styles.sectionKicker}>{t("答案与边界", "Answers and boundaries", "答案與邊界")}</p>
            <h2 id="career-path-faq-title">{t("职业路径常见问题", "Career path questions", "職涯路徑常見問題")}</h2>
            <p>
              {t("页面更新于", "Updated", "頁面更新於")} <time dateTime={PAGE_UPDATED_AT}>{PAGE_UPDATED_AT}</time>{(isZh ? "。" : ".")}
              {t("内容索引来自公开 CMS，目标职业事实以职业库为准。", " Guide indexing comes from the public CMS; role facts remain authoritative in the occupation library.", "內容索引來自公開 CMS，目標職業事實以職業庫為準。")}
            </p>
          </div>
          <div className={styles.faqList}>
            {faqItems.map((item) => (
              <details key={item.question} className={styles.faqItem}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </Container>
    </PageRoot>
  );
}

function GuideLinkCard({
  guide,
  locale,
  index,
  prominent = false,
}: {
  guide: CareerGuideListItem;
  locale: DisplayLocale;
  index: number;
  prominent?: boolean;
}) {
  return (
    <Link href={guide.href} className={prominent ? styles.featuredCard : styles.guideCard}>
      <span className={styles.guideIndex}>{String(index).padStart(2, "0")}</span>
      <p>{formatGuideCategory(guide.categorySlug || guide.category, locale)}</p>
      <h3>{guide.title}</h3>
      <small>{guide.summary}</small>
      <strong>{pickLocale(locale, { zh: "阅读指南", en: "Read guide", "zh-TW": "閱讀指南" })}<ArrowRight aria-hidden="true" /></strong>
    </Link>
  );
}

function formatGuideCategory(category: string, locale: DisplayLocale): string {
  const labels: Record<string, Record<DisplayLocale, string>> = {
    "career-planning": { en: "Career planning", zh: "职业规划", "zh-TW": "職涯規劃" },
    "career-transition": { en: "Career transition", zh: "职业转型", "zh-TW": "職涯轉型" },
    "skill-growth": { en: "Capability building", zh: "能力建设", "zh-TW": "能力建設" },
    "assessment-usage": { en: "Assessment usage", zh: "测评应用", "zh-TW": "測評應用" },
    "workplace-communication": { en: "Workplace communication", zh: "职场沟通", "zh-TW": "職場溝通" },
    "job-search": { en: "Job search", zh: "求职行动", "zh-TW": "求職行動" },
    onboarding: { en: "Onboarding", zh: "新岗位适应", "zh-TW": "新職位適應" },
    wellbeing: { en: "Wellbeing", zh: "职业健康", "zh-TW": "職業健康" },
    "education-decision": { en: "Education decision", zh: "教育选择", "zh-TW": "教育選擇" },
  };
  return labels[category]?.[locale] ?? category;
}
