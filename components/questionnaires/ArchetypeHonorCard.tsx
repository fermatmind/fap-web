"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import {
  archetypeCardShortTitle, archetypeCardThemes, archetypeCardUrl, archetypeCardVariant,
  archetypePosterSize, archetypeResultName, archetypeRunnerUp, type CompleteArchetype,
} from "@/lib/questionnaires/archetypeResultCard";
import { getArchetypeHonorCopy } from "@/lib/questionnaires/archetypeHonorCardCopy";
import { archetypeResultCopy, archetypeSharePayload } from "@/lib/questionnaires/archetypeResultShare";
import { questionnairePath } from "@/lib/questionnaires/paths";
import { hasQuizResultArtwork, QuizResultArtwork } from "./QuizResultArtwork";
import { existingResultPortrait } from "./PortraitResultLead";
import styles from "./ArchetypeHonorCard.module.css";
import dialogStyles from "./SevenSinsOverview.module.css";

function existingGraphic(element: HTMLElement | null, color: string) {
  const source = element?.querySelector("[data-quiz-artwork] svg");
  if (!source) return undefined;
  const svg = source.cloneNode(true) as SVGElement;
  svg.setAttribute("width", "256");
  svg.setAttribute("height", "256");
  svg.style.color = color;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
}

export function ArchetypeHonorCard({ quiz, result, profiles, locale, copy: translate, onRetake }: {
  quiz: Questionnaire;
  result: CompleteArchetype;
  profiles: QuestionnaireProfile[];
  locale: DisplayLocale;
  copy: (value: string) => string;
  onRetake?: () => void;
}) {
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [manual, setManual] = useState("");
  const [unavailableArtwork, setUnavailableArtwork] = useState(false);
  const blob = useRef("");
  const active = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const art = useRef<HTMLDivElement>(null);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      if (blob.current) URL.revokeObjectURL(blob.current);
      blob.current = "";
    };
  }, []);
  useEffect(() => {
    if (preview && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [preview]);

  const config = archetypeCardVariant(quiz.slug, locale);
  const first = profiles[0];
  if (!config || !first) return null;

  const copy = archetypeResultCopy[locale];
  const color = archetypeCardThemes[config.theme];
  const shortTitle = archetypeCardShortTitle(quiz, locale, translate);
  const names = profiles.map(profile => archetypeResultName(profile, locale, translate));
  const tied = names.length > 1;
  const runner = archetypeRunnerUp(quiz, result);
  const runnerUp = runner ? archetypeResultName(runner, locale, translate) : undefined;
  const reading = tied ? undefined : getArchetypeHonorCopy(quiz.slug, first.id, locale);
  // A tie has no singled-out lead; its edition mark is neutral.
  const portrait = !tied && !unavailableArtwork ? existingResultPortrait(quiz.slug, first.id) : undefined;
  const emblem = !tied && quiz.slug !== "aura-color" && hasQuizResultArtwork(quiz.slug);
  const monogram = tied ? (locale === "en" ? "∥" : copy.tied.slice(-1)) : Array.from(names[0].match(/[\p{L}\p{N}]/gu)?.[0] ?? "◇")[0].toUpperCase();
  const url = archetypeCardUrl(locale, quiz.slug);
  const payload = archetypeSharePayload(locale, shortTitle, names, runnerUp, reading?.soulVerdict, url);
  const caption = `${payload.text}\n${url}`;
  const filename = `fermatmind-${quiz.slug}-${locale}.png`;

  async function prepare(open: boolean) {
    if (busy || !config) return;
    setBusy(true);
    setStatus("");
    try {
      if (!blob.current) {
        const { renderArchetypePoster } = await import("@/lib/questionnaires/archetypePoster");
        const image = await renderArchetypePoster({
          locale, theme: config.theme, shortTitle, names, runnerUp, reading,
          artwork: portrait ?? existingGraphic(art.current, color.light), monogram, url,
        });
        if (!active.current) return;
        blob.current = URL.createObjectURL(image);
      }
      if (open) setPreview(blob.current);
      else {
        const link = document.createElement("a");
        link.href = blob.current;
        link.download = filename;
        link.click();
      }
    } catch {
      if (active.current) setStatus(copy.error);
    } finally {
      if (active.current) setBusy(false);
    }
  }

  async function share() {
    setStatus("");
    setManual("");
    if (window.matchMedia("(pointer: coarse)").matches && typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        setStatus(copy.sent);
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(caption);
      setStatus(copy.copied);
    } catch {
      setManual(caption);
    }
  }

  return <div className={styles.group} data-archetype-honor-group={quiz.slug}>
    <article className={styles.card} aria-label={names.join(" · ")} data-archetype-honor-card={config.theme} data-archetype-state={tied ? "tied" : runnerUp ? "runner-up" : "single"}
      style={{ "--card-bg": color.background, "--card-glow": color.glow, "--card-line": color.line, "--card-light": color.light, "--card-ink": color.ink } as CSSProperties}>
      <header className={styles.header}>
        <p className={styles.brand}>{copy.brand} · {shortTitle}</p>
        <span className={styles.badge}>{tied ? copy.tied : copy.closest}</span>
      </header>
      <div className={styles.art} ref={art} data-archetype-art={portrait ? "portrait" : emblem ? "emblem" : "typographic"}>
        {portrait
          ? <Image unoptimized src={portrait} width={640} height={640} alt="" onError={() => setUnavailableArtwork(true)} />
          : <div className={styles.mark} aria-hidden="true">{emblem ? <QuizResultArtwork slug={quiz.slug} id={first.id} /> : <span>{monogram}</span>}</div>}
      </div>
      <div className={styles.names}>
        <h3 className={styles.title} data-tie={tied ? "" : undefined}>
          {names.slice(0, 2).map((name, i) => <span key={profiles[i].id}>{i ? "· " : ""}{name}</span>)}
          {names.length > 2 && <span className={styles.extra}>+{names.length - 2}</span>}
        </h3>
        {runnerUp && <p className={styles.runner}>{copy.runner} · {runnerUp}</p>}
        {tied && <p className={styles.runner}>{copy.tieLine}</p>}
      </div>
      {reading && <>
        <ul className={styles.tags} aria-label={locale === "en" ? "Personality tags" : locale === "zh-TW" ? "性格標籤" : "性格标签"}>{reading.personalityTags.map(tag => <li key={tag}>{tag}</li>)}</ul>
        <p className={styles.quote} lang={locale} data-archetype-verdict>{reading.soulVerdict}</p>
      </>}
      <p className={styles.watermark}>FermatMind.com</p>
    </article>
    <div className={styles.actions} data-archetype-honor-actions>
      <button type="button" disabled={busy} onClick={() => void prepare(false)}>{copy.save}</button>
      <button type="button" ref={opener} disabled={busy} onClick={() => void prepare(true)}>{copy.open}</button>
      <button type="button" onClick={() => void share()}>{copy.share}</button>
      {onRetake ? <button type="button" onClick={onRetake}>{copy.retake}</button> : <Link href={`${questionnairePath(locale, quiz.slug)}/take`}>{copy.retake}</Link>}
    </div>
    {status && <p className={styles.status} role="status">{status}</p>}
    {manual && <label className={styles.status}>{copy.manual}<textarea className="block w-full border" readOnly value={manual} onFocus={event => event.currentTarget.select()} /></label>}
    <dialog ref={dialog} className={dialogStyles.cardLightbox} aria-label={copy.open} data-archetype-lightbox
      onClose={() => { setPreview(""); opener.current?.focus(); }}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      {preview && <div className={dialogStyles.cardLightboxBody}>
        <button type="button" aria-label={copy.close} onClick={() => dialog.current?.close()}>×</button>
        <Image unoptimized src={preview} width={archetypePosterSize.width} height={archetypePosterSize.height} alt={names.join(" · ")} />
        <p>{copy.hold}</p>
        <a href={preview} download={filename}>{copy.download}</a>
      </div>}
    </dialog>
  </div>;
}
