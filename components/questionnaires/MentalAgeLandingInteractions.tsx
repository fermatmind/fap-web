"use client";

import { useEffect, useRef, useState } from "react";
import { drawMentalAgeCard } from "@/lib/questionnaires/mentalAgeCard";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";
import { mentalAgeLandingConfig } from "@/lib/questionnaires/mentalAgeLandingConfig";
import { mentalAgeComparison, mentalAgeStyles } from "@/lib/questionnaires/mentalAge";
import type { MentalAgeLandingLocale } from "@/lib/questionnaires/mentalAgeLandingCopy";
import styles from "./mental-age-landing.module.css";

const { samples } = mentalAgeLandingConfig;
const bandIndex = (age: number) => mentalAgeStyles.findIndex(({ min, max }) => age >= min && age <= max);
const originalText = (value: string) => value;

function SamplePoster({ age, locale, year, styleTitle, label }: {
  age: number; locale: MentalAgeLandingLocale; year: number; styleTitle: string; label: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let current = true;
    async function draw() {
      const traditional = locale === "zh-TW";
      const displayText = traditional ? await loadTraditionalAssessmentText() : originalText;
      await document.fonts.ready;
      const preview = canvas.current;
      if (!current || !preview) return;
      const poster = document.createElement("canvas");
      drawMentalAgeCard(poster, {
        age, sum: age - 10, locale: locale === "en" ? "en" : "zh", actualAge: null,
        year, traditional, displayText, styleTitle, format: "portrait",
      });
      preview.getContext("2d")?.drawImage(poster, 0, 0);
    }
    void draw().catch(() => { /* The text result remains available if canvas cannot render. */ });
    return () => { current = false; };
  }, [age, locale, year, styleTitle]);

  return <canvas ref={canvas} className={styles.miniCard} width={1080} height={1920} role="img" aria-label={label} />;
}

function AgeScale({ age }: { age: number }) {
  return <div aria-hidden="true">
    <div className={styles.track}><span style={{ insetInlineStart: `${(age - 10) / 60 * 100}%` }} /></div>
    <div className={styles.scaleLabels}><span>10</span><span>40</span><span>70</span></div>
  </div>;
}

type SampleCopy = {
  sample: string; age: string; actual: string; gap: string; year: string; years: string; card: string;
  sampleNote: readonly string[];
  styleTitles: readonly string[];
};

export function MentalAgeSamples({ locale, year, copy }: { locale: MentalAgeLandingLocale; year: number; copy: SampleCopy }) {
  const [selected, setSelected] = useState(0);
  const sample = samples[selected];
  const selectedStyle = copy.styleTitles[bandIndex(sample.age)];
  const comparison = mentalAgeComparison(sample.age, sample.actual, year);
  const gap = comparison?.gap ?? 0;

  return <section id="mental-age-sample" className={styles.sample} aria-labelledby="mental-age-sample-title">
    <h2 id="mental-age-sample-title" className={styles.sampleLabel}>{copy.sample}</h2>
    <div className={styles.sampleControls}>
      {samples.map((item, index) => <button key={item.age} type="button" aria-pressed={selected === index}
        aria-controls="mental-age-sample-reading" onClick={() => setSelected(index)}>
        <b>{item.age} {copy.years}</b><span>{copy.styleTitles[bandIndex(item.age)]}</span>
      </button>)}
    </div>
    <div id="mental-age-sample-reading" className={styles.sampleBody} aria-live="polite">
      <div>
        <p className={styles.ageLabel}>{copy.age}</p>
        <p className={styles.sampleAge}><strong>{sample.age}</strong> {copy.years}</p>
        <p className={styles.sampleStyle}>{selectedStyle}</p>
        <p className={styles.sampleNote}>{copy.sampleNote[selected]}</p>
      </div>
      <SamplePoster age={sample.age} locale={locale} year={year} styleTitle={selectedStyle} label={copy.card} />
      <div className={styles.sampleScale}>
        <AgeScale age={sample.age} />
        <dl className={styles.sampleFacts}>
          <div><dt>{copy.actual}</dt><dd>{sample.actual} {copy.years}</dd></div>
          <div><dt>{copy.gap}</dt><dd>{gap > 0 ? "+" : ""}{gap} {copy.years}</dd></div>
          <div><dt>{copy.year}</dt><dd>{comparison?.equivalentYear}</dd></div>
        </dl>
      </div>
    </div>
  </section>;
}

type SpectrumCopy = {
  spectrum: string;
  spectrumEnds: readonly [string, string];
  years: string;
  styles: readonly (readonly [string, string])[];
};

export function MentalAgeSpectrum({ copy }: { copy: SpectrumCopy }) {
  const [selected, setSelected] = useState(3);
  const band = mentalAgeStyles[selected];
  const content = copy.styles[selected];

  return <section className={styles.spectrum} aria-labelledby="mental-age-spectrum-title">
    <h3 id="mental-age-spectrum-title">{copy.spectrum}</h3>
    <div className={styles.segments}>
      {mentalAgeStyles.map((range, index) => <button key={range.min} type="button"
        aria-pressed={selected === index} aria-controls="mental-age-spectrum-reading"
        aria-label={`${range.min}–${range.max} ${copy.years} · ${copy.styles[index][0]}`}
        onClick={() => setSelected(index)}>{range.min}–{range.max}</button>)}
    </div>
    <div className={styles.scaleLabels}>{copy.spectrumEnds.map(label => <span key={label}>{label}</span>)}</div>
    <div id="mental-age-spectrum-reading" className={styles.spectrumReading} aria-live="polite">
      <strong>{content[0]}</strong><p>{content[1]}</p>
      <AgeScale age={(band.min + band.max) / 2} />
    </div>
  </section>;
}
