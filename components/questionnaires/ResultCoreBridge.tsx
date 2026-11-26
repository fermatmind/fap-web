import Link from "next/link";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { archetypeCorePath } from "@/lib/questionnaires/archetypeResultCard";
import { archetypeResultCopy } from "@/lib/questionnaires/archetypeResultShare";
import styles from "./ArchetypeHonorCard.module.css";

export function ResultCoreBridge({ locale, target }: { locale: DisplayLocale; target: Parameters<typeof archetypeCorePath>[1] }) {
  const copy = archetypeResultCopy[locale];
  const [label, context] = copy.targets[target];
  return <section className={styles.bridge} data-archetype-core-assessment={target}>
    <h3>{copy.next}</h3><p>{context}</p>
    <Link prefetch={false} referrerPolicy="no-referrer" href={archetypeCorePath(locale, target)}>{label} →</Link>
  </section>;
}
