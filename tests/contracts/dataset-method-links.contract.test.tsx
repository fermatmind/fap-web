import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DatasetMethodPanel } from "@/components/datasets/DatasetMethodPanel";
import { adaptCareerDatasetMethod } from "@/lib/career/adapters/adaptCareerDatasetMethod";

const basePayload = {
  dataset_key: "occupations",
  dataset_scope: "public",
  title: "Dataset method",
  summary: "Method summary",
  source_summary: "Source summary",
  review_discipline_summary: "Review summary",
  included: ["included"],
  excluded: ["excluded"],
  boundary_notes: ["boundary"],
  scope_summary: {
    member_count: 342,
    included_count: 300,
    excluded_count: 42,
    release_cohort_counts: { current: 300 },
    strong_index_decision_counts: { publish: 300 },
  },
  publication: {
    publisher: {
      name: "FermatMind",
      url: "https://www.fermatmind.com/datasets",
    },
    license: {
      name: "Method license",
      url: "/datasets/occupations/license",
    },
    usage: {
      summary: "Usage summary",
    },
    distribution: {
      download_url: "https://www.fermatmind.com/datasets/occupations.csv",
    },
  },
  structured_data: {},
};

describe("dataset method publication links", () => {
  it("keeps http, https, and site-relative publication URLs renderable", () => {
    const method = adaptCareerDatasetMethod({ payload: basePayload });

    expect(method?.publication).toMatchObject({
      publisherUrl: "https://www.fermatmind.com/datasets",
      licenseUrl: "/datasets/occupations/license",
      downloadUrl: "https://www.fermatmind.com/datasets/occupations.csv",
    });
  });

  it("strips unsafe publication URL schemes before they reach anchors", () => {
    const method = adaptCareerDatasetMethod({
      payload: {
        ...basePayload,
        publication: {
          ...basePayload.publication,
          publisher: {
            name: "FermatMind",
            url: "javascript:alert(1)",
          },
          license: {
            name: "Method license",
            url: "data:text/html,owned",
          },
          distribution: {
            download_url: "//attacker.example/download.csv",
          },
        },
      },
    });

    expect(method?.publication).toMatchObject({
      publisherUrl: "https://www.fermatmind.com/",
      licenseUrl: "",
      downloadUrl: "",
    });

    render(
      <DatasetMethodPanel
        title={method?.title ?? ""}
        summary={method?.summary ?? ""}
        sourceSummary={method?.sourceSummary ?? ""}
        reviewDisciplineSummary={method?.reviewDisciplineSummary ?? ""}
        included={method?.included ?? []}
        excluded={method?.excluded ?? []}
        boundaryNotes={method?.boundaryNotes ?? []}
        scopeSummary={
          method?.scopeSummary ?? {
            memberCount: 0,
            includedCount: 0,
            excludedCount: 0,
            releaseCohortCounts: {},
            strongIndexDecisionCounts: {},
          }
        }
        publication={
          method?.publication ?? {
            publisherName: "",
            publisherUrl: "",
            licenseName: "",
            licenseUrl: "",
            usageSummary: "",
            downloadUrl: "",
          }
        }
      />
    );

    expect(screen.getByRole("link", { name: "FermatMind" })).toHaveAttribute(
      "href",
      "https://www.fermatmind.com/"
    );
    expect(screen.queryByRole("link", { name: "Method license" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Download" })).toBeNull();
  });
});
