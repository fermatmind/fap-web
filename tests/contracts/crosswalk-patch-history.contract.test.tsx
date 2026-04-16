import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CrosswalkPatchHistory } from "@/components/ops/career/CrosswalkPatchHistory";

describe("crosswalk patch history contract", () => {
  it("renders version chain with status and target fields", () => {
    const html = renderToStaticMarkup(
      (
        <CrosswalkPatchHistory
          history={{
            historyKind: "career_editorial_patch_history",
            historyVersion: "career.editorial_patch.history.v1",
            subjectSlug: "family-proxy-role",
            count: 2,
            latestPatch: null,
            patches: [
              {
                patchKey: "patch-v2",
                patchVersion: "v2",
                patchStatus: "approved",
                subjectSlug: "family-proxy-role",
                targetKind: "family",
                targetSlug: "software-engineering-family",
                crosswalkModeOverride: "trust_inheritance",
                reviewNotes: "approved",
                createdBy: null,
                reviewedBy: null,
                createdAt: null,
                reviewedAt: null,
                isLatest: true,
              },
              {
                patchKey: "patch-v1",
                patchVersion: "v1",
                patchStatus: "rejected",
                subjectSlug: "family-proxy-role",
                targetKind: "occupation",
                targetSlug: "family-proxy-role",
                crosswalkModeOverride: "exact",
                reviewNotes: "rejected",
                createdBy: null,
                reviewedBy: null,
                createdAt: null,
                reviewedAt: null,
                isLatest: false,
              },
            ],
          }}
        />
      ) as ReactNode
    );

    expect(html).toContain("crosswalk-patch-history");
    expect(html).toContain("v2");
    expect(html).toContain("approved");
    expect(html).toContain("family");
    expect(html).toContain("trust_inheritance");
  });
});

