import Image from "next/image";
import { Flag, ListChecks, MessagesSquare, UsersRound } from "lucide-react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import styles from "@/components/career/unlock-report-experience.module.css";

const directions = [
  { code: "D", id: "DOMINANCE", label: ["推进处理", "推進處理", "Moving things forward"], icon: Flag },
  { code: "I", id: "INFLUENCE", label: ["表达带动", "表達帶動", "Engaging through expression"], icon: MessagesSquare },
  { code: "S", id: "STEADINESS", label: ["稳定支持", "穩定支持", "Steady support"], icon: UsersRound },
  { code: "C", id: "CONSCIENTIOUSNESS", label: ["规范核对", "規範核對", "Standards and checks"], icon: ListChecks },
] as const;

// The DISC-24 paired form presents each direction in twelve items.
const opportunities = 12;

export type DiscDesignPreview = {
  title: string;
  headline: string;
  art?: string;
  axes: { code: typeof directions[number]["code"]; label: string; count: number; total: number }[];
};

export function buildDiscDesignPreview(payload: unknown, locale: DisplayLocale): DiscDesignPreview | undefined {
  const sample = payload as { counts?: Record<string, number>; profile?: { headline: { zh: string; en: string } } } | undefined;
  if (!sample?.counts || !sample.profile) return undefined;
  const languageIndex = locale === "en" ? 2 : locale === "zh-TW" ? 1 : 0;
  const axes = directions.flatMap(({ code, id, label }) => {
    const count = sample.counts?.[id];
    return typeof count === "number" && Number.isInteger(count) && count >= 0 && count <= opportunities
      ? [{ code, label: label[languageIndex], count, total: opportunities }] : [];
  });
  if (axes.length !== directions.length || axes.reduce((sum, axis) => sum + axis.count, 0) !== 24) return undefined;
  const highest = Math.max(...axes.map(axis => axis.count));
  const leading = axes.filter(axis => axis.count === highest);
  const title = leading.map(axis => `${axis.code} · ${axis.label}`).join(" / ");
  return {
    title,
    headline: locale === "zh-TW" ? "先把下一步說清楚" : sample.profile.headline[locale],
    art: leading.length === 1 && leading[0].code === "D" ? "/images/disc/preview-moving-forward.webp" : undefined,
    axes,
  };
}

export function DiscUnlockPreview({ result, locale }: { result: DiscDesignPreview; locale: DisplayLocale }) {
  const t = (zh: string, tw: string, en: string) => locale === "en" ? en : locale === "zh-TW" ? tw : zh;
  const highest = Math.max(...result.axes.map(axis => axis.count));
  return <>
    <header className={`${styles.hero} ${styles.discHero}`}>
      <p className={styles.eyebrow}>{t("DISC · 本次行为风格", "DISC · 本次行為風格", "DISC · Your behavior profile")}</p>
      <h1>{result.title}</h1>
      <p className={styles.discHeadline}>{result.headline}</p>
      {result.art && <div className={styles.discPortrait}>
        <Image src={result.art} alt="" width={360} height={360} sizes="(max-width: 620px) 64vw, 320px" />
      </div>}
      <a href="#disc-dimensions" className={styles.traitMethodLink}>{t("查看四维作答分布", "查看四維作答分布", "See your four scores")} ↓</a>
    </header>
    <section className={styles.discDimensions} id="disc-dimensions" aria-labelledby="disc-dimension-title">
      <h2 id="disc-dimension-title">{t("四种行为风格", "四種行為風格", "Four behavior styles")}</h2>
      <p>{t("每个方向在 24 题中各出现 12 次。", "每個方向在 24 題中各出現 12 次。", "Each style appeared in 12 of the 24 questions.")}</p>
      <dl>
        {result.axes.map(({ code, label, count, total }) => {
          const Icon = directions.find(direction => direction.code === code)!.icon;
          return <div key={code} data-axis={code} className={styles.discDimension} data-leading={count === highest || undefined}>
            <dt><span><Icon size={21} aria-hidden="true" /></span><span>{code} · {label}</span></dt>
            <dd><strong>{count}</strong> / {total}</dd>
            <dd className={styles.discMeter} aria-hidden="true"><i style={{ width: `${count / total * 100}%` }} /></dd>
          </div>;
        })}
      </dl>
    </section>
  </>;
}
