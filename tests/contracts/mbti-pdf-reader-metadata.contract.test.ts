import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { normalizeExtractedPdfText, parsePdfInfoOutput, parsePdfMetadataFallback } from "../../scripts/ops/check-mbti-result-page-pdf-smoke.mjs";
describe("MBTI rendered PDF reader", () => {
  it("parses ordinary pdfinfo whitespace and raw metadata without escaped-regex drift", () => {
    expect(parsePdfInfoOutput("Producer: Skia/PDF m149\nPages: 13\nPage size: 595 x 842 pts (A4)\n")).toMatchObject({ producer: "Skia/PDF m149", pages: 13, page_size: "595 x 842 pts (A4)" });
    expect(parsePdfMetadataFallback(Buffer.from("%PDF /Producer (Chromium) /Type /Page /MediaBox [0 0 595 842]"))).toMatchObject({ producer: "Chromium", pages: 1, page_size: "595 x 842 pts" });
  });
  it("recognizes Chinese headings split by a PDF reader without erasing English word boundaries", () => {
    expect(normalizeExtractedPdfText("成长\n优势\n关系 优势\nGrowth strengths")).toBe("成长优势关系优势\nGrowth strengths");
  });
  it("uses locale-specific operational page bounds and preserves explicit overrides", () => {
    const script = "scripts/ops/check-mbti-result-page-pdf-smoke.mjs";
    const read = (args: string[]) => JSON.parse(execFileSync("node", [script, "--json", "--locale", "en", ...args], { encoding: "utf8" }));
    expect(JSON.parse(execFileSync("node", [script, "--json", "--locale", "zh-CN"], { encoding: "utf8" })).page_count_range).toEqual([8, 18]);
    expect(read([]).page_count_range).toEqual([12, 26]);
    expect(read(["--min-pages", "5", "--max-pages", "30"]).page_count_range).toEqual([5, 30]);
  });
});
