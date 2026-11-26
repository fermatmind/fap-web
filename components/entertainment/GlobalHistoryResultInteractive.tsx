"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { recordEntertainmentActivity } from "@/lib/entertainment/activity";
import { GLOBAL_HISTORY_SLUG, GLOBAL_HISTORY_VERSION, globalHistoryPath } from "@/lib/entertainment/global-history/config";
import { GlobalHistoryPosterExport, type HistoryPosterContent } from "./GlobalHistoryPosterExport";
import { useGlobalHistoryVector } from "./GlobalHistoryReport";
import type { DisplayLocale } from "@/lib/i18n/locales";
import styles from "./GlobalHistoryResultV2.module.css";

const subscribe = () => () => {};

type HeroLabels = {
  start: string; questionCount: string; sync: string; similar: string; contrast: string; tie: string;
  match: string; traits: string; save: string; open: string; share: string; shareProfile: string;
  copied: string; copiedProfile: string; shareFallback: string; retake: string; own: string; figure: string;
};

export function GlobalHistoryReveal({ id, locale, axisNames, profile, canonical, poster, labels, identity, portrait, languages, credit }: {
  id: string; locale: DisplayLocale; axisNames: string[]; profile: readonly number[];
  canonical: string; poster: HistoryPosterContent; labels: HeroLabels;
  identity: ReactNode; portrait: ReactNode; languages: ReactNode; credit: ReactNode;
}) {
  const vector = useGlobalHistoryVector(id);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [sharing, setSharing] = useState<"idle" | "copied" | "manual">("idle");
  const differences = vector?.map((score, index) => ({ index, gap: Math.abs(score - profile[index]) }))
    .sort((a, b) => a.gap - b.gap || a.index - b.index);
  const furthest = differences?.at(-1);
  const distance = differences ? Math.sqrt(differences.reduce((sum, row) => sum + row.gap ** 2, 0)) : 0;
  const similarity = Math.round(100 * (1 - distance / (6 * Math.sqrt(profile.length))));
  const shareTitle = `${poster.name} · ${poster.title}`;
  const shareText = vector ? [shareTitle, poster.description, canonical].join("\n") : canonical;
  const take = `${globalHistoryPath(locale)}/take`;

  async function share() {
    setSharing("idle");
    const analyticsLocale = locale === "en" ? "en" : "zh";
    if (vector && typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches) {
      const data = { title: shareTitle, text: `${shareTitle}\n${poster.description}`, url: canonical };
      try {
        if (!navigator.canShare || navigator.canShare(data)) {
          await navigator.share(data);
          recordEntertainmentActivity(GLOBAL_HISTORY_SLUG, GLOBAL_HISTORY_VERSION, analyticsLocale, "share", "single", "system");
          return;
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setSharing("copied");
      recordEntertainmentActivity(GLOBAL_HISTORY_SLUG, GLOBAL_HISTORY_VERSION, analyticsLocale, "share", "single", "copy");
    } catch {
      setSharing("manual");
    }
  }

  return <section className={vector ? styles.matchedHero : styles.hero} id="hero" aria-labelledby="history-person-name">
    {vector ? <div className={styles.honorCard} data-history-state="matched">
      <div className={styles.honorPortrait}>{portrait}</div>
      <p className={styles.honorLabel}>{labels.match}</p>
      <h1 className={styles.honorName} id="history-person-name">{poster.name}</h1>
      <p className={styles.honorType}>{poster.title}</p>
      <p className={styles.honorQuote}>{poster.description}</p>
      <p className={styles.honorTraitsLabel}>{labels.traits}</p>
      <ul className={styles.honorTraits} aria-label={labels.traits}>
        {poster.traits?.map(trait => <li key={trait}>{trait}</li>)}
      </ul>
      <p className={styles.honorBrand}>FermatMind.com</p>
    </div> : <>{identity}{portrait}</>}
    <div className={styles.heroControls}>
      {!vector && <Link className={styles.publicCta} href={take} prefetch={false} data-history-state="public"><span>{labels.start}<wbr /><span className={styles.questionCount}>{labels.questionCount}</span></span><span aria-hidden="true">↗</span></Link>}
      <div className={styles.actions}>
        <GlobalHistoryPosterExport key={`${locale}:${id}:${Boolean(vector)}`} matched={Boolean(vector)} id={id} locale={locale} url={canonical} content={poster}
          saveClassName={styles.save} saveLabel={labels.save} openLabel={labels.open} />
        <button type="button" className={vector ? styles.shareButton : undefined} onClick={() => void share()} disabled={!hydrated}>{vector ? labels.share : labels.shareProfile}</button>
        {vector && <Link href={take} prefetch={false}>{labels.retake}</Link>}
      </div>
      <p role="status" className={sharing === "copied" ? styles.shareStatus : "sr-only"}>{sharing === "copied" ? (vector ? labels.copied : labels.copiedProfile) : ""}</p>
      {sharing === "manual" && <label className={styles.manualShare}>{labels.shareFallback}
        <textarea readOnly value={shareText} onFocus={event => event.currentTarget.select()} />
      </label>}
      {differences && vector && <div className={styles.reveal}>
        <strong>{similarity}% <span>{labels.sync}</span></strong>
        <div className={styles.comparison}>
          <div><span>{labels.similar}</span><strong>{differences.slice(0, 2).map(({ index }) => axisNames[index]).join(" / ")}</strong></div>
          <div><span>{labels.contrast}</span><strong>{furthest && furthest.gap > 0 ? axisNames[furthest.index] : labels.tie}</strong>
            {furthest && furthest.gap > 0 && <small>{labels.own} {vector[furthest.index]}/6 · {labels.figure} {profile[furthest.index]}/6</small>}</div>
        </div>
      </div>}
      {languages}
      {credit}
    </div>
  </section>;
}

export function GlobalHistoryResultFollowup({ id, children }: { id: string; children: ReactNode }) {
  const vector = useGlobalHistoryVector(id);
  return vector ? children : null;
}

export function GlobalHistoryBehaviorTrack({ id, index, score, ownLabel }: {
  id: string; index: number; score: number; ownLabel: string;
}) {
  const own = useGlobalHistoryVector(id)?.[index];
  return <>
    {own !== undefined && <span className={styles.ownValue}>{ownLabel} {own} / 6</span>}
    <div className={styles.axisTrack} aria-hidden="true">
      <i className={styles.figurePoint} data-history-figure-point style={{ left: `${score / 6 * 100}%` }} />
      {own !== undefined && <i className={styles.ownPoint} data-history-own-point style={{ left: `${own / 6 * 100}%` }} />}
    </div>
  </>;
}

export function GlobalHistoryDirectory({ labels, regions, fields, bands, entries }: {
  labels: { summary: string; all: string; region: string; field: string; band: string; empty: string };
  regions: { id: string; label: string }[]; fields: { id: string; label: string }[]; bands: { id: string; label: string }[];
  entries: { id: string; href: string; name: string; regions: string[]; field: string; band: string }[];
}) {
  const [region, setRegion] = useState("");
  const [field, setField] = useState("");
  const [band, setBand] = useState("");
  const filters = [
    { label: labels.region, options: regions, value: region, set: setRegion },
    { label: labels.field, options: fields, value: field, set: setField },
    { label: labels.band, options: bands, value: band, set: setBand },
  ];
  const visible = (entry: typeof entries[number]) => (!region || entry.regions.includes(region)) && (!field || entry.field === field) && (!band || entry.band === band);

  return <details className={styles.details}>
    <summary>{labels.summary}</summary>
    <div className={styles.filters}>{filters.map(filter => <label key={filter.label}>{filter.label}
      <select value={filter.value} onChange={event => filter.set(event.target.value)}>
        <option value="">{labels.all}</option>
        {filter.options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
    </label>)}</div>
    <ul className={styles.directory}>{entries.map(entry => <li key={entry.id} hidden={!visible(entry)}>
      <Link prefetch={false} href={entry.href}>{entry.name}</Link>
    </li>)}</ul>
    {!entries.some(visible) && <p role="status">{labels.empty}</p>}
  </details>;
}
