import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { getMbtiResultContent } from "@/lib/mbti/result-content";
import { resultCodes } from "@/lib/mbti/result-content/chinese-content";
import { RichResultReport } from "@/components/result/RichResultReport";
import { buildMbtiResultProjectionViewModel } from "@/lib/mbti/publicProjection";
import type { ReportResponse } from "@/lib/api/v0_3";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import fixture from "@/tests/fixtures/report_ready.mbti.projection.json";
const mocks = vi.hoisted(() => ({ share: vi.fn(), checkout: vi.fn(), event: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/zh/result/attempt-123" }));
vi.mock("@/lib/api/v0_3", async () => ({ ...await vi.importActual("@/lib/api/v0_3"), createAttemptShare: mocks.share, createCheckoutOrOrder: mocks.checkout }));
vi.mock("@/lib/analytics", () => ({ trackEvent: mocks.event, trackObservableFunnelEvent: mocks.event }));
vi.mock("@/components/result/mbti/clone/useMbtiTraitCatalog", async () => {
  const { traitCatalogResponse } = await import("@/tests/fixtures/mbti-trait-catalog");
  const { parseMbtiTraitCatalog } = await import("@/lib/cms/mbti-trait-explanations");
  return { useMbtiTraitCatalog: (locale: string) => ({ content: locale === "zh" ? parseMbtiTraitCatalog(traitCatalogResponse()) : null, pending: false, unavailable: false }) };
});
vi.mock("@/lib/cms/personality-result-introduction", () => ({ fetchPersonalityResultIntroduction: vi.fn(async (fullCode: string) => ({ fullCode, contentHash: "a".repeat(64), paragraphs: ["Introduction one.", "Introduction two."] })) }));
function report(count: number, code = "ENFP-T") {
  return { ...JSON.parse(JSON.stringify(fixture).replaceAll("ENFP-T", code).replaceAll("ENFP", code.slice(0, 4))), mbti_form_v1: { form_code: `mbti_${count}`, label: `${count} items`, short_label: `${count}`, question_count: count, estimated_minutes: 10, scale_code: "MBTI" } } as unknown as ReportResponse;
}
function access(pdfState: "ready" | "locked" = "locked"): AttemptReportAccessView {
  return { attemptId: "attempt-123", accessState: "ready", reportState: "ready", pdfState, unlockStage: "locked", unlockSource: "none", reasonCode: null, accessLevel: "free", accessMode: "free_full", paywallSuppressed: true, variant: "free", projectionVersion: 1, modulesAllowed: [], modulesPreview: [], actions: { pageHref: null, pdfHref: pdfState === "ready" ? "/v0.3/attempts/attempt-123/result-page.pdf" : null, waitHref: null, historyHref: "/zh/history/mbti", lookupHref: null }, meta: { producedAt: null, refreshedAt: null } };
}
beforeEach(() => { cleanup(); vi.clearAllMocks(); Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } }); });
describe.each(["zh", "zh-TW", "en"] as const)("%s shared production result", (language) => {
  it.each(resultCodes)("has complete %s content and existing owned images", (code) => {
    const value = getMbtiResultContent(code, language)!;
    expect(value.data.fullCode).toBe(code);
    expect(value.data.content.hero.profileIdentity?.name).toBeTruthy();
    expect(value.data.content.hero.profileIdentity?.name).not.toBe(code);
    expect(value.data.content.hero.profileIdentity?.keywords?.length).toBeGreaterThan(0);
    for (const chapter of Object.values(value.data.content.chapters)) {
      expect(chapter.intro).toHaveLength(2);
      expect(chapter.strengths?.items).toHaveLength(6);
      expect(chapter.weaknesses?.items).toHaveLength(6);
    }
    for (const block of Object.values(value.applications)) expect(block.items).toHaveLength(6);
    for (const slot of value.data.assetSlots) expect(existsSync(`public${slot.assetRef?.url}`)).toBe(true);
  });
  it.each(resultCodes)("renders %s with the same UI for 93 and 144 items without changed scores", async (code) => {
    const bodies: string[] = [];
    for (const count of [93, 144]) {
      const data = report(count, code); const before = JSON.stringify(data);
      const projection = buildMbtiResultProjectionViewModel(data)!;
      render(<RichResultReport locale={language === "en" ? "en" : "zh"} displayLocale={language} reportData={data} accessProjection={access()} />);
      await waitFor(() => expect(screen.getByTestId("mbti-evidence-and-prompts")).toBeInTheDocument());
      await waitFor(() => expect(screen.getByTestId("mbti-result-intro")).toHaveAttribute("data-intro-state", "ready"));
      const intro = screen.getByTestId("mbti-result-intro");
      expect([...intro.children].map((child) => child.tagName)).toEqual(["P", "DIV", "P"]);
      expect(intro.children[1]).toHaveAttribute("data-testid", "mbti-asset-slot-traits");
      expect(within(screen.getByTestId("mbti-chapter-traits")).queryByTestId("mbti-asset-slot-traits")).not.toBeInTheDocument();
      const base = code.slice(0, 4).toLowerCase();
      for (const chapter of ["traits", "career", "growth", "relationships"]) {
        const art = screen.getByTestId(`mbti-asset-slot-${chapter}`);
        expect(art).toHaveAttribute("data-slot-mode", "ready");
        expect(new URL(art.querySelector("img")!.getAttribute("src")!, "http://localhost").pathname).toBe(`/images/mbti/result-chapters/${base}/${chapter}.webp`);
        if (chapter !== "traits") {
          const section = screen.getByTestId(`mbti-chapter-${chapter}`);
          expect(art.parentElement).toBe(section);
          expect(section.querySelector("h2")!.compareDocumentPosition(art) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
          expect(art.compareDocumentPosition(section.querySelector("p")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        }
      }
      expect(screen.queryByTestId("mbti-desktop-clone-snapshot-error")).not.toBeInTheDocument();
      expect(screen.queryByTestId("mbti-offer-full")).not.toBeInTheDocument();
      expect(screen.queryByTestId("result-export-panel")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /比较|Compare|解锁|Unlock/ })).not.toBeInTheDocument();
      expect(screen.getAllByTestId("mbti-evidence-and-prompts")).toHaveLength(1);
      const first = projection.dimensions[0];
      expect(screen.getByTestId("mbti-traits-card").textContent).toContain(`${first.dominantPct}%`);
      expect(JSON.stringify(data)).toBe(before);
      bodies.push(screen.getByTestId("mbti-result-shell").textContent!);
      cleanup();
    }
    expect(bodies[0]).toBe(bodies[1]);
    expect(mocks.checkout).not.toHaveBeenCalled();
  });
});
it("keeps formal share generation on the authorized API and never copies the private result URL", async () => {
  mocks.share.mockResolvedValue({ share_url: "https://fermatmind.com/zh/share/opaque-public-token" });
  render(<RichResultReport locale="zh" reportData={report(93)} accessProjection={access()} />);
  fireEvent.click(within(screen.getByTestId("mbti-sticky-rail")).getByRole("button", { name: "分享结果" }));
  await waitFor(() => expect(mocks.share).toHaveBeenCalledWith({ attemptId: "attempt-123", locale: "zh" }));
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://fermatmind.com/zh/share/opaque-public-token");
});
it("does not offer PDF download without server entitlement and invokes the existing download callback when allowed", async () => {
  const download = vi.fn().mockResolvedValue(undefined);
  render(<RichResultReport locale="en" reportData={report(144)} accessProjection={access()} onDownloadMbtiPdf={download} />);
  expect(screen.queryByRole("button", { name: "Download PDF" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "View my reports" })).toBeInTheDocument(); cleanup();
  render(<RichResultReport locale="en" reportData={report(144)} accessProjection={access("ready")} onDownloadMbtiPdf={download} />);
  fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));
  await waitFor(() => expect(download).toHaveBeenCalledOnce());
});
it("removes the unused unlock loading shell and retired product components", () => {
  expect(readFileSync("components/result/mbti/MbtiResultShell.tsx", "utf8")).not.toContain("MbtiResultShellLoadingShell");
  for (const file of ["MbtiOfferComparisonSection.tsx", "MbtiPostPurchaseSection.tsx"]) expect(existsSync(`components/result/mbti/${file}`)).toBe(false);
  expect(readFileSync("components/result/mbti/MbtiResultShell.tsx", "utf8")).not.toMatch(/createCheckoutOrOrder|createAttemptInviteUnlock|\/dev\//);
});

it("retains a retryable share action without copying a private or invalid URL on failure", async () => {
  mocks.share.mockResolvedValue({ share_url: "javascript:alert(1)" });
  render(<RichResultReport locale="zh" reportData={report(93)} accessProjection={access()} />);
  fireEvent.click(within(screen.getByTestId("mbti-sticky-rail")).getByRole("button", { name: "分享结果" }));
  await waitFor(() => expect(within(screen.getByTestId("mbti-sticky-rail")).getByRole("button", { name: "重试分享" })).toBeEnabled());
  expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
});

it("prints the same editorial chapters while retaining snapshot readiness checks", async () => {
  render(<RichResultReport locale="zh" reportData={report(144)} accessProjection={access("ready")} printSnapshotMode snapshotContentStatus={{ ok: true, source: "storage", missing: [] }} />);
  await waitFor(() => expect(screen.getByTestId("mbti-desktop-clone-shell")).toHaveAttribute("data-pdf-content-ready", "true"));
  expect(screen.getByTestId("mbti-desktop-clone-shell")).toHaveAttribute("data-pdf-content-source", "result-adapter");
  expect(screen.queryByTestId("mbti-sticky-rail")).not.toBeInTheDocument();
  expect(screen.queryByTestId("mbti-evidence-and-prompts")).not.toBeInTheDocument();
  expect(screen.getByTestId("mbti-chapter-career")).toBeInTheDocument();
});
