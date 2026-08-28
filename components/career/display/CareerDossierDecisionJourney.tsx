import Link from "next/link";
import visual from "@/components/career/display/CareerProductionVisual.module.css";
import type {
  CareerPublishedOutlookTransitions,
  CareerPublishedProgression,
  CareerPublishedSourceLink,
  CareerPublishedWorkRisk,
} from "@/lib/career/publishedComponentContract";

type Locale = "en" | "zh";

function apiField(path: string) {
  return { "data-career-api-field": path };
}

function Header({
  heading,
  answer,
  componentId,
  sectionLabel,
  sectionLabelId,
}: {
  heading: string;
  answer: string;
  componentId: string;
  sectionLabel: string;
  sectionLabelId: string;
}) {
  return (
    <header className={visual.fitCenterHero}>
      <div className={visual.fitCenterTitleRow}>
        <p id={sectionLabelId}>{sectionLabel}</p>
        <span aria-hidden="true" />
      </div>
      <h2 className={visual.fitCenterTitle} {...apiField(`${componentId}.heading`)}>{heading}</h2>
      <p className={visual.fitCenterAnswer} {...apiField(`${componentId}.direct_answer`)}>{answer}</p>
    </header>
  );
}

function Sources({ links, componentId }: { links: CareerPublishedSourceLink[]; componentId: string }) {
  return (
    <footer className="border-t border-[#E5E9F2] bg-[#F6F8FC] px-6 py-5 sm:px-8">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-[#2C3E8C]" data-career-api-list={`${componentId}.source_links`}>
        {links.map((source, index) => (
          <a key={source.id} href={source.href} target="_blank" rel="noreferrer" title={source.scope} {...apiField(`${componentId}.source_links[${index}].label`)}>{source.label}</a>
        ))}
      </div>
    </footer>
  );
}

export function supportsCareerWorkRisk(value: unknown): value is CareerPublishedWorkRisk {
  const candidate = value as Partial<CareerPublishedWorkRisk> | null;
  return candidate?.schema_version === "career.work_risk.v1" && Array.isArray(candidate.risks) && candidate.risks.length === 6;
}

export function supportsCareerProgression(value: unknown): value is CareerPublishedProgression {
  const candidate = value as Partial<CareerPublishedProgression> | null;
  return candidate?.schema_version === "career.career_progression.v1" && Array.isArray(candidate.tracks) && candidate.tracks.length === 3;
}

export function supportsCareerOutlookTransitions(value: unknown): value is CareerPublishedOutlookTransitions {
  const candidate = value as Partial<CareerPublishedOutlookTransitions> | null;
  return candidate?.schema_version === "career.outlook_transitions.v1" && Array.isArray(candidate.outlook_evidence) && Array.isArray(candidate.transitions);
}

type DecisionJourneyProps<T> = {
  value: T;
  locale: Locale;
  sectionLabel: string;
  sectionLabelId: string;
};

export function CareerDossierWorkRisk({ value, locale, sectionLabel, sectionLabelId }: DecisionJourneyProps<CareerPublishedWorkRisk>) {
  const isZh = locale === "zh";
  const sources = new Map(value.source_links.map((source) => [source.id, source]));
  return (
    <div className="min-w-0 bg-white" data-testid="career-dossier-work-risk" data-career-api-component="career_risk_cards">
      <Header heading={value.heading} answer={value.direct_answer} componentId="career_risk_cards" sectionLabel={sectionLabel} sectionLabelId={sectionLabelId} />
      <div className="px-6 py-7 sm:px-8">
        <p className="m-0 text-sm leading-7 text-[#5B6678]" {...apiField("career_risk_cards.evidence_scope")}>{value.evidence_scope}</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2" data-career-api-list="career_risk_cards.risks">
          {value.risks.map((risk, index) => (
            <article key={risk.id} className="rounded-xl border border-[#DCE3F0] bg-[#F8FAFD] p-5">
              <div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E9EEFB] text-xs font-extrabold text-[#2C3E8C]">{String(index + 1).padStart(2, "0")}</span><h3 className="m-0 text-base font-bold text-[#172A60]" {...apiField(`career_risk_cards.risks[${index}].title`)}>{risk.title}</h3></div>
              {[
                [isZh ? "典型场景" : "Typical scenario", risk.scenario, "scenario"],
                [isZh ? "主要岗位" : "Roles most affected", risk.affected_roles, "affected_roles"],
                [isZh ? "可能后果" : "Possible consequence", risk.consequence, "consequence"],
                [isZh ? "降低风险" : "How to reduce risk", risk.mitigation, "mitigation"],
              ].map(([label, text, field]) => <p key={field} className="m-0 mt-3 text-sm leading-6 text-[#465066]"><strong className="text-[#26375F]">{label}：</strong><span {...apiField(`career_risk_cards.risks[${index}].${field}`)}>{text}</span></p>)}
              <p className="m-0 mt-3 text-xs text-[#657087]">{isZh ? "依据" : "Evidence"}：{risk.evidence_refs.map((id) => sources.get(id)?.label ?? id).join(" · ")}</p>
            </article>
          ))}
        </div>
        <aside className="mt-5 rounded-xl border-l-4 border-[#E8920C] bg-[#FFF6E9] px-5 py-4 text-sm leading-7 text-[#5A4930]" {...apiField("career_risk_cards.boundary")}>{value.boundary}</aside>
        <div className="mt-5 flex flex-wrap gap-3">{value.context_links.map((link) => <a key={link.href} href={link.href} className="font-semibold text-[#2C3E8C]">{link.label} →</a>)}</div>
      </div>
      <Sources links={value.source_links} componentId="career_risk_cards" />
    </div>
  );
}

export function CareerDossierProgression({ value, locale, sectionLabel, sectionLabelId }: DecisionJourneyProps<CareerPublishedProgression>) {
  const isZh = locale === "zh";
  return (
    <div className="min-w-0 bg-white" data-testid="career-dossier-progression" data-career-api-component="career_path_block">
      <Header heading={value.heading} answer={value.direct_answer} componentId="career_path_block" sectionLabel={sectionLabel} sectionLabelId={sectionLabelId} />
      <div className="px-6 py-7 sm:px-8">
        <aside className="grid gap-3 rounded-xl border border-[#DCE3F0] bg-[#F3F6FC] p-5 md:grid-cols-[180px_1fr]">
          <strong className="text-[#2C3E8C]" {...apiField("career_path_block.locale_requirements.jurisdiction")}>{value.locale_requirements.jurisdiction}</strong>
          <div><p className="m-0 text-sm leading-6 text-[#465066]" {...apiField("career_path_block.locale_requirements.summary")}>{value.locale_requirements.summary}</p><p className="m-0 mt-2 text-sm leading-6 text-[#465066]" {...apiField("career_path_block.locale_requirements.credential_boundary")}>{value.locale_requirements.credential_boundary}</p></div>
        </aside>
        <div className="mt-7 space-y-7" data-career-api-list="career_path_block.tracks">
          {value.tracks.map((track, trackIndex) => (
            <section key={track.id} aria-labelledby={`career-track-${track.id}`}>
              <h3 id={`career-track-${track.id}`} className="m-0 text-xl font-bold text-[#172A60]" {...apiField(`career_path_block.tracks[${trackIndex}].title`)}>{track.title}</h3>
              <div className="mt-4 grid gap-3 lg:grid-cols-4">
                {track.stages.map((stage, stageIndex) => (
                  <article key={stage.role} className="relative rounded-xl border border-[#DCE3F0] bg-[#F8FAFD] p-4 pt-10">
                    <span className="absolute left-4 top-3 text-xs font-extrabold text-[#0E9F94]">{String(stageIndex + 1).padStart(2, "0")}</span>
                    <h4 className="m-0 text-base font-bold text-[#243B7A]" {...apiField(`career_path_block.tracks[${trackIndex}].stages[${stageIndex}].role`)}>{stage.role}</h4>
                    <p className="m-0 mt-3 text-sm leading-6 text-[#465066]"><strong>{isZh ? "典型职责" : "Typical scope"}：</strong>{stage.responsibility}</p>
                    <p className="m-0 mt-3 text-sm leading-6 text-[#465066]"><strong>{isZh ? "晋升证据" : "Readiness evidence"}：</strong>{stage.readiness_evidence}</p>
                    <p className="m-0 mt-3 text-sm leading-6 text-[#465066]"><strong>{isZh ? "资格边界" : "Credential boundary"}：</strong>{stage.credentials}</p>
                    <p className="m-0 mt-3 text-sm leading-6 text-[#465066]"><strong>{isZh ? "下一步" : "Next moves"}：</strong>{stage.next_moves}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
        <section className="mt-8 border-t border-[#E5E9F2] pt-7" aria-labelledby="career-competence-ladder-title">
          <h3 id="career-competence-ladder-title" className="m-0 text-xl font-bold text-[#172A60]">{isZh ? "能力阶梯：晋升看什么证据？" : "Capability ladder: what demonstrates readiness?"}</h3>
          <ol className="mt-4 grid list-none gap-3 p-0 md:grid-cols-4" data-career-api-list="career_path_block.competence_ladder">{value.competence_ladder.map((item, index) => <li key={item.stage} className="rounded-xl border-t-4 border-[#0E9F94] bg-[#F3F6FC] p-4"><span className="text-xs font-extrabold text-[#0E9F94]">{String(index + 1).padStart(2, "0")}</span><h4 className="m-0 mt-2 text-sm font-bold text-[#243B7A]">{item.stage}</h4><p className="m-0 mt-2 text-sm leading-6 text-[#5B6678]">{item.description}</p></li>)}</ol>
        </section>
        <aside className="mt-5 rounded-xl border-l-4 border-[#E8920C] bg-[#FFF6E9] px-5 py-4 text-sm leading-7 text-[#5A4930]" {...apiField("career_path_block.boundary")}>{value.boundary}</aside>
      </div>
      <Sources links={value.source_links} componentId="career_path_block" />
    </div>
  );
}

export function CareerDossierOutlookTransitions({ value, locale, sectionLabel, sectionLabelId }: DecisionJourneyProps<CareerPublishedOutlookTransitions>) {
  const isZh = locale === "zh";
  const sources = new Map(value.source_links.map((source) => [source.id, source]));
  return (
    <div className="min-w-0 bg-white" data-testid="career-dossier-outlook-transitions" data-career-api-component="market_signal_card">
      <Header heading={value.heading} answer={value.direct_answer} componentId="market_signal_card" sectionLabel={sectionLabel} sectionLabelId={sectionLabelId} />
      <div className="px-6 py-7 sm:px-8">
        <section aria-labelledby="career-outlook-evidence-title"><h3 id="career-outlook-evidence-title" className="m-0 text-xl font-bold text-[#172A60]">{isZh ? "三类数据，三种不同口径" : "Three sources, three different measures"}</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-3" data-career-api-list="market_signal_card.outlook_evidence">{value.outlook_evidence.map((item, index) => {
            const title = item.source_id ? sources.get(item.source_id)?.label ?? item.source_id : item.geography;
            return <article key={`${item.source_id ?? item.geography}:${item.occupation_scope}:${index}`} className="rounded-xl border border-[#DCE3F0] bg-[#F8FAFD] p-5"><div className="flex items-start justify-between gap-3"><h4 className="m-0 text-base font-bold text-[#243B7A]">{title}</h4><span className="rounded-full bg-[#E9EEFB] px-3 py-1 text-xs font-bold text-[#2C3E8C]">{item.horizon}</span></div><p className="m-0 mt-3 text-sm text-[#5B6678]">{item.geography} · {item.occupation_scope}</p><p className="m-0 mt-4 text-2xl font-bold text-[#172A60]" {...apiField(`market_signal_card.outlook_evidence[${index}].value`)}>{item.value}</p><p className="m-0 mt-1 text-xs font-bold uppercase tracking-wide text-[#0E9F94]">{item.metric}</p><p className="m-0 mt-4 text-sm leading-6 text-[#465066]">{item.interpretation}</p><p className="m-0 mt-3 rounded-lg bg-[#FFF6E9] p-3 text-xs leading-5 text-[#6A5738]"><strong>{isZh ? "不能说明" : "Does not establish"}：</strong>{item.limitation}</p></article>;
          })}</div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">{value.context_links.map((link) => <a key={link.href} href={link.href} className="font-semibold text-[#2C3E8C]">{link.label} →</a>)}</div>
        </section>
        <section className="mt-8 border-t border-[#E5E9F2] pt-7" aria-labelledby="career-transitions-title"><h3 id="career-transitions-title" className="m-0 text-xl font-bold text-[#172A60]">{isZh ? "现有能力可以迁移到哪里？" : "Where can your current capabilities transfer?"}</h3><p className="m-0 mt-2 text-sm leading-6 text-[#5B6678]">{isZh ? "这些是能力邻近关系，不代表自动晋升或无需补课。" : "These are capability relationships, not automatic promotions or credential waivers."}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2" data-career-api-list="market_signal_card.transitions">{value.transitions.map((item, index) => <Link key={item.target_slug} href={item.target_href} className="group rounded-xl border border-[#DCE3F0] bg-[#F8FAFD] p-5 no-underline transition hover:-translate-y-0.5 hover:border-[#2C3E8C] hover:shadow-md" data-career-transition-target={item.target_slug}><div className="flex items-start justify-between gap-3"><h4 className="m-0 text-base font-bold text-[#243B7A]" {...apiField(`market_signal_card.transitions[${index}].target_title`)}>{item.target_title}</h4><span className="shrink-0 rounded-full bg-[#E9EEFB] px-3 py-1 text-xs font-bold text-[#2C3E8C]">{item.transition_distance}</span></div><p className="m-0 mt-3 text-sm leading-6 text-[#465066]"><strong>{isZh ? "可迁移" : "Transfers"}：</strong>{item.shared_capabilities}</p><p className="m-0 mt-2 text-sm leading-6 text-[#465066]"><strong>{isZh ? "需补足" : "Build next"}：</strong>{item.capability_gaps}</p><span className="mt-4 inline-flex font-bold text-[#2C3E8C]">{isZh ? "查看职业详情" : "View career profile"} <span aria-hidden="true" className="ml-1 transition group-hover:translate-x-1">→</span></span></Link>)}</div>
        </section>
      </div>
      <Sources links={value.source_links} componentId="market_signal_card" />
    </div>
  );
}
