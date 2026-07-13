"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Compass, Briefcase, GraduationCap, Heart } from "lucide-react";
import type { Locale } from "@/lib/i18n/locales";
import type { PersonalityPublicContentAsset } from "@/lib/cms/personality-public-content-assets";

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
  | "test_intro"
  | "self_reflection"
  | "scientific_background"
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
    id: "test_intro",
    title: "大五人格测试介绍",
    placement: "main",
    expectedContentType: "200-300 字介绍(测试内容、时长、用途、边界)",
    cmsFieldHint: "asset.sections[] with key=test_intro",
    requiredForPublish: false,
  },
  {
    id: "self_reflection",
    title: "五个维度的自省题",
    placement: "main",
    expectedContentType: "5 维度 x 3-4 道自省题(引导用户在测试前建立直觉)",
    cmsFieldHint: "asset.sections[] with key=self_reflection",
    requiredForPublish: false,
  },
  {
    id: "scientific_background",
    title: "大五人格的科学背景",
    placement: "main",
    expectedContentType: "400-500 字科学背景(FFM vs IPIP vs NEO、研究历史、Big Five 命名由来)",
    cmsFieldHint: "asset.sections[] with key=scientific_background",
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
        prefetch={false}
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
  asset,
  preview = false,
}: {
  locale: Locale;
  asset?: PersonalityPublicContentAsset;
  preview?: boolean;
}) {
  const isZh = locale === "zh";

  return (
    <div
      className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:px-8 lg:grid-cols-[minmax(0,1fr)_300px]"
      data-authority-asset={asset ? `${asset.framework}:${asset.code}` : undefined}
    >
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
                        prefetch={false}
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
                    prefetch={false}
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
                  prefetch={false}
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

        {/* Slot 10: Test Intro */}
        <PreviewCard
          slotId="test_intro"
          title={isZh ? "大五人格测试介绍" : "What is the Big Five Test"}
        >
          <p className="m-0">
            {isZh
              ? "大五人格测试通过约 120 道自评题目，从五个独立维度测量稳定的人格倾向，通常需要 15–20 分钟完成。测试不是诊断工具，不判断对错、好坏或能力高低——它提供的是一个用来理解行为偏好和沟通风格的参考框架。每个维度给出从低到高的连续分数，帮助回答\u201c我在什么场景下倾向做什么，又在什么场景下需要补充策略\u201d。分数在不同阶段可能变化，不代表固定身份。"
              : "The Big Five test uses about 120 self-report items to measure stable personality tendencies across five independent dimensions, typically taking 15–20 minutes. The test is not a diagnostic tool and does not judge right/wrong, good/bad, or ability — it provides a reference framework for understanding behavioral preferences and communication styles."}
          </p>
        </PreviewCard>

        {/* Slot 11: Self-Reflection Questions */}
        <PreviewCard
          slotId="self_reflection"
          title={isZh ? "五个维度的自省题" : "Self-Reflection Questions for Each Dimension"}
        >
          <div className="space-y-5">
            {[
              {
                dim: isZh ? "开放性" : "Openness",
                questions: isZh
                  ? "你最近一次被一个新想法或陌生的艺术形式吸引是什么时候？在你熟悉的日常中，有哪些事你宁愿按老办法做？如果明天必须学一样完全陌生的东西，你的第一反应是兴奋还是抗拒？"
                  : "When was the last time you were drawn to a new idea or unfamiliar art form? In your daily routine, what do you prefer to do the old way? If you had to learn something completely unfamiliar tomorrow, would your first reaction be excitement or resistance?",
              },
              {
                dim: isZh ? "尽责性" : "Conscientiousness",
                questions: isZh
                  ? "你最近一次因为计划被打乱而感到烦躁是什么情境？你是更享受制定计划的过程，还是更享受计划完成后的成就感？在没有人监督的情况下，你的效率会变高还是变低？"
                  : "When was the last time you felt frustrated because your plan was disrupted? Do you enjoy the process of making plans more, or the satisfaction of completing them? Without supervision, does your productivity increase or decrease?",
              },
              {
                dim: isZh ? "外向性" : "Extraversion",
                questions: isZh
                  ? "一次社交活动结束后，你的精力通常是在消耗还是补充？你更喜欢和三五个人深聊，还是在一大群人中自由切换？当你需要思考一个重要问题时，你倾向找人讨论还是独自整理？"
                  : "After a social event, does your energy usually feel drained or replenished? Do you prefer deep conversations with a few people, or freely moving among a larger group? When you need to think through an important issue, do you tend to discuss it or sort it out alone?",
              },
              {
                dim: isZh ? "宜人性" : "Agreeableness",
                questions: isZh
                  ? "你在冲突中是先理解对方感受，还是先陈述自己的立场？你更看重关系和谐，还是更看重把问题说清楚？当别人提出不合理要求时，你通常怎么回应？"
                  : "In a conflict, do you first try to understand the other person's feelings, or first state your position? Do you value harmony more, or clarity more? When someone makes an unreasonable request, how do you typically respond?",
              },
              {
                dim: isZh ? "神经质 / 情绪敏感性" : "Neuroticism",
                questions: isZh
                  ? "你最近一次感到压力时，那种感觉持续了多久？你更容易注意到环境中可能出错的地方，还是更容易注意到已经顺利的地方？当你情绪波动时，恢复到平稳状态通常需要多长时间？"
                  : "The last time you felt stressed, how long did that feeling last? Are you more likely to notice what could go wrong, or what is already going well? When your emotions fluctuate, how long does it typically take to return to a stable state?",
              },
            ].map(({ dim, questions }) => (
              <div key={dim} className="rounded-xl border border-[var(--fm-border)] bg-white p-4">
                <h3 className="m-0 mb-2 text-base font-semibold text-[var(--fm-text)]">{dim}</h3>
                <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{questions}</p>
              </div>
            ))}
          </div>
        </PreviewCard>

        {/* Slot 12: Scientific Background */}
        <PreviewCard
          slotId="scientific_background"
          title={isZh ? "大五人格的科学背景" : "How Was the Big Five Created"}
        >
          <div className="space-y-4 text-sm leading-7 text-[var(--fm-text-muted)]">
            <p className="m-0">
              {isZh
                ? "大五人格的五个维度并非人为设计出来的，而是通过数十年跨语言、跨文化的词汇研究和因素分析自然浮现的。"
                : "The five dimensions of the Big Five were not designed by any single researcher — they emerged naturally through decades of cross-language, cross-cultural lexical research and factor analysis."}
            </p>
            <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4">
              <h3 className="m-0 mb-2 text-base font-semibold text-[var(--fm-text)]">
                {isZh ? "起源" : "Origins"}
              </h3>
              <p className="m-0">
                {isZh
                  ? "20 世纪上半叶，研究者 Allport 和 Odbert 从英语词典中提取了数千个描述人格的词汇。后续研究者通过统计分析，发现这些词汇反复收敛到五个主要因素——这就是\u201cBig Five\u201d名称的由来。"
                  : "In the early 20th century, researchers Allport and Odbert extracted thousands of personality-descriptive words from the English dictionary. Subsequent statistical analysis showed these words consistently converged into five major factors — hence the name 'Big Five.'"}
              </p>
            </div>
            <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
              {isZh ? "主要理论脉络" : "Major Theoretical Traditions"}
            </h3>
            <ul className="m-0 space-y-2 pl-5">
              <li>
                <strong>{isZh ? "五因素模型 (FFM)" : "Five Factor Model (FFM)"}</strong>
                ：{isZh
                  ? "由 Costa 和 McCrae 提出，以 NEO-PI-R 量表为代表，包含 30 个 facet 的层级结构。"
                  : "Proposed by Costa and McCrae, represented by the NEO-PI-R inventory, including a hierarchical structure of 30 facets."}
              </li>
              <li>
                <strong>{isZh ? "大五 (Big Five)" : "Big Five (Lexical)"}</strong>
                ：{isZh
                  ? "来自词汇研究传统，由 Goldberg、John 等人发展，以 BFI 和 IPIP 为代表，强调跨语言可重复性。"
                  : "From the lexical research tradition, developed by Goldberg, John, and others, represented by BFI and IPIP, emphasizing cross-language replicability."}
              </li>
              <li>
                <strong>{isZh ? "IPIP" : "IPIP (International Personality Item Pool)"}</strong>
                ：{isZh
                  ? "公开量表生态，在研究中常被用作 NEO 的替代工具。"
                  : "An open-source item pool, often used as an alternative to NEO in research."}
              </li>
            </ul>
            <p className="m-0">
              {isZh
                ? "FFM 和 Big Five 共享同样的五个维度命名，研究高度交叉引用，但理论基础和量表编制路径有所不同。大五维度的跨文化可重复性、重测信度和与行为指标的关联已积累了大量实证文献。"
                : "FFM and Big Five share the same five dimension names and highly cross-reference each other in research, but differ in theoretical foundation and scale development approaches. The Big Five dimensions have accumulated substantial empirical evidence for cross-cultural replicability, test-retest reliability, and associations with behavioral indicators."}
            </p>
          </div>
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
        {/* Preview mode indicator — only shown in explicit preview mode */}
      {preview ? (
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
      ) : null}

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
                prefetch={false}
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
