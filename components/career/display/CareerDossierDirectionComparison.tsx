import visual from "@/components/career/display/CareerProductionVisual.module.css";
import type { CareerPublishedValue } from "@/lib/career/publishedComponentContract";

type DirectionRow = {
  career: string;
  work: string;
  difference: string;
  choice: string;
};

type DirectionComparison = {
  heading: string;
  intro: string;
  rows: DirectionRow[];
  evidenceNote: string;
  evidenceLinks: Array<{ label: string; href: string }>;
  conclusion: string;
  transition: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function parseDirectionComparison(value: CareerPublishedValue): DirectionComparison | null {
  if (!isRecord(value) || !Array.isArray(value.rows)) return null;

  const heading = text(value.heading);
  const intro = text(value.intro);
  const evidenceNote = text(value.evidence_note);
  const evidenceLinks = Array.isArray(value.evidence_links)
    ? value.evidence_links.map((link) => {
        if (!isRecord(link)) return null;
        const label = text(link.label);
        const href = text(link.href);
        if (!label || !href) return null;
        try {
          const url = new URL(href);
          return url.protocol === "https:" && [
            "www.bls.gov",
            "www.onetonline.org",
            "www.mohrss.gov.cn",
            "www.mof.gov.cn",
            "www.cicpa.org.cn",
          ].includes(url.hostname)
            ? { label, href: url.toString() }
            : null;
        } catch {
          return null;
        }
      })
    : [];
  const conclusion = text(value.conclusion);
  const transition = text(value.transition);
  const rows = value.rows.map((row) => {
    if (!isRecord(row)) return null;
    const career = text(row["职业方向"]);
    const work = text(row["核心工作与产出"]);
    const difference = text(row["与会计师／审计师的关键区别"]);
    const choice = text(row["更适合什么选择"]);
    return career && work && difference && choice ? { career, work, difference, choice } : null;
  });

  if (!heading || !intro || !evidenceNote || evidenceLinks.length === 0 || evidenceLinks.some((link) => link === null) ||
    !conclusion || !transition || rows.some((row) => row === null)) {
    return null;
  }

  return {
    heading,
    intro,
    evidenceNote,
    evidenceLinks: evidenceLinks as Array<{ label: string; href: string }>,
    conclusion,
    transition,
    rows: rows as DirectionRow[],
  };
}

export function supportsCareerDossierDirectionComparison(value: CareerPublishedValue): boolean {
  return parseDirectionComparison(value) !== null;
}

export function CareerDossierDirectionComparison({ value, locale }: { value: CareerPublishedValue; locale: "zh" | "en" }) {
  const comparison = parseDirectionComparison(value);
  if (!comparison) return null;

  return (
    <section
      className={visual.directionComparison}
      data-testid="career-dossier-direction-comparison"
      data-career-api-component="adjacent_career_comparison_table"
    >
      <header className={visual.directionHeader}>
        <div className={visual.directionTitleRow}>
          <p className={visual.directionEyebrow}>{locale === "zh" ? "职业方向比较" : "Career direction comparison"}</p>
          <span className={visual.directionTitleRule} aria-hidden="true" />
        </div>
        <h2 className={visual.directionTitle} data-career-api-field="adjacent_career_comparison_table.heading">
          {comparison.heading}
        </h2>
        <p className={visual.directionIntro} data-career-api-field="adjacent_career_comparison_table.intro">
          {comparison.intro}
        </p>
      </header>

      <div className={visual.directionTableWrap} data-career-table-wrap="adjacent_career_comparison_table.rows">
        <table className={visual.directionTable} data-career-api-table="adjacent_career_comparison_table.rows">
          <caption className="sr-only">{comparison.heading}</caption>
          <thead>
            <tr>
              <th scope="col">{locale === "zh" ? "职业方向" : "Career direction"}</th>
              <th scope="col">{locale === "zh" ? "核心工作与产出" : "Core work and output"}</th>
              <th scope="col">{locale === "zh" ? "关键区别" : "Key differences"}</th>
              <th scope="col">{locale === "zh" ? "更适合什么选择" : "Best-fit choice"}</th>
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row, index) => (
              <tr key={row.career}>
                <th scope="row" data-label="职业方向" data-career-api-field={`adjacent_career_comparison_table.rows[${index}].职业方向`}>
                  {row.career}
                </th>
                <td data-label="核心工作与产出" data-career-api-field={`adjacent_career_comparison_table.rows[${index}].核心工作与产出`}>{row.work}</td>
                <td data-label="关键区别" data-career-api-field={`adjacent_career_comparison_table.rows[${index}].与会计师／审计师的关键区别`}>{row.difference}</td>
                <td data-label="更适合什么选择" data-career-api-field={`adjacent_career_comparison_table.rows[${index}].更适合什么选择`}>{row.choice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <aside className={visual.directionEvidence} aria-label={locale === "zh" ? "职业方向比较依据" : "Evidence for the career comparison"}>
        <p data-career-api-field="adjacent_career_comparison_table.evidence_note">{comparison.evidenceNote}</p>
        <p data-career-api-list="adjacent_career_comparison_table.evidence_links">
          {comparison.evidenceLinks.map((link, index) => (
            <span key={link.href}>
              {index > 0 ? " · " : null}
              <a href={link.href} target="_blank" rel="noopener noreferrer" data-career-api-field={`adjacent_career_comparison_table.evidence_links[${index}]`}>
                {link.label}
              </a>
            </span>
          ))}
        </p>
      </aside>
      <section className={visual.directionConclusion} aria-labelledby="career-direction-conclusion-title">
        <h3 id="career-direction-conclusion-title">{locale === "zh" ? "怎么选" : "How to choose"}</h3>
        <p data-career-api-field="adjacent_career_comparison_table.conclusion">{comparison.conclusion}</p>
      </section>
      <p className={visual.directionTransition} data-career-api-field="adjacent_career_comparison_table.transition">
        {comparison.transition}
      </p>
    </section>
  );
}
