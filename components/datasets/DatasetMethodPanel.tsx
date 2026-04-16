import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DatasetMethodPanelProps = {
  title: string;
  summary: string;
  sourceSummary: string;
  reviewDisciplineSummary: string;
  included: string[];
  excluded: string[];
  boundaryNotes: string[];
  scopeSummary: {
    memberCount: number;
    includedCount: number;
    excludedCount: number;
    releaseCohortCounts: Record<string, number>;
    strongIndexDecisionCounts: Record<string, number>;
  };
  publication: {
    publisherName: string;
    publisherUrl: string;
    licenseName: string;
    licenseUrl: string;
    usageSummary: string;
    downloadUrl: string;
  };
};

export function DatasetMethodPanel({
  title,
  summary,
  sourceSummary,
  reviewDisciplineSummary,
  included,
  excluded,
  boundaryNotes,
  scopeSummary,
  publication,
}: DatasetMethodPanelProps) {
  const renderFacet = (title: string, facet: Record<string, number>) => {
    const entries = Object.entries(facet).sort((left, right) => right[1] - left[1]);
    if (entries.length === 0) {
      return null;
    }

    return (
      <div>
        <h2 className="m-0 text-base font-semibold text-[var(--fm-text)]">{title}</h2>
        <ul className="m-0 mt-2 list-disc space-y-1 pl-5">
          {entries.map(([key, value]) => (
            <li key={`${title}-${key}`}>
              {key}: {value}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <Card data-testid="dataset-method-panel">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-[var(--fm-text-muted)]">
        <p className="m-0">{summary}</p>
        <p className="m-0">Source: {sourceSummary}</p>
        <p className="m-0">Review discipline: {reviewDisciplineSummary}</p>
        <p className="m-0">
          Scope summary: {scopeSummary.memberCount} tracked, {scopeSummary.includedCount} included, {scopeSummary.excludedCount} excluded.
        </p>
        <p className="m-0">
          Publication:{" "}
          <a href={publication.publisherUrl} className="font-semibold text-[var(--fm-accent)] underline-offset-2 hover:underline">
            {publication.publisherName}
          </a>
          {" · "}
          <a href={publication.licenseUrl} className="font-semibold text-[var(--fm-accent)] underline-offset-2 hover:underline">
            {publication.licenseName}
          </a>
          {" · "}
          <a href={publication.downloadUrl} className="font-semibold text-[var(--fm-accent)] underline-offset-2 hover:underline">
            Download
          </a>
        </p>
        <p className="m-0">Usage: {publication.usageSummary}</p>
        {renderFacet("Release cohort distribution", scopeSummary.releaseCohortCounts)}
        {renderFacet("Strong-index decision distribution", scopeSummary.strongIndexDecisionCounts)}
        <div>
          <h2 className="m-0 text-base font-semibold text-[var(--fm-text)]">Included</h2>
          <ul className="m-0 mt-2 list-disc space-y-1 pl-5">
            {included.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="m-0 text-base font-semibold text-[var(--fm-text)]">Excluded</h2>
          <ul className="m-0 mt-2 list-disc space-y-1 pl-5">
            {excluded.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="m-0 text-base font-semibold text-[var(--fm-text)]">Boundary notes</h2>
          <ul className="m-0 mt-2 list-disc space-y-1 pl-5">
            {boundaryNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
