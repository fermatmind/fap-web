"use client";

import { useRef, useState } from "react";
import styles from "./GlobalHistoryAtlas.module.css";

type Format = "APA" | "Chicago" | "Markdown";

export function GlobalHistoryCitation({ citations, labels }: {
  citations: Record<Format, string>;
  labels: { heading: string; copy: string; copied: string; manual: string };
}) {
  const [format, setFormat] = useState<Format>("APA");
  const [status, setStatus] = useState("");
  const text = useRef<HTMLTextAreaElement>(null);

  async function copyCitation(next: Format) {
    setFormat(next);
    try {
      await navigator.clipboard.writeText(citations[next]);
      setStatus(`${labels.copied} · ${next}`);
    } catch {
      if (text.current) {
        text.current.value = citations[next];
        text.current.focus();
        text.current.select();
      }
      setStatus(labels.manual);
    }
  }

  return <section className={styles.referenceCard} aria-labelledby="history-citation-heading">
    <h2 id="history-citation-heading">{labels.heading}</h2>
    <div className={styles.copyFormats}>
      {(Object.keys(citations) as Format[]).map(item =>
        <button key={item} type="button" onClick={() => void copyCitation(item)} aria-pressed={format === item}>{labels.copy} {item}</button>,
      )}
    </div>
    <textarea ref={text} aria-label={`${labels.heading} · ${format}`} readOnly value={citations[format]} rows={3} />
    {status && <p role="status">{status}</p>}
  </section>;
}
