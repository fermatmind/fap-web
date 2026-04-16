import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CrosswalkQueueTable } from "@/components/ops/career/CrosswalkQueueTable";
import type { CareerCrosswalkOpsQueueItemAdapter } from "@/lib/career/adapters/types";

describe("crosswalk ops queue contract", () => {
  it("renders queue list with high-risk crosswalk modes and detail links", () => {
    const items: CareerCrosswalkOpsQueueItemAdapter[] = [
      {
        subjectSlug: "local-heavy-role",
        canonicalTitleEn: "Local Heavy Role",
        familySlug: "software-engineering",
        currentCrosswalkMode: "local_heavy_interpretation",
        candidateTargetKind: "occupation",
        candidateTargetSlug: "local-heavy-role",
        queueReasons: ["local_heavy_requires_editorial_patch"],
        requiresEditorialPatch: true,
        batchOrigin: "batch-4",
        publishTrack: "hold",
        blockingFlags: ["approved_patch_missing"],
        hasApprovedPatch: false,
        latestPatchKey: null,
        latestPatchStatus: null,
        latestPatchVersion: null,
        latestPatchCreatedAt: null,
      },
    ];

    const html = renderToStaticMarkup((<CrosswalkQueueTable locale="en" items={items} />) as ReactNode);
    expect(html).toContain("crosswalk-ops-queue-table");
    expect(html).toContain("local-heavy-role");
    expect(html).toContain("local_heavy_interpretation");
    expect(html).toContain("local_heavy_requires_editorial_patch");
    expect(html).toContain("/en/ops/career/crosswalk/local-heavy-role");
  });
});

