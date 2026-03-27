import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { EVIDENCE_LOGS, SCENARIO_VALIDATIONS } from "@/lib/marketing/socialProof";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

function EvidenceFacetPreview({ active }: { active: number[] }) {
  return (
    <div className="fm-home-evidence-preview" aria-hidden>
      {Array.from({ length: 30 }, (_, index) => (
        <span key={index} className={`fm-home-evidence-preview-node${active.includes(index) ? " is-active" : ""}`} />
      ))}
    </div>
  );
}

const SECTION_COPY = {
  en: {
    kicker: "Scenario Validation",
    title: "Scenario Validation",
    subtitle:
      "These results do not stop at personal reading. They enter real judgment chains across coaching, role-fit, retrospectives, and research conversations.",
    rackLabel: "DEPLOYMENT / VALIDATION",
    rackTitle: "Academic model, industrial execution.",
    rackLead:
      "Instead of stacking media logos, the system exposes where the protocol is actually deployed and what kind of judgment output it enters.",
    rackMetaLeft: "MODEL_SOURCE: PKU / THU DOCTORAL RESEARCH",
    rackMetaRight: "EXECUTION_LAYER: INDUSTRIAL_PRECISION",
    rackTicker:
      "[SYSTEM] SYNCING_THU_MODEL_REF_V3.1... OK // [SYSTEM] CALIBRATING_NORM_REF_SET_100K... ACTIVE // [SYSTEM] EXECUTING_DECISION_MAPPING_PROTOCOL... READY //",
    logsTitle: "Evidence Registry",
    logsSubtitle: "Each record is stored like an audited operating note instead of a soft testimonial card.",
    scoreLabel: "VERIFICATION_SCORE",
    slotLabel: "SLOT",
    useCaseLabel: "Use case",
    roleLabel: "User role",
    sourceLabel: "Source module",
    validationLayerLabel: "Execution layer",
    validationInterfaceLabel: "Judgment interface",
    outputLabel: "Output",
    signalLabel: "Signal channel",
  },
  zh: {
    kicker: "场景验证",
    title: "场景验证",
    subtitle: "这些结果不是停留在个人阅读，而是进入真实判断链路。",
    rackLabel: "部署 / 校验",
    rackTitle: "学术底模，工业执行。",
    rackLead: "这里不靠媒体 Logo 建立信任，而是直接展示协议被部署到什么场景，以及它输出什么判断接口。",
    rackMetaLeft: "MODEL_SOURCE: PKU / THU DOCTORAL RESEARCH",
    rackMetaRight: "EXECUTION_LAYER: INDUSTRIAL_PRECISION",
    rackTicker:
      "[SYSTEM] SYNCING_THU_MODEL_REF_V3.1... OK // [SYSTEM] CALIBRATING_NORM_REF_SET_100K... ACTIVE // [SYSTEM] EXECUTING_DECISION_MAPPING_PROTOCOL... READY //",
    logsTitle: "证据库",
    logsSubtitle: "每条记录都按系统审计日志存档，而不是常规的用户好评卡。",
    scoreLabel: "VERIFICATION_SCORE",
    slotLabel: "SLOT",
    useCaseLabel: "使用场景",
    roleLabel: "用户身份",
    sourceLabel: "来源模块",
    validationLayerLabel: "执行层",
    validationInterfaceLabel: "判断接口",
    outputLabel: "输出接口",
    signalLabel: "信号通道",
  },
} as const;

export function SocialProofSection({ locale }: { locale: Locale }) {
  const withLocale = (path: string) => localizedPath(path, locale);
  const copy = SECTION_COPY[locale];

  return (
    <section data-testid="home-social-proof-section" className="fm-home-social-proof py-[var(--fm-section-y-lg)]">
      <Container className="relative z-10 space-y-[var(--fm-space-10)]">
        <div className="mx-auto max-w-[48rem] space-y-3 text-center">
          <p className="fm-home-section-kicker m-0">{copy.kicker}</p>
          <h2 className="m-0 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.045em] text-[#0b0f14]">
            {copy.title}
          </h2>
          <p className="m-0 text-[0.98rem] leading-7 text-[#53606e] md:text-[1.04rem]">{copy.subtitle}</p>
        </div>

        <div className="space-y-4">
          <div className="fm-home-validation-rack">
            <div className="fm-home-validation-rack-head">
              <div className="space-y-3">
                <p className="fm-home-section-kicker m-0">{copy.rackLabel}</p>
                <h3 className="m-0 text-[1.45rem] font-semibold tracking-[-0.03em] text-[#f2f2f7] md:text-[1.7rem]">
                  {copy.rackTitle}
                </h3>
                <p className="m-0 max-w-[46rem] text-sm leading-7 text-[#adb6c2] md:text-[0.98rem]">{copy.rackLead}</p>
              </div>

              <div className="fm-home-validation-rack-meta">
                <span>{copy.rackMetaLeft}</span>
                <span>{copy.rackMetaRight}</span>
              </div>
            </div>

            <div className="fm-home-validation-rack-grid">
              {SCENARIO_VALIDATIONS.map((item) => (
                <article key={item.id} className="fm-home-scenario-chip">
                  <div className="space-y-4">
                    <div className="fm-home-scenario-chip-head">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="fm-home-scenario-slot-code">{item.slotCode}</span>
                          <p className="m-0 text-[1rem] font-semibold tracking-[-0.02em] text-[#f2f2f7]">
                            {locale === "zh" ? item.label.zh : item.label.en}
                          </p>
                        </div>
                        <p className="m-0 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-[#00ff41] opacity-90">
                          {item.protocol}
                        </p>
                      </div>
                      <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#758091]">
                        {item.code}
                      </span>
                    </div>

                    <p className="m-0 text-sm leading-7 text-[#b3bcc7]">
                      {locale === "zh" ? item.detail.zh : item.detail.en}
                    </p>

                    <div className="fm-home-validation-slot-grid">
                      <div className="grid gap-1">
                        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#758091]">
                          {copy.outputLabel}
                        </span>
                        <span className="text-sm font-medium text-[#f2f2f7]">
                          {locale === "zh" ? item.output.zh : item.output.en}
                        </span>
                      </div>

                      <div className="grid gap-1">
                        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#758091]">
                          {copy.validationLayerLabel}
                        </span>
                        <span className="text-sm font-medium text-[#f2f2f7]">
                          {locale === "zh" ? item.layer.zh : item.layer.en}
                        </span>
                      </div>

                      <div className="grid gap-1">
                        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#758091]">
                          {copy.validationInterfaceLabel}
                        </span>
                        <span className="text-sm font-medium text-[#f2f2f7]">
                          {locale === "zh" ? item.source.zh : item.source.en}
                        </span>
                      </div>
                    </div>

                    <div className="fm-home-validation-slot-footer">
                      <div className="grid gap-1">
                        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#758091]">
                          {copy.slotLabel}
                        </span>
                        <span className="text-sm font-medium text-[#f2f2f7]">{item.slotCode}</span>
                      </div>

                      <div className="fm-home-validation-slot-signal" aria-hidden>
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="fm-home-validation-rack-log" aria-hidden>
              <div className="fm-home-validation-rack-log-track">
                <span>{copy.rackTicker}</span>
                <span>{copy.rackTicker}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="m-0 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#0b0f14]">{copy.logsTitle}</h3>
            <p className="m-0 max-w-[44rem] text-sm leading-7 text-[#53606e]">{copy.logsSubtitle}</p>
          </div>

          <div className="fm-home-evidence-registry">
            <div className="grid gap-[1px] bg-[#d4dae1] md:grid-cols-2">
            {EVIDENCE_LOGS.map((item) => (
              <article key={item.id} className="fm-home-evidence-entry">
                <div className="flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#7f8a99]">
                          LOG_ID: {item.auditId}
                        </span>
                        <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#7f8a99]">
                          {copy.slotLabel}: {item.slotCode}
                        </span>
                      </div>

                      <p className="fm-home-evidence-signal-label m-0">{locale === "zh" ? item.signalLabel.zh : item.signalLabel.en}</p>

                      <div className="grid gap-2">
                        <p className="m-0 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#7f8a99]">
                          {copy.scoreLabel}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="fm-home-evidence-score-bars" aria-hidden>
                            <span className="is-active" />
                            <span className="is-active" />
                            <span className="is-active" />
                            <span className="is-active" />
                            <span className="is-active" />
                          </div>
                          <span className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[#f2f2f7]">
                            {item.verificationScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    <EvidenceFacetPreview active={item.facetPreview} />
                  </div>

                  <p className="m-0 text-[1rem] leading-8 text-[#f2f2f7]">
                    “{locale === "zh" ? item.quote.zh : item.quote.en}”
                  </p>

                  <div className="mt-auto fm-home-evidence-meta-grid">
                    <div className="grid gap-1">
                      <p className="m-0 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#7f8a99]">
                        {copy.useCaseLabel}
                      </p>
                      <p className="m-0 text-sm font-medium text-[#f2f2f7]">[{locale === "zh" ? item.useCase.zh : item.useCase.en}]</p>
                    </div>

                    <div className="grid gap-1">
                      <p className="m-0 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#7f8a99]">{copy.roleLabel}</p>
                      <p className="m-0 text-sm font-medium text-[#f2f2f7]">[{locale === "zh" ? item.role.zh : item.role.en}]</p>
                    </div>

                    <div className="grid gap-1">
                      <p className="m-0 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#7f8a99]">
                        {copy.sourceLabel}
                      </p>
                      <Link
                        href={withLocale(`/tests/${item.testSlug}`)}
                        className="inline-flex text-sm font-semibold text-[#f2f2f7] hover:text-[#b9ffc9]"
                      >
                        [{locale === "zh" ? item.testLabel.zh : item.testLabel.en}]
                      </Link>
                    </div>
                  </div>

                  <div className="fm-home-evidence-scanline" aria-hidden />
                </div>
              </article>
            ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
