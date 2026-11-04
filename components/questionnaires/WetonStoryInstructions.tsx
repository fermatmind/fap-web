import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";

export const wetonStoryEntryInstructions = { zh: "选择较想尝试的虚构贡献或关注。问卷无需生日，完成后完整保留所有最高并列组合；也可不作答，直接阅读35篇公开指南。", en: "Choose a fictional contribution or focus you would like to try. No birthdate is required. Every highest-tied pairing remains complete, and all 35 public guides can be read without answering." };

export function WetonStoryAnsweringInstructions({ quiz, locale }: { quiz: Pick<Questionnaire, "instructions">; locale: Locale }) {
  const zh = locale === "zh";
  return <section className="my-8 space-y-4 leading-8" aria-labelledby="weton-answering"><h2 id="weton-answering">{zh ? "35题故事选择：完整作答说明" : "35 story choices: full answering instructions"}</h2><p>{quiz.instructions?.[locale]}</p><p data-weton-privacy className="rounded-lg bg-slate-50 p-4 text-sm leading-7">{zh ? "答案与可选日期只留当前页面内存，不保存进度、不发送测试流程统计、不分享个人结果。刷新或换语言重新开始；退出并清除会同时清除问卷和历法输入。" : "Answers and the optional date remain in this page’s memory. No saved draft, quiz-flow statistics or personal-result sharing. Refreshing or changing language starts fresh; Exit and clear discards both quiz and calendar inputs."}</p></section>;
}
