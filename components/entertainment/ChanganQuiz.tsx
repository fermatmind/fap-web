"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { recordEntertainmentActivity, type ActivityAction } from "@/lib/entertainment/activity";
import { CHANGAN_INTERLUDE_AFTER, changanPortraitPath, firstChoiceRule } from "@/lib/entertainment/changan";
import { contentImagePath, resultPath } from "@/lib/entertainment/guides";
import { resolveFunQuiz } from "@/lib/entertainment/scoring";
import type { Answers, FunQuiz } from "@/lib/entertainment/types";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./ChanganQuiz.module.css";

const subscribeHydration = () => () => {};

export function ChanganQuiz({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  const zh = locale === "zh";
  const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);
  const [stage, setStage] = useState<"intro" | "answer" | "interlude" | "result">("intro");
  const [answers, setAnswers] = useState<Answers>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const position = Object.keys(answers).length;
  const question = quiz.questions[position];
  const resultId = stage === "result" ? resolveFunQuiz(quiz, answers).resultIds[0] : undefined;
  const result = quiz.results.find(portrait => portrait.id === resultId);
  const track = (action: ActivityAction) => recordEntertainmentActivity(
    quiz.slug, quiz.version, locale, action, "single", action === "share" ? "image" : undefined,
  );

  useEffect(() => {
    heading.current?.focus();
  }, [stage, position]);

  function choose(questionId: string, optionId: string) {
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);
    if (position + 1 === quiz.questions.length) {
      track("complete");
      track("result_view");
      setStage("result");
    } else if (position + 1 === CHANGAN_INTERLUDE_AFTER) {
      setStage("interlude");
    }
  }

  return <div className={styles.stage} data-stage={stage}>
    {stage === "intro" && <div className={styles.scene}>
      <p className={styles.eyebrow}>{zh ? "长安卷 · 入城" : "Chang’an · The city gate"}</p>
      <h2 ref={heading} tabIndex={-1}>{zh ? "城门将闭，一封急信送到你手上。" : "The gates are closing. A letter lands in your hands."}</h2>
      <p>{zh ? "接下来的六个情境，由你决定先做什么。" : "Six scenes lie ahead. In each one, you decide what to do first."}</p>
      <button className={styles.primary} type="button" disabled={!hydrated} onClick={() => { track("start"); setStage("answer"); }}>
        {zh ? "推开长安城门" : "Enter Chang’an"} <span aria-hidden="true">→</span>
      </button>
    </div>}
    {stage === "answer" && question && <div className={styles.scene} key={question.id}>
      <progress className={styles.progress} aria-label={zh ? "作答进度" : "Quiz progress"} value={position} max={quiz.questions.length} />
      <p className={styles.eyebrow}>{zh ? `第 ${position + 1} / ${quiz.questions.length} 题` : `Question ${position + 1} of ${quiz.questions.length}`} · {question.scene?.[locale]}</p>
      <h2 ref={heading} tabIndex={-1}>{question.prompt[locale]}</h2>
      <div className={styles.choices}>
        {question.options.map((option, index) => <button className={styles.option} type="button" key={option.id} onClick={() => choose(question.id, option.id)}>
          <span aria-hidden="true">{"ABCD"[index]}</span>{option.label[locale]}
        </button>)}
      </div>
    </div>}
    {stage === "interlude" && <div className={styles.scene}>
      <p className={styles.eyebrow}>{zh ? "中场 · 西市" : "Interlude · West Market"}</p>
      <h2 ref={heading} tabIndex={-1}>{zh ? "急信送走了，去逛逛西市吧。" : "The letter is on its way. Let’s visit the West Market."}</h2>
      <p>{zh ? "隔着两条街，已经听见店家卷起竹帘的声音。剩下的时间，随你安排。" : "Two streets away, shopkeepers are already rolling up their bamboo blinds. The rest of the day is yours."}</p>
      <button className={styles.primary} type="button" onClick={() => setStage("answer")}>{zh ? "去西市" : "Visit the market"} <span aria-hidden="true">→</span></button>
    </div>}
    {stage === "result" && result && <div className={styles.result} data-changan-result={result.id}>
      <div className={styles.portrait}>
        <Image src={changanPortraitPath(result.id)} width={720} height={720} unoptimized loading="eager" alt={zh ? `${result.title.zh}的原创动漫画像` : `Original illustrated portrait of ${result.title.en}`} />
      </div>
      <div className={styles.reading}>
        <p className={styles.eyebrow}>{zh ? "你的长安人物卡" : "Your Chang’an portrait"}</p>
        <h2 ref={heading} tabIndex={-1}>{result.title[locale]}</h2>
        <p className={styles.epithet}>{result.epithet?.[locale]}</p>
        <p>{result.summary[locale]}</p>
        <div className={styles.actions}>
          <a className={styles.primary} href={`${contentImagePath(quiz, locale, result.id)}&download=1`} download={`fermatmind-changan-${result.id}-${locale}.png`} onClick={() => track("share")}>{zh ? "下载人物卡 PNG" : "Download portrait PNG"}</a>
          <a className={styles.secondary} href={contentImagePath(quiz, locale, result.id)} target="_blank" rel="noopener noreferrer">{zh ? "打开图片" : "Open image"}</a>
        </div>
        <p className={styles.hint}>{zh ? "手机上也可打开图片，长按保存后分享。" : "On mobile, you can open the image and press and hold to save it."}</p>
      </div>
      <div className={styles.details}>
        {result.history && <div><h3>{zh ? "史料与作品" : "Historical source"}</h3><p>{result.history.note[locale]} <a href={result.history.url} target="_blank" rel="noopener noreferrer">{result.history.label[locale]} ↗</a></p></div>}
        <details><summary>{zh ? "为什么是这位？" : "How did I get this match?"}</summary><p>{firstChoiceRule[locale]}</p></details>
        <p className={styles.hint}>{quiz.focus[locale]}</p>
        <div className={styles.actions}>
          <Link className={styles.secondary} prefetch={false} href={resultPath(locale, quiz.slug, result.id)}>{zh ? "读完整人物指南" : "Read the portrait guide"}</Link>
          <button className={styles.secondary} type="button" onClick={() => { setAnswers({}); setStage("intro"); }}>{zh ? "再玩一次" : "Play again"}</button>
        </div>
      </div>
    </div>}
  </div>;
}
