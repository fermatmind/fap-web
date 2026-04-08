import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

const SECTION_COPY = {
  en: {
    kicker: "Methodology, privacy, and boundaries",
    title: "Why users can trust this product",
    subtitle:
      "FermatMind is designed for structured self-understanding and decision support. It does not claim clinical diagnosis or deterministic life predictions.",
    cards: [
      {
        title: "Structured methodology",
        body: "Results are organized from facet-level readings to scenario interpretation, so users can follow how conclusions are formed.",
      },
      {
        title: "Transparent interpretation scope",
        body: "Scores are interpreted in context and used as decision support. They are not positioned as absolute truth.",
      },
      {
        title: "Privacy and policy visibility",
        body: "Privacy policy, terms, support channels, and order recovery paths are available as explicit product surfaces.",
        href: "/privacy",
        linkLabel: "View privacy policy",
      },
      {
        title: "Real-world scenario relevance",
        body: "The product focuses on practical decisions including learning direction, career planning, and collaboration style.",
      },
    ],
    boundariesTitle: "Interpretation boundaries",
    boundaries: [
      "Not a clinical diagnosis tool.",
      "No guaranteed outcomes or deterministic destiny claims.",
      "A score never defines a whole person.",
    ],
    primaryCta: "Start free assessment",
    secondaryCta: "Read help center",
  },
  zh: {
    kicker: "方法、隐私与边界",
    title: "为什么值得信任",
    subtitle: "FermatMind 用于结构化自我理解与决策支持，不提供临床诊断，也不承诺确定性人生结论。",
    cards: [
      {
        title: "结构化方法",
        body: "从分面读数到场景解释，结果链路可读、可讨论，便于理解结论如何形成。",
      },
      {
        title: "解释范围透明",
        body: "结果放在语境中解释，用于支持判断，不被包装为绝对真理。",
      },
      {
        title: "隐私与规则可见",
        body: "隐私政策、条款、支持渠道和订单恢复入口都在产品中明确可查。",
        href: "/privacy",
        linkLabel: "查看隐私政策",
      },
      {
        title: "贴近真实决策场景",
        body: "重点服务学习方向、职业规划与协作风格等实际问题，而非抽象概念展示。",
      },
    ],
    boundariesTitle: "解释边界",
    boundaries: ["不用于临床诊断。", "不承诺结果必然发生。", "任何分数都不等于“定义一个人”。"],
    primaryCta: "开始免费测评",
    secondaryCta: "查看帮助中心",
  },
} as const;

export function SocialProofSection({ locale }: { locale: Locale }) {
  const copy = SECTION_COPY[locale];
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section data-testid="home-social-proof-section" className="fm-home-archive">
      <Container className="fm-home-archive-shell max-w-[84rem] px-5 md:px-8 lg:px-10">
        <div className="fm-home-archive-head">
          <p className="fm-home-archive-kicker m-0">{copy.kicker}</p>
          <h2 className="fm-home-archive-title m-0">{copy.title}</h2>
          <p className="fm-home-archive-subtitle m-0">{copy.subtitle}</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-[60rem] gap-4 md:grid-cols-2">
          {copy.cards.map((card) => (
            <article key={card.title} className="rounded-[10px] border border-[#243447]/25 bg-white/95 p-5 shadow-[0_10px_30px_rgba(13,24,39,0.08)]">
              <h3 className="m-0 text-[1.18rem] font-semibold tracking-[-0.02em] text-slate-900">{card.title}</h3>
              <p className="m-0 mt-2 text-[0.95rem] leading-7 text-slate-700">{card.body}</p>
              {"href" in card ? (
                <Link
                  href={withLocale(card.href)}
                  className="mt-3 inline-flex text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
                >
                  {card.linkLabel}
                </Link>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mx-auto mt-6 max-w-[60rem] rounded-[10px] border border-white/15 bg-[#0f1722] px-5 py-5 text-slate-200 shadow-[0_24px_48px_rgba(10,17,27,0.24)]">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-white/62">{copy.boundariesTitle}</p>
          <ul className="m-0 mt-3 list-none space-y-2 p-0 text-[0.95rem] leading-7 text-slate-200/88">
            {copy.boundaries.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-[#9db5cd]" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-10 flex max-w-[60rem] flex-wrap items-center justify-center gap-3">
          <Link
            href={withLocale("/tests/mbti-personality-test-16-personality-types")}
            className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[#101d2a] bg-[#101d2a] px-6 text-sm font-semibold tracking-[0.04em] text-white transition hover:bg-[#18293b]"
          >
            {copy.primaryCta}
          </Link>
          <Link
            href={withLocale("/help")}
            className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[#101d2a]/25 bg-white/88 px-6 text-sm font-semibold tracking-[0.04em] text-slate-900 transition hover:bg-white"
          >
            {copy.secondaryCta}
          </Link>
        </div>
      </Container>
    </section>
  );
}
