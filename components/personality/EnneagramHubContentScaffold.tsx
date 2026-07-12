"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Heart, Brain, Zap, Compass, Briefcase, GraduationCap, GitBranch } from "lucide-react";
import type { Locale } from "@/lib/i18n/locales";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function PreviewBadge({ slotId }: { slotId: string }) {
  return (
    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--fm-text-muted)]">
      <span className="rounded-full border border-dashed border-amber-300 bg-amber-50 px-2 py-0.5 text-amber-700">
        CMS 内容待填充 — Preview Slot Placeholder
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

function TypeNumber({ n }: { n: number }) {
  const colors = [
    "bg-red-100 text-red-700 border-red-200",
    "bg-purple-100 text-purple-700 border-purple-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-sky-100 text-sky-700 border-sky-200",
    "bg-amber-100 text-amber-700 border-amber-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-teal-100 text-teal-700 border-teal-200",
    "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
    "bg-orange-100 text-orange-700 border-orange-200",
  ];
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${colors[n - 1]}`}
    >
      {n}
    </span>
  );
}

function ScenarioCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border border-[var(--fm-border)] bg-white p-5 shadow-[var(--fm-shadow-sm)]"
      data-slot-id="result_usage_scenarios"
    >
      <div className="mb-2 flex items-center gap-2">
        {icon}
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
// Type preview data
// ---------------------------------------------------------------------------

const PREVIEW_TYPES = [
  { n: 1, name: "改革者", key: "The Reformer", center: "本能中心", color: "red" },
  { n: 2, name: "助人者", key: "The Helper", center: "情感中心", color: "purple" },
  { n: 3, name: "成就者", key: "The Achiever", center: "情感中心", color: "emerald" },
  { n: 4, name: "个人主义者", key: "The Individualist", center: "情感中心", color: "sky" },
  { n: 5, name: "探索者", key: "The Investigator", center: "思维中心", color: "amber" },
  { n: 6, name: "忠诚者", key: "The Loyalist", center: "思维中心", color: "indigo" },
  { n: 7, name: "热情者", key: "The Enthusiast", center: "思维中心", color: "teal" },
  { n: 8, name: "挑战者", key: "The Challenger", center: "本能中心", color: "fuchsia" },
  { n: 9, name: "和平者", key: "The Peacemaker", center: "本能中心", color: "orange" },
];

const CENTERS = [
  {
    key: "gut",
    nameZh: "本能中心",
    nameEn: "Instinctive Center",
    numbers: "8 · 9 · 1",
    focus: "以身体直觉和行动冲动为核心驱动力",
    icon: <Zap className="h-5 w-5 text-red-500" />,
  },
  {
    key: "heart",
    nameZh: "情感中心",
    nameEn: "Feeling Center",
    numbers: "2 · 3 · 4",
    focus: "以情感认同和自我形象为关注焦点",
    icon: <Heart className="h-5 w-5 text-purple-500" />,
  },
  {
    key: "head",
    nameZh: "思维中心",
    nameEn: "Thinking Center",
    numbers: "5 · 6 · 7",
    focus: "以分析、预测和安全需求为驱动力",
    icon: <Brain className="h-5 w-5 text-teal-500" />,
  },
];

// ---------------------------------------------------------------------------
// Main scaffold
// ---------------------------------------------------------------------------

export default function EnneagramHubContentScaffold({
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
          title={isZh ? "九型人格是什么" : "What is the Enneagram"}
        >
          <p className="m-0">
            {isZh
              ? "这里将放置 80-120 字的九型人格直接答案摘要。解释九种人格类型、三个中心（本能/情感/思维）、以及如何用九型理解自己和他人。"
              : "An 80-120 word answer block explaining the nine personality types, three centers, and how to use the Enneagram for self-understanding."}
          </p>
        </PreviewCard>

        {/* Slot 2: Enneagram Definition */}
        <PreviewCard
          slotId="enneagram_definition"
          title={isZh ? "什么是九型人格" : "What is the Enneagram"}
        >
          <div className="space-y-3">
            <p className="m-0">
              {isZh
                ? "定义段：解释九型人格模型是什么，九种类型基于三种核心驱动（本能/情感/思维），以及九型人格与其他人格模型的区别。"
                : "Definition explaining the Enneagram model, its nine types driven by three core motivations, and how it differs from other personality models."}
            </p>
            <ul className="m-0 space-y-2 pl-5 text-sm">
              <li>
                {isZh
                  ? "本能中心（8-9-1）：以身体直觉和行动冲动为核心驱动"
                  : "Instinctive Center (8-9-1): Driven by gut reactions and action impulses"}
              </li>
              <li>
                {isZh
                  ? "情感中心（2-3-4）：以情感认同和自我形象为关注焦点"
                  : "Feeling Center (2-3-4): Focused on emotional identity and self-image"}
              </li>
              <li>
                {isZh
                  ? "思维中心（5-6-7）：以分析、预测和安全需求为核心驱动"
                  : "Thinking Center (5-6-7): Driven by analysis, prediction, and security needs"}
              </li>
            </ul>
          </div>
        </PreviewCard>

        {/* Slot 3: Three Centers */}
        <PreviewCard
          slotId="three_centers"
          title={isZh ? "九型人格三大中心" : "Three Centers of the Enneagram"}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {CENTERS.map((c) => (
              <div
                key={c.key}
                className="rounded-xl border border-[var(--fm-border)] bg-white p-4"
              >
                <div className="flex items-center gap-2">
                  {c.icon}
                  <div>
                    <h3 className="m-0 text-sm font-semibold text-[var(--fm-text)]">
                      {isZh ? c.nameZh : c.nameEn}
                    </h3>
                    <p className="m-0 text-xs text-[var(--fm-text-muted)]">
                      {c.numbers}
                    </p>
                  </div>
                </div>
                <p className="m-0 mt-3 text-xs leading-5 text-[var(--fm-text-muted)]">
                  {c.focus}
                </p>
              </div>
            ))}
          </div>
        </PreviewCard>

        {/* Slot 4: Nine Types Grid */}
        <PreviewCard
          slotId="nine_types_grid"
          title={isZh ? "九型人格类型一览" : "The Nine Enneagram Types"}
        >
          <p className="m-0 mb-4">
            {isZh
              ? "九种人格类型，每种代表一种独特的核心驱动和世界观。类型之间通过箭头和翼型相互连接。"
              : "Nine personality types, each representing a distinct core drive and worldview. Types interconnect through arrows and wings."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PREVIEW_TYPES.map((t) => (
              <div
                key={t.n}
                className="group rounded-xl border border-[var(--fm-border)] bg-white p-4 shadow-[var(--fm-shadow-sm)] transition hover:border-[var(--fm-trust-blue)]"
              >
                <div className="flex items-center gap-2">
                  <TypeNumber n={t.n} />
                  <div>
                    <span className="text-sm font-semibold text-[var(--fm-text)]">
                      {t.name}
                    </span>
                    <span className="ml-1 text-xs text-[var(--fm-text-muted)]">
                      {t.key}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-[var(--fm-text-muted)]">
                  {t.center}
                </div>
                <Link
                  href={`/${locale}/personality/enneagram/type-${t.n}`}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--fm-trust-blue)] transition group-hover:underline"
                >
                  {isZh ? "查看详情" : "View Details"}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </PreviewCard>

        {/* Slot 5: Not a Type Trap */}
        <PreviewCard
          slotId="not_type_trap"
          title={isZh ? "九型人格不是把人定型" : "Enneagram Is Not About Labeling People"}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4">
              <h3 className="m-0 flex items-center gap-1.5 text-sm font-semibold text-[var(--fm-text)]">
                <GitBranch className="h-4 w-4 text-[var(--fm-trust-blue)]" />
                {isZh ? "动态模型" : "Dynamic Model"}
              </h3>
              <p className="m-0 mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">
                {isZh
                  ? "九型不是9个固定盒子。每个类型在压力和安全感下有连接方向（箭头/成长方向），有邻近类型影响（翼型）。你是一个动态的人格系统。"
                  : "Not 9 fixed boxes. Each type has stress/security directions (arrows) and neighboring influences (wings). You are a dynamic personality system."}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--fm-border)] bg-white p-4">
              <h3 className="m-0 flex items-center gap-1.5 text-sm font-semibold text-[var(--fm-text)]">
                <ShieldCheck className="h-4 w-4 text-[var(--fm-trust-blue)]" />
                {isZh ? "认知工具" : "Awareness Tool"}
              </h3>
              <p className="m-0 mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">
                {isZh
                  ? "九型不是告诉你'你是什么人'，而是告诉你'你更容易陷入哪种模式'。自我觉察才是目标，标签只是开始。"
                  : "The Enneagram tells you 'which pattern you tend to fall into', not 'who you are'. Self-awareness is the goal."}
              </p>
            </div>
          </div>
        </PreviewCard>

        {/* Slot 6: Usage Scenarios */}
        <section className="space-y-4" data-slot-id="result_usage_scenarios">
          <PreviewBadge slotId="result_usage_scenarios" />
          <h2 className="m-0 text-2xl font-semibold tracking-normal text-[var(--fm-text)]">
            {isZh ? "如何阅读和使用九型人格" : "How to Read and Use the Enneagram"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ScenarioCard
              icon={<Compass className="h-5 w-5 text-[var(--fm-trust-blue)]" />}
              title={isZh ? "自我觉察" : "Self-Awareness"}
            >
              {isZh
                ? "找出你最容易陷入的自动化反应模式，用九型框架观察自己而不是评判自己。"
                : "Identify your most automatic reactive patterns. Use Enneagram to observe yourself."}
            </ScenarioCard>
            <ScenarioCard
              icon={<GraduationCap className="h-5 w-5 text-[var(--fm-trust-blue)]" />}
              title={isZh ? "成长方向" : "Growth Direction"}
            >
              {isZh
                ? "每个类型有特定的成长方向（integration）和压力方向（disintegration），了解它们帮助你找到平衡。"
                : "Each type has specific growth and stress directions that help you find balance."}
            </ScenarioCard>
            <ScenarioCard
              icon={<Briefcase className="h-5 w-5 text-[var(--fm-trust-blue)]" />}
              title={isZh ? "职场关系" : "Workplace Relations"}
            >
              {isZh
                ? "理解不同人格类型的沟通、领导和冲突应对方式，改善团队协作和跨类型沟通。"
                : "Understand different types' communication, leadership, and conflict styles for better teamwork."}
            </ScenarioCard>
            <ScenarioCard
              icon={<Heart className="h-5 w-5 text-[var(--fm-trust-blue)]" />}
              title={isZh ? "亲密关系" : "Relationships"}
            >
              {isZh
                ? "用九型理解你与另一半、家人或朋友的核心驱动差异，把冲突翻译成需求差异。"
                : "Use Enneagram to understand core drive differences in relationships."}
            </ScenarioCard>
          </div>
        </section>

        {/* Slot 7: Enneagram × MBTI Bridge */}
        <PreviewCard
          slotId="enneagram_mbti_bridge"
          title={isZh ? "九型人格 × MBTI" : "Enneagram × MBTI"}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
                {isZh ? "九型人格" : "Enneagram"}
              </h3>
              <ul className="m-0 space-y-1.5 pl-5 text-sm text-[var(--fm-text-muted)]">
                <li>{isZh ? "描述核心驱动力和逃避模式" : "Describes core motivations and avoidance patterns"}</li>
                <li>{isZh ? "动态模型（箭头、翼型、成长方向）" : "Dynamic model (arrows, wings, growth directions)"}</li>
                <li>{isZh ? "回答'为什么你这样反应'" : "Answers 'why do you react this way'"}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
                MBTI
              </h3>
              <ul className="m-0 space-y-1.5 pl-5 text-sm text-[var(--fm-text-muted)]">
                <li>{isZh ? "描述认知偏好和处理方式" : "Describes cognitive preferences and processing styles"}</li>
                <li>{isZh ? "四组偏好，16 种类型" : "Four preference pairs, 16 types"}</li>
                <li>{isZh ? "回答'你如何接受信息和做决定'" : "Answers 'how do you process info and decide'"}</li>
              </ul>
            </div>
          </div>
          <p className="m-0 mt-4 text-sm leading-6 text-[var(--fm-text-muted)]">
            {isZh
              ? "九型和 MBTI 测量不同维度但高度互补：九型告诉你'为什么'，MBTI 告诉你'怎么做'。同一个 MBTI 类型的人可能有完全不同的九型类型。"
              : "Enneagram and MBTI measure different but complementary dimensions. Same MBTI type can have vastly different Enneagram types."}
          </p>
        </PreviewCard>

        {/* Slot 8: Type Self-Check */}
        <PreviewCard
          slotId="type_self_check"
          title={isZh ? "快速自查：先看哪个类型" : "Quick Check: Which Type to Explore First"}
        >
          <p className="m-0 mb-4">
            {isZh
              ? "读以下描述，选出最像你的那一句。这不是测试，只是帮助你优先阅读的方向。"
              : "Read the descriptions below and pick the one that resonates most."}
          </p>
          <div className="space-y-3">
            {[
              {
                q: isZh ? "我做事有很强的原则感，追求完美和正确" : "Strong sense of principle, pursue correctness and perfection",
                n: 1,
              },
              {
                q: isZh ? "我总是不自觉地去帮助别人，希望通过付出来被需要" : "Naturally help others, want to be needed",
                n: 2,
              },
              {
                q: isZh ? "我很有目标感，重视效率和成功" : "Goal-oriented, value efficiency and success",
                n: 3,
              },
              {
                q: isZh ? "我感受很丰富，觉得别人不太能理解我的独特" : "Rich feelings, feel others don't quite understand my uniqueness",
                n: 4,
              },
              {
                q: isZh ? "我喜欢深度思考和分析，需要时间来理解和消化" : "Love deep thinking and analysis, need time to understand",
                n: 5,
              },
              {
                q: isZh ? "我习惯提前考虑最坏情况，对信任很谨慎" : "Habitually consider worst cases, cautious with trust",
                n: 6,
              },
              {
                q: isZh ? "我追求新奇体验，不喜欢被限制" : "Seek novel experiences, dislike being constrained",
                n: 7,
              },
              {
                q: isZh ? "我说话直来直去，讨厌虚伪和软弱" : "Direct and straightforward, dislike pretense and weakness",
                n: 8,
              },
              {
                q: isZh ? "我习惯妥协和维持和谐，不喜欢冲突" : "Used to compromising and maintaining harmony, dislike conflict",
                n: 9,
              },
            ].map((item) => (
              <div
                key={item.n}
                className="flex items-center justify-between rounded-xl border border-[var(--fm-border)] bg-white px-4 py-3"
              >
                <div className="flex items-center gap-2 text-sm text-[var(--fm-text)]">
                  <TypeNumber n={item.n} />
                  <span>{item.q}</span>
                </div>
                <Link
                  href={`/${locale}/personality/enneagram/type-${item.n}`}
                  className="ml-4 shrink-0 text-sm font-medium text-[var(--fm-trust-blue)] hover:underline"
                >
                  {isZh ? "查看" : "View"} →
                </Link>
              </div>
            ))}
          </div>
        </PreviewCard>

        {/* Slot 9: FAQ Expansion */}
        <PreviewCard
          slotId="faq_expansion"
          title={isZh ? "常见问题（扩展中）" : "FAQ (Expanded)"}
        >
          <p className="m-0">
            {isZh
              ? "现有 FAQ 将保留。未来计划扩展到 7-8 题，新增如'九型和 MBTI 的区别''九型会不会变''Wings/翼型是什么'等常见问题。FAQ 的渲染已有生产组件支持。"
              : "Existing FAQ will be preserved. Planned expansion to 7-8 items including 'Enneagram vs MBTI', 'Does Enneagram change', 'What are Wings'."}
          </p>
        </PreviewCard>

        {/* CTA band */}
        <div
          className="rounded-2xl bg-[var(--fm-surface)] p-6 text-center md:p-8"
          data-slot-id="cta_related_links"
        >
          <h2 className="m-0 text-xl font-semibold text-[var(--fm-text)]">
            {isZh ? "准备好了吗？" : "Ready to Explore?"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--fm-text-muted)]">
            {isZh
              ? "了解九型人格，找到你的核心驱动、逃避模式和成长方向。"
              : "Discover your Enneagram type, core motivations, and growth directions."}
          </p>
          <Link
            href={`/${locale}/personality/enneagram/type-1`}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--fm-cta-orange)] px-8 py-3 text-base font-semibold text-white shadow-[var(--fm-shadow-sm)] transition hover:bg-[var(--fm-cta-orange-strong)]"
          >
            {isZh ? "浏览九型人格类型" : "Browse Enneagram Types"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ===== SIDEBAR ===== */}
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        {/* Slot 10: Method Boundary */}
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
              ? "九型人格公开内容只用于自我认知和结构化复盘，不用于临床诊断、招聘筛选、能力判断或职业/关系决定。"
              : "Enneagram public content is for self-awareness and structured reflection only."}
          </p>
          <ul className="mt-4 space-y-2 pl-5 text-sm leading-6 text-[var(--fm-text-muted)]">
            <li>{isZh ? "临床诊断" : "Clinical Diagnosis"}</li>
            <li>{isZh ? "心理治疗建议" : "Psychological Treatment"}</li>
            <li>{isZh ? "招聘筛选" : "Hiring or Screening"}</li>
            <li>{isZh ? "能力或智力判断" : "Ability or Intelligence Assessment"}</li>
            <li>{isZh ? "职业或伴侣关系决定" : "Career or Relationship Decisions"}</li>
          </ul>
        </section>

        {/* Slot 11: Related Links */}
        <section
          className="rounded-2xl border border-[var(--fm-border)] bg-white p-5 shadow-[var(--fm-shadow-sm)]"
          data-slot-id="cta_related_links"
        >
          <h2 className="m-0 text-base font-semibold text-[var(--fm-text)]">
            {isZh ? "继续浏览" : "Continue Browsing"}
          </h2>
          <div className="mt-4 grid gap-3">
            {[
              { label: isZh ? "九型人格类型一览" : "All Enneagram Types", href: `/${locale}/personality/enneagram#nine-types-grid` },
              { label: isZh ? "类型 1：改革者" : "Type 1: The Reformer", href: `/${locale}/personality/enneagram/type-1` },
              { label: isZh ? "类型 2：助人者" : "Type 2: The Helper", href: `/${locale}/personality/enneagram/type-2` },
              { label: isZh ? "类型 3：成就者" : "Type 3: The Achiever", href: `/${locale}/personality/enneagram/type-3` },
              { label: isZh ? "类型 4：个人主义者" : "Type 4: The Individualist", href: `/${locale}/personality/enneagram/type-4` },
              { label: isZh ? "类型 5：探索者" : "Type 5: The Investigator", href: `/${locale}/personality/enneagram/type-5` },
              { label: isZh ? "MBTI 测试" : "MBTI Test", href: `/${locale}/tests/mbti-personality-test-16-personality-types` },
              { label: isZh ? "大五人格" : "Big Five", href: `/${locale}/personality/big-five` },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center justify-between rounded-xl border border-[var(--fm-border)] px-4 py-3 text-sm font-medium text-[var(--fm-text)] transition hover:border-[var(--fm-trust-blue)] hover:text-[var(--fm-trust-blue)]"
              >
                <span>{label}</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
