import { loadFixedMbtiSampleContent, loadFixedSample } from "@/lib/reports/fixedSamples";
import { mbtiLandingAxes, type MbtiLandingPublicSample } from "./landingReportPreview";

function firstSentence(paragraph: string, english: boolean) {
  if (english) return paragraph.match(/^.+?[.!?](?=\s|$)/u)?.[0] ?? paragraph;
  return paragraph.match(/^.+?[。！？]/u)?.[0] ?? paragraph;
}

export async function loadMbtiLandingPublicSample(locale: "zh" | "en" | "zh-TW" = "zh"): Promise<MbtiLandingPublicSample> {
  const [report, fixedContent] = await Promise.all([loadFixedSample("mbti", locale === "en" ? "en" : "zh"), loadFixedMbtiSampleContent(locale)]);
  const projection = report?.mbti_public_projection_v1;
  if (projection?.display_type !== "ISFJ-T" || !fixedContent || projection.display_type !== fixedContent.fullCode) {
    throw new Error("The fixed MBTI landing sample and its report content must describe ISFJ-T.");
  }

  const scores = mbtiLandingAxes.map(([axis]) => {
    const score = projection.dimensions?.find(item => item.axis_code === axis)?.raw_first_pole_pct;
    if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 100) {
      throw new Error(`Invalid fixed MBTI landing sample score for ${axis}.`);
    }
    return score;
  });
  const { content } = fixedContent;
  return {
    code: projection.display_type,
    scores,
    portraitLine: firstSentence(content.hero.profileIdentity?.introduction || content.intro.paragraphs[0], locale === "en"),
    chapters: [
      content.traits.body[0],
      content.chapters.career.intro[0],
      content.chapters.growth.intro[0],
      content.chapters.relationships.intro[0],
    ].map(text => firstSentence(text, locale === "en")),
  };
}
