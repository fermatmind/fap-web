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
  save: string; open: string; share: string; copied: string; shareFallback: string; retake: string; own: string; figure: string;
};

export function GlobalHistoryReveal({ id, locale, axisNames, profile, canonical, hook, poster, labels, children, languages }: {
  id: string; locale: DisplayLocale; axisNames: string[]; profile: readonly number[];
  canonical: string; hook: string; poster: HistoryPosterContent; labels: HeroLabels; children: ReactNode; languages: ReactNode;
}) {
  const vector = useGlobalHistoryVector(id);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [sharing, setSharing] = useState<"idle" | "copied" | "manual">("idle");
  const differences = vector && vector.map((score, index) => ({ index, gap: Math.abs(score - profile[index]) }))
    .sort((a, b) => a.gap - b.gap || a.index - b.index);
  const furthest = differences?.at(-1);
  const distance = differences ? Math.sqrt(differences.reduce((sum, row) => sum + row.gap ** 2, 0)) : 0;
  const similarity = Math.round(100 * (1 - distance / (6 * Math.sqrt(profile.length))));
  const shareText = `${hook}\n${canonical}`;
  const take = `${globalHistoryPath(locale)}/take`;

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareText);
      setSharing("copied");
      recordEntertainmentActivity(GLOBAL_HISTORY_SLUG, GLOBAL_HISTORY_VERSION, locale === "zh-TW" ? "zh" : locale, "share", "single", "copy");
    } catch {
      setSharing("manual");
    }
  }

  return <>
    {differences && vector ? <div className={styles.reveal} data-history-state="matched">
      <strong>{similarity}% <span>{labels.sync}</span></strong>
      <div className={styles.comparison}>
        <div><span>{labels.similar}</span><strong>{differences.slice(0, 2).map(({ index }) => axisNames[index]).join(" / ")}</strong></div>
        <div><span>{labels.contrast}</span><strong>{furthest && furthest.gap > 0 ? axisNames[furthest.index] : labels.tie}</strong>
          {furthest && furthest.gap > 0 && <small>{labels.own} {vector[furthest.index]}/6 · {labels.figure} {profile[furthest.index]}/6</small>}</div>
      </div>
    </div> : <Link className={styles.publicCta} href={take} prefetch={false} data-history-state="public"><span>{labels.start}<wbr /><span className={styles.questionCount}>{labels.questionCount}</span></span><span aria-hidden="true">↗</span></Link>}
    {children}
    <div className={styles.actions}>
      <GlobalHistoryPosterExport key={`${locale}:${id}`} id={id} locale={locale} url={canonical} content={poster}
        saveClassName={styles.save} saveLabel={labels.save} openLabel={labels.open} />
      <button type="button" onClick={() => void copyShare()} disabled={!hydrated}>{labels.share}</button>
      <Link href={take} prefetch={false}>{labels.retake}</Link>
    </div>
    <p role="status" className={sharing === "copied" ? styles.shareStatus : "sr-only"}>{sharing === "copied" ? labels.copied : ""}</p>
    {sharing === "manual" && <label className={styles.manualShare}>{labels.shareFallback}
      <textarea readOnly value={shareText} onFocus={event => event.currentTarget.select()} />
    </label>}
    {languages}
  </>;
}

export function GlobalHistoryResultFollowup({ id, matched = false, children }: { id: string; matched?: boolean; children: ReactNode }) {
  const vector = useGlobalHistoryVector(id);
  return Boolean(vector) === matched ? children : null;
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
