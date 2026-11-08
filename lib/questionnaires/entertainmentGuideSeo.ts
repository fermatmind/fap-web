import topics from "./entertainmentGuideSeo.json";
import ui from "@/lib/i18n/zh-TW/ui.source.json";
import type { QuestionnaireProfile, Text } from "./types";

type GuideTopic = { quiz: Text; names: Record<string, { name: Text; topic: Text; presentation?: Pick<QuestionnaireProfile, "title" | "summary" | "seo"> }> };

/** Search presentation for existing public guides, never personal results or scoring. */
export function entertainmentGuideProfile(slug: string, locale: string, profile: QuestionnaireProfile): QuestionnaireProfile {
  if (locale !== "zh" && locale !== "en") return profile;
  if (slug === "chiikawa") {
    const copy = (ui.chiikawaGuideSeo as Record<string, { title: Text; description: Text }>)[profile.id];
    return copy ? { ...profile, title: copy.title, seo: { title: copy.title, description: copy.description } } : profile;
  }
  const group = (topics as Record<string, GuideTopic>)[slug];
  const topic = group?.names[profile.id];
  if (!group || !topic) return profile;
  if (slug === "love-languages" && locale === "en") return profile;
  if (topic.presentation) return { ...profile, ...topic.presentation };
  const { name: { zh: zhName, en: enName }, topic: { zh: zhTopic, en: enTopic } } = topic;
  let title: Text = { zh: `${zhName}：${group.quiz.zh}结果`, en: `${enName} | ${group.quiz.en} Result` };
  let description: Text = {
    zh: `${group.quiz.zh}中的${zhName}结果，围绕“${zhTopic}”解释本版角色联想。阅读具体例子、其他角色的区别与计分说明，再返回免费测试。非官方同人解读。`,
    en: `${enName} in the ${group.quiz.en}: ${enTopic}. Read examples, character comparisons and scoring notes, then take the free unofficial fan quiz.`,
  };
  if (slug === "aura-color") {
    title = { zh: `${zhName}的含义｜光环颜色测试结果`, en: `${enName} Meaning | Aura Color Test Result` };
    description = {
      zh: `本光环颜色测试把${zhName}用作“${zhTopic}”的象征。阅读日常例子、七色区别和选择次数的含义，也可返回21题测试；不测量真实能量场。`,
      en: `${enName} meaning in this quiz: ${enTopic}. Explore examples, compare seven symbolic colors and try the free 21-question aura color test. No energy field is measured.`,
    };
  } else if (slug === "moon-phase") {
    title = { zh: `${zhName}意象的含义｜月相测试结果`, en: `${enName} Meaning | Moon Phase Personality Test` };
    description = {
      zh: `本月相测试中的${zhName}意象指向“${zhTopic}”。阅读活动节奏的例子、八相比较与计分说明；这是24题问卷的趣味解读，不查询生日月相或月亮星座。`,
      en: `${enName} meaning in this moon phase personality test: ${enTopic}. Read examples and eight-phase comparisons. A quiz metaphor, not your birth moon or Moon sign.`,
    };
  } else if (slug === "philosopher-personality-test") {
    title = { zh: `${zhName}：哲学家测试结果与阅读入口`, en: `${enName} | Philosopher Quiz Result & Reading Guide` };
    description = {
      zh: `哲学家性格测试中的${zhName}阅读联想：${zhTopic}。结合原典背景、日常例子与其他八位哲学家的区别，理解18题结果；不鉴定你与历史人物的人格相似度。`,
      en: `${enName} in the philosopher personality quiz: ${enTopic}. Explore primary-text context, everyday examples and nine reading paths, without claiming a personality diagnosis.`,
    };
  } else if (slug === "adult-age-preferences") {
    description = {
      zh: `年上年下恋爱倾向测试的${zhName}结果：${zhTopic}。查看18道成年伴侣情境题的次数读法、并列与相处例子；不能由此确定择偶年龄或关系配对。`,
      en: `${enName} in the dating age preference quiz: ${enTopic}. Read counts, ties and examples from 18 adult scenarios; this does not prescribe a partner's age.`,
    };
  } else if (slug === "space-marine-chapter") {
    description = {
      zh: `战锤40K星际战士战团测试中的${zhName}同人指南：${zhTopic}。阅读18题爱好情境的选择解释、其他五战团比较与计数说明；不提供配军或战斗能力判断。`,
      en: `${enName} in the Warhammer 40K Space Marine Chapter quiz: ${enTopic}. Read hobby examples and six-Chapter comparisons, then try 18 choices. Unofficial, not army advice.`,
    };
  }
  const heading = slug === "philosopher-personality-test"
    ? { ...title, en: `${enName}: Philosopher Quiz Result` }
    : title;
  return { ...profile, title: heading, seo: { title, description } };
}

export function entertainmentGuideStartLabel(slug: string, locale: "zh" | "en"): string | undefined {
  if (slug === "love-languages") return undefined;
  const quiz = slug === "chiikawa" ? { zh: "吉伊卡哇角色测试", en: "Chiikawa Character Quiz" } : (topics as Record<string, GuideTopic>)[slug]?.quiz;
  return quiz ? (locale === "zh" ? `开始免费${quiz.zh}` : `Take the free ${quiz.en}`) : undefined;
}
