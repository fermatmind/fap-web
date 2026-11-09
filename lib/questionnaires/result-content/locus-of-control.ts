import content from "./locus-of-control.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function locusOfControlResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  // Correct the current reader flow without changing the versioned source profile.
  const sections = profile.sections.map(section => section.id === "review-privacy" ? {
    ...section,
    paragraphs: section.paragraphs.map(paragraph => ({
      zh: paragraph.zh.replace("草稿需主动开启，仅本标签页24小时有效，完成、重测、退出清除即删。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。"),
      en: paragraph.en.replace("Opted-in drafts last twenty-four hours in this tab and clear on completion, retake or exit-and-clear.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over."),
    })),
  } : section);
  return { ...profile, sections: [...sections, ...additions] };
}
