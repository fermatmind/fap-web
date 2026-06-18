import type {
  CareerDisplayReviewValidity,
  CareerDisplaySource,
  CareerDisplaySurfaceViewModel,
} from "@/lib/career/displaySurface";

type SourceDisclosureBlockProps = {
  locale: CareerDisplaySurfaceViewModel["locale"];
  sources: CareerDisplaySource[];
  notices: string[];
  reviewValidity: CareerDisplayReviewValidity | null;
};

function formatReviewText(locale: CareerDisplaySurfaceViewModel["locale"], reviewValidity: CareerDisplayReviewValidity | null): string | null {
  if (!reviewValidity?.lastReviewed && !reviewValidity?.nextReviewDue && !reviewValidity?.marketSignalExpiry) {
    return null;
  }

  if (locale === "zh") {
    return [
      reviewValidity.lastReviewed ? `最近复核：${reviewValidity.lastReviewed}` : null,
      reviewValidity.nextReviewDue ? `下次复核：${reviewValidity.nextReviewDue}` : null,
      reviewValidity.marketSignalExpiry ? `市场信号到期：${reviewValidity.marketSignalExpiry}` : null,
    ].filter(Boolean).join("；") + "。";
  }

  return [
    reviewValidity.lastReviewed ? `Last reviewed: ${reviewValidity.lastReviewed}.` : null,
    reviewValidity.nextReviewDue ? `Next review due: ${reviewValidity.nextReviewDue}.` : null,
    reviewValidity.marketSignalExpiry ? `Market signal expires: ${reviewValidity.marketSignalExpiry}.` : null,
  ].filter(Boolean).join(" ");
}

function sourceBoundaryLabel(source: CareerDisplaySource): string {
  const value = `${source.label} ${source.usage ?? ""}`.toLowerCase();

  if (value.includes("o*net")) {
    return "O*NET：职业定义、任务、兴趣、技能和工作场景。";
  }

  if (value.includes("standard occupational classification") || value.includes("soc")) {
    return "SOC / BLS：职业分类和官方职业边界。";
  }

  if (value.includes("employment projections")) {
    return "BLS Employment Projections：美国就业预测、空缺和教育要求边界。";
  }

  if (value.includes("occupational employment and wage") || value.includes("oews")) {
    return "BLS OEWS：美国官方职业工资来源，按可见字段展示。";
  }

  if (value.includes("national bureau of statistics") || value.includes("国家统计局")) {
    return "国家统计局：中国行业或单位层面的宏观工资语境，不是单职业中位薪资。";
  }

  if (value.includes("linkedin") || value.includes("robert half") || value.includes("hays") || value.includes("job")) {
    return "招聘市场样本：仅作为岗位和薪资信号，不作为官方统计。";
  }

  return `${source.label.replace(/\s+-\s+.*/, "")}：来源边界按本页说明阅读。`;
}

function renderDetailedSource(locale: CareerDisplaySurfaceViewModel["locale"], source: CareerDisplaySource) {
  if (locale === "zh") {
    return sourceBoundaryLabel(source);
  }

  return [
    source.label,
    source.usage ? `- ${source.usage}` : null,
    source.capturedAt ? `Captured: ${source.capturedAt}.` : null,
    source.expiresAt ? `Expires: ${source.expiresAt}.` : null,
  ].filter(Boolean).join(" ");
}

export function SourceDisclosureBlock({
  locale,
  sources,
  notices,
  reviewValidity,
}: SourceDisclosureBlockProps) {
  const isZh = locale === "zh";
  const reviewText = formatReviewText(locale, reviewValidity);

  if (sources.length === 0 && notices.length === 0 && !reviewText) {
    return null;
  }

  const summaryItems = isZh
    ? [
        "本页职业定义、任务和兴趣结构参考 O*NET / SOC 等公开职业资料。",
        "薪资与就业数据按国家和来源边界展示，中国部分仅作为招聘市场参考。",
        reviewText,
      ].filter((item): item is string => Boolean(item))
    : [
        "Career definitions, tasks, and interest signals reference public occupational sources such as O*NET and SOC.",
        "Salary and outlook data are shown within each source and country boundary.",
        reviewText,
      ].filter((item): item is string => Boolean(item));

  return (
    <section
      className="rounded-lg border border-amber-200 bg-amber-50/70 p-5 text-amber-950 md:p-6"
      data-testid="career-source-disclosure"
    >
      <h2 className="m-0 text-xl font-semibold tracking-normal md:text-2xl">
        {isZh ? "资料来源与更新说明" : "Sources and update notes"}
      </h2>
      <ul className="m-0 mt-4 space-y-2 p-0 text-sm leading-6">
        {summaryItems.map((item) => (
          <li key={item} className="list-none">
            {item}
          </li>
        ))}
      </ul>
      <details className="mt-4 rounded-lg border border-amber-200 bg-white/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-amber-950">
          {isZh ? "查看详细来源" : "View detailed sources"}
        </summary>
        {sources.length > 0 ? (
          <ul className="m-0 mt-4 space-y-2 p-0" data-testid="source-list">
            {sources.map((source) => (
              <li key={source.key} className="list-none text-sm leading-6 text-amber-950">
                {source.url ? (
                  <a href={source.url} className="font-semibold underline-offset-4 hover:underline">
                    {renderDetailedSource(locale, source)}
                  </a>
                ) : (
                  <span className="font-semibold">{renderDetailedSource(locale, source)}</span>
                )}
              </li>
            ))}
          </ul>
        ) : null}
        {notices.length > 0 ? (
          <ul className="m-0 mt-4 space-y-2 pl-5 text-sm leading-6" data-testid="boundary-notice">
            {notices.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
        ) : (
          <div data-testid="boundary-notice" />
        )}
      </details>
    </section>
  );
}
