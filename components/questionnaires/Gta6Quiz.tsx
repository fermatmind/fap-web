"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { readQuestionnaireDraftWithScorer } from "@/lib/questionnaires/draft";
import {
  gta6Draft, gta6DraftKey, gta6InviteRole, gta6Name, gta6Questions, gta6TakePath, scoreGta6,
} from "@/lib/questionnaires/gta6CharacterQuiz";
import type { Gta6Profile } from "@/lib/questionnaires/gta6CharacterQuiz";
import type { QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { Gta6Result } from "./Gta6Result";
import { QuestionnaireTakeOptions } from "./QuestionnaireTakeOptions";
import styles from "./Gta6Quiz.module.css";

const scenes = [
  {
    "zh": "17:00 · 第一幕：落日暗涌",
    "en": "5:00 PM · Act 1: Sunset Heat",
    "zh-TW": "17:00 · 第一幕：落日暗湧"
  },
  {
    "zh": "20:00 · 第二幕：霓虹失控",
    "en": "8:00 PM · Act 2: Neon Chaos",
    "zh-TW": "20:00 · 第二幕：霓虹失控"
  },
  {
    "zh": "00:00 · 第三幕：午夜暗账",
    "en": "Midnight · Act 3: Pack-Out",
    "zh-TW": "00:00 · 第三幕：午夜收攤"
  }
];

export function Gta6Quiz({ locale }: { locale: DisplayLocale }) {
  const zh = locale !== "en";
  const heading = useRef<HTMLHeadingElement>(null);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [position, setPosition] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [invite, setInvite] = useState<Gta6Profile>();
  const question = gta6Questions[position];
  const act = Math.floor(position / 4);
  const result = finished ? scoreGta6(gta6Draft, answers) : undefined;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setInvite(gta6InviteRole(window.location.search, window.location.hash));
      try {
        const raw = sessionStorage.getItem(gta6DraftKey);
        const saved = readQuestionnaireDraftWithScorer(gta6Draft, raw, scoreGta6);
        if (!saved) {
          if (raw) sessionStorage.removeItem(gta6DraftKey);
          return;
        }
        const next = gta6Questions.findIndex((item) => !saved[item.id]);
        setAnswers(saved);
        setPosition(next < 0 ? gta6Questions.length - 1 : next);
        setSaving(true);
      } catch {
        // The quiz is usable when storage is unavailable.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function focusQuestion() {
    window.requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }

  function save(next: QuestionnaireAnswers, enabled: boolean) {
    try {
      if (enabled) sessionStorage.setItem(gta6DraftKey, JSON.stringify({ version: gta6Draft.version, savedAt: Date.now(), answers: next }));
      else sessionStorage.removeItem(gta6DraftKey);
      setNotice("");
    } catch {
      if (enabled) {
        setSaving(false);
        setNotice(zh ? (locale === "zh-TW" ? "這個瀏覽器存不了進度，你還是可以繼續答題。" : "浏览器无法保存进度，当前作答仍可继续。") : "This browser couldn't save progress. You can keep answering.");
      }
    }
  }

  function restart() {
    setAnswers({});
    setPosition(0);
    setFinished(false);
    setSaving(false);
    save({}, false);
    focusQuestion();
  }

  function move(next: number) {
    setPosition(next);
    focusQuestion();
  }

  function leaveInvite() {
    const url = new URL(window.location.href);
    url.searchParams.delete("with");
    if (new URLSearchParams(url.hash.slice(1)).has("with")) url.hash = "";
    window.history.replaceState(window.history.state, "", url);
    setInvite(undefined);
  }

  if (result?.status === "complete") {
    const reasons = gta6Questions.flatMap((item) => {
      const choice = item.options.find((option) => option.id === answers[item.id] && option.role === result.primary.id);
      return choice ? [choice.label[locale]] : [];
    }).slice(-2).reverse();
    return (
      <Gta6Result
        locale={locale}
        profile={result.primary}
        secondary={result.secondary}
        invite={invite}
        reasons={reasons}
        onRestart={restart}
      />
    );
  }

  return (
    <main className={styles.screen} data-stage="answer" data-act={act + 1}>
      <div className={styles.questionLayout}>
        <section className={styles.questionBody}>
          <div className={styles.topline}>
            <span>{gta6Name[locale]}</span>
            <div className={styles.languages}>
              {(["en", "zh", "zh-TW"] as const).filter(lang => lang !== locale).map(lang => <Link key={lang} prefetch={false} href={gta6TakePath(lang, invite?.id)} lang={lang}>{({ en: "English", zh: "简体中文", "zh-TW": "繁體中文" })[lang]}</Link>)}
            </div>
          </div>
          <p className={styles.actLabel}>{scenes[act][locale]}</p>
          <div className={styles.progressLabel}>
            <span>{zh ? (locale === "zh-TW" ? `第 ${position + 1} / 12 題` : `第 ${position + 1} / 12 题`) : `Question ${position + 1} of 12`}</span>
          </div>
          <progress className={styles.progress} aria-label={zh ? (locale === "zh-TW" ? "答題進度" : "答题进度") : "Quiz progress"} max={gta6Questions.length} value={position + 1} />
          {invite && (
            <div className={styles.inviteBanner}>
              <span>{zh ? (locale === "zh-TW" ? `你的朋友配對到 ${invite.name}，想揪你一起救場。` : `好友测出了 ${invite.name}，邀你组队救场。`) : `Your friend got ${invite.name} and invited you to team up.`}</span>
              <button type="button" onClick={leaveInvite}>{zh ? (locale === "zh-TW" ? "改成自己玩" : "退出组队") : "Leave invite"}</button>
            </div>
          )}
          <div key={question.id} className={styles.prompt}>
            <h1 ref={heading} tabIndex={-1}>{question.prompt[locale]}</h1>
            <p>{zh ? (locale === "zh-TW" ? "選一個你現在最想做的動作" : "选你当下的第一反应") : "Pick your first instinct"}</p>
            <div className={styles.options}>
              <QuestionnaireTakeOptions
                questionId={question.id}
                prompt={question.prompt[locale]}
                options={question.options.map(({ id, label }) => ({ id, label: label[locale] }))}
                value={answers[question.id]}
                onChange={(option) => {
                  const next = { ...answers, [question.id]: option };
                  setAnswers(next);
                  if (saving) save(next, true);
                }}
              />
            </div>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.secondaryButton} disabled={position === 0} onClick={() => move(position - 1)}>
              {zh ? (locale === "zh-TW" ? "上一題" : "上一题") : "Back"}
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              disabled={!answers[question.id]}
              onClick={() => {
                if (position + 1 < gta6Questions.length) {
                  move(position + 1);
                } else if (scoreGta6(gta6Draft, answers).status === "complete") {
                  save({}, false);
                  setFinished(true);
                  window.scrollTo({ top: 0, behavior: "instant" });
                }
              }}
            >
              {position + 1 === gta6Questions.length ? (zh ? (locale === "zh-TW" ? "看我配對到誰" : "查看我的角色") : "See my result") : (zh ? (locale === "zh-TW" ? "下一題" : "下一题") : "Next question")} <span aria-hidden="true">→</span>
            </button>
          </div>
          <label className={styles.save}>
            <input type="checkbox" checked={saving} onChange={(event) => { setSaving(event.target.checked); save(answers, event.target.checked); }} />
            {zh ? (locale === "zh-TW" ? "在此分頁儲存進度" : "在此标签页保存进度") : "Save progress in this tab"}
          </label>
          {notice && <p role="status" className={styles.notice}>{notice}</p>}
        </section>
      </div>
    </main>
  );
}
