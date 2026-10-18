import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAssessmentLandingUi } from "@/lib/tests/assessmentLandingUi";

// Google Fonts Noto Sans SC, OFL-1.1. Local subsets cover this card's fixed copy
// and ASCII; image rendering must not depend on a runtime font download.
const fonts = Promise.all([400, 700].map(async (weight) => ({
  name: "Assessment Social",
  data: await readFile(path.join(process.cwd(), "public/fonts/noto-sans-sc", `social-${weight}.ttf`)),
  weight: weight as 400 | 700,
  style: "normal" as const,
})));

export async function GET(request: Request, context: { params: Promise<{ page: string }> }) {
  const { page } = await context.params;
  const locale = new URL(request.url).searchParams.get("locale") === "zh" ? "zh" : "en";
  let title: string | undefined;
  let label: string;
  let note: string;
  if (page === "holland-career-interest-test-riasec") {
    title = getAssessmentLandingUi(page, locale)?.title;
    label = "HOLLAND · RIASEC";
    note = locale === "zh" ? "探索工作兴趣，不评定职业能力" : "Explore work interests, not job ability";
  } else {
    return new Response("Not found", { status: 404 });
  }
  if (!title) return new Response("Not found", { status: 404 });

  return new ImageResponse(
    <div lang={locale === "zh" ? "zh-CN" : "en"} style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 76px", background: "#f4f7fb", color: "#142b45", fontFamily: "Assessment Social" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28 }}>
        <span>FermatMind · 费马测试</span>
        <span style={{ color: "#45647d" }}>{label}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: 30, color: "#45647d" }}>{note}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 26, borderTop: "2px solid #c9d7e3", paddingTop: 24 }}>
        <span>fermatmind.com</span>
        <span>{locale === "zh" ? "自我理解与探索" : "Self-understanding and exploration"}</span>
      </div>
    </div>,
    { width: 1200, height: 630, fonts: await fonts }
  );
}
