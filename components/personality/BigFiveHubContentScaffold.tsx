"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, ShieldCheck, Compass, Briefcase, GraduationCap, Heart } from "lucide-react";
import type { Locale } from "@/lib/i18n/locales";

// ---------------------------------------------------------------------------
// Section slot definition
// ---------------------------------------------------------------------------

export type HubSectionSlotId =
  | "answer_block"
  | "big_five_definition"
  | "ocean_overview_table"
  | "not_type_system"
  | "result_usage_scenarios"
  | "dimension_summary_cards"
  | "big_five_mbti_bridge"
  | "dimension_self_check"
  | "faq_expansion"
  | "method_boundary"
  | "cta_related_links";

export type HubSectionSlot = {
  id: HubSectionSlotId;
  title: string;
  placement: "main" | "sidebar" | "footer";
  expectedContentType: string;
  cmsFieldHint: string;
  requiredForPublish: boolean;
};

export const BIG_FIVE_HUB_SECTION_SLOTS: HubSectionSlot[] = [
  {
    id: "answer_block",
    title: "直接答案",
    placement: "main",
    expectedContentType: "80-120 字摘要文本",
    cmsFieldHint: "asset.sections[] with key=answer_block",
    requiredForPublish: true,
  },
  {
    id: "big_five_definition",
    title: "什么是大五人格",
    placement: "main",
    expectedContentType: "200-300 字正文 + OCEAN 解释",
    cmsFieldHint: "asset.sections[] with key=big_five_definition",
    requiredForPublish: true,
  },
  {
    id: "ocean_overview_table",
    title: "OCEAN 五维总览表",
    placement: "main",
    expectedContentType: "5 行表格(维度/英文/关注什么/高低分) + 链接",
    cmsFieldHint: "asset.sections[] with key=ocean_overview_table",
    requiredForPublish: true,
  },
  {
    id: "not_type_system",
    title: "大五不是人格类型系统",
    placement: "main",
    expectedContentType: "150-200 字解释 + 连续谱 vs 类型对比",
    cmsFieldHint: "asset.sections[] with key=not_type_system",
    requiredForPublish: true,
  },
  {
    id: "result_usage_scenarios",
    title: "如何阅读和使用大五结果",
    placement: "main",
    expectedContentType: "4 个场景卡片(自我复盘/学习方式/职场沟通/关系理解)",
    cmsFieldHint: "asset.sections[] with key=result_usage_scenarios",
    requiredForPublish: true,
  },
  {
    id: "dimension_summary_cards",
    title: "五个维度摘要卡片",
    placement: "main",
    expectedContentType: "5 个卡片 grid(维度名/摘要/高分/低分/查看详情)",
    cmsFieldHint: "asset.sections[] with key=dimension_summary_cards",
    requiredForPublish: false,
  },
  {
    id: "big_five_mbti_bridge",
    title: "Big Five × MBTI 交叉理解",
    placement: "main",
    expectedContentType: "两栏对比卡片(Big Five 左侧 / MBTI 右侧)",
    cmsFieldHint: "asset.sections[] with key=big_five_mbti_bridge",
    requiredForPublish: false,
  },
  {
    id: "dimension_self_check",
    title: "自查：我应该先看哪个维度",
    placement: "main",
    expectedContentType: "决策卡片列表(问题→推荐维度→链接)",
    cmsFieldHint: "asset.sections[] with key=dimension_self_check",
    requiredForPublish: false,
  },
  {
    id: "faq_expansion",
    title: "常见问题扩展",
    placement: "main",
    expectedContentType: "FAQ accordion(现有 5 题 + 2-3 新题)",
    cmsFieldHint: "asset.faq[] — 复用现有 FAQ 渲染",
    requiredForPublish: false,
  },
  {
    id: "method_boundary",
    title: "方法边界",
    placement: "sidebar",
    expectedContentType: "保留现有方法边界 card",
    cmsFieldHint: "asset.methodBoundary — 复用现有渲染",
    requiredForPublish: true,
  },
  {
    id: "cta_related_links",
    title: "CTA + 继续浏览",
    placement: "footer",
    expectedContentType: "CTA band + 相关链接卡片",
    cmsFieldHint: "asset.internalLinks[] — 复用现有渲染",
    requiredForPublish: true,
  },
];

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function previewLabel(): string {
  return "CMS 内容待填充 — Preview Slot Placeholder";
}

function PreviewBadge({ slotId }: { slotId: string }) {
  return (
    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--fm-text-muted)]">
      <span className="rounded-full border border-dashed border-amber-300 bg-amber-50 px-2 py-0.5 text-amber-700">
        {previewLabel()}
      </span>
      <code className="rounded bg-[var(--fm-surface-muted)] px-1.5 py-0.5 text-[10px]">
        slot: {slotId}
      </code>
    </div>
  );
}

function PreviewCard({
  slotId,
  title,
  children,
}: {
  slotId: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="scroll-mt-24 rounded-2xl border border-dashed border-amber-300 bg-amber-50/30 p-6 shadow-[var(--fm-shadow-sm)] md:p-8"
      data-slot-id={slotId}
    >
      <PreviewBadge slotId={slotId} />
      <h2 className="m-0 text-2xl font-semibold tracking-normal text-[var(--fm-text)]">
        {title}
      </h2>
      <div className="mt-4 text-sm leading-7 text-[var(--fm-text-muted)]">
        {children}
      </div>
    </section>
  );
}

function DimensionCard({
  name,
  english,
  highLabel,
  lowLabel,
  href,
  locale,
}: {
  name: string;
  english: string;
  highLabel: string;
  lowLabel: string;
  href: string;
  locale: Locale;
}) {
  return (
    <article
      className="group rounded-2xl border border-[var(--fm-border)] bg-white p-5 shadow-[var(--fm-shadow-sm)] transition hover:border-[var(--fm-trust-blue)]"
      data-slot-id="dimension_summary_cards"
    >
      <h3 className="m-0 text-lg font-semibold text-[var(--fm-text)]">
        {name}
        <span className="ml-1.5 text-sm font-normal text-[var(--fm-text-muted)]">
          {english}
        </span>
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-[var(--fm-surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--fm-text)]">
          {highLabel}
        </span>
        <span className="rounded-full bg-[var(--fm-surface-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--fm-text-muted)]">
          {lowLabel}
        </span>
      </div>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--fm-trust-blue)] transition group-hover:underline"
      >
        {locale === "zh" ? "查看维度页" : "View Dimension Page"}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}

const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  self_review: <Compass className="h-5 w-5 text-[var(--fm-trust-blue)]" />,
  learning: <GraduationCap className="h-5 w-5 text-[var(--fm-trust-blue)]" />,
  work: <Briefcase className="h-5 w-5 text-[var(--fm-trust-blue)]" />,
  relationship: <Heart className="h-5 w-5 text-[var(--fm-trust-blue)]" />,
};

function ScenarioCard({
  iconKey,
  title,
  children,
}: {
  iconKey: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border border-[var(--fm-border)] bg-white p-5 shadow-[var(--fm-shadow-sm)]"
      data-slot-id="result_usage_scenarios"
    >
      <div className="mb-2 flex items-center gap-2">
        {SCENARIO_ICONS[iconKey] ?? (
          <BookOpen className="h-5 w-5 text-[var(--fm-trust-blue)]" />
        )}
        <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
          {title}
        </h3>
      </div>
      <p className="m-0 text-sm leading-6 text-[var(--fm-text-muted)]">
        {children}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DIMENSION DATA (preview-only — replaced by CMS in production)
// ---------------------------------------------------------------------------

const PREVIEW_DIMENSIONS = [
  {
    name: "开放性",
    english: "Openness",
    highLabel: "好奇 · 富于想象",
    lowLabel: "务实 · 偏好熟悉",
    slug: "openness",
  },
  {
    name: "尽责性",
    english: "Conscientiousness",
    highLabel: "自律 · 有条理",
    lowLabel: "灵活 · 随性",
    slug: "conscientiousness",
  },
  {
    name: "外向性",
    english: "Extraversion",
    highLabel: "社交活跃 · 健谈",
    lowLabel: "偏好安静 · 深度思考",
    slug: "extraversion",
  },
  {
    name: "宜人性",
    english: "Agreeableness",
    highLabel: "合作 · 共情",
    lowLabel: "直言 · 重视原则",
    slug: "agreeableness",
  },
  {
    name: "神经质 / 情绪敏感性",
    english: "Neuroticism",
    highLabel: "风险敏感 · 容易觉察压力",
    lowLabel: "情绪稳定 · 抗压",
    slug: "neuroticism",
  },
];

// ---------------------------------------------------------------------------
// Main scaffold component
// ---------------------------------------------------------------------------

export default function BigFiveHubContentScaffold({
  locale,
}: {
  locale: Locale;
}) {
  const isZh = locale === "zh";

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:px-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      {/* ===== MAIN COLUMN ===== */}
      <div className="space-y-8">
        {/* Slot 1: Answer Block */}
        <PreviewCard
          slotId="answer_block"
          title={isZh ? "大五人格是什么" : "What is the Big Five"}
        >
          <p className="m-0">
            {isZh
              ? "这里将放置 80-120 字的大五人格直接答案摘要。解释 OCEAN 五个维度、连续维度模型以及如何使用这个页面。"
              : "An 80-120 word answer block explaining OCEAN, the five dimensions, and how to use this hub page."}
          </p>
        </PreviewCard>

        {/* Slot 2: Big Five Definition */}
        <PreviewCard
          slotId="big_five_definition"
          title={isZh ? "什么是大五人格" : "What is the Big Five Personality"}
        >
          <div className="space-y-3">
            <p className="m-0">
              {isZh
                ? "定义段：解释大五人格（OCEAN 模型）是什么，五个维度分别测量什么，以及大五人格基于数十年跨文化研究。"
                : "Definition paragraph explaining the Big Five (OCEAN model) and its five dimensions."}
            </p>
            <ul className="m-0 space-y-2 pl-5 text-sm">
              <li>Openness — 对新事物、新观念的接受程度</li>
              <li>Conscientiousness — 自律、条理和目标导向程度</li>
              <li>Extraversion — 从外部世界获取能量的倾向</li>
              <li>Agreeableness — 对他人需求的关注和合作倾向</li>
              <li>Neuroticism — 对负面情绪的敏感度和压力反应</li>
            </ul>
          </div>
        </PreviewCard>

        {/* Slot 3: OCEAN Overview Table */}
        <PreviewCard
          slotId="ocean_overview_table"
          title={isZh ? "OCEAN 五维总览" : "OCEAN Five-Factor Overview"}
        >
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-[var(--fm-border)] md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--fm-border)] bg-[var(--fm-surface)]">
                  <th className="px-4 py-3 font-semibold text-[var(--fm-text)]">
                    {isZh ? "维度" : "Dimension"}
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--fm-text)]">
                    {isZh ? "英文" : "English"}
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--fm-text)]">
                    {isZh ? "关注什么" : "What It Measures"}
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--fm-text)]">
                    {isZh ? "高低分怎么理解" : "High vs Low"}
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--fm-text)]">
                    {isZh ? "查看详情" : "Details"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {PREVIEW_DIMENSIONS.map((dim) => (
                  <tr
                    key={dim.slug}
                    className="border-b border-[var(--fm-border)] last:border-b-0"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--fm-text)]">
                      {dim.name}
                    </td>
                    <td className="px-4 py-3 text-[var(--fm-text-muted)]">
                      {dim.english}
                    </td>
                    <td className="px-4 py-3 text-[var(--fm-text-muted)]">
                      {isZh ? "CMS 内容待填充" : "CMS content pending"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <span className="rounded-full bg-[var(--fm-surface)] px-2 py-0.5 text-xs">
                          {dim.highLabel}
                        </span>
                        <span className="rounded-full bg-[var(--fm-surface-muted)] px-2 py-0.5 text-xs">
                          {dim.lowLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/${locale}/personality/big-five/${dim.slug}`}
                        className="text-sm font-medium text-[var(--fm-trust-blue)] hover:underline"
                      >
                        {isZh ? "查看" : "View"}
                        <ArrowRight className="ml-1 inline h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card stack */}
          <div className="grid gap-3 md:hidden">
            {PREVIEW_DIMENSIONS.map((dim) => (
              <div
                key={dim.slug}
                className="rounded-xl border border-[var(--fm-border)] bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[var(--fm-text)]">
                      {dim.name}
                    </span>
                    <span className="ml-1.5 text-xs text-[var(--fm-text-muted)]">
                      {dim.english}
                    </span>
                  </div>
                  <Link
                    href={`/${locale}/personality/big-five/${dim.slug}`}
                    className="text-sm font-medium text-[var(--fm-trust-blue)]"
                  >
                    {isZh ? "查看" : "View"} →
                  </Link>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="rounded-full bg-[var(--fm-surface)] px-2 py-0.5 text-xs">
                    {dim.highLabel}
                  </span>
                  <span className="rounded-full bg-[var(--fm-surface-muted)] px-2 py-0.5 text-xs">
                    {dim.lowLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </PreviewCard>

        {/* Slot 4: Not a Type System */}
        <PreviewCard
          slotId="not_type_system"
          title={
            isZh
              ? "大五人格不是人格类型系统"
              : "Big Five Is Not a Personality Type System"
          }
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4">
              <h3 className="m-0 text-sm font-semibold text-[var(--fm-text)]">
                {isZh ? "大五人格：连续维度" : "Big Five: Continuous Dimensions"}
              </h3>
              <p className="m-0 mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">
                {isZh
                  ? "每个人在五个维度上都有分数。不是被分到某个类型盒子。分数是倾向，不是标签。"
                  : "Everyone has a score on all five dimensions. Not sorted into type boxes. Scores are tendencies, not labels."}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--fm-border)] bg-white p-4">
              <h3 className="m-0 text-sm font-semibold text-[var(--fm-text)]">
                {isZh ? "类型系统：是/否分类" : "Type Systems: Yes/No Categories"}
              </h3>
              <p className="m-0 mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">
                {isZh
                  ? "类型系统把人分到固定的类别中。大五人格不这样做——你是一个独特的五维组合。"
                  : "Type systems sort people into fixed categories. The Big Five doesn't — you are a unique five-dimension combination."}
              </p>
            </div>
          </div>
        </PreviewCard>

        {/* Slot 5: Usage Scenarios */}
        <section
          className="space-y-4"
          data-slot-id="result_usage_scenarios"
        >
          <PreviewBadge slotId="result_usage_scenarios" />
          <h2 className="m-0 text-2xl font-semibold tracking-normal text-[var(--fm-text)]">
            {isZh
              ? "如何阅读和使用大五结果"
              : "How to Read and Use Big Five Results"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ScenarioCard
              iconKey="self_review"
              title={isZh ? "自我复盘" : "Self-Reflection"}
            >
              {isZh
                ? "用五个维度重新理解你的行为模式。记录场景、反应和调整，而不是给自己贴标签。"
                : "Use five dimensions to reframe your behavioral patterns."}
            </ScenarioCard>
            <ScenarioCard
              iconKey="learning"
              title={isZh ? "学习方式" : "Learning Styles"}
            >
              {isZh
                ? "根据你的开放性和尽责性，调整适合你的学习策略和时间安排。"
                : "Adjust your study strategies based on your openness and conscientiousness."}
            </ScenarioCard>
            <ScenarioCard
              iconKey="work"
              title={isZh ? "职场沟通" : "Workplace Communication"}
            >
              {isZh
                ? "理解不同外向性、宜人性、尽责性的同事有不同的工作节奏和沟通偏好。"
                : "Understand that colleagues with different trait levels have different work rhythms."}
            </ScenarioCard>
            <ScenarioCard
              iconKey="relationship"
              title={isZh ? "关系理解" : "Relationship Understanding"}
            >
              {isZh
                ? "用维度帮助沟通，把模糊的'你总是这样'翻译成具体的需求。"
                : "Use dimensions to help communication — translate 'you always do this' into specific needs."}
            </ScenarioCard>
          </div>
        </section>

        {/* Slot 6: Dimension Summary Cards */}
        <section className="space-y-4" data-slot-id="dimension_summary_cards">
          <PreviewBadge slotId="dimension_summary_cards" />
          <h2 className="m-0 text-2xl font-semibold tracking-normal text-[var(--fm-text)]">
            {isZh ? "OCEAN 五维概览" : "OCEAN Five Dimensions Overview"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PREVIEW_DIMENSIONS.map((dim) => (
              <DimensionCard
                key={dim.slug}
                name={dim.name}
                english={dim.english}
                highLabel={dim.highLabel}
                lowLabel={dim.lowLabel}
                href={`/${locale}/personality/big-five/${dim.slug}`}
                locale={locale}
              />
            ))}
          </div>
        </section>

        {/* Slot 7: Big Five × MBTI Bridge */}
        <PreviewCard
          slotId="big_five_mbti_bridge"
          title={
            isZh
              ? "Big Five 与 MBTI 的区别与互补"
              : "Big Five vs MBTI: Differences and Complementarity"
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
                Big Five
              </h3>
              <ul className="m-0 space-y-1.5 pl-5 text-sm text-[var(--fm-text-muted)]">
                <li>{isZh ? "连续维度模型" : "Continuous dimension model"}</li>
                <li>{isZh ? "五个独立维度" : "Five independent dimensions"}</li>
                <li>{isZh ? "每个人在每个维度都有分数" : "Everyone has a score on each dimension"}</li>
                <li>{isZh ? "适合描述行为倾向和偏好" : "Describes behavioral tendencies and preferences"}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
                MBTI
              </h3>
              <ul className="m-0 space-y-1.5 pl-5 text-sm text-[var(--fm-text-muted)]">
                <li>{isZh ? "偏好语言模型" : "Preference language model"}</li>
                <li>{isZh ? "四组二元偏好" : "Four pairs of preferences"}</li>
                <li>{isZh ? "描述你更自然使用哪种方式" : "Describes which approach you naturally prefer"}</li>
                <li>{isZh ? "适合理解沟通风格和决策方式" : "Helps understand communication and decision-making styles"}</li>
              </ul>
            </div>
          </div>
        </PreviewCard>

        {/* Slot 8: Self-Check */}
        <PreviewCard
          slotId="dimension_self_check"
          title={
            isZh
              ? "我应该先看哪个维度？"
              : "Which Dimension Should I Look at First?"
          }
        >
          <p className="m-0 mb-4">
            {isZh
              ? "回答以下问题，找到你最值得优先阅读的维度。这些不是诊断，只是指引你开始的线索。"
              : "Answer these questions to find which dimension is most worth reading first."}
          </p>
          <div className="space-y-3">
            {[
              {
                q: isZh
                  ? "我经常被说'太随意'或'没计划'？"
                  : 'Often told you\'re "too casual" or "unplanned"?',
                dim: "conscientiousness",
                label: isZh ? "尽责性" : "Conscientiousness",
              },
              {
                q: isZh
                  ? "我对新事物感到抗拒或不安？"
                  : "Feel resistant or uneasy about new things?",
                dim: "openness",
                label: isZh ? "开放性" : "Openness",
              },
              {
                q: isZh
                  ? "社交让我精疲力竭？"
                  : "Socializing exhausts you?",
                dim: "extraversion",
                label: isZh ? "外向性" : "Extraversion",
              },
              {
                q: isZh
                  ? "我容易被压力压垮或经常担心？"
                  : "Easily overwhelmed by stress or worry often?",
                dim: "neuroticism",
                label: isZh ? "神经质 / 情绪敏感性" : "Neuroticism",
              },
              {
                q: isZh
                  ? "我在团队中经常觉得需要妥协太多？"
                  : "Often feel you compromise too much in teams?",
                dim: "agreeableness",
                label: isZh ? "宜人性" : "Agreeableness",
              },
            ].map((item) => (
              <div
                key={item.dim}
                className="flex items-center justify-between rounded-xl border border-[var(--fm-border)] bg-white px-4 py-3"
              >
                <span className="text-sm text-[var(--fm-text)]">{item.q}</span>
                <Link
                  href={`/${locale}/personality/big-five/${item.dim}`}
                  className="ml-4 shrink-0 text-sm font-medium text-[var(--fm-trust-blue)] hover:underline"
                >
                  {item.label} <ArrowRight className="inline h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </PreviewCard>

        {/* Slot 9: FAQ Expansion — placeholder, reuses existing FAQ renderer */}
        <PreviewCard
          slotId="faq_expansion"
          title={isZh ? "常见问题（扩展中）" : "FAQ (Expanded)"}
        >
          <p className="m-0">
            {isZh
              ? "现有 5 题 FAQ 将保留。未来计划扩展到 7-8 题，新增如'大五和 MBTI 的区别''结果会不会变'等常见问题。FAQ 的渲染已有生产组件支持。"
              : "Existing 5 FAQ items will be preserved. Planned expansion to 7-8 items."}
          </p>
        </PreviewCard>

        {/* CTA band before footer */}
        <div
          className="rounded-2xl bg-[var(--fm-surface)] p-6 text-center md:p-8"
          data-slot-id="cta_related_links"
        >
          <h2 className="m-0 text-xl font-semibold text-[var(--fm-text)]">
            {isZh ? "准备好了解自己了吗？" : "Ready to Learn About Yourself?"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fm-text-muted)]">
            {isZh
              ? "用约 20 分钟完成 120 题，获得你的五维度详尽分布和解释。"
              : "Complete 120 questions in about 20 minutes for your detailed five-dimension profile."}
          </p>
          <Link
            href={`/${locale}/tests/big-five-personality-test-ocean-model`}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--fm-cta-orange)] px-8 py-3 text-base font-semibold text-white shadow-[var(--fm-shadow-sm)] transition hover:bg-[var(--fm-cta-orange-strong)]"
          >
            {isZh ? "开始大五人格免费测试" : "Start the Free Big Five Test"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ===== SIDEBAR ===== */}
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        {/* Preview mode indicator */}
        <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4">
          <p className="m-0 text-xs font-medium text-amber-700">
            ⚠️ {isZh ? "预览模式" : "Preview Mode"} —{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 text-[10px]">
              ?layout_preview=big-five-v2
            </code>
          </p>
          <p className="m-0 mt-1 text-[10px] leading-4 text-amber-600">
            {isZh
              ? "此布局包含 CMS placeholder。生产环境不显示。"
              : "This layout contains CMS placeholders. Not shown in production."}
          </p>
        </div>

        {/* Slot 10: Method Boundary (placeholder — production uses real CMS data) */}
        <section
          className="rounded-2xl border border-[var(--fm-border)] bg-white p-5 shadow-[var(--fm-shadow-sm)]"
          data-slot-id="method_boundary"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--fm-text)]">
            <ShieldCheck className="h-4 w-4 text-[var(--fm-trust-blue)]" />
            {isZh ? "方法边界" : "Method Boundary"}
          </div>
          <p className="m-0 mt-3 text-sm leading-6 text-[var(--fm-text-muted)]">
            {isZh
              ? "大五人格公开内容只用于自我认知和结构化复盘，不用于临床诊断、招聘筛选、能力判断或职业/关系决定。"
              : "Big Five public content is for self-awareness and structured reflection only."}
          </p>
          <ul className="mt-4 space-y-2 pl-5 text-sm leading-6 text-[var(--fm-text-muted)]">
            <li>{isZh ? "临床诊断" : "Clinical Diagnosis"}</li>
            <li>{isZh ? "心理治疗建议" : "Psychological Treatment"}</li>
            <li>{isZh ? "招聘筛选" : "Hiring or Screening"}</li>
            <li>{isZh ? "能力或智力判断" : "Ability or Intelligence Assessment"}</li>
            <li>{isZh ? "职业或伴侣关系决定" : "Career or Relationship Decisions"}</li>
          </ul>
        </section>

        {/* Slot 11: Related Links (placeholder) */}
        <section
          className="rounded-2xl border border-[var(--fm-border)] bg-white p-5 shadow-[var(--fm-shadow-sm)]"
          data-slot-id="cta_related_links"
        >
          <h2 className="m-0 text-base font-semibold text-[var(--fm-text)]">
            {isZh ? "继续浏览" : "Continue Browsing"}
          </h2>
          <div className="mt-4 grid gap-3">
            {[
              { label: isZh ? "大五人格测试" : "Big Five Test", href: `/${locale}/tests/big-five-personality-test-ocean-model` },
              { label: isZh ? "30 个细分面向" : "30 Facets", href: `/${locale}/personality/big-five/facets` },
              { label: isZh ? "开放性" : "Openness", href: `/${locale}/personality/big-five/openness` },
              { label: isZh ? "尽责性" : "Conscientiousness", href: `/${locale}/personality/big-five/conscientiousness` },
              { label: isZh ? "外向性" : "Extraversion", href: `/${locale}/personality/big-five/extraversion` },
              { label: isZh ? "宜人性" : "Agreeableness", href: `/${locale}/personality/big-five/agreeableness` },
              { label: isZh ? "MBTI 测试" : "MBTI Test", href: `/${locale}/tests/mbti-personality-test-16-personality-types`, pending: true },
              { label: isZh ? "RIASEC 职业兴趣测试" : "RIASEC Career Test", href: `/${locale}/tests/holland-career-interest-test-riasec`, pending: true },
            ].map(({ label, href, pending }) => (
              <Link
                key={href}
                href={href}
                className={`group flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  pending
                    ? "border-dashed border-amber-300 bg-amber-50/30 text-amber-700 hover:border-amber-400"
                    : "border-[var(--fm-border)] text-[var(--fm-text)] hover:border-[var(--fm-trust-blue)] hover:text-[var(--fm-trust-blue)]"
                }`}
              >
                <span>
                  {label}
                  {pending && (
                    <span className="ml-1.5 text-[10px]">({isZh ? "预留" : "reserved"})</span>
                  )}
                </span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
