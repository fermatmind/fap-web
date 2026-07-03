import { render, screen } from "@testing-library/react";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { adaptCareerDisplaySurface } from "@/lib/career/displaySurface";
import { isSecurity122Web14AllowedFile } from "@/tests/contracts/helpers/currentPrScope";
import {
  buildDisplaySurfaceClaimPermissions,
  buildSelectedCareerDisplaySurfaceFixture,
} from "@/tests/contracts/careerDisplaySurface.fixture";

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

describe("SECURITY-122-WEB-14 career outcome and compensation claim audit", () => {
  it("removes unsafe outcome, payroll, tax, compensation, and promotion claims before rendering", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "data-scientists",
      titleEn: "Data Scientists",
    });
    fixture.claim_permissions = buildDisplaySurfaceClaimPermissions({
      allow_strong_claim: true,
      allow_salary_comparison: true,
      allow_market_signal: true,
      allow_ai_strategy: true,
    });
    fixture.page.content.fermat_decision_card.summary = "Guaranteed salary and guaranteed promotion should not render.";
    fixture.page.content.career_snapshot_primary_locale.rows.push([
      "Payroll outcome",
      "Payroll guarantee and tax optimization should not render.",
    ]);
    fixture.page.content.fit_decision_checklist.checks.push({
      title: "Hiring guarantee should not render",
      question: "Will get hired should not render?",
      note: "Success guarantee should not render.",
    });
    fixture.page.content.responsibilities_block.push("Source-bounded compensation reference");
    fixture.page.content.responsibilities_block.push("This is not a compensation guarantee.");
    fixture.page.content.next_steps_block.steps.push({
      title: "Compensation prediction should not render",
      items: ["Will be promoted should not render."],
    });
    fixture.page.content.faq_block.items.push({
      question: "Can this make a salary prediction?",
      answer: "Guaranteed income should not render.",
    });

    const surface = adaptCareerDisplaySurface(fixture, "en");

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.queryByText(/Guaranteed salary/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/guaranteed promotion/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Payroll outcome/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/tax optimization/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Hiring guarantee/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Will get hired/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Success guarantee/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Compensation prediction/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Will be promoted/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Can this make a salary prediction/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Guaranteed income/i)).not.toBeInTheDocument();
    expect(screen.getByText("Source-bounded compensation reference")).toBeInTheDocument();
    expect(screen.getByText("This is not a compensation guarantee.")).toBeInTheDocument();
  });

  it("keeps tracked diff scope inside SECURITY-122-WEB-14", () => {
    for (const file of changedFiles()) {
      expect(isSecurity122Web14AllowedFile(file), file).toBe(true);
    }
  });
});
