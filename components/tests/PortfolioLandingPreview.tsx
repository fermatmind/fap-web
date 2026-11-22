import type { DisplayLocale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { buildPortfolioPreview, hasPortfolioLanding } from "@/lib/entertainment/portfolioLanding";
import { ExploreChoicePreview, ExploreLandingSamples } from "./ExploreLandingSamples";
import styles from "./portfolio-landing-preview.module.css";

const copy = {
  en: {
    heading: "Try a sample before you start",
    examples: "Illustrative results",
    tabs: ["Example 1", "Example 2", "Example 3"],
    format: "What the result can show",
    practice: (correct: number, total: number) => `${correct} of ${total} correct`,
    guide: "Read the guide",
    sampleQuestion: "Sample question",
    chooseOne: "Choose one answer.",
    noScore: "This response is left out when calculating the average.",
    adds: (dimension: string) => `This choice counts toward ${dimension}.`,
    rate: (points: number) => `This answer contributes ${points} on the 1–5 scale.`,
    practiceTry: "This sample uses the same answer format as the timed or scored questions.",
    chooseMany: "Choose the options that fit.",
    rank: "Put the options in order.",
    disclosure: "These examples use made-up answers. Your result is based on your own responses.",
    fieldAccuracy: "Field accuracy",
    correctKph: "Correct characters per hour",
    timed: "Complete records within the time limit. The result shows field accuracy and correct characters per hour.",
  },
  zh: {
    heading: "先看看题目和结果",
    examples: "虚构作答示例",
    tabs: ["示例一", "示例二", "示例三"],
    format: "结果会呈现什么",
    practice: (correct: number, total: number) => `答对 ${correct} / ${total} 题`,
    guide: "阅读指南",
    sampleQuestion: "题目示例",
    chooseOne: "选择一个选项。",
    noScore: "这个答案不计入平均分。",
    adds: (dimension: string) => `这个选项会给「${dimension}」计入一次选择。`,
    rate: (points: number) => `按 1–5 分规则，这个答案计 ${points} 分。`,
    practiceTry: "正式练习使用同样的答题方式。",
    chooseMany: "选择符合要求的选项。",
    rank: "按自己的判断为选项排序。",
    disclosure: "以下结果按虚构答案计算。正式结果以你的实际作答为准。",
    fieldAccuracy: "字段正确率",
    correctKph: "每小时正确字符数",
    timed: "在限时内录完记录。结果会显示字段正确率和每小时正确录入的字符数。",
  },
  "zh-TW": {
    heading: "先看題目和結果範例",
    examples: "模擬作答結果",
    tabs: ["範例一", "範例二", "範例三"],
    format: "結果可以看到什麼",
    practice: (correct: number, total: number) => `答對 ${correct} / ${total} 題`,
    guide: "閱讀完整指南",
    sampleQuestion: "題目範例",
    chooseOne: "選一個答案。",
    noScore: "這個答案不列入平均分。",
    adds: (dimension: string) => `選這項會為「${dimension}」計入一次。`,
    rate: (points: number) => `依 1–5 分的規則，這個答案計 ${points} 分。`,
    practiceTry: "正式練習的作答方式和這題一樣。",
    chooseMany: "選出符合題意的選項。",
    rank: "依自己的判斷排列選項。",
    disclosure: "以下結果由模擬答案計算。完成測驗後，會依你的實際作答顯示結果。",
    fieldAccuracy: "欄位正確率",
    correctKph: "每小時正確字元數",
    timed: "在時間內完成資料輸入。結果會顯示欄位正確率和每小時正確輸入的字元數。",
  },
} satisfies Record<DisplayLocale, object>;

export function PortfolioLandingPreview({ quiz, locale }: { quiz: Questionnaire; locale: DisplayLocale }) {
  const ui = copy[locale];
  const read = locale === "en" ? "en" : "zh";
  const sampleQuestion = quiz.questions[0];
  const optionNotes = sampleQuestion?.interaction ? null : sampleQuestion?.options.map(option => {
    if (quiz.kind === "likert") return typeof option.score === "number" ? ui.rate(sampleQuestion.reverse ? 6 - option.score : option.score) : ui.noScore;
    if (quiz.kind === "archetype" || quiz.kind === "directional") {
      const direction = quiz.directions.find(item => item.id === option.directionId);
      return direction ? ui.adds(direction.title[read]) : "";
    }
    return "";
  });
  const exampleByResult = new Map<string, ReturnType<typeof buildPortfolioPreview>>();
  for (let sample = 0; sample < 3; sample++) {
    const result = buildPortfolioPreview(quiz, sample);
    if (result.kind !== "format") exampleByResult.set(JSON.stringify(result), result);
  }
  const examples = [...exampleByResult.values()];
  const namedProfiles = (ids: string[]) => ids.flatMap(id => {
    const profile = quiz.profiles.find(item => item.id === id);
    return profile ? [profile] : [];
  });
  return (
    <section className={styles.preview} id="portfolio-preview" aria-labelledby="portfolio-preview-heading" data-portfolio-entry={quiz.slug}>
      <h2 id="portfolio-preview-heading">{ui.heading}</h2>
      <div className={styles.grid}>
        <div className={styles.question}>
          {sampleQuestion && optionNotes?.every(Boolean) ? <ExploreChoicePreview label={ui.sampleQuestion}
            prompt={sampleQuestion.prompt[read]} options={sampleQuestion.options.map(option => option.label[read])} notes={optionNotes}
          /> : sampleQuestion ? <>
            <h3>{ui.sampleQuestion}</h3>
            <p className={styles.prompt}>{sampleQuestion.prompt[read]}</p>
            <p className={styles.instruction}>{sampleQuestion.interaction === "rank" ? ui.rank : sampleQuestion.interaction === "multiple" ? ui.chooseMany : ui.chooseOne}</p>
            <ol className={styles.options}>{sampleQuestion.options.map(option => <li key={option.id}>{option.label[read]}</li>)}</ol>
            {quiz.kind === "practice" && <p className={styles.instruction}>{ui.practiceTry}</p>}
          </> : <>
            <h3>{ui.format}</h3>
            <p>{quiz.kind === "data-entry" ? ui.timed : quiz.introduction[read]}</p>
          </>}
        </div>
        <div>
          {examples.length > 0 ? <>
            <ExploreLandingSamples label={ui.examples} names={ui.tabs.slice(0, examples.length)}>
              {examples.map(result => {
                if (result.kind === "format") return null;
                const profiles = namedProfiles(result.kind === "matches" ? result.profileIds : result.kind === "data-entry" ? [result.profileId] : []);
                return <div key={JSON.stringify(result)} className={styles.result}>
                  {result.kind === "practice" && <strong>{ui.practice(result.correct, result.total)}</strong>}
                  {profiles.map(profile => <article key={profile.id} data-portfolio-result-id={profile.id}>
                    <h3>{profile.title[read]}</h3>
                    <p>{profile.headline[read]}</p>
                    <a href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{ui.guide}<span aria-hidden> →</span></a>
                  </article>)}
                  {result.kind === "data-entry" && <dl className={styles.scores}>
                    <div><dt>{ui.fieldAccuracy}</dt><dd>{result.fieldAccuracy}%</dd></div>
                    <div><dt>{ui.correctKph}</dt><dd>{result.exactCharacterKph}</dd></div>
                  </dl>}
                  {(result.kind === "dimensions" || result.kind === "practice") && <dl className={styles.scores}>
                    {result.scores.map(score => {
                      const direction = quiz.directions.find(item => item.id === score.id);
                      return direction ? <div key={score.id}>
                        <dt>{direction.title[read]}</dt>
                        <dd>{new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(score.value)} / {score.total}</dd>
                        <meter aria-label={direction.title[read]} min={"min" in score ? score.min : 0} value={score.value} max={score.total} />
                      </div> : null;
                    })}
                  </dl>}
                </div>;
              })}
            </ExploreLandingSamples>
            <p className={styles.disclosure}>{ui.disclosure}</p>
          </> : <div className={styles.question}>
            <h3>{ui.format}</h3>
            <ul className={styles.guides}>{quiz.profiles.slice(0, 3).map(profile => <li key={profile.id}>
              <a href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[read]}<span aria-hidden> →</span></a>
            </li>)}</ul>
          </div>}
        </div>
      </div>
    </section>
  );
}

export async function preparePortfolioLanding(slug: string, locale: DisplayLocale, projected?: Questionnaire | null) {
  if (!hasPortfolioLanding(slug)) return null;
  const quiz = locale === "zh-TW" ? projected : projected ?? await loadQuestionnaire(slug);
  return quiz ? <PortfolioLandingPreview quiz={quiz} locale={locale} /> : null;
}
