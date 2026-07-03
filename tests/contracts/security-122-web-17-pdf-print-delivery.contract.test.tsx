import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AttemptPdfDownloadButton } from "@/components/commerce/AttemptPdfDownloadButton";
import { Container } from "@/components/layout/Container";
import { isSecurity122Web17AllowedFile } from "./helpers/currentPrScope";

const hoisted = vi.hoisted(() => ({
  fetchAttemptReportPdfWithMeta: vi.fn(),
  fetchAttemptResultPagePdfWithMeta: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("@/lib/api/v0_3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/v0_3")>();

  return {
    ...actual,
    fetchAttemptReportPdfWithMeta: hoisted.fetchAttemptReportPdfWithMeta,
    fetchAttemptResultPagePdfWithMeta: hoisted.fetchAttemptResultPagePdfWithMeta,
  };
});

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

const ROOT = process.cwd();

function read(relPath: string): string {
  return readFileSync(path.join(ROOT, relPath), "utf8");
}

function git(args: string[]): string {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function tryGit(args: string[]): string | null {
  try {
    return git(args);
  } catch {
    return null;
  }
}

function committedDiffOutput(): string {
  const candidateRefs =
    process.env.GITHUB_ACTIONS === "true"
      ? ["HEAD^1...HEAD", "origin/main...HEAD", "main...HEAD"]
      : ["origin/main...HEAD", "main...HEAD", "HEAD^1...HEAD"];

  for (const ref of candidateRefs) {
    const output = tryGit(["diff", "--name-only", ref]);
    if (output !== null) {
      return output;
    }
  }

  if (process.env.GITHUB_ACTIONS === "true") {
    return "";
  }

  throw new Error(`Unable to resolve a committed diff base from: ${candidateRefs.join(", ")}`);
}

describe("SECURITY-122-WEB-17 PDF print delivery markers and smoke-test correctness", () => {
  it("keeps Container from dropping PDF and private print delivery markers", () => {
    render(
      <Container
        as="main"
        data-testid="pdf-container"
        data-private-result-print-root="true"
        data-gotenberg-result-print-root="true"
        data-pdf-mode="true"
        data-pdf-layout="a4-report-dense"
        data-pdf-ready="false"
      >
        PDF shell
      </Container>
    );

    const container = screen.getByTestId("pdf-container");
    expect(container.tagName).toBe("MAIN");
    expect(container).toHaveAttribute("data-private-result-print-root", "true");
    expect(container).toHaveAttribute("data-gotenberg-result-print-root", "true");
    expect(container).toHaveAttribute("data-pdf-mode", "true");
    expect(container).toHaveAttribute("data-pdf-layout", "a4-report-dense");
    expect(container).toHaveAttribute("data-pdf-ready", "false");
  });

  it("keeps the print route and CSS anchored to the private A4 PDF gate", () => {
    const page = read("app/(localized)/[locale]/(app)/result/[id]/print/page.tsx");
    const css = read("app/globals.css");

    expect(page).toContain('data-private-result-print-root="true"');
    expect(page).toContain('data-gotenberg-result-print-root="true"');
    expect(page).toContain('data-pdf-layout="a4-report-dense"');
    expect(page).toContain('data-pdf-visual-version="mbti-result-snapshot-a4-v1"');
    expect(page).toContain('data-pdf-ready="false"');
    expect(page).toContain('data-pdf-error={errorCode}');
    expect(css).toContain("@page fermat-result-snapshot");
    expect(css).toContain("size: A4");
    expect(css).toContain('body:has([data-private-result-print-root="true"])');
    expect(css).toContain('[data-private-result-print-hidden="true"]');
    expect(css).toContain('[role="navigation"]');
  });

  it("rejects external PDF hrefs instead of extracting attacker-controlled attempt ids", () => {
    render(
      <AttemptPdfDownloadButton
        locale="en"
        label="Download PDF"
        loadingLabel="Downloading"
        errorMessage="Failed"
        pdfVariant="mbti_result_page"
        pdfUrl="https://evil.example/api/v0.3/attempts/attempt-private/result-page.pdf"
        fallbackUrl="//evil.example/api/v0.3/attempts/attempt-private/report.pdf"
        exportSurface="result_page"
        testId="pdf-download"
      />
    );

    const button = screen.getByTestId("pdf-download");
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(hoisted.fetchAttemptResultPagePdfWithMeta).not.toHaveBeenCalled();
    expect(hoisted.fetchAttemptReportPdfWithMeta).not.toHaveBeenCalled();
  });

  it("keeps the smoke gate A4 metadata check tolerant of Chromium decimal point sizes", () => {
    const smoke = read("scripts/ops/check-mbti-result-page-pdf-smoke.mjs");

    expect(smoke).toContain("Math.abs(width - 595) <= 2");
    expect(smoke).toContain("Math.abs(height - 842) <= 2");
    expect(smoke).toContain("matchesLandscapeA4");
    expect(smoke).toContain("pdf_page_size_a4");
    expect(smoke).toContain("pdf_metadata_producer");
  });

  it("keeps the current PR diff inside the PDF print delivery scope", () => {
    const committedOutput = committedDiffOutput();
    const workingTreeOutput = git(["diff", "--name-only"]);
    const untrackedOutput = git(["ls-files", "--others", "--exclude-standard"]);
    const files = Array.from(
      new Set(
        `${committedOutput}\n${workingTreeOutput}\n${untrackedOutput}`
          .split("\n")
          .map((file) => file.trim())
          .filter(Boolean)
      )
    );

    if (files.length === 0 && process.env.GITHUB_ACTIONS === "true") {
      expect(files).toEqual([]);
      return;
    }

    expect(files.length).toBeGreaterThan(0);
    expect(files.every((file) => isSecurity122Web17AllowedFile(file)), files.join("\n")).toBe(true);
  });
});
