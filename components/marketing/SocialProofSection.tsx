import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { EVIDENCE_LOGS, SCENARIO_VALIDATIONS } from "@/lib/marketing/socialProof";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

function EvidenceFacetPreview({ active }: { active: number[] }) {
  return (
    <div className="fm-home-archive-preview" aria-hidden>
      {Array.from({ length: 30 }, (_, index) => (
        <span key={index} className={`fm-home-archive-preview-node${active.includes(index) ? " is-active" : ""}`} />
      ))}
    </div>
  );
}

const SECTION_COPY = {
  en: {
    kicker: "EVIDENCE REGISTRY / LIVE DEPLOYMENT TRACE",
    title: "Scenario Validation",
    subtitle:
      "These outputs do not stop at personal reading. They enter real judgment chains, then settle into reviewed deployment traces.",
    boardTitle: "Deployment mainboard",
    boardLead:
      "This is not a testimonial carousel. It is a structured board showing where the system is used, what judgment interface it enters, and which value gets verified.",
    logsTitle: "Audit archive",
    logsSubtitle: "Each log behaves like a registry entry rather than an emotional endorsement card.",
    dateLabel: "DATE",
    statusLabel: "STATUS",
    scoreLabel: "VERIFICATION_SCORE",
    roleLabel: "USER_ROLE",
    scenarioLabel: "SCENARIO",
    summaryLabel: "SUMMARY",
    traceLabel: "TRACE",
    sourceLabel: "MODULE",
    valueLabel: "VERIFIED_VALUE",
    slotLabel: "SLOT",
    closure: "From Noise to Clarity.",
    closureSub: "Turn cognitive noise into more reliable judgment.",
  },
  zh: {
    kicker: "EVIDENCE REGISTRY / LIVE DEPLOYMENT TRACE",
    title: "场景验证",
    subtitle: "这些结果不是停留在个人阅读，而是进入真实判断链路，并沉降为可复查的部署记录。",
    boardTitle: "部署主板",
    boardLead: "这里不是用户好评轮播，而是一块结构化证据主板：展示系统被部署到哪里、进入什么判断接口、验证了什么价值。",
    logsTitle: "审计档案区",
    logsSubtitle: "每条记录都更像系统归档条目，而不是情绪化背书卡片。",
    dateLabel: "DATE",
    statusLabel: "STATUS",
    scoreLabel: "VERIFICATION_SCORE",
    roleLabel: "USER_ROLE",
    scenarioLabel: "SCENARIO",
    summaryLabel: "SUMMARY",
    traceLabel: "TRACE",
    sourceLabel: "MODULE",
    valueLabel: "VERIFIED_VALUE",
    slotLabel: "SLOT",
    closure: "From Noise to Clarity.",
    closureSub: "将认知噪声转化为更清晰的判断依据。",
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

        <div className="fm-home-archive-board">
          <div className="fm-home-archive-board-head">
            <div>
              <p className="fm-home-archive-board-label m-0">{copy.boardTitle}</p>
              <p className="fm-home-archive-board-copy m-0">{copy.boardLead}</p>
            </div>
            <div className="fm-home-archive-board-meta">
              <span>BOARD_STATUS: SETTLED</span>
              <span>TRACE_MODE: VERIFIED</span>
            </div>
          </div>

          <div className="fm-home-archive-board-grid">
            {SCENARIO_VALIDATIONS.map((item) => (
              <article key={item.id} className="fm-home-archive-slot">
                <div className="fm-home-archive-slot-top">
                  <div>
                    <span className="fm-home-archive-slot-code">{`${item.slotCode} / ${item.code}`}</span>
                    <h3 className="fm-home-archive-slot-title m-0">{locale === "zh" ? item.label.zh : item.label.en}</h3>
                  </div>
                  <span className="fm-home-archive-slot-status">{item.status}</span>
                </div>

                <p className="fm-home-archive-slot-summary m-0">{locale === "zh" ? item.summary.zh : item.summary.en}</p>

                <div className="fm-home-archive-slot-detailgrid">
                  <div>
                    <span className="fm-home-archive-slot-label">{copy.valueLabel}</span>
                    <p className="m-0">{locale === "zh" ? item.output.zh : item.output.en}</p>
                  </div>
                  <div>
                    <span className="fm-home-archive-slot-label">{copy.slotLabel}</span>
                    <p className="m-0">{locale === "zh" ? item.layer.zh : item.layer.en}</p>
                  </div>
                  <div>
                    <span className="fm-home-archive-slot-label">{locale === "zh" ? "INTERFACE" : "INTERFACE"}</span>
                    <p className="m-0">{locale === "zh" ? item.source.zh : item.source.en}</p>
                  </div>
                </div>

                <div className="fm-home-archive-slot-foot">
                  <span className="fm-home-archive-slot-protocol">{item.protocol}</span>
                  <div className="fm-home-archive-slot-signal" aria-hidden>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="fm-home-archive-logs">
          <div className="fm-home-archive-logs-head">
            <h3 className="m-0">{copy.logsTitle}</h3>
            <p className="m-0">{copy.logsSubtitle}</p>
          </div>

          <div className="fm-home-archive-log-grid">
            {EVIDENCE_LOGS.map((item) => (
              <article key={item.id} className="fm-home-archive-log">
                <div className="fm-home-archive-log-head">
                  <div className="fm-home-archive-log-meta">
                    <span>{item.auditId}</span>
                    <span>{`${copy.slotLabel}: ${item.slotCode}`}</span>
                    <span>{`${copy.traceLabel}: ${locale === "zh" ? item.useCase.zh : item.useCase.en}`}</span>
                  </div>
                  <EvidenceFacetPreview active={item.facetPreview} />
                </div>

                <div className="fm-home-archive-log-body">
                  <div className="fm-home-archive-log-line">
                    <span className="fm-home-archive-log-label">{copy.dateLabel}</span>
                    <span className="fm-home-archive-log-value">{item.date}</span>
                  </div>
                  <div className="fm-home-archive-log-line">
                    <span className="fm-home-archive-log-label">{copy.scoreLabel}</span>
                    <span className="fm-home-archive-log-value">{item.verificationScore}</span>
                  </div>
                  <div className="fm-home-archive-log-line">
                    <span className="fm-home-archive-log-label">{copy.statusLabel}</span>
                    <span className="fm-home-archive-log-value">VERIFIED</span>
                  </div>
                </div>

                <div className="fm-home-archive-log-summary">
                  <span className="fm-home-archive-log-label">{copy.summaryLabel}</span>
                  <p className="fm-home-archive-log-quote m-0">{locale === "zh" ? item.quote.zh : item.quote.en}</p>
                </div>

                <div className="fm-home-archive-log-table">
                  <div>
                    <span className="fm-home-archive-log-label">{copy.roleLabel}</span>
                    <p className="m-0">{locale === "zh" ? item.role.zh : item.role.en}</p>
                  </div>
                  <div>
                    <span className="fm-home-archive-log-label">{copy.scenarioLabel}</span>
                    <p className="m-0">{locale === "zh" ? item.scenario.zh : item.scenario.en}</p>
                  </div>
                  <div>
                    <span className="fm-home-archive-log-label">{copy.sourceLabel}</span>
                    <Link href={withLocale(`/tests/${item.testSlug}`)} className="fm-home-archive-log-link">
                      {locale === "zh" ? item.testLabel.zh : item.testLabel.en}
                    </Link>
                  </div>
                  <div className="fm-home-archive-log-span">
                    <span className="fm-home-archive-log-label">{copy.valueLabel}</span>
                    <p className="m-0">{locale === "zh" ? item.verifiedValue.zh : item.verifiedValue.en}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="fm-home-archive-closure">
          <p className="fm-home-archive-closure-title m-0">{copy.closure}</p>
          <p className="fm-home-archive-closure-copy m-0">{copy.closureSub}</p>
        </div>
      </Container>
    </section>
  );
}
