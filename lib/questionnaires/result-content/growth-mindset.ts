import content from "./growth-mindset.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

export function growthMindsetResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  // Correct the current reader flow without changing the versioned source profile.
  const sections = profile.sections.map(section => {
    if (section.id === "reference") return { ...section, paragraphs: section.paragraphs.map(paragraph => ({
      zh: paragraph.zh.replace("若换了技能，回答可能改变；恢复草稿时请仍用原先参照，不记得可以清除后重测，而不是把两种情境当作同一结果。", "若换了技能，回答可能改变。重测同一情境时，请继续用原先的技能作参照；若想换一项技能，就把它当成一次新的观察。"),
      en: paragraph.en.replace("Resume a draft with the same skill, or clear and retake if you do not remember it, rather than treating two contexts as one result.", "Use the same skill if you retake to reflect on the same situation. If you choose another skill, treat it as a new observation."),
    })) };
    if (section.id === "reflection-scope") return { ...section, paragraphs: section.paragraphs.map(paragraph => ({
      zh: paragraph.zh.replace("草稿需主动开启，本标签页24小时后失效，完成、重测或退出清除即删。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。"),
      en: paragraph.en.replace("Opted-in drafts expire after twenty-four hours in this tab and clear on completion, retake or exit-and-clear.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over."),
    })) };
    return section;
  });
  return { ...profile, sections: [...sections, ...additions] };
}
