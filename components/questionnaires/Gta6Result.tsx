"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import {
  gta6Cover, gta6Name, gta6Profiles, gta6ResultPath, gta6TakePath, type Gta6Profile,
} from "@/lib/questionnaires/gta6CharacterQuiz";
import styles from "./Gta6Quiz.module.css";

type Props = {
  locale: Locale;
  profile: Gta6Profile;
  secondary?: Gta6Profile;
  invite?: Gta6Profile;
  reasons?: string[];
  onRestart?: () => void;
};

export function Gta6Result({ locale, profile, secondary, invite, reasons, onRestart }: Props) {
  const zh = locale === "zh";
  const heading = useRef<HTMLHeadingElement>(null);
  const [fallback, setFallback] = useState("");
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState(false);
  const resultPath = gta6ResultPath(locale, profile.id);

  useEffect(() => {
    if (onRestart) heading.current?.focus({ preventScroll: true });
  }, [onRestart]);

  async function copy() {
    const url = new URL(resultPath, window.location.origin).href;
    const shareText = `${profile.share[locale]}\n${url}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setFallback("");
      setMessage(zh ? "已复制结果与邀请链接。" : "Result and invite link copied.");
    } catch {
      setFallback(shareText);
      setMessage(zh ? "请选择下方文字并复制。" : "Select the text below to copy it.");
    }
  }

  async function downloadCard() {
    setDownloading(true);
    try {
      const cover = new window.Image();
      cover.src = gta6Cover;
      await cover.decode();
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      const crop = Math.min(cover.width, cover.height);
      ctx.drawImage(cover, cover.width - crop, 0, crop, crop, 0, 0, 1080, 1080);
      const shade = ctx.createLinearGradient(0, 0, 0, 1080);
      shade.addColorStop(0, "#101823a3");
      shade.addColorStop(0.44, "#10182321");
      shade.addColorStop(1, "#101823");
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, 1080, 1080);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 28px system-ui, sans-serif";
      ctx.fillText("FERMATMIND", 72, 98);
      ctx.font = "800 88px system-ui, sans-serif";
      ctx.fillText(profile.name, 72, 824, 936);
      ctx.fillStyle = "#ff8b88";
      ctx.font = "700 36px system-ui, sans-serif";
      ctx.fillText(profile.title[locale], 72, 895, 936);
      ctx.fillStyle = "#ffffff";
      ctx.font = "400 25px system-ui, sans-serif";
      ctx.fillText(zh ? "GTA 6 角色测试 · 非官方娱乐测验" : "GTA 6 Character Quiz · Unofficial fan quiz", 72, 1000);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `fermatmind-gta6-${profile.id}.png`;
      link.click();
      setMessage("");
    } catch {
      setMessage(zh ? "结果卡暂时无法生成，你仍可以复制链接。" : "Couldn't create the card. You can still copy the result link.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <main className={styles.screen} data-stage="result">
      <article className={styles.resultLayout}>
        <header className={styles.resultHero}>
          <div className={styles.resultHeroCopy}>
            <nav className={styles.resultTopline} aria-label={zh ? "结果导航" : "Result navigation"}>
              <Link prefetch={false} href={zh ? "/" : "/en"} className={styles.brand}>FERMATMIND</Link>
              <Link prefetch={false} href={gta6ResultPath(zh ? "en" : "zh", profile.id)} lang={zh ? "en" : "zh"}>{zh ? "English" : "简体中文"}</Link>
            </nav>
            <p className={styles.resultKicker}>{onRestart ? (zh ? "你的匹配角色" : "Your character match") : gta6Name[locale]}</p>
            <h1 ref={heading} tabIndex={-1}>{profile.name}</h1>
            <p className={styles.resultTitle}>{profile.title[locale]}</p>
          </div>
        </header>
        <div className={styles.report}>
          <div>
            <p className={styles.resultSummary}>{profile.summary[locale]}</p>
            {reasons?.length ? (
              <section className={styles.reportSection}>
                <h2>{zh ? "为什么是这个角色" : "Why you matched"}</h2>
                <ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
              </section>
            ) : null}
            {secondary && (
              <section className={styles.reportSection}>
                <h2>{zh ? "次要行事风格" : "Secondary play style"}</h2>
                <p><strong>{secondary.title[locale]}</strong> · {secondary.contribution[locale]}</p>
              </section>
            )}
          </div>
          <section className={styles.crew}>
            <h2>{invite ? (zh ? "你们的组队分工" : "Your crew roles") : (zh ? "你的救场分工" : "Your role on the crew")}</h2>
            {invite?.id === profile.id && <p>{zh ? "同一分工，两种视角。" : "Same role, two perspectives."}</p>}
            <dl>
              <dt>{invite ? (zh ? `你 · ${profile.name}` : `You · ${profile.name}`) : profile.title[locale]}</dt>
              <dd>{profile.contribution[locale]}</dd>
              <dd className={styles.friction}>{profile.friction[locale]}</dd>
              {invite && <>
                <dt>{zh ? `好友 · ${invite.name}` : `Friend · ${invite.name}`}</dt>
                <dd>{invite.contribution[locale]}</dd>
                <dd className={styles.friction}>{invite.friction[locale]}</dd>
              </>}
            </dl>
            {invite && <p className={styles.crewPrompt}>{zh ? "巡逻队提醒还有十分钟散场。你俩谁先带观众离场，谁负责收尾？" : "Patrol says the party wraps in ten minutes. Who guides the crowd out, and who wraps up backstage?"}</p>}
          </section>
        </div>
        <div className={styles.resultActions}>
          {onRestart ? (
            <>
              <button type="button" className={styles.primaryButton} onClick={copy}>{zh ? "复制结果，邀请好友" : "Copy result and invite a friend"} <span aria-hidden="true">↗</span></button>
              <button type="button" className={styles.secondaryButton} disabled={downloading} onClick={downloadCard}>{zh ? "保存结果卡" : "Save result card"}</button>
              <button type="button" className={styles.secondaryButton} onClick={onRestart}>{zh ? "重新测试" : "Retake"}</button>
            </>
          ) : (
            <>
              <Link prefetch={false} href={gta6TakePath(locale, profile.id)} className={styles.primaryButton}>{zh ? "我也来测，看看怎么组队" : "Take the quiz and team up"} <span aria-hidden="true">→</span></Link>
              <Link prefetch={false} href={gta6TakePath(locale)} className={styles.secondaryButton}>{zh ? "独自开测" : "Play solo"}</Link>
            </>
          )}
        </div>
        {message && <p className={styles.notice} role="status">{message}</p>}
        {fallback && <textarea className={styles.shareText} aria-label={zh ? "分享文案与链接" : "Share message and link"} readOnly value={fallback} onFocus={(event) => event.currentTarget.select()} />}
        <details className={styles.otherResults}>
          <summary>{zh ? "查看其他角色" : "Browse other characters"}</summary>
          <ul>
            {gta6Profiles.filter((other) => other.id !== profile.id).map((other) => (
              <li key={other.id}><Link href={gta6ResultPath(locale, other.id)} prefetch={false}>{other.name}</Link></li>
            ))}
          </ul>
        </details>
        <footer className={styles.footer}>
          {zh ? "费马测试独立创作的非官方娱乐测验，与 Rockstar Games 无隶属关系。" : "An unofficial entertainment quiz by FermatMind. Not affiliated with Rockstar Games."}
        </footer>
      </article>
    </main>
  );
}
