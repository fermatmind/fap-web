import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MbtiReportAccessSummary, MbtiScoredReportExample } from "@/components/tests/MbtiReportPreview";

describe("public MBTI report preview", () => {
  it("uses published reader copy only when full-report access is available", () => {
    const cmsCopy = "Read the four chapters as a guest.";
    const full = renderToStaticMarkup(<MbtiReportAccessSummary locale="en" freeFullReport cmsCopy={cmsCopy} />);
    const basic = renderToStaticMarkup(<MbtiReportAccessSummary locale="en" freeFullReport={false} cmsCopy={cmsCopy} />);
    const fallback = renderToStaticMarkup(<MbtiReportAccessSummary locale="en" freeFullReport />);
    expect(full).toContain('data-mbti-report-copy="cms"');
    expect(full).toContain(cmsCopy);
    expect(basic).toContain("view your basic result for free");
    expect(basic).not.toContain(cmsCopy);
    expect(fallback).toContain("view the four web report chapters for free");
    expect(fallback).toContain('href="#scored-report-example"');
  });

  it.each([
    ["en", "Sample report from synthetic answers", "Your Career Path"],
    ["zh", "合成作答报告示例", "职业路径"],
    ["zh-TW", "合成作答報告範例", "職涯路徑"],
  ] as const)("renders the approved %s excerpt with no private report navigation", (locale, title, chapter) => {
    const html = renderToStaticMarkup(<MbtiScoredReportExample locale={locale} />);
    expect(html).toContain('id="scored-report-example"');
    expect(html).toContain(title);
    expect(html).toContain(chapter);
    expect(html).toContain("INTJ-T");
    expect(html).toContain("2026.01.mbti_93");
    expect(html).toContain("54%");
    expect(html).toMatch(/data-testid="mbti-example-additional-axis"[^>]*><dt>[^<]*A\/T[^<]*<\/dt><dd[^>]*>55%<\/dd>/);
    expect(html).not.toMatch(/href=|attempt_id|access_token/);
  });
});
