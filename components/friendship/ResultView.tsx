"use client";
import Link from "next/link";
import type { Ref } from "react";
import { average, CATEGORIES, PUBLIC_PATH, ranked, streak, title, type Challenge, type Locale, type QuestionStat, type Result } from "@/lib/friendship/core";
import { CategoryRadar } from "./CategoryRadar";
import { ShareTools } from "./ShareTools";
import { friendshipEvent } from "@/lib/friendship/analytics";
import { ResultPage } from "@/components/questionnaires/QuestionnaireResultPresentation";
export function ResultView({ locale, challenge, result, url, onManage, headingRef }: { locale: Locale; challenge: Challenge; result: Result; url: string; onManage?: () => void; headingRef?: Ref<HTMLHeadingElement> }) {
  const zh = locale === "zh";
  const max = Math.max(...Object.values(result.categories).map(c => c.correct / c.total));
  const highlights = Object.entries(result.categories).filter(([, c]) => c.correct / c.total === max).map(([key]) => CATEGORIES[key][locale]);
  const surprise = result.guesses.findIndex((guess, index) => guess !== result.answers[index]);
  const conversationIndex = surprise >= 0 ? surprise : 0;
  const conversationQuestion = challenge.questions[conversationIndex];
  return <ResultPage variant="dimensions" className="fq-result">
    <div className="fq-result-lead">
      <header className="fq-result-head">
        <p className="fq-eyebrow">{zh ? `${challenge.nickname} 的朋友默契挑战` : `${challenge.nickname}’s friendship quiz`}</p>
        <h2 ref={headingRef} tabIndex={-1}>{zh ? `${result.nickname} 的结果` : `${result.nickname}’s result`}</h2>
        <div className="fq-result-score">
          <div className="fq-ring" style={{ background: `conic-gradient(#7c3aed ${result.percent}%, #e9e2fa 0)` }} role="img" aria-label={zh ? `猜中 ${result.correct}/${result.total} 题，${result.percent}%` : `${result.correct}/${result.total} matches, ${result.percent}%`}><div><strong>{result.correct}<span>/{result.total}</span></strong><b>{result.percent}%</b></div></div>
          <div>
            <p className="fq-score-caption">{zh ? `你猜中了 ${result.total} 题中的 ${result.correct} 题。` : `You matched ${result.correct} of the creator’s ${result.total} choices.`}</p>
            <h3>{title(result.percent, locale)}</h3>
          </div>
        </div>
        <dl className="fq-result-facts"><div><dt>{zh ? "最佳连击" : "Best streak"}</dt><dd>{streak(result.guesses, result.answers).best} {zh ? "题" : "correct guesses"}</dd></div><div><dt>{zh ? "本次各类猜中情况" : "Your category matches"}</dt><dd>{max === 0 ? (zh ? "这次各类都还没猜中，可以从一个意外的答案聊起。" : "No category had a match this time. Start with one surprising answer.") : <>{zh ? "猜中率最高：" : "Highest match rate: "}{highlights.join(zh ? "、" : ", ")}{highlights.length > 1 ? (zh ? "（并列）" : " (tied)") : ""}</>}</dd></div></dl>
        <nav className="fq-result-jumps" aria-label={zh ? "跳到结果详情" : "Jump to result details"}>
          <a href="#fq-category-reading">{zh ? "六类猜中情况" : "Six category results"}</a>
          <a href="#fq-conversation">{zh ? "逐题对照" : "Answer comparison"}</a>
        </nav>
        {result.preview && <p role="status" className="fq-warning">{zh ? "创建者预演 · 未加入榜单或统计" : "Creator preview · not recorded in the ranking or statistics"}</p>}
        <p className="fq-muted">{zh ? "称号只是这轮小游戏的反馈，不给友情打分。" : "The title is playful feedback on this round, not a rating of your friendship."}</p>
      </header>

    </div>
    <section id="fq-category-reading" className="fq-section" aria-labelledby="fq-category-reading-title">
      <p className="fq-eyebrow">{zh ? "六类选择，各自来看" : "Six categories, read separately"}</p>
      <h3 id="fq-category-reading-title">{zh ? "六类题目猜中情况" : "Matches in each category"}</h3>
      <p>{zh ? "每类分开看：数值表示这一类题目中，你猜中了多少。" : "Read each category separately: the value shows how many of its questions you guessed correctly."}</p>
      <div className="fq-category-compare">
        <CategoryRadar locale={locale} result={result} />
        <div className="fq-category-bars">{Object.entries(result.categories).map(([category, c]) => {
          const value = Math.round(c.correct / c.total * 100); const avg = average(result.entries, category, result.id);
          return <div key={category}><div className="fq-bar-label"><b>{CATEGORIES[category][locale]}</b><span>{c.correct}/{c.total} · {value}%</span></div><div className="fq-bar-track" aria-hidden="true"><span style={{ width: `${value}%` }} /></div><p className="fq-muted">{avg === null ? (zh ? "尚无其他参与记录，暂无平均参照。" : "No other entries yet; no average to compare with.") : (zh ? `其他记录平均 ${Math.round(avg)}% · 差 ${value - Math.round(avg) > 0 ? "+" : ""}${value - Math.round(avg)} 个百分点` : `Other entries: ${Math.round(avg)}% average · ${value - Math.round(avg) > 0 ? "+" : ""}${value - Math.round(avg)} percentage points`)}</p></div>;
        })}</div>
      </div>
    </section>
      <section id="fq-conversation" className="fq-section fq-conversation" aria-labelledby="fq-conversation-title">
        <p className="fq-eyebrow">{zh ? "从分数回到朋友" : "From scores to friends"}</p>
        <h3 id="fq-conversation-title">{zh ? "把答案变成聊天" : "Turn your answers into a conversation"}</h3>
        {conversationQuestion && <div className="fq-conversation-example"><p><b>{conversationQuestion[locale].options.join(" / ")}</b></p><p>{zh ? "你猜的是：" : "Your guess: "}{conversationQuestion[locale].options[result.guesses[conversationIndex]]}<br />{zh ? "朋友选的是：" : "Their choice: "}{conversationQuestion[locale].options[result.answers[conversationIndex]]}</p><p>{surprise >= 0 ? (zh ? "这是一道你们选择不同的题，可以从这里聊起。" : "This is one of the choices you did not guess. It could be a place to start talking.") : (zh ? "这次全部猜中了！可以问问，你是凭哪次共同经历想到这个答案的？" : "Every guess matched this time! What shared memory helped you guess this choice?")}</p></div>}
        <p>{zh ? "问一句：你选这一边，是最近改变了想法，还是我一直没留意？尊重对方不想讨论的题。" : "Ask: Is this a recent change, or something I hadn't noticed? It's fine to leave a question out of the conversation."}</p>
        <details><summary>{zh ? "查看逐题对照" : "See every answer"}</summary><ol className="fq-answer-list">{challenge.questions.map((q, i) => <li key={q.id}><b>{i + 1}. {q[locale].options.join(" / ")}</b><p>{zh ? "你的猜测" : "Your guess"}: {q[locale].options[result.guesses[i]]}<br />{zh ? "出题者的选择" : "Creator's choice"}: {q[locale].options[result.answers[i]]} <span>{result.guesses[i] === result.answers[i] ? (zh ? "✓ 猜中" : "✓ Match") : (zh ? "↔ 新发现" : "↔ A discovery")}</span></p></li>)}</ol></details>
      </section>
    <details className="fq-section fq-secondary-result"><summary>{zh ? "查看好友榜单与逐题统计" : "See the friendboard and question statistics"}</summary><div id="fq-friendboard"><Ranking locale={locale} entries={result.entries} total={result.total} ownId={result.id} /></div>
    <QuestionAccuracy locale={locale} challenge={challenge} stats={result.question_stats} /></details>
    <details id="fq-result-limits" className="fq-section fq-result-limits" ><summary>{zh ? "计分和对照数据怎么看？" : "How do the score and comparisons work?"}</summary><p>{zh ? "平均参照只含同一题组的其他可见完成记录，不含你本人、隐藏记录或创建者预演。没有其他记录时，不显示虚构平均。" : "The comparison uses other visible completed entries on this exact quiz, excluding you, hidden entries and creator previews. With no other entries, no average is invented."}</p><p>{zh ? "分数是猜中数÷总题数，百分比四舍五入。称号只是游戏反馈，不代表友情质量、忠诚、人格配对或人口百分位。第一次作答之外的其他设备参与无法完全识别，榜单适合朋友间娱乐。" : "Your percentage is matches divided by questions, rounded to a whole number. Titles are playful feedback, not friendship quality, loyalty, personality compatibility or population percentiles. Play from another device cannot be reliably detected; keep rankings lighthearted."}</p></details>
    <ShareTools locale={locale} url={url} result={result} />
    <section className="fq-section fq-result-next" aria-label={zh ? "下一轮" : "Another round"}><Link className="fq-primary" href={`/${locale}${PUBLIC_PATH}`} onClick={() => friendshipEvent("continue_exploration", locale, result.preview ? "creator" : "friend", "make_my_quiz")}>{zh ? "创建我的挑战，让朋友来猜我" : "Create my own challenge"} <span aria-hidden="true">↗</span></Link>{onManage && <button onClick={onManage}>{zh ? "返回管理" : "Back to management"}</button>}</section>
  </ResultPage>;
}

export function Ranking({ locale, entries, total, ownId, onHide }: { locale: Locale; entries: Challenge["entries"]; total: number; ownId?: string; onHide?: (id: string, hidden: boolean) => void }) {
  const zh = locale === "zh"; const rows = ranked(entries);
  return <section className="fq-section"><h3>{zh ? "好友榜单" : "Friendboard"}</h3><p>{zh ? `${rows.length} 条可见完成记录 · 同分并列，共享名次` : `${rows.length} visible completed entries · equal scores share a rank`}</p>{rows.length === 0 ? <p>{zh ? "还没有好友完成。邀请一个朋友来猜猜吧。" : "Nobody has finished yet. Invite a friend to have a go."}</p> : <ol className="fq-ranking">{rows.map(e => <li key={e.id} className={e.id === ownId ? "fq-own" : ""}><b>{e.rank}</b><span>{e.nickname}</span><strong>{e.correct}/{total}</strong>{onHide && <button aria-label={zh ? `隐藏 ${e.nickname} 的记录` : `Hide entry by ${e.nickname}`} onClick={() => onHide(e.id, true)}>{zh ? "隐藏" : "Hide"}</button>}</li>)}</ol>}{onHide && entries.filter(e => e.hidden).map(e => <p key={e.id}>{e.nickname} <button onClick={() => onHide(e.id, false)}>{zh ? "恢复此记录" : "Restore entry"}</button></p>)}</section>;
}

export function QuestionAccuracy({ locale, challenge, stats }: { locale: Locale; challenge: Challenge; stats?: QuestionStat[] }) {
  if (!stats || stats.length !== challenge.questions.length) return null;
  const zh = locale === "zh";
  const rows = stats.map((stat, index) => ({ ...stat, index })).sort((a, b) => (a.total ? a.correct / a.total : 0) - (b.total ? b.correct / b.total : 0) || a.index - b.index);
  return <section className="fq-section"><details><summary>{zh ? "逐题猜中率 · 先看最难猜的题" : "Question-by-question accuracy · hardest first"}</summary><p>{zh ? "只含本题组可见的完整参与记录，包括你本人；隐藏记录与创建者预演不计入。" : "Visible completed entries on this quiz, including yours. Hidden entries and creator previews are excluded."}</p><ol className="fq-answer-list">{rows.map(row => <li key={row.index}><b>{row.index + 1}. {challenge.questions[row.index][locale].options.join(" / ")}</b><p>{row.total ? `${row.correct}/${row.total} · ${Math.round(row.correct / row.total * 100)}%` : (zh ? "尚无可见完成记录" : "No visible completed entries yet")}</p></li>)}</ol></details></section>;
}
