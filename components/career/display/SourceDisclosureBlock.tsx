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

function renderDetailedSource(locale: CareerDisplaySurfaceViewModel["locale"], source: CareerDisplaySource) {
  if (locale === "zh") {
    return [
      source.label,
      source.usage ? `- ${source.usage}` : null,
      source.capturedAt ? `捕获：${source.capturedAt}。` : null,
      source.expiresAt ? `到期：${source.expiresAt}。` : null,
    ].filter(Boolean).join(" ");
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

  const summaryItems = [reviewText].filter((item): item is string => Boolean(item));

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
