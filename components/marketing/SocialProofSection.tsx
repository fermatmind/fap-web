import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { EVIDENCE_LOGS, SCENARIO_VALIDATIONS } from "@/lib/marketing/socialProof";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

const SECTION_COPY = {
  en: {
    kicker: "Scenario Validation",
    title: "Scenario Validation",
    subtitle:
      "These results do not stop at personal reading. They enter real judgment chains across coaching, role-fit, retrospectives, and research conversations.",
    logsTitle: "Evidence Logs",
    logsSubtitle: "Real feedback written like operating notes rather than marketing applause.",
    rating: "4.8 / 5",
    ratingLabel: "summary rating",
    scenarioLabel: "Scenario",
    roleLabel: "Role",
    sourceLabel: "Source module",
  },
  zh: {
    kicker: "场景验证",
    title: "场景验证",
    subtitle: "这些结果不是停留在个人阅读，而是进入真实判断链路。",
    logsTitle: "证据日志",
    logsSubtitle: "保留真实评价核心语义，但表达成更接近系统运行记录的证据卡。",
    rating: "4.8 / 5",
    ratingLabel: "summary rating",
    scenarioLabel: "使用场景",
    roleLabel: "角色身份",
    sourceLabel: "来源模块",
  },
} as const;

export function SocialProofSection({ locale }: { locale: Locale }) {
  const withLocale = (path: string) => localizedPath(path, locale);
  const copy = SECTION_COPY[locale];

  return (
    <section data-testid="home-social-proof-section" className="fm-home-social-proof py-[var(--fm-section-y-lg)]">
      <Container className="space-y-[var(--fm-space-10)]">
        <div className="mx-auto max-w-[48rem] space-y-3 text-center">
          <p className="fm-home-section-kicker m-0">{copy.kicker}</p>
          <h2 className="m-0 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.045em] text-[#0b0f14]">
            {copy.title}
          </h2>
          <p className="m-0 text-[0.98rem] leading-7 text-[#53606e] md:text-[1.04rem]">{copy.subtitle}</p>
        </div>

        <div className="space-y-4">
          <p className="m-0 max-w-[44rem] text-sm leading-7 text-[#53606e]">
            {locale === "zh"
              ? "以下六类场景展示的是系统被真实部署的方式，而不是泛泛的“谁在推荐”。"
              : "These six validation contexts describe where the system is actually deployed, not just who recommends it."}
          </p>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {SCENARIO_VALIDATIONS.map((item) => (
              <article key={item.id} className="fm-home-scenario-chip">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="m-0 text-[1rem] font-semibold tracking-[-0.02em] text-[#0b0f14]">
                      {locale === "zh" ? item.label.zh : item.label.en}
                    </p>
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#717b88]">
                      {item.code}
                    </span>
                  </div>
                  <p className="m-0 text-sm leading-7 text-[#56626e]">
                    {locale === "zh" ? item.detail.zh : item.detail.en}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="m-0 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#0b0f14]">{copy.logsTitle}</h3>
            <p className="m-0 max-w-[44rem] text-sm leading-7 text-[#53606e]">{copy.logsSubtitle}</p>
          </div>

          <div className="grid gap-[var(--fm-gap-md)] md:grid-cols-2">
            {EVIDENCE_LOGS.map((item, index) => (
              <article key={item.id} className="fm-home-testimonial-card fm-home-evidence-log">
                <div className="flex h-full flex-col gap-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-3">
                      <span className="rounded-full border border-[#d3d8df] bg-[#f4f6f8] px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#5f6a77]">
                        {copy.rating}
                      </span>
                      <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#7a8593]">
                        LOG 0{index + 1}
                      </span>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-[#00ff41]" />
                  </div>

                  <p className="m-0 text-[1rem] leading-8 text-[#111821]">
                    “{locale === "zh" ? item.quote.zh : item.quote.en}”
                  </p>

                  <div className="mt-auto grid gap-3 border-t border-[#d8dde4] pt-4">
                    <div className="grid gap-1">
                      <p className="m-0 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#6d7785]">
                        {copy.scenarioLabel}
                      </p>
                      <p className="m-0 text-sm font-medium text-[#0b0f14]">{locale === "zh" ? item.scenario.zh : item.scenario.en}</p>
                    </div>

                    <div className="grid gap-1">
                      <p className="m-0 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#6d7785]">{copy.roleLabel}</p>
                      <p className="m-0 text-sm font-medium text-[#0b0f14]">
                        {item.author}
                        <span className="mx-2 text-[#a2acb8]">/</span>
                        {locale === "zh" ? item.role.zh : item.role.en}
                      </p>
                    </div>

                    <div className="grid gap-1">
                      <p className="m-0 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#6d7785]">
                        {copy.sourceLabel}
                      </p>
                      <Link
                        href={withLocale(`/tests/${item.testSlug}`)}
                        className="inline-flex text-sm font-semibold text-[#0b0f14] hover:text-[#15253d]"
                      >
                        {locale === "zh" ? item.testLabel.zh : item.testLabel.en}
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
