"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import type { ShareMethod } from "@/lib/entertainment/activity";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import {
  archetypeCardShortTitle, archetypeCardThemes, archetypeCardUrl, archetypeCardVariant,
  archetypePosterSize, archetypeResultName, archetypeRunnerUp, type CompleteArchetype,
} from "@/lib/questionnaires/archetypeResultCard";
import { getArchetypeHonorCopy, type ArchetypeHonorCopy } from "@/lib/questionnaires/archetypeHonorCardCopy";
import { archetypeResultCopy, archetypeSharePayload } from "@/lib/questionnaires/archetypeResultShare";
import { honorMetricCopy, metricSharePayload, scalePosition, type HonorResultMetrics } from "@/lib/questionnaires/honorResultMetrics";
import { storyHonorLabels, storySharePayload, type StoryHonorMode } from "@/lib/entertainment/wave3aStory";
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
  const config = archetypeCardVariant(quiz.slug, locale);
  const first = profiles[0];
  if (!config || !first) return null;
  const single = profiles.length === 1;
  const runner = archetypeRunnerUp(quiz, result);
  return <ResultHonorCard slug={quiz.slug} locale={locale} theme={config.theme}
    shortTitle={archetypeCardShortTitle(quiz, locale, translate)}
    matches={profiles.map(profile => ({ id: profile.id, name: archetypeResultName(profile, locale, translate) }))}
    runnerUp={runner ? archetypeResultName(runner, locale, translate) : undefined}
    reading={single ? getArchetypeHonorCopy(quiz.slug, first.id, locale) : undefined}
    portraitPath={single ? existingResultPortrait(quiz.slug, first.id) : undefined}
    emblem={single && quiz.slug !== "aura-color" && hasQuizResultArtwork(quiz.slug) ? first.id : undefined}
    onRetake={onRetake} />;
}

export function ResultHonorCard({ slug, locale, theme, shortTitle, matches, runnerUp, reading, portraitPath, emblem, artworkMark, age, credit, onRetake, onShare, spaceAfterActions, metrics, shareEntryOnly, entryOnlyPoster, shareTitle, storyMode }: {
  slug: string;
  locale: DisplayLocale;
  theme: keyof typeof archetypeCardThemes;
  shortTitle: string;
  matches: { id: string; name: string }[];
  runnerUp?: string;
  reading?: ArchetypeHonorCopy;
  portraitPath?: string;
  emblem?: string;
  artworkMark?: ReactNode;
  age?: { value: number; unit: string; label: string; contrast?: string; share?: string };
  credit?: string;
  onShare?: (method: ShareMethod) => void;
  spaceAfterActions?: boolean;
  metrics?: HonorResultMetrics;
  shareEntryOnly?: boolean;
  shareTitle?: string;
  storyMode?: StoryHonorMode;
  entryOnlyPoster?: boolean;
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

  const copy = archetypeResultCopy[locale];
  const color = archetypeCardThemes[theme];
  const names = matches.map(match => match.name);
  const tied = metrics?.tied ?? names.length > 1;
  const metricCopy = honorMetricCopy[locale];
  const tieLabel = metrics?.kind === "dimensions" ? metrics.tieLabel : undefined;
  const scale = metrics && metrics.kind !== "dimensions" ? metrics.scale : undefined;
  const portrait = !tied && !unavailableArtwork ? portraitPath : undefined;
  const tieMonogram = storyMode ? "||" : (locale === "en" ? "∥" : copy.tied.slice(-1));
  const monogram = tied ? tieMonogram : (names[0].match(/[\p{L}\p{N}]/u)?.[0] ?? "◇").toUpperCase();
  const url = archetypeCardUrl(locale, slug);
  const metricResult = scale && metrics?.kind === "scalar" ? [scale.display, ...names].join(" · ") : names.join(" · ");
  const payload = storyMode ? storySharePayload(locale, shortTitle, names, storyMode, url) : metrics ? metricSharePayload(locale, shareTitle ?? shortTitle, url, shareEntryOnly ? undefined : metricResult,
    metrics.kind === "practice" ? names[0] : undefined, reading?.soulVerdict) : archetypeSharePayload(locale, shortTitle, names, runnerUp, reading?.soulVerdict, url, age?.share);
  const caption = `${payload.text}\n${url}`;
  const filename = `fermatmind-${slug}-${locale}.png`;

  async function prepare(open: boolean) {
    if (busy) return;
    setBusy(true);
    setStatus("");
    try {
      if (!blob.current) {
        const { renderArchetypePoster } = await import("@/lib/questionnaires/archetypePoster");
        const image = await renderArchetypePoster({
          locale, theme, shortTitle, storyMode, names: entryOnlyPoster ? [shortTitle] : names, runnerUp,
          reading: entryOnlyPoster ? undefined : reading, credit,
          metrics: entryOnlyPoster ? { kind: "dimensions", label: metricCopy.invite, rows: [], tied: false } : metrics,
          age: age && { value: age.value, unit: age.unit, label: age.label },
          artwork: portrait ?? existingGraphic(art.current, color.light), monogram: entryOnlyPoster ? "◇" : monogram, url,
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
    if (typeof navigator.share === "function" && window.matchMedia?.("(pointer: coarse)").matches) {
      try {
        await navigator.share(payload);
        onShare?.("system");
        setStatus(copy.sent);
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(caption);
      onShare?.("copy");
      setStatus(copy.copied);
    } catch {
      setManual(caption);
    }
  }

  return <div className={styles.group} data-archetype-honor-group={slug} data-honor-action-spacing={spaceAfterActions ? "" : undefined}>
    <article className={styles.card} aria-label={names.join(" · ")} data-honor-story={storyMode} data-honor-metrics={metrics?.kind} data-archetype-honor-card={theme} data-archetype-state={tied ? "tied" : runnerUp ? "runner-up" : "single"}
      style={{ "--card-bg": color.background, "--card-glow": color.glow, "--card-line": color.line, "--card-light": color.light, "--card-ink": color.ink } as CSSProperties}>
      <header className={styles.header}>
        <p className={styles.brand}>{copy.brand} · {shortTitle}</p>
        <span className={styles.badge}>{tied ? tieLabel ?? copy.tied : metrics?.label ?? age?.label ?? (storyMode === "branch" ? storyHonorLabels[locale].branch : copy.closest)}</span>
      </header>
      {metrics ? <>
      <div className={`${styles.age} ${styles.metricPanel}`} data-honor-metric-panel>
        {scale && <>
          <p className={styles.metricReading} data-honor-reading>{scale.display}</p>
          <div className={styles.ruler} aria-hidden="true" style={{ "--age-marker": `${scalePosition(scale.value, scale.min, scale.max)}%` } as CSSProperties}><i /></div>
          <div className={styles.rulerLabels} aria-hidden="true">{scale.ticks.map(tick => <span key={tick}>{tick}</span>)}</div>
        </>}
        {metrics.kind === "dimensions" && metrics.rows.length > 0 && <dl className={styles.metricRows}>
          {metrics.rows.map(row => <div key={row.id} data-honor-metric={row.id}>
            <dt>{row.label}</dt><dd>{row.value}</dd>
            <div className={styles.metricTrack} aria-hidden="true"><i style={{ width: `${row.position}%` }} /></div>
          </div>)}
        </dl>}
        {!scale && (metrics.kind !== "dimensions" || !metrics.rows.length) && <p className={styles.metricMissing}>◇</p>}
      </div>
      {metrics.kind !== "practice" && <h3 className={styles.title} data-tie={tied ? "" : undefined}>
        {names.slice(0, 2).map((name, i) => <span key={matches[i].id}>{i ? "· " : ""}{name}</span>)}
        {names.length > 2 && <span className={styles.extra}>+{names.length - 2}</span>}
      </h3>}
      </> : age ? <div className={styles.age} data-honor-age-scale>
        <h3 className={styles.ageValue} data-mental-age-value>{age.value}{age.unit === "years" ? " " : ""}<span>{age.unit}</span></h3>
        <div className={styles.ruler} aria-hidden="true" style={{ "--age-marker": `${(age.value - 10) / 60 * 100}%` } as CSSProperties}><i /></div>
        <div className={styles.rulerLabels} aria-hidden="true"><span>10</span><span>25</span><span>40</span><span>55</span><span>70</span></div>
        {age.contrast && <p className={styles.ageContrast}>{age.contrast}</p>}
      </div> : <>
      <div className={styles.art} ref={art} data-archetype-art={portrait ? "portrait" : (emblem || artworkMark) ? "emblem" : "typographic"}>
        {portrait
          ? <Image unoptimized src={portrait} width={640} height={640} alt="" onError={() => setUnavailableArtwork(true)} />
          : <div className={styles.mark} aria-hidden="true">{artworkMark ? <div data-quiz-artwork>{artworkMark}</div> : emblem ? <QuizResultArtwork slug={slug} id={emblem} /> : <span>{monogram}</span>}</div>}
      </div>
      <div className={styles.names}>
        <h3 className={styles.title} data-tie={tied ? "" : undefined}>
          {names.slice(0, 2).map((name, i) => <span key={matches[i].id}>{i ? "· " : ""}{name}</span>)}
          {names.length > 2 && <span className={styles.extra}>+{names.length - 2}</span>}
        </h3>
        {runnerUp && <p className={styles.runner}>{copy.runner} · {runnerUp}</p>}
        {tied && <p className={styles.runner}>{storyMode ? storyHonorLabels[locale].tied : copy.tieLine}</p>}
      </div>
      </>}
      {reading && <>
        <ul className={styles.tags} aria-label={storyMode ? storyHonorLabels[locale].tags : metrics?.kind === "practice" ? metricCopy.badges : locale === "en" ? "Personality tags" : locale === "zh-TW" ? "性格標籤" : "性格标签"}>{reading.personalityTags.map(tag => <li key={tag}>{tag}</li>)}</ul>
        <p className={styles.quote} lang={locale} data-archetype-verdict>{reading.soulVerdict}</p>
      </>}
      <div className={styles.watermark}>{credit && <span>{credit}</span>} FermatMind.com</div>
    </article>
    <div className={styles.actions} data-archetype-honor-actions>
      <button type="button" disabled={busy} onClick={() => void prepare(false)}>{copy.save}</button>
      <button type="button" ref={opener} disabled={busy} onClick={() => void prepare(true)}>{copy.open}</button>
      <button type="button" onClick={() => void share()}>{copy.share}</button>
      {onRetake ? <button type="button" onClick={onRetake}>{copy.retake}</button> : <Link href={`${questionnairePath(locale, slug)}/take`}>{copy.retake}</Link>}
    </div>
    {metrics?.tied && names.length > 2 && <details className={styles.status} data-honor-full-ties>
      <summary>{metricCopy.ties} · {names.length}</summary>
      <p>{names.join(" · ")}</p>
    </details>}
    {entryOnlyPoster && <p className={styles.status}>{metricCopy.privateExport}</p>}
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
