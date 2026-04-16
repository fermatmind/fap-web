import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DatasetFilterHubProps = {
  familyEnabled: boolean;
  publishTrackEnabled: boolean;
  indexPostureEnabled: boolean;
};

export function DatasetFilterHub({
  familyEnabled,
  publishTrackEnabled,
  indexPostureEnabled,
}: DatasetFilterHubProps) {
  return (
    <Card data-testid="dataset-filter-hub">
      <CardHeader>
        <CardTitle className="text-lg">Public filter hub</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
        <p className="m-0">This hub exposes public-safe facets only. Internal review states remain backend-internal.</p>
        <ul className="m-0 list-disc space-y-1 pl-5">
          <li>Family: {familyEnabled ? "available" : "deferred"}</li>
          <li>Publish track: {publishTrackEnabled ? "available" : "deferred"}</li>
          <li>Index posture summary: {indexPostureEnabled ? "available" : "deferred"}</li>
        </ul>
      </CardContent>
    </Card>
  );
}

