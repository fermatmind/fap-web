import type { ReportResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import {
  buildMbtiResultProjectionViewModel,
  type MbtiResultProjectionSectionViewModel,
} from "@/lib/mbti/publicProjection";

type PdfSectionKey = "personality-traits" | "career-path" | "personal-growth" | "relationships";

type PdfSection = {
  key: PdfSectionKey;
  title: string;
  sections: MbtiResultProjectionSectionViewModel[];
};

const PLACEHOLDER_PATTERNS = [
  "占位槽位",
  "Placeholder trait slot",
  "placeholder trait slot",
  "kind:axis",
  "state:strong",
] as const;

const TECHNICAL_PREFIX_PATTERNS = [
  /^kind:/i,
  /^axis:/i,
  /^state:/i,
  /^career:/i,
  /^topic:/i,
] as const;

function cleanText(value: unknown): string {
  const normalized = String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[#*_`>]+/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized || TECHNICAL_PREFIX_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "";
  }

  return normalized;
}

function hasPlaceholderText(...values: unknown[]): boolean {
  const text = values.map((value) => String(value ?? "")).join("\n");

  return PLACEHOLDER_PATTERNS.some((pattern) => text.includes(pattern));
}

function sectionBodyLines(section: MbtiResultProjectionSectionViewModel): string[] {
  const lines = cleanText(section.bodyMd)
    .split(/\n+|(?:\s+-\s+)/)
    .map((line) => cleanText(line))
    .filter(Boolean);

  return Array.from(new Set(lines)).slice(0, 4);
}

function collectSections(
  sections: MbtiResultProjectionSectionViewModel[],
  predicate: (section: MbtiResultProjectionSectionViewModel) => boolean
): MbtiResultProjectionSectionViewModel[] {
  return sections.filter(predicate).filter((section) => cleanText(section.title) || cleanText(section.bodyMd));
}

function buildPdfSections(sections: MbtiResultProjectionSectionViewModel[]): PdfSection[] {
  return [
    {
      key: "personality-traits",
      title: "Personality Traits",
      sections: collectSections(sections, (section) =>
        ["letters_intro", "overview", "trait_overview"].includes(section.key)
        || section.key.startsWith("traits.")
      ),
    },
    {
      key: "career-path",
      title: "Your Career Path",
      sections: collectSections(sections, (section) => section.key.startsWith("career.")),
    },
    {
      key: "personal-growth",
      title: "Your Personal Growth",
      sections: collectSections(sections, (section) => section.key.startsWith("growth.")),
    },
    {
      key: "relationships",
      title: "Your Relationships",
      sections: collectSections(sections, (section) => section.key.startsWith("relationships.")),
    },
  ];
}

export function MbtiResultPdfShell({
  locale,
  reportData,
}: {
  locale: Locale;
  reportData: ReportResponse;
}) {
  const projection = buildMbtiResultProjectionViewModel(reportData);
  const pdfSections = buildPdfSections(projection.sections);
  const missingSections = pdfSections.filter((section) => section.sections.length === 0);
  const placeholderDetected = hasPlaceholderText(
    projection.title,
    projection.summary,
    projection.sections.map((section) => `${section.title}\n${section.bodyMd}`).join("\n")
  );
  const isZh = locale === "zh";

  if (!projection.hasProjection || missingSections.length > 0 || placeholderDetected) {
    return (
      <section
        data-testid="mbti-result-pdf-shell-error"
        data-pdf-placeholder="true"
        data-pdf-error="PDF_PLACEHOLDER_CONTENT"
        data-pdf-content-ready="false"
        className="mx-auto max-w-[760px] rounded-[8px] border border-rose-200 bg-rose-50 p-6 text-rose-800"
      >
        <h2 className="m-0 text-xl font-semibold">
          {isZh ? "PDF 内容尚未准备好" : "PDF content is not ready"}
        </h2>
        <p className="m-0 mt-3 text-sm leading-7">
          {isZh
            ? "结果页核心模块仍包含占位或缺失内容，因此不会生成 PDF。"
            : "The result-page sections still contain placeholder or missing content, so the PDF export will not proceed."}
        </p>
      </section>
    );
  }

  return (
    <article
      data-testid="mbti-result-pdf-shell"
      data-result-pdf-root="true"
      data-pdf-content-ready="true"
      data-pdf-content-source="mbti-result-projection"
      className="mx-auto w-full max-w-[760px] space-y-8 bg-white text-slate-900 print:space-y-6"
    >
      <header className="space-y-3 border-b border-slate-200 pb-6">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          FermatMind MBTI Result
        </p>
        <h1 className="m-0 text-4xl font-semibold tracking-normal text-slate-950">
          {cleanText(projection.displayType) || cleanText(projection.canonicalTypeCode) || "MBTI"}
        </h1>
        {cleanText(projection.typeName) ? (
          <p className="m-0 text-xl font-medium text-slate-700">{cleanText(projection.typeName)}</p>
        ) : null}
        {cleanText(projection.summary || projection.heroSummary) ? (
          <p className="m-0 max-w-3xl text-base leading-8 text-slate-700">
            {cleanText(projection.summary || projection.heroSummary)}
          </p>
        ) : null}
        {projection.keywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {projection.keywords.slice(0, 8).map((keyword) => (
              <span key={keyword} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                {keyword}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {pdfSections.map((pdfSection) => (
        <section
          key={pdfSection.key}
          data-pdf-section={pdfSection.key}
          className="break-inside-avoid-page space-y-4 rounded-[8px] border border-slate-200 bg-white p-5 print:border-slate-300 print:shadow-none"
        >
          <h2 className="m-0 text-2xl font-semibold text-slate-950">{pdfSection.title}</h2>
          <div className="grid gap-4">
            {pdfSection.sections.map((section) => {
              const title = cleanText(section.title);
              const lines = sectionBodyLines(section);

              return (
                <div key={section.key} data-pdf-card="true" className="break-inside-avoid-page rounded-[8px] bg-slate-50 p-4">
                  {title ? <h3 className="m-0 text-base font-semibold text-slate-900">{title}</h3> : null}
                  {lines.length > 0 ? (
                    <div className="mt-2 space-y-2 text-sm leading-7 text-slate-700">
                      {lines.map((line) => (
                        <p key={line} className="m-0">{line}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="break-inside-avoid-page rounded-[8px] border border-emerald-200 bg-emerald-50 p-5">
        <h2 className="m-0 text-xl font-semibold text-slate-950">
          {isZh ? "继续探索" : "Continue Exploring"}
        </h2>
        <p className="m-0 mt-2 text-sm leading-7 text-slate-700">
          {isZh
            ? "PDF 保留当前结果页的核心阅读内容。职业推荐、历史结果与订单入口请回到结果页继续使用。"
            : "This PDF preserves the core result-page reading content. Return to the result page for career recommendations, history, and order actions."}
        </p>
      </section>
    </article>
  );
}
