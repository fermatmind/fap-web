import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DatasetFilterHubProps = {
  familyEnabled: boolean;
  publishTrackEnabled: boolean;
  indexPostureEnabled: boolean;
  includedCount: number;
  excludedCount: number;
  familyFacet: Record<string, number>;
  publishTrackFacet: Record<string, number>;
  releaseCohortFacet: Record<string, number>;
  publicIndexStateFacet: Record<string, number>;
};

export function DatasetFilterHub({
  familyEnabled,
  publishTrackEnabled,
  indexPostureEnabled,
  includedCount,
  excludedCount,
  familyFacet,
  publishTrackFacet,
  releaseCohortFacet,
  publicIndexStateFacet,
}: DatasetFilterHubProps) {
  const renderFacet = (title: string, facet: Record<string, number>) => {
    const entries = Object.entries(facet).sort((left, right) => right[1] - left[1]);
    if (entries.length === 0) {
      return <p className="m-0 text-xs text-[var(--fm-text-muted)]">No public-safe distribution available.</p>;
    }

    return (
      <div>
        <h3 className="m-0 text-sm font-semibold text-[var(--fm-text)]">{title}</h3>
        <ul className="m-0 mt-1 list-disc space-y-1 pl-5 text-xs text-[var(--fm-text-muted)]">
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
    <Card data-testid="dataset-filter-hub">
      <CardHeader>
        <CardTitle className="text-lg">Public filter hub</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-[var(--fm-text-muted)]">
        <p className="m-0">This hub exposes public-safe facets only. Internal review states remain backend-internal.</p>
        <ul className="m-0 list-disc space-y-1 pl-5">
          <li>Family: {familyEnabled ? "available" : "deferred"}</li>
          <li>Publish track: {publishTrackEnabled ? "available" : "deferred"}</li>
          <li>Index posture summary: {indexPostureEnabled ? "available" : "deferred"}</li>
          <li>
            Included / Excluded: {includedCount} / {excludedCount}
          </li>
        </ul>
        {renderFacet("Family distribution", familyFacet)}
        {renderFacet("Publish track distribution", publishTrackFacet)}
        {renderFacet("Release cohort distribution", releaseCohortFacet)}
        {renderFacet("Public index posture distribution", publicIndexStateFacet)}
      </CardContent>
    </Card>
  );
}
