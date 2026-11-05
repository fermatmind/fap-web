import type { HTMLAttributes, ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import styles from "./QuestionnaireResultPresentation.module.css";

type HeadingLevel = 2 | 3 | 4;
export type ResultVariant = "default" | "profile" | "dimensions" | "practice" | "reflection" | "story";

/** Selects visual treatment from the actual interaction mechanism, never from score values. */
export function questionnaireResultVariant(kind: Questionnaire["kind"]): ResultVariant {
  switch (kind) {
    case "directional": case "archetype": case "alignment": case "compass": case "love-type16": case "sbti31":
      return "profile";
    case "practice": case "reasoning18": case "critical30": case "technical30": case "afqt32":
    case "data-entry": case "typing": case "ten-key": case "written-coordination":
      return "practice";
    case "natal-chart": case "birth-number": case "nine-star-year": case "weton-story35": case "nakshatra27":
      return "story";
    case "likert": case "tipi10": case "four-axes": case "paired-dimensions": case "eight-values":
    case "secs": case "political-coordinates": case "affection": case "attachment": case "extraversion":
    case "optimism": case "saps": case "scs26": case "rosenberg": case "cbi": case "fscrs22":
    case "mini-virtues": case "mini-shadow": case "mini-friction": case "interaction-pairs":
      return "dimensions";
    default:
      return "reflection";
  }
}
type SectionProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title?: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  headingLevel?: HeadingLevel;
  tone?: "default" | "soft" | "muted" | "framed";
};

/** Presentation only: callers retain ownership of scoring, availability and copy. */
export function ResultPage({ children, className = "", variant = "default", ...props }: HTMLAttributes<HTMLDivElement> & {
  variant?: ResultVariant;
}) {
  return <div className={`${styles.page} ${className}`} data-result-variant={variant} {...props}>{children}</div>;
}

export function ResultSection({ title, eyebrow, description, headingLevel = 3, tone = "default", children, className = "", ...props }: SectionProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return <section className={`${styles.section} ${styles[tone]} ${className}`} {...props}>
    {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
    {title && <Heading className={styles.sectionTitle}>{title}</Heading>}
    {description && <p className={styles.description}>{description}</p>}
    {children}
  </section>;
}

type OverviewItem = { id: string; label: ReactNode; value?: ReactNode; note?: ReactNode; href?: string };

export function ResultOverview({ locale, items, children, ...props }: SectionProps & { locale?: Locale; items?: OverviewItem[] }) {
  return <ResultSection {...props} className={`${styles.overview} ${props.className ?? ""}`}>
    {items && <ul className={styles.overviewItems}>{items.map(item => <li key={item.id}>
      <span>{item.href ? <a href={item.href}>{item.label}</a> : item.label}</span>
      {item.value !== undefined && <strong>{item.value}</strong>}
      {item.note && <p className={styles.itemNote}>{item.note}</p>}
    </li>)}</ul>}
    {children}
    {locale && !props.title && !props.eyebrow && <span className="sr-only">{locale === "zh" ? "结果概览" : "Result overview"}</span>}
  </ResultSection>;
}

type ScoreRowProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  /** Supply all three only when the score has a documented numeric range. */
  score?: number | null;
  min?: number;
  max?: number;
};

export function ResultScoreRow({ label, value, description, score, min, max, className = "", ...props }: ScoreRowProps) {
  const ranged = typeof score === "number" && Number.isFinite(score)
    && typeof min === "number" && Number.isFinite(min)
    && typeof max === "number" && Number.isFinite(max) && max > min && score >= min && score <= max;
  const position = ranged ? (score - min) / (max - min) * 100 : null;
  return <div className={`${styles.scoreRow} ${className}`} {...props}>
    <dl className={styles.scoreMeta}><dt>{label}</dt><dd><strong>{value}</strong></dd></dl>
    {position !== null && <div className={styles.track} aria-hidden="true"><span style={{ width: `${position}%` }} /></div>}
    {description && <p className={styles.scoreDescription}>{description}</p>}
  </div>;
}

export function ResultNotice(props: SectionProps) {
  return <ResultSection tone="muted" {...props} />;
}

export function ResultReadingNav({ label, sections, className = "", collapsible = false }: {
  label: string; sections: { id: string; title: string }[]; className?: string; collapsible?: boolean;
}) {
  if (!sections.length) return null;
  const navigation = <nav className={`${styles.navigation} ${className}`} aria-label={label}>
    {!collapsible && <p className={styles.eyebrow}>{label}</p>}
    <ol>{sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol>
  </nav>;
  return collapsible ? <details className={styles.contents}><summary>{label}</summary>{navigation}</details> : navigation;
}

export function ResultNav({ locale, items, label, className }: { locale: Locale; items: { id: string; label: string; href?: string }[]; label?: string; className?: string }) {
  if (!items.length) return null;
  const title = label ?? (locale === "zh" ? "选择一个部分阅读" : "Choose a section to read");
  return <nav className={`${styles.navigation} ${className ?? ""}`} aria-label={title}>
    <p className={styles.eyebrow}>{title}</p>
    <ol>{items.map(item => <li key={item.id}><a href={item.href ?? `#${item.id}`}>{item.label}</a></li>)}</ol>
  </nav>;
}
