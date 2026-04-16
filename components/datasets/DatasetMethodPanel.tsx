import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DatasetMethodPanelProps = {
  title: string;
  summary: string;
  sourceSummary: string;
  reviewDisciplineSummary: string;
  included: string[];
  excluded: string[];
  boundaryNotes: string[];
};

export function DatasetMethodPanel({
  title,
  summary,
  sourceSummary,
  reviewDisciplineSummary,
  included,
  excluded,
  boundaryNotes,
}: DatasetMethodPanelProps) {
  return (
    <Card data-testid="dataset-method-panel">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-[var(--fm-text-muted)]">
        <p className="m-0">{summary}</p>
        <p className="m-0">Source: {sourceSummary}</p>
        <p className="m-0">Review discipline: {reviewDisciplineSummary}</p>
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

