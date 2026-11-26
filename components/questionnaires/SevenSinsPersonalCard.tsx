"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { DisplayLocale as Locale } from "@/lib/i18n/locales";
import type { MiniVirtuesDualResult } from "@/lib/questionnaires/miniVirtues";
import { sevenSinsCardPeaks, sevenSinsCardRows, sevenSinsPosterSize } from "@/lib/questionnaires/sevenSinsCard";
import { sevenSinsShareCaption, sevenSinsShareCopy } from "@/lib/questionnaires/sevenSinsShareCopy";
import { recordEntertainmentActivity } from "@/lib/entertainment/activity";
import styles from "./SevenSinsOverview.module.css";

export type SevenSinsPersonalCardProps = { result: MiniVirtuesDualResult; locale: Locale; formCode: string; onRetake: () => void };

/** Generating a card and composing a caption use the completed result locally. */
export function SevenSinsPersonalCard({ result, locale, formCode, onRetake }: SevenSinsPersonalCardProps) {
  const rows = sevenSinsCardRows(result);
  const copy = sevenSinsShareCopy[locale];
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [manual, setManual] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const objectUrl = useRef("");
  const alive = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); };
  }, []);
  useEffect(() => {
    if (preview && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [preview]);

  const publicUrl = `https://fermatmind.com/${locale}/tests/explore/seven-sins-virtues-test`;
  const filename = `fermatmind-seven-sins-result-${locale}.png`;
  if (!rows) return null;

  function record(channel: "image" | "system" | "copy") {
    if (locale !== "zh-TW") recordEntertainmentActivity("seven-sins-virtues-test", formCode, locale, "share", "single", channel);
  }

  async function prepareImage(open: boolean) {
    if (busy || !rows) return;
    setBusy(true);
    setMessage("");
    try {
      if (!objectUrl.current) {
        const { renderSevenSinsPoster } = await import("@/lib/questionnaires/sevenSinsPoster");
        const blob = await renderSevenSinsPoster(rows, locale, publicUrl);
        if (!alive.current) return;
        objectUrl.current = URL.createObjectURL(blob);
      }
      if (open) setPreview(objectUrl.current);
      else {
        const anchor = document.createElement("a");
        anchor.href = objectUrl.current;
        anchor.download = filename;
        anchor.click();
        record("image");
      }
    } catch {
      setMessage(copy.error);
    } finally {
      if (alive.current) setBusy(false);
    }
  }

  async function share() {
    if (!rows) return;
    const caption = sevenSinsShareCaption(sevenSinsCardPeaks(rows), locale, publicUrl);
    setManual("");
    setMessage("");
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text: caption });
        record("system");
        setMessage(copy.sent);
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(caption);
      record("copy");
      setMessage(copy.copied);
    } catch {
      setManual(caption);
    }
  }

  return <section className={styles.shareTools} aria-label={copy.imageAlt}>
    <div className={styles.shareGrid} data-mini-virtues-actions>
      <button type="button" disabled={busy} onClick={() => void prepareImage(false)}>{copy.buttons[0]}</button>
      <button type="button" ref={opener} disabled={busy} onClick={() => void prepareImage(true)}>{copy.buttons[1]}</button>
      <button type="button" onClick={() => void share()}>{copy.buttons[2]}</button>
      <button type="button" onClick={onRetake}>{copy.buttons[3]}</button>
    </div>
    {message && <p role="status">{message}</p>}
    {manual && <label>{copy.manual}<textarea readOnly rows={3} value={manual} onFocus={event => event.currentTarget.select()} /></label>}
    <dialog ref={dialog} className={styles.cardLightbox} aria-label={copy.imageAlt}
      onClose={() => { setPreview(""); opener.current?.focus(); }}
      onClick={event => { if (event.currentTarget === event.target) dialog.current?.close(); }}>
      {preview && <div className={styles.cardLightboxBody}>
        <button type="button" aria-label={copy.close} onClick={() => dialog.current?.close()}>×</button>
        <Image unoptimized src={preview} width={sevenSinsPosterSize.width} height={sevenSinsPosterSize.height} alt={copy.imageAlt} />
        <p>{copy.hold}</p>
        <small>{copy.fallback}</small>
        <a href={preview} download={filename} onClick={() => record("image")}>{copy.download}</a>
      </div>}
    </dialog>
  </section>;
}
