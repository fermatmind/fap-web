import { CATEGORIES, ranked, title, type Locale } from "@/lib/friendship/core";
import scores from "@/lib/friendship/score-example.json";
import { CategoryRadar } from "./CategoryRadar";

export function FriendshipScoreExample({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  // Aggregate output of FriendshipQuiz::submit for three deterministic 30-question
  // synthetic answer sheets. There are no live challenge or player records here.
  const entries = scores.map(({ correct, categories }, index) => ({
    id: String(index),
    nickname: zh ? `示例好友 ${index + 1}` : `Sample friend ${index + 1}`,
    correct,
    categories,
    hidden: false,
  }));
  const sample = scores[0];

  return (
    <section id="sample-score" className="scroll-mt-24" aria-labelledby="sample-score-heading">
      <h2 id="sample-score-heading">{zh ? `分数示例：${sample.total} 题猜中 ${sample.correct} 题` : `Sample score: ${sample.correct} matches out of ${sample.total}`}</h2>
      <p>{zh
        ? `下图与榜单均为虚构示例。示例好友 1 猜中 ${sample.correct} 题，四舍五入后是 ${sample.percent}%，获得「${title(sample.percent, locale)}」称号。`
        : `This chart and friendboard are fictional. Sample friend 1 matched ${sample.correct} of ${sample.total} answers, or ${sample.percent}% rounded, earning “${title(sample.percent, locale)}.”`}</p>
      <p>{zh
        ? "在线版必须答完才能提交并上榜。没答完的题不会按 0 分提前结算。猜错得 0 分，猜中得 1 分。"
        : "You must finish every question to submit an online round and join the friendboard. Unanswered questions do not count as zero in a partial score. A match earns one point and a miss earns zero."}</p>
      <CategoryRadar locale={locale} result={{ id: "0", categories: sample.categories, entries }} />
      <ul className="fq-answer-list">
        {Object.entries(sample.categories).map(([category, value]) => (
          <li key={category}>{CATEGORIES[category][locale]}: {value.correct}/{value.total}</li>
        ))}
      </ul>
      <table className="fq-example">
        <caption>{zh ? "示例榜单：22 分并列第 1，18 分排第 3" : "Sample friendboard: two share first place, then third"}</caption>
        <thead>
          <tr>
            <th scope="col">{zh ? "名次" : "Rank"}</th>
            <th scope="col">{zh ? "好友" : "Friend"}</th>
            <th scope="col">{zh ? "猜中数" : "Matches"}</th>
          </tr>
        </thead>
        <tbody>
          {ranked(entries).map(entry => (
            <tr key={entry.id}>
              <td>{entry.rank}</td>
              <th scope="row">{entry.nickname}</th>
              <td>{entry.correct}/{sample.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
