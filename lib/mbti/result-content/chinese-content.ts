import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";
import type { MbtiApplicationContent, MbtiDesktopCloneContent } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import pack from "./content.zh-CN.json";
import { isfjApplications } from "./isfj-applications";
import { applyIsfjContent } from "./isfj-chapters";

type Candidate = { chapters: MbtiDesktopCloneContent["chapters"]; applications: MbtiApplicationContent };
// Approved result copy shared by the 93- and 144-item forms.
const candidates = pack.types as unknown as Record<string, Candidate>;
export const resultCodes = Object.keys(candidates).flatMap((type) => [`${type}-A`, `${type}-T`]);

export function applyChineseContent(data: PersonalityDesktopCloneContentPayload): { data: PersonalityDesktopCloneContentPayload; applications: MbtiApplicationContent } {
  if (data.locale !== "zh-CN" || !resultCodes.includes(data.fullCode)) {
    throw new Error("A supported zh-CN MBTI source identity is required.");
  }
  const type = data.fullCode.slice(0, 4);
  if (type === "ISFJ") {
    // Both suffixes share the accepted sample; suffix differences remain in the score interpretation.
    const sample = applyIsfjContent({ ...data, fullCode: "ISFJ-A" });
    return { data: { ...sample, fullCode: data.fullCode }, applications: isfjApplications };
  }
  const candidate = candidates[type];
  return { data: { ...data, content: { ...data.content, chapters: {
    career: { ...data.content.chapters.career, ...candidate.chapters.career },
    growth: { ...data.content.chapters.growth, ...candidate.chapters.growth },
    relationships: { ...data.content.chapters.relationships, ...candidate.chapters.relationships },
  } } }, applications: candidate.applications };
}
