import { render, screen } from "@testing-library/react";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { adaptCareerDisplaySurface } from "@/lib/career/displaySurface";
import { isSecurity122Web13AllowedFile } from "@/tests/contracts/helpers/currentPrScope";
import { buildSelectedCareerDisplaySurfaceFixture } from "@/tests/contracts/careerDisplaySurface.fixture";

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "--cached"],
    ["diff", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) {
          files.add(line.trim());
        }
      }
    } catch {
      // CI checkouts can omit origin/main; use every available diff source.
    }
  }

  return Array.from(files).sort();
}

describe("SECURITY-122-WEB-13 career QA source trust certification", () => {
  it("keeps trusted career source baselines and records non-rendered certification", () => {
    const surface = adaptCareerDisplaySurface(
      buildSelectedCareerDisplaySurfaceFixture({
        slug: "data-scientists",
        titleEn: "Data Scientists",
      }),
      "en"
    );

    expect(surface?.sources).toEqual([
      expect.objectContaining({
        label: "O*NET Online: Data Scientists",
        authority: "occupation_fact",
        trustCertification: "trusted_public_source",
      }),
      expect.objectContaining({
        label: "FermatMind interpretation",
        authority: "fermatmind_interpretation",
        trustCertification: "bounded_interpretation",
      }),
    ]);

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("source-list")).toHaveTextContent("O*NET Online: Data Scientists");
    expect(screen.getByTestId("source-list")).not.toHaveTextContent("trusted_public_source");
    expect(screen.getByTestId("source-list")).not.toHaveTextContent("source_type");
  });

  it("drops forged source references instead of rendering labels, URLs, or QA metadata", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "data-scientists",
      titleEn: "Data Scientists",
    });
    (fixture.sources as { references: Array<Record<string, unknown>> }).references = [
      {
        label: "O*NET Online: Data Scientists",
        url: "https://evil.example/onet/data-scientists",
        usage: "Forged source should not render.",
        source_type: "official",
        qa_notes: "internal QA note must not render",
        source_reference: "/private/career/source-ledger.json",
      },
      {
        label: "FermatMind interpretation",
        usage: "FermatMind synthesis; not an official occupational fact source.",
        source_type: "interpretation",
        qa_trace: "agent-chain-of-thought",
      },
    ];

    const surface = adaptCareerDisplaySurface(fixture, "en");

    expect(surface?.sources).toEqual([
      expect.objectContaining({
        label: "FermatMind interpretation",
        authority: "fermatmind_interpretation",
        trustCertification: "bounded_interpretation",
      }),
    ]);

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.queryByText(/evil\.example/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Forged source should not render/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/internal QA note/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/source-ledger/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/agent-chain-of-thought/i)).not.toBeInTheDocument();
  });

  it("keeps tracked diff scope inside SECURITY-122-WEB-13", () => {
    for (const file of changedFiles()) {
      expect(isSecurity122Web13AllowedFile(file), file).toBe(true);
    }
  });
});
